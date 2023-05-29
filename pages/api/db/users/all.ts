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
  role,
  name
}`;

    try {
      const data = await sanityClient.fetch(query);
      // console.log(data);
      return res.status(200).json({ success: true, users: data });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ success: false });
    }
  }

  return res.status(404).json({ success: false });
}
