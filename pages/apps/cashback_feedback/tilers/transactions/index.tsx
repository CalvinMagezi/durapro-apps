import FeedbackLayout from "@/components/layouts/FeedbackLayout";
import TilerTransactionsTable from "@/components/tables/cashback_feedback/TilerTransactionsTable";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { TilerTransactionType } from "@/typings";
import { Heading, Skeleton } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function TilerTransactionsPage() {
  const { profile } = useUser();
  const { data, isLoading } = useQuery(
    ["all_tiler_transactions", profile?.id],
    async () => {
      const { data, error } = await supabase
        .from("tiler_transaction")
        .select("*, tiler_profile(*, tracked_by(*))");
      if (error) {
        console.log(error);
        return [] as TilerTransactionType[];
      }
      return data as TilerTransactionType[];
    },
    {
      enabled: !!profile,
    }
  );
  return (
    <FeedbackLayout>
      <Heading>Tiler Transactions</Heading>

      <Skeleton isLoaded={!isLoading}>
        {data && data.length > 0 ? (
          <TilerTransactionsTable
            data={data}
            total={data.length}
            isAdmin={true}
          />
        ) : (
          <div className="text-center">
            <p>No transactions found</p>
          </div>
        )}
      </Skeleton>
    </FeedbackLayout>
  );
}

export default TilerTransactionsPage;
