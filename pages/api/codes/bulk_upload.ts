import { supabase } from "@/lib/supabaseClient";
import { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "xlsx";

function removeDuplicates(arr: number[]) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //   if (req.method !== "POST") {
  //     return res.status(404).json({ success: false });
  //   }

  try {
    const workbook = readFile("public/data.xlsx");
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const items = [];
    for (let i = 1; ; i++) {
      const cell = worksheet[`A${i}`];
      if (!cell || !cell.v) {
        break;
      }
      items.push(cell.v);
    }
    console.log(items);

    const no_dupes = removeDuplicates(items);

    const no_nulls = no_dupes.filter((item) => item !== null);

    const items_as_codes = no_nulls.map((item) => {
      return {
        _id: `code-${item}`,
        code: item,
        product_name: "Normal Tile Adhesive",
        _createdAt: new Date().toISOString(),
        redeemed: false,
        funds_disbursed: false,
      };
    });

    //bunch into 5000s and upload to supabase
    const bunches = [];
    const bunch_size = 5000;
    for (let i = 0; i < items_as_codes.length; i += bunch_size) {
      bunches.push(items_as_codes.slice(i, i + bunch_size));
    }

    for (let i = 0; i < bunches.length; i++) {
      const { data: created, error } = await supabase
        .from("cashback_codes")
        .upsert(bunches[i])
        .select();

      if (error) {
        console.log(error);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ success: false });
  }
}
