import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  CashbackCodeType,
  TilerProfileType,
  TilerTransactionType,
} from "@/typings";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Skeleton,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { TilerAtom } from "@/atoms/TilerAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import useUser from "@/hooks/useUser";
import TilerTransactionsTable from "@/components/tables/cashback_feedback/TilerTransactionsTable";
import AllCodesTable from "@/components/tables/cashback_feedback/AllCodesTable";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/pages/_app";
import NewTransactionModal from "@/components/modals/cashback_feedback/NewTransactionModal";

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

function TilerDetailsDrawer() {
  const [tiler, setTiler] = useRecoilState(TilerAtom);
  const [loading, setLoading] = useState(false);
  const { profile } = useUser();
  const router = useRouter();
  const [redeemed_codes, setRedeemedCodes] = useState<CashbackCodeType[]>([]);
  const [filter, setFilter] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const { data: user_codes, isLoading: userCodesLoading } = useQuery(
    ["tiler_redeemed_codes", tiler?._id],
    async () => {
      const { data, error: codes_error } = await supabase
        .from("cashback_codes")
        .select("*")
        .eq("redeemed_by", tiler?.phone_number);

      if (codes_error) {
        console.log(codes_error);
      }

      return data as CashbackCodeType[];
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
      queryClient.invalidateQueries({
        queryKey: ["tiler_transactions", "tiler_redeemed_codes"],
      });
      onClose();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!user_codes) return;
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
    <Drawer
      isOpen={tiler !== null}
      onClose={() => {
        setTiler(null);
        onClose();
      }}
      placement="right"
      size="xl"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <Heading className="text-center" size="lg">
            User: {tiler?.phone_number}
          </Heading>

          {tiler && (
            <div className="flex justify-center w-full mt-5">
              <NewTransactionModal tiler={tiler} />
            </div>
          )}
        </DrawerHeader>
        <DrawerBody>
          <div className="max-w-7xl mx-auto">
            <form className="mt-10" onSubmit={handleSubmit(onSubmit)}>
              <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                <GridItem>
                  <Text className="font-semibold mb-3">
                    Tiler First Name:
                    <span className="text-sm"> {tiler?.first_name}</span>
                  </Text>
                  <Input type="text" {...register("first_name")} />
                </GridItem>
                <GridItem>
                  <Text className="font-semibold mb-3">
                    Tiler Last Name:
                    <span className="text-sm"> {tiler?.last_name}</span>
                  </Text>
                  <Input type="text" {...register("last_name")} />
                </GridItem>
                <GridItem>
                  <Text className="font-semibold mb-3">
                    Contact:
                    <span className="text-sm"> {tiler?.phone_number}</span>
                  </Text>
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
                    redeemed_codes.filter(
                      (code) => code.funds_disbursed === true
                    ).length
                  }
                </Heading>
              </div>
              <div>
                <Heading size="md" className="mb-3">
                  Unpaid Codes:
                </Heading>
                <Heading>
                  {
                    redeemed_codes.filter(
                      (code) => code.funds_disbursed === false
                    ).length
                  }
                </Heading>
              </div>
            </div>
            <Skeleton isLoaded={!userCodesLoading}>
              {user_codes && user_codes.length > 0 ? (
                <AllCodesTable
                  codes={redeemed_codes}
                  total={redeemed_codes.length}
                />
              ) : (
                <div className="text-center">No codes found</div>
              )}
            </Skeleton>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default TilerDetailsDrawer;
