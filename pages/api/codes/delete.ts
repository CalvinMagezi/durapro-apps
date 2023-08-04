import sanityClient from "@/lib/sanity/sanityClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { _id } = req.body;

    try {
      await sanityClient.delete(_id).then(() => {
        return res.status(200).json({ success: true });
      });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ success: false });
    }
  }

  if (req.method === "DELETE") {
    const { ids } = req.body;

    try {
      for (let i = 0; i <= ids.length; i++) {
        const element = ids[i];
        await sanityClient.delete(element);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ success: false });
    }
  }

  return res.status(404).json({ success: false });
}
