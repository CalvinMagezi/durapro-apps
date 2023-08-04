interface TableProps {
  data: any[];
  columns: string[];
}

import { format } from "date-fns";

// This is the helper function
export const formatSupabaseData = (data: any): TableProps => {
  // If there's no data, return empty arrays
  if (data.length === 0) {
    return { data: [], columns: [] };
  }

  // Get the columns from the keys of the first object in the data array
  let columns = Object.keys(data[0]);

  // Format the data array
  const formattedData = data.map((item: any) => {
    return columns.reduce((obj: any, key: string) => {
      // Format the created_at field
      if (key === "created_at") {
        obj[key] = format(new Date(item[key]), "yyyy-MM-dd HH:mm");
      } else {
        obj[key] = item[key];
      }
      return obj;
    }, {});
  });

  return { data: formattedData, columns };
};
