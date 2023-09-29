// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import generateUniqueId from "@/helpers/generateUniqueId";
import { mailOptions, transporter } from "@/lib/nodemailer";
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = "";

    try {
      if (text == "") {
        //================================================================
        //Opening Screen
        //================================================================

        const { data: banList } = await supabase.from("ban_list").select("*");

        if (banList && banList.length > 0) {
          if (
            banList?.filter((ban) => ban?.phone_number == phoneNumber).length >
            0
          ) {
            response = `END You have been banned from using this service. Please contact support for assistance.`;
            return res.send(response);
          }
        }

        const { data: user, error: userFetchError } = await supabase
          .from("cashback_users")
          .select("*")
          .eq("phone_number", phoneNumber);

        if (userFetchError) {
          console.log(userFetchError);
        }

        if (user?.length === 0) {
          await supabase.from("cashback_users").insert({
            _id: generateUniqueId(),
            phone_number: phoneNumber,
            role: "user",
            first_login: false,
          });
        }

        response = `CON Welcome to Quickset Cashback \n
        Please Enter The Code Below:`;
      } else {
        const code = text;
        const { data: user, error: userFetchError } = await supabase
          .from("cashback_users")
          .select("*")
          .eq("phone_number", phoneNumber)
          .single();

        const { data, error } = await supabase
          .from("cashback_codes")
          .select("*")
          .limit(1)
          .eq("code", code);

        if (data?.length === 0 || error) {
          await supabase
            .from("cashback_users")
            .update({
              wrong_code_count: user?.wrong_code_count + 1,
            })
            .eq("phone_number", phoneNumber);

          if (user?.wrong_code_count >= 5) {
            await supabase.from("ban_list").insert({
              phone_number: phoneNumber,
              reason: "Too many wrong code attempts from ussd.",
            });

            response = `END You have attempted to redeem too many incorrect codes. Please contact support for assistance.`;
          } else {
            response = `END Please ensure you've entered a valid code. You have ${
              5 - user?.wrong_code_count
            } invalid attempts left.`;
          }
        } else {
          if (data && data[0].redeemed === true) {
            await supabase
              .from("cashback_users")
              .update({
                wrong_code_count: user?.wrong_code_count + 1,
              })
              .eq("phone_number", phoneNumber);

            if (user?.wrong_code_count >= 5) {
              await supabase.from("ban_list").insert({
                phone_number: phoneNumber,
                reason: "Too many wrong code attempts from ussd.",
              });

              response = `END You have attempted to redeem too many incorrect codes. Please contact support for assistance.`;
            } else {
              response = `END This code has already been redeemed. You have ${
                5 - user?.wrong_code_count
              } attempts left.`;
            }
          } else {
            const { error } = await supabase
              .from("cashback_codes")
              .update({
                redeemed_by: `${phoneNumber}`,
                redeemed: true,
                redeemed_on: new Date().toISOString(),
              })
              .eq("code", code);

            const { data: codes } = await supabase
              .from("cashback_codes")
              .select("*")
              .eq("redeemed_by", `${phoneNumber}`);

            if (
              codes &&
              codes.filter((code) => code.funds_disbursed == false).length > 10
            ) {
              await transporter.sendMail({
                ...mailOptions,
                subject: `User ${phoneNumber} is ready to be paid`,
                text: `User ${phoneNumber} is ready to be paid`,
                html: `<h1>User ready to be paid</h1><p>The user with phone number: ${phoneNumber} has redeemed more than 10 codes that haven't been paid for.</p>`,
              });
            }

            if (error) {
              response = `END Oops, something went wrong. Please try again`;
            } else {
              response = `END Successfully redeemed code ${code}`;
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      response = `END Oops, something went wrong. Please try again`;
    }

    console.log(response);
    return res.send(response);
  }

  return res
    .status(500)
    .json({ success: false, message: "Invalid request method" });
}
