import CommissionLayout from "@/components/layouts/CommissionLayout";
import UserCommissionTable from "@/components/tables/UserCommissionTable";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { CommissionType } from "@/typings";
import { Box, Heading } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

const styles = {
  activeTab: `bg-blue-600 text-white rounded-lg flex-shrink-0  p-3 shadow-lg flex flex-col items-center space-y-4 border border-black cursor-pointer hover:scale-105 transition duration-100 ease-in-out`,
  inactiveTab: `rounded-lg flex-shrink-0  p-3 shadow-lg flex flex-col items-center space-y-4 border border-black cursor-pointer hover:scale-105 transition duration-100 ease-in-out`,
};

function CommissionAppPage() {
  const { user, manualFetch } = useUser();
  const [months, setMonths] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>("November 2022");
  const [results, setResults] = useState<CommissionType[]>([]);

  const { data, isLoading, error } = useQuery(
    ["commission"],
    async () => {
      const { data, error } = await supabase
        .from("commission")
        .select("*, employee_id(id, name)")
        .order("month", { ascending: false });

      if (error) {
        return [] as CommissionType[];
      }

      if (data) {
        return data as CommissionType[];
      } else {
        return [] as CommissionType[];
      }
    },
    {
      enabled: !!user,
    }
  );

  // console.log(data);

  useEffect(() => {
    if (data) {
      const months = data.map((d) => d.month);
      const uniqueMonths = [];

      for (let i = 0; i < months.length; i++) {
        if (uniqueMonths.indexOf(months[i]) === -1) {
          uniqueMonths.push(months[i]);
        }
      }
      setMonths(uniqueMonths);
    }

    if (data && currentMonth) {
      const filteredData = data.filter((d) => d.month === currentMonth);
      setResults(filteredData);
    }
  }, [data, currentMonth]);

  // console.log(results);
  console.log(months);

  return (
    <CommissionLayout>
      <Heading size="lg" className="text-center">
        Showing results for: {currentMonth}
      </Heading>
      <div className="overflow-x-scroll my-10 py-3">
        <div className="flex flex-shrink-0 items-center space-x-4 w-3/4 ">
          {months?.map((month, index) => (
            <div
              key={index}
              className={`${
                currentMonth === month ? styles.activeTab : styles.inactiveTab
              }`}
              onClick={() => setCurrentMonth(month)}
            >
              <Heading size="md">{month}</Heading>
            </div>
          ))}
        </div>
      </div>

      <UserCommissionTable results={results} />
    </CommissionLayout>
  );
}

export default CommissionAppPage;
