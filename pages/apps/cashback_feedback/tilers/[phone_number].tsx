import FeedbackLayout from "@/components/layouts/FeedbackLayout";
import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabaseClient";
import {
  CashbackCodeType,
  TilerProfileType,
  TilerTransactionType,
} from "@/typings";
import {
  Button,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Skeleton,
  Text,
  Textarea,
} from "@chakra-ui/react";

import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import useUser from "@/hooks/useUser";
import CheckRedeemed from "@/helpers/CheckRedeemed";
import AllCodesTable from "@/components/tables/cashback_feedback/AllCodesTable";
import NewTransactionModal from "@/components/modals/cashback_feedback/NewTransactionModal";
import { useQuery } from "@tanstack/react-query";
import TilerTransactionsTable from "@/components/tables/cashback_feedback/TilerTransactionsTable";

type FormValues = {
  first_name: string;
  last_name: string;
  contact: string;
  shop_name: string;
  city: string;
  site_location: string;
  quantity_bought: string;
  redeemed: string;
  not_redeemed: string;
  comment: string;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const phone_number = ctx.params?.phone_number;

  const { data, error } = await supabase
    .from("tiler_profile")
    .select("*")
    .eq("phone_number", phone_number)
    .single();

  if (error) {
    console.log(error);
  }

  const { data: user_codes, error: codes_error } = await supabase
    .from("cashback_codes")
    .select("*")
    .eq("redeemed_by", phone_number);

  if (codes_error) {
    console.log(codes_error);
  }

  return {
    props: {
      tiler: data,
      user_codes: user_codes,
    },
  };
};

function SingleTilerPage({
  tiler,
  user_codes,
}: {
  tiler: TilerProfileType;
  user_codes: CashbackCodeType[];
}) {
  // console.log(tiler);
  // console.log(user_codes);

  const [loading, setLoading] = useState(false);
  const { profile } = useUser();
  const router = useRouter();
  const [redeemed_codes, setRedeemedCodes] = useState<CashbackCodeType[]>([]);
  const [filter, setFilter] = useState("all");

  const { data: transactions, isLoading } = useQuery(
    ["tiler_transactions", tiler?._id],
    async () => {
      const { data, error } = await supabase
        .from("tiler_transaction")
        .select("*")
        .eq("tiler_profile", tiler?._id);

      if (error) {
        console.log(error);
      }

      return data as TilerTransactionType[];
    },
    {
      enabled: !!tiler,
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!tiler) {
      toast.error("Error updating tiler profile, please try again", {
        duration: 3000,
      });
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from("tiler_profile")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
      })
      .eq("_id", tiler._id);

    if (error) {
      console.log(error);
      toast.error("Error updating profile, please try again", {
        duration: 3000,
      });
    } else {
      toast.success("Successfully updated profile", {
        duration: 3000,
      });
      router.push(`/apps/cashback_feedback/tilers/${tiler.phone_number}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (filter === "all") {
      setRedeemedCodes(user_codes);
    } else if (filter === "unpaid") {
      setRedeemedCodes(
        user_codes.filter((code) => code.funds_disbursed === false)
      );
    } else if (filter === "paid") {
      setRedeemedCodes(
        user_codes.filter((code) => code.funds_disbursed === true)
      );
    }
  }, [filter, user_codes]);

  return (
    <FeedbackLayout>
      {!tiler && <div className="text-center">No tiler found</div>}

      <Heading className="text-center" size="lg">
        User: {tiler?.phone_number}
      </Heading>
      <Heading className="text-center mt-5" size="md">
        Total Of: {user_codes?.length} Codes Redeemed
      </Heading>
      <div className="flex justify-center w-full mt-5">
        <NewTransactionModal tiler={tiler} />
      </div>

      <div className="max-w-7xl mx-auto">
        <form className="mt-10" onSubmit={handleSubmit(onSubmit)}>
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
            <GridItem>
              <Text className="font-semibold mb-3">Tiler First Name:</Text>
              <Input
                type="text"
                {...register("first_name")}
                defaultValue={tiler?.first_name}
              />
            </GridItem>
            <GridItem>
              <Text className="font-semibold mb-3">Tiler Last Name:</Text>
              <Input
                type="text"
                {...register("last_name")}
                defaultValue={tiler?.last_name}
              />
            </GridItem>
            <GridItem>
              <Text className="font-semibold mb-3">Contact:</Text>
              <Input
                readOnly={true}
                type="tel"
                {...register("contact")}
                defaultValue={tiler?.phone_number}
              />
            </GridItem>

            <GridItem>
              <Button
                colorScheme="green"
                type="submit"
                className="w-full h-full"
                isLoading={loading}
              >
                Update Details
              </Button>
            </GridItem>
          </Grid>
        </form>
      </div>

      <div className="mt-10">
        <Heading className="mb-10" size="lg">
          Transaction Details:
        </Heading>

        <Skeleton isLoaded={!isLoading}>
          {transactions && transactions.length > 0 ? (
            <TilerTransactionsTable
              data={transactions}
              total={transactions.length}
            />
          ) : (
            <div className="text-center">No transactions found</div>
          )}
        </Skeleton>
      </div>

      <div className="mt-10">
        <Heading className="mb-10" size="lg">
          Redeemed Codes:
        </Heading>
        <div className="flex items-center justify-between w-full">
          <div>
            <Heading size="md" className="mb-3">
              Show:
            </Heading>
            <Select
              defaultValue="all"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </Select>
          </div>
          <div>
            <Heading size="md" className="mb-3">
              Paid Codes:
            </Heading>
            <Heading>
              {
                redeemed_codes.filter((code) => code.funds_disbursed === true)
                  .length
              }
            </Heading>
          </div>
          <div>
            <Heading size="md" className="mb-3">
              Unpaid Codes:
            </Heading>
            <Heading>
              {
                redeemed_codes.filter((code) => code.funds_disbursed === false)
                  .length
              }
            </Heading>
          </div>
        </div>
        {user_codes && user_codes.length > 0 ? (
          <AllCodesTable codes={redeemed_codes} total={redeemed_codes.length} />
        ) : (
          <div className="text-center">No codes found</div>
        )}
      </div>
    </FeedbackLayout>
  );
}

export default SingleTilerPage;
