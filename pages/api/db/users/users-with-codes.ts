import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { CashbackCodeType } from "@/typings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const PAGE_SIZE = 1000;
    let codes: any[] = [];
    let page = 1;

    while (true) {
      const { data: pageData, error } = await supabase
        .from("cashback_codes")
        .select("*")
        .eq("redeemed", true)
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (error) {
        throw new Error("Failed to fetch cashback codes");
      }

      if (pageData.length === 0) {
        break;
      }

      codes = [...codes, ...pageData];
      page++;
    }

    const usersWithCodes: {
      [key: string]: {
        codes: CashbackCodeType[];
        first_time_redeemed: boolean;
      };
    } = codes.reduce((acc, code) => {
      const { redeemed_by, redeemed_on } = code;
      if (redeemed_by) {
        if (!acc[redeemed_by]) {
          acc[redeemed_by] = {
            codes: [],
            first_time_redeemed: false,
          };
        }
        if (
          !acc[redeemed_by].codes.some(
            (c: CashbackCodeType) => c.code === code.code
          )
        ) {
          acc[redeemed_by].codes.push(code);
          if (acc[redeemed_by].first_time_redeemed) {
            acc[redeemed_by].first_time_redeemed =
              new Date(redeemed_on).getFullYear() === new Date().getFullYear();
          }
        }
      }
      return acc;
    }, {});

    // console.table(data);

    res.status(200).json(usersWithCodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
}
