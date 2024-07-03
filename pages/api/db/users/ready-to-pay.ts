import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { CashbackCodeType } from "@/typings";

function checkRedeemed(redeemedCodes: CashbackCodeType[]): number {
  return redeemedCodes.reduce((count, code) => {
    return !code.funds_disbursed ? count + 1 : count;
  }, 0);
}

interface FetchedCashbackCode {
  redeemed_by: string | null;
  redeemed_on: string;
  funds_disbursed: boolean;
  code: string;
}

async function fetchAllCashbackCodes(
  pageSize: number
): Promise<FetchedCashbackCode[]> {
  let page = 1;
  let codes: FetchedCashbackCode[] = [];
  let hasMore = true;

  while (hasMore) {
    const { data: pageData, error } = await supabase
      .from("cashback_codes")
      .select("redeemed_by, redeemed_on, funds_disbursed, code")
      .eq("redeemed", true)
      .order("redeemed_on", { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      throw new Error("Failed to fetch cashback codes");
    }

    if (pageData.length === 0) {
      hasMore = false;
    } else {
      codes = codes.concat(pageData);
      page++;
    }
  }

  return codes;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const PAGE_SIZE = 1000;
    const codes = await fetchAllCashbackCodes(PAGE_SIZE);

    const usersWithCodes = codes.reduce<Record<string, any>>((acc, code) => {
      const { redeemed_by, redeemed_on } = code;
      if (redeemed_by) {
        if (!acc[redeemed_by]) {
          acc[redeemed_by] = {
            codes: [],
            first_time_redeemed:
              new Date(redeemed_on).getFullYear() === new Date().getFullYear(),
          };
        }
        acc[redeemed_by].codes.push(code);
      }
      return acc;
    }, {});

    const dataArray = Object.values(usersWithCodes);

    const rtp = dataArray
      .filter((user) => checkRedeemed(user.codes) >= 10)
      .sort((a, b) => b.codes.length - a.codes.length);

    res.status(200).json(rtp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
}
