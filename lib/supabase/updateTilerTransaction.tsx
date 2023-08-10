import { TilerTransactionType } from "@/typings";
import { supabase } from "../supabaseClient";

export async function updateTilerTransaction(
  transaction: TilerTransactionType
) {
  console.log(transaction);
  const { data, error } = await supabase
    .from("tiler_transaction")
    .update({
      city: transaction.city,
      shop_name: transaction.shop_name,
      site_location: transaction.site_location,
      quantity_bought: transaction.quantity_bought,
    })
    .eq("id", transaction.id);

  if (error) {
    // throw new Error("Failed to update transaction");
    console.log(error);
  }

  return data;
}
