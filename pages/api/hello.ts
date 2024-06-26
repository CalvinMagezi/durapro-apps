// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import CheckRedeemed from "@/helpers/CheckRedeemed";
import sanityClient from "@/lib/sanity/sanityClient";
import { ProfileType } from "@/typings";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

      const users_with_codes = data.map((user: ProfileType) => {
        const user_codes = data?.filter(
          (code: any) => code.redeemed_by === user.phone_number
        );
        return { ...user, redeemed_codes: user_codes };
      });

      users_with_codes.sort(
        (a: any, b: any) =>
          CheckRedeemed(b.redeemed_codes) - CheckRedeemed(a.redeemed_codes)
      ) as ProfileType[];

      // console.log(data);
      return res.status(200).json({ success: true, users: data });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ success: false });
    }
  }

  return res.status(404).json({ success: false });
}
