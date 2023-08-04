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

  const { redeemed_codes, momo_number } = req.body;
  // console.log(redeemed_codes);
  // console.log(momo_number);

  try {
    for (let i = 0; i < redeemed_codes.length; i++) {
      const element = redeemed_codes[i];
      if (element.funds_disbursed === false) {
        await sanityClient
          .patch(element._id)
          .set({
            mm_confirmation: momo_number,
            funds_disbursed: true,
            disbursed_on: new Date(),
          })
          .commit();
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: "Oops, something went wrong. Please try again.",
    });
  }
}
