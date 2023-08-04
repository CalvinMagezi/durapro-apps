import { CashbackCodeType } from "./../../../typings.d";
import sanityClient from "@/lib/sanity/sanityClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(404).json({ success: false });
  }

  const { code, user_id } = req.body;
  console.log(code);

  const query = `*[_type == "cashback_codes" && code == ${code}]{
    _id,
    _createdAt,  
    code,
    product_name,
    redeemed,
    redeemed_on,
    funds_disbursed,
    disbursed_on,
    mm_confirmation
    }[0...1]`;

  try {
    const data = await sanityClient.fetch(query);

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "The code entered does not exist within our database",
      });
    } else {
      if (data[0].redeemed === true) {
        return res.status(404).json({
          success: false,
          message: "This code has already been redeemed",
        });
      } else {
        await sanityClient
          .patch(data[0]._id)
          .set({
            redeemed_by: {
              _ref: user_id,
            },
            redeemed: true,
            redeemed_on: new Date(),
          })
          .commit()
          .then(() => {
            return res
              .status(200)
              .json({ success: true, message: "Successfully Redeemed Code" });
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: "Oops, something went wrong. Please try again.",
    });
  }
}
