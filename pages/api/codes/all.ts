import sanityClient from "@/lib/sanity/sanityClient";
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //Get All Codes

  if (req.method === "GET") {
    try {
      const codes = [];

      const ranges = [
        { start: 0, end: 1000 },
        { start: 1001, end: 2000 },
        { start: 2001, end: 3000 },
        { start: 3001, end: 4000 },
        { start: 4001, end: 5000 },
        { start: 5001, end: 6000 },
        { start: 6001, end: 7000 },
        { start: 7001, end: 8000 },
        { start: 8001, end: 9000 },
        { start: 9001, end: 10000 },
        { start: 10001, end: 11000 },
      ];

      for (let index = 0; index < ranges.length; index++) {
        const element = ranges[index];

        const { data, error } = await supabase
          .from("cashback_codes")
          .select("*")
          .range(element.start, element.end);

        if (error) {
          console.log(error);
          return res
            .status(500)
            .json({ success: false, message: error.message });
        }

        codes.push(data);
      }

      const singleObject = codes.map((code) => {
        return code.map((c) => {
          return c;
        });
      });

      const asOneObject = singleObject.flat();

      return res.status(200).json({
        success: true,
        codes: asOneObject,
      });
    } catch (error) {
      console.log(error);

      return res
        .status(500)
        .json({ success: false, message: "Something went wrong." });
    }
  }

  //Get User Specific Codes
  if (req.method === "POST") {
    const { user_id } = req.body;

    const query = `*[_type == "cashback_codes" && redeemed_by._ref == '${user_id}']{
  _id,
  _createdAt,  
  code,
  product_name,
  redeemed,
  redeemed_on,
  funds_disbursed,
  disbursed_on,
  mm_confirmation
}`;

    try {
      const data = await sanityClient.fetch(query);
      return res.status(200).json({ success: true, codes: data });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ success: false });
    }
  }

  return res.status(404).json({ success: false });
}
