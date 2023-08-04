import FeedbackLayout from "@/components/layouts/FeedbackLayout";
import TrackNewTilerModal from "@/components/modals/cashback_feedback/TrackNewTilerModal";
import MyTilersTable from "@/components/tables/cashback_feedback/MyTilersTable";
import TilerTransactionsTable from "@/components/tables/cashback_feedback/TilerTransactionsTable";
import DefaultDashboardBanner from "@/components/utils/DefaultDashboardBanner";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { TilerProfileType, TilerTransactionType } from "@/typings";
import { Button, Heading, Skeleton } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FaPlus } from "react-icons/fa";

function CashbackFeedbackPage() {
  const { profile } = useUser();

  const { data, isLoading } = useQuery(
    ["my_tilers", profile?.id],
    async () => {
      const { data, error } = await supabase
        .from("tiler_profile")
        .select("*")
        .eq("tracked_by", profile?.id);
      if (error) {
        console.log(error);
        return [] as TilerProfileType[];
      }
      return data as TilerProfileType[];
    },
    {
      enabled: !!profile,
    }
  );

  const { data: transactions, isLoading: loadingTransactions } = useQuery(
    ["latest_tiler_transactions", profile?.id],
    async () => {
      const { data, error } = await supabase
        .from("tiler_transaction")
        .select("*, tiler_profile(*, tracked_by(*))")
        .limit(10);
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
      <DefaultDashboardBanner title="Cashback Feedback" />
      {profile?.role === "admin" ? (
        <>
          <div className="flex items-center justify-between w-full">
            <Heading>Most recent tiler transactions:</Heading>
          </div>

          <Skeleton isLoaded={!loadingTransactions}>
            {transactions && transactions.length > 0 ? (
              <TilerTransactionsTable
                data={transactions}
                total={transactions.length}
                isAdmin={true}
              />
            ) : (
              <div className="text-center">
                <p>No transactions found</p>
              </div>
            )}
          </Skeleton>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between w-full">
            <Heading>Tilers I Am Tracking:</Heading>
            <div>
              <TrackNewTilerModal />
            </div>
          </div>

          <Skeleton isLoaded={!isLoading}>
            {data && data.length > 0 ? (
              <MyTilersTable tilers={data} />
            ) : (
              <div className="text-center">
                <p>You are not tracking any tilers yet</p>
                <p>Click the button above to track a new tiler</p>
              </div>
            )}
          </Skeleton>
        </>
      )}
    </FeedbackLayout>
  );
}

export default CashbackFeedbackPage;
