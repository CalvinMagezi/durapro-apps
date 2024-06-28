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
            response = `END We apologize, but your access to this service has been restricted. Please contact our support team for assistance.`;
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

        // Check the number of redeemed codes for this user
        const { data: redeemedCodes, error: redeemedCodesError } =
          await supabase
            .from("cashback_codes")
            .select("*")
            .eq("redeemed_by", phoneNumber);

        if (redeemedCodesError) {
          console.log(redeemedCodesError);
        }

        if (redeemedCodes && redeemedCodes.length > 30) {
          response = `END Thank you for your continued use of our service. You have redeemed more than 30 codes. We invite you to visit https://quickset-apps.vercel.app for an enhanced experience.`;
          return res.send(response);
        }

        response = `CON Welcome to Quickset Cashback! \n
        We appreciate your participation. Please enter your code below:`;
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
              reason: "Multiple invalid code entries.",
            });

            response = `END We're sorry, but you've reached the maximum number of incorrect code attempts. Please contact our support team for further assistance.`;
          } else {
            response = `END We apologize, but the code you entered appears to be invalid. You have ${
              5 - user?.wrong_code_count
            } attempts remaining. Please try again.`;
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
                reason: "Multiple attempts to redeem already redeemed codes.",
              });

              response = `END We're sorry, but you've reached the maximum number of incorrect code attempts. Please contact our support team for further assistance.`;
            } else {
              response = `END We apologize, but this code has already been redeemed. You have ${
                5 - user?.wrong_code_count
              } attempts remaining. Please try a different code.`;
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
                subject: `User ${phoneNumber} is eligible for payment`,
                text: `User ${phoneNumber} is eligible for payment`,
                html: `<h1>User eligible for payment</h1><p>The user with phone number: ${phoneNumber} has redeemed more than 10 codes that haven't been paid for.</p>`,
              });
            }

            if (error) {
              response = `END We apologize, but an error occurred while processing your request. Please try again later.`;
            } else {
              if (codes && codes.length > 30) {
                response = `END Thank you! Your code ${code} has been successfully redeemed. You have now redeemed more than 30 codes. We invite you to visit https://quickset-apps.vercel.app for an enhanced experience.`;
              } else {
                response = `END Thank you! Your code ${code} has been successfully redeemed.`;
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      response = `END We apologize, but an error occurred while processing your request. Please try again later.`;
    }

    console.log(response);
    return res.send(response);
  }

  return res
    .status(500)
    .json({ success: false, message: "Invalid request method" });
}
