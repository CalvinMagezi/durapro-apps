import { CashbackCodeType } from "./../../../typings.d";
import sanityClient from "@/lib/sanity/sanityClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //Get All Codes

  if (req.method === "GET") {
    const query = `*[_type == "users"]{
  _id,
  _createdAt,  
  phone_number,
  role
}`;

    // console.log("Hello");

    try {
      const data = await sanityClient.fetch(query);
      return res.status(200).json({ success: true, users: data });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ success: false });
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
