// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import * as cheerio from "cheerio";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const API_KEY = process.env.NEXT_PUBLIC_WEB_SCRAP_API_KEY;

  const { api_key } = req.body;

  if (api_key !== API_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const config = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
      },
    };

    const data = await axios(
      "http://services.eaziness.com/eazyness/services/store/scheduled/duraproMothlySalesCommission.cfm",
      config
    )
      .then(async (res) => {
        const htmlData = res.data;
        const $ = cheerio.load(htmlData);
        const tables = $("table", htmlData);
        // console.log(tables.length);

        const byMonthData: any = [];
        const byMonth = $(tables[1]);
        const byMonthBody = byMonth.find("tbody");
        const byMonthBodyRow = byMonthBody.find("tr");
        let commission_by_month: any = [];

        byMonthBodyRow.each((index, element) => {
          const tb = $(element);

          const byMonthBodyRowData = tb.find("td");
          const byMonthRowContent: string[] = [];

          byMonthBodyRowData.each((index, element) => {
            const tb = $(element);

            const byMonthBodyRowDataText = tb.text();
            const formattedText = byMonthBodyRowDataText.replace(/\s\s+/g, " ");
            byMonthRowContent.push(formattedText);
          });
          byMonthData.push(byMonthRowContent);
          // console.log(byMonthRowContent);

          const formattedByMonthRowContent = byMonthData.map((data: any) => {
            const d = data;
            if (d) {
              return {
                title: d[0]?.slice(1, -1),
                target: d[1],
                sales: d[2],
                base_tier: d[3],
                one_percent: d[4],
                two_percent: d[5],
                five_percent: d[6],
                commission: d[7],
              };
            }
          });

          const removedEmptyTitle = formattedByMonthRowContent.filter(
            (data: any) => data.title !== " "
          );

          const removedEmptyArrays = removedEmptyTitle.filter(
            (value: any) => Object.keys(value).length > 1
          );

          const separatedNameFields = removedEmptyArrays.map(
            (data: any, index: number) => {
              const d = data;
              if (d.title) {
                return d;
              }
            }
          );

          const removeNulls = separatedNameFields.filter(
            (value: any) => value !== null
          );

          commission_by_month = removeNulls;
        });

        const month_indexes: any = [];

        const months_of_year = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        const month_titles: any = [];

        commission_by_month.map((dt: any, index: number) => {
          if (dt) {
            return months_of_year.map((month: any) => {
              if (dt.title.split(" ")[0] === month) {
                // console.log(dt.title);
                month_titles.push(dt.title);
                return month_indexes.push(index);
              }
            });
          }
        });

        const finalData: any = [];

        commission_by_month.filter((data: any, index: number) => {
          if (data) {
            const ranges = month_indexes;
            let d;

            for (let i = 0; i < month_indexes.length; i++) {
              if (index > ranges[i] && index < ranges[i + 1]) {
                d = {
                  ...data,
                  month: month_titles[i],
                };

                finalData.push(d);
                return {
                  ...data,
                  month: month_titles[i],
                };
              }
            }

            if (index > ranges[ranges.length - 1]) {
              d = {
                ...data,
                month: month_titles[month_titles.length - 1],
              };

              finalData.push(d);
              return {
                ...data,
                month: month_titles[month_titles.length - 1],
              };
            }
          }
        });

        const { data: employees, error } = await supabase
          .from("employees")
          .select("*");

        if (error) {
          console.log(error);
        }

        // console.log(employees);

        const updateValues: any = [];

        employees?.map((employee: any) => {
          finalData.filter((data: any) => {
            if (data && employee.name === data.title) {
              let d = {
                employee_id: employee.id,
                month: data.month,
                target: parseInt(data.target.replace(/,/g, "")),
                sales: parseInt(data.sales.replace(/,/g, "")),
                base_tier: parseInt(data.base_tier.replace(/,/g, "")),
                one_percent: parseInt(data.one_percent.replace(/,/g, "")),
                two_percent: parseInt(data.two_percent.replace(/,/g, "")),
                five_percent: parseInt(data.five_percent.replace(/,/g, "")),
                commission: parseInt(data.commission.replace(/,/g, "")),
              };
              updateValues.push(d);
              return;
            }
          });
        });

        updateValues?.map(async (val: any) => {
          const emp = val.employee_id;
          const month = val.month;

          const { data: exists, error: error2 } = await supabase
            .from("commission")
            .select("employee_id, month")
            .eq("employee_id", emp)
            .eq("month", month);

          if (error2) {
            console.log(error2);
          }

          if (exists?.length === 0) {
            const { error: createError } = await supabase
              .from("commission")
              .insert(val);
            if (createError) {
              console.log(createError);
            }
          }

          if (exists && exists?.length > 0) {
            const { error: updateError } = await supabase
              .from("commission")
              .update(val)
              .eq("employee_id", emp)
              .eq("month", month);

            if (updateError) {
              console.log(updateError);
            }
          }
        });

        return {
          // month_indexes,
          // month_titles,
          updateValues,
          // finalData,
          // commission_by_month,
        };
      })
      .catch((err) => console.log(err));

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
}
