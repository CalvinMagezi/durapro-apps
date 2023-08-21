import React from "react";
import { GetServerSideProps } from "next";
import sanityClient from "@/lib/sanity/sanityClient";

import { Heading, Skeleton } from "@chakra-ui/react";

import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import CashbackAdminLayout from "@/components/layouts/CashbackAdminLayout";
import UserCodesTable from "@/components/tables/cashback_admin/UserCodesTable";
import { ProfileType } from "@/typings";

function SingleUserPage() {
  // console.log(id);
  const router = useRouter();
  const id = router.query.id as string;

  const fetchCustomer = async () => {
    const { data: response, error: fetchError } = await supabase
      .from("cashback_users")
      .select("*")
      .eq("phone_number", id)
      .single();

    const { data } = await supabase
      .from("cashback_codes")
      .select("*")
      .eq("redeemed_by", response?.phone_number);

    const user_with_codes = { ...response, redeemed_codes: data };

    return user_with_codes as ProfileType;
  };

  const { data, isLoading } = useQuery(["customer", id], fetchCustomer, {
    enabled: !!id,
  });

  return (
    <CashbackAdminLayout>
      <Skeleton height="5rem" isLoaded={!isLoading}>
        {data && (
          <>
            <Heading className="text-center mb-10">
              {data?.phone_number}
            </Heading>
            <UserCodesTable
              codes={data.redeemed_codes}
              total={data.redeemed_codes.length}
              customer={data}
            />
          </>
        )}
      </Skeleton>
    </CashbackAdminLayout>
  );
}

export default SingleUserPage;
