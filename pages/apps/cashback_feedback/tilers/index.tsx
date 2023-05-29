import FeedbackLayout from "@/components/layouts/FeedbackLayout";
import AllTilersTable from "@/components/tables/cashback_feedback/AllTilersTable";
import CheckRedeemed from "@/helpers/CheckRedeemed";
import { supabase } from "@/lib/supabaseClient";
import { ProfileType } from "@/typings";
import { Heading, Skeleton } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function TilersPage() {
  const { data: tilers, isLoading } = useQuery(["all_users"], async () => {
    const response = await fetch("/api/db/users/all");
    const res = await response.json();
    const { data, error } = await supabase
      .from("cashback_codes")
      .select("*")
      .eq("redeemed", true);

    if (res.success) {
      const users_with_codes = res.users.map((user: ProfileType) => {
        const user_codes = data?.filter(
          (code) => code.redeemed_by === user.phone_number
        );
        return { ...user, redeemed_codes: user_codes };
      });
      return users_with_codes.sort(
        (a: any, b: any) =>
          CheckRedeemed(b.redeemed_codes) - CheckRedeemed(a.redeemed_codes)
      ) as ProfileType[];
    } else {
      return [] as ProfileType[];
    }
  });

  console.log(tilers);
  return (
    <FeedbackLayout>
      <Heading className="text-center">All Tilers:</Heading>

      <Skeleton isLoaded={!isLoading}>
        {tilers && <AllTilersTable users={tilers} />}
      </Skeleton>
    </FeedbackLayout>
  );
}

export default TilersPage;
