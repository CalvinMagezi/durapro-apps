import CommissionLayout from "@/components/layouts/CommissionLayout";
import UserCommissionTable from "@/components/tables/UserCommissionTable";
import DefaultDashboardBanner from "@/components/utils/DefaultDashboardBanner";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { queryClient } from "@/pages/_app";
import { CommissionType } from "@/typings";
import { Box, Heading, IconButton } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaRedoAlt } from "react-icons/fa";

const styles = {
  activeTab: `bg-blue-600 text-white rounded-lg flex-shrink-0  p-3 shadow-lg flex flex-col items-center space-y-4 border border-black cursor-pointer hover:scale-105 transition duration-100 ease-in-out`,
  inactiveTab: `rounded-lg flex-shrink-0  p-3 shadow-lg flex flex-col items-center space-y-4 border border-black cursor-pointer hover:scale-105 transition duration-100 ease-in-out`,
};

function CommissionAppPage() {
  const { user, manualFetch } = useUser();
  const [months, setMonths] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>("June 2023");
  const [results, setResults] = useState<CommissionType[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const refetchScrapper = async () => {
    setLoading(true);
    const res = await fetch("/api/scrapper/commission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.NEXT_PUBLIC_WEB_SCRAP_API_KEY,
      }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Successfully fetched commission data", {
        duration: 5000,
      });
      setLoading(false);
      queryClient.invalidateQueries(["commission"]);
      return;
    } else {
      toast.error("Error fetching commission data", {
        duration: 5000,
      });
      setLoading(false);
      return;
    }
  };

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
      const uniqueMonths = Array.from(new Set(months)); // Remove duplicates

      const sortedMonths = uniqueMonths.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB.getTime() - dateA.getTime(); // Sort in descending order
      });

      setMonths(sortedMonths);
    }

    if (data && currentMonth) {
      const filteredData = data.filter((d) => d.month === currentMonth);
      setResults(filteredData);
    }
  }, [data, currentMonth]);

  // console.log(results);
  // console.log(months);

  return (
    <CommissionLayout>
      <DefaultDashboardBanner title="Staff Commission" />
      <Heading size="lg" className="text-center">
        Showing results for: {currentMonth}
      </Heading>
      <div className="flex items-center w-full justify-center">
        <IconButton
          aria-label="refresh"
          icon={<FaRedoAlt />}
          colorScheme="orange"
          onClick={refetchScrapper}
          isLoading={loading}
        />
      </div>
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
