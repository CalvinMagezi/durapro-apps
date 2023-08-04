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

  const { product_name, product_sku, number_of_codes } = req.body;

  const codes = [];

  function removeDuplicates(arr: number[]) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  try {
    for (let index = 0; index < parseInt(number_of_codes); index++) {
      let code = Math.floor(100000 + Math.random() * 900000);
      codes.push(code);
    }

    const no_dupes = removeDuplicates(codes);
    let successful = 0;
    let failed = 0;

    for (let index = 0; index < no_dupes.length; index++) {
      let doc = {
        _id: `code-${no_dupes[index]}`,
        _type: "cashback_codes",
        code: no_dupes[index],
        product_name: product_name,
        product_sku: product_sku,
        redeemed: false,
        funds_disbursed: false,
      };

      await sanityClient
        .create(doc)
        .then(() => {
          successful = successful + 1;
        })
        .catch(() => {
          failed = failed + 1;
        });
    }

    return res
      .status(200)
      .json({ success: true, successful: successful, failed: failed });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ success: false });
  }
}
