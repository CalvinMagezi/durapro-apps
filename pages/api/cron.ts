import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import xlsx from "xlsx";
import nodemailer from "nodemailer";
import { CashbackCodeType } from "@/typings";
import { format } from "date-fns";
import { parsePhoneNumber } from "libphonenumber-js";
import { Client } from "africastalking-ts";

const africasTalking = new Client({
  apiKey: process.env.NEXT_AT_API_KEY!,
  username: process.env.NEXT_AT_USERNAME!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Fetch all cashback codes that have been redeemed but funds have not been disbursed
    const PAGE_SIZE = 1000;
    let codes: any[] = [];
    let page = 1;
    const successful_dispatches: string[] = [];
    const failed_dispatches: string[] = [];

    while (true) {
      const { data: pageData, error } = await supabase
        .from("cashback_codes")
        .select("*")
        .eq("redeemed", true)
        .eq("funds_disbursed", false)
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (error) {
        throw new Error("Failed to fetch cashback codes");
      }

      if (pageData.length === 0) {
        break;
      }

      codes = [...codes, ...pageData];
      page++;
    }

    // Extract all redeemed_by values and sort out duplicates
    const usersWithCodes: {
      [key: string]: {
        codes: CashbackCodeType[];
        first_time_redeemed: boolean;
      };
    } = codes.reduce((acc, code) => {
      const { redeemed_by, redeemed_on } = code;
      if (redeemed_by) {
        if (!acc[redeemed_by]) {
          acc[redeemed_by] = {
            codes: [],
            first_time_redeemed: false,
          };
        }
        if (
          !acc[redeemed_by].codes.some(
            (c: CashbackCodeType) => c.code === code.code
          )
        ) {
          acc[redeemed_by].codes.push(code);
          if (acc[redeemed_by].first_time_redeemed) {
            acc[redeemed_by].first_time_redeemed =
              new Date(redeemed_on).getFullYear() === new Date().getFullYear();
          }
        }
      }
      return acc;
    }, {});

    // Filter out users with less than 10 codes
    const usersWithMoreThan10Codes = Object.entries(usersWithCodes)
      .filter(([user, data]) => data.codes.length > 10)
      .map(([user, data]) => ({
        uid: user,
        redeemed_codes: data.codes,
        first_time_redeemed: data.first_time_redeemed,
      }));

    // Create an Excel workbook with multiple sheets
    const workbook = xlsx.utils.book_new();

    // Create a sheet for users with more than 10 codes
    const sheetData = usersWithMoreThan10Codes.map((user) => {
      return [user.uid, user.redeemed_codes.length, user.first_time_redeemed];
    });
    const worksheet = xlsx.utils.aoa_to_sheet([
      ["User", "Number of Codes", "First Time Redeemed"],
      ...sheetData,
    ]);
    xlsx.utils.book_append_sheet(
      workbook,
      worksheet,
      "Users with More Than 10 Codes"
    );

    // Create a sheet for each user with more than 10 codes
    Object.entries(usersWithMoreThan10Codes).forEach(([user, data]) => {
      const sheetName = `Codes for ${user}`;
      const sheetData = data.redeemed_codes.map((code: CashbackCodeType) => {
        const { _id, code: codeValue, product_name, redeemed_on } = code;
        return {
          "Code ID": _id,
          "Code ": codeValue,
          "Product Name": product_name,
          "Redeemed On": format(new Date(redeemed_on), "PPpp"),
        };
      });
      const worksheet = xlsx.utils.json_to_sheet(sheetData);
      xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Write the workbook to a file
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Send the email with the spreadsheet attachment
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "magezitechsolutions@gmail.com",
        pass: process.env.EMAIL_PAS,
      },
    });

    const mailOptions = {
      from: "magezitechsolutions@gmail.com",
      to: "gregmagezi@gmail.com",
      subject: `Ready To Pay ${format(new Date(), "PPpp")}`,
      text: "Please find attached the users ready to pay",
      attachments: [
        {
          filename: `ready_to_pay-${format(new Date(), "PPpp").replaceAll(
            " ",
            "_"
          )}.xlsx`,
          content: buffer,
        },
      ],
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Internal server error");
      } else {
        console.log("Email sent: " + info.response);
        // Mark all the codes in the spreadsheet as funds_disbursed = true
        const codesToUpdate = usersWithMoreThan10Codes
          .map((user) => user.redeemed_codes)
          .flat();
        const { error } = await supabase
          .from("cashback_codes")
          .update({
            funds_disbursed: true,
            disbursed_on: new Date().toISOString(),
            mm_confirmation: "Meishox MM Temangalo",
          })
          .in(
            "code",
            codesToUpdate.map((code) => (code as CashbackCodeType).code)
          );
        if (error) {
          console.error(error);
          res.status(500).send("Internal server error");
        } else {
          for (const user of usersWithMoreThan10Codes) {
            const { uid } = user;
            const phone_number = uid;

            const p = parsePhoneNumber(phone_number, "UG");
            if (!p || !p.isValid()) {
              console.log("Error parsing phone number");
            } else {
              const parsed_number = p.number;

              // console.log(parsed_number);

              try {
                const transaction =
                  "Hello from Quickset! Your cashback payment for using Quickset Tile Adhesive is being processed and you shall receive it soon. Thank you for your support. Quickset - Your Partner in Tiling Excellence.";

                await africasTalking
                  .sendSms({
                    to: [`${parsed_number}`], // Your phone number
                    message: transaction, // Your message
                    from: "Quickset", // Your shortcode or alphanumeric
                  })
                  .then(() => {
                    successful_dispatches.push(parsed_number);
                    console.log("Successfully dispatched to " + parsed_number);
                  })
                  .catch((error) => {
                    const message = error.response.data;
                    console.log(message);
                    failed_dispatches.push(parsed_number);
                  });
              } catch (error) {
                console.log(error);
                return res.status(400).json({
                  success: false,
                  message: "Error dispatching message to Africa's Talking",
                });
              }
            }
          }

          return res.status(200).json({
            message: "Email sent and codes updated",
            ready: usersWithMoreThan10Codes,
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }

  return res.status(200).json({
    message: "Successfully notified admin",
  });
}
