import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { CashbackCodeType } from "@/typings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const total_codes = await supabase
      .from("cashback_codes")
      .select("code", { count: "exact", head: true });

    const total_users = await supabase
      .from("cashback_users")
      .select("phone_number", { count: "exact", head: true });

    const total_redeemed_codes = await supabase
      .from("cashback_codes")
      .select("code", { count: "exact", head: true })
      .eq("redeemed", true);

    const latest_users = await supabase
      .from("cashback_users")
      .select("*")
      .order("_createdAt", { ascending: false })
      .limit(10);

    const latest_redeemed_codes = await supabase
      .from("cashback_codes")
      .select("*")
      .order("redeemed_on", { ascending: false })
      .neq("redeemed_by", null)
      .neq("redeemed_on", null)
      .limit(10);

    const total_paid_out = await supabase
      .from("cashback_codes")
      .select("code", { count: "exact", head: true })
      .eq("redeemed", true)
      .eq("funds_disbursed", true);

    return res.status(200).json({
      total_codes: total_codes.count,
      total_users: total_users.count,
      total_redeemed_codes: total_redeemed_codes.count,
      latest_users: latest_users.data,
      latest_redeemed_codes: latest_redeemed_codes.data,
      total_paid_out: total_paid_out.count,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred. Please try again." });
  }
}

export const config = {
  api: {
    responseLimit: false,
    // responseLimit: '8mb',
  },
};
