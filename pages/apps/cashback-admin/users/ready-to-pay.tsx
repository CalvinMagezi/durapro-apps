import {
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaRedo, FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { CashbackCodeType, CashbackUserType } from "@/typings";
import CashbackAdminLayout from "@/components/layouts/CashbackAdminLayout";
import { queryClient } from "@/pages/_app";
import TableLoading from "@/components/loaders/TableLoading";
import AllUsersTable from "@/components/tables/cashback_admin/AllUsersTable";
import { supabase } from "@/lib/supabaseClient";

interface CashbackUserWithCodesType {
  codes: CashbackCodeType[];
  first_time_redeemed: boolean;
}

function ReadyToPayPage() {
  const [users, setUsers] = useState<CashbackUserWithCodesType[]>([]);
  const [show, setShow] = useState(10);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("ready to pay");
  const [loading, setLoading] = useState(false);

  // console.log(d);

  const { data, isLoading, refetch, fetchStatus } = useQuery(
    ["ready_to_pay"],
    async () => {
      const users = await fetch("/api/db/users/ready-to-pay")
        .then(async (response) => {
          const data = await response.json();
          // console.log(data);
          if (data) {
            return data as CashbackUserWithCodesType[];
          } else {
            return [] as CashbackUserWithCodesType[];
          }
        })
        .catch((error) => {
          console.error(error);
          return [] as CashbackUserWithCodesType[];
        });

      return users;
    }
  );

  function CheckRedeemed(redeemed_codes: CashbackCodeType[]) {
    if (redeemed_codes.length === 0) return 0;
    let count = 0;
    redeemed_codes.forEach((code) => {
      if (code.funds_disbursed === false) {
        count += 1;
      }
    });
    return count;
  }

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    if (term) {
      setUsers(
        data.filter((u) => u.codes.some((c) => c.redeemed_by.includes(term)))
      );
    } else {
      setUsers(
        data
          .slice(0, show)
          .sort((a, b) => CheckRedeemed(b.codes) - CheckRedeemed(a.codes))
      );
    }
  }, [term, show, data]);

  console.log(data);

  return (
    <CashbackAdminLayout>
      <div className="justify-center text-center">
        <Heading className="text-center">Users Ready To Be Paid</Heading>
        <IconButton
          aria-label="Refresh"
          icon={<FaRedo />}
          colorScheme="orange"
          isLoading={loading}
          onClick={async () => {
            setLoading(true);

            await queryClient
              .invalidateQueries(["all_users"])
              .then(() => {
                toast.success("Refreshed Successfully", {
                  duration: 3000,
                });
              })
              .catch((err) => {
                console.log(err);
                toast.error("Something went wrong", {
                  duration: 3000,
                });
              });

            refetch();

            setLoading(false);
          }}
        />
      </div>

      <Skeleton height="5rem" isLoaded={!isLoading}>
        <div className="mt-10 ">
          {data && (
            <>
              <div className="flex items-center space-x-4 w-full">
                <div>
                  <Text className="font-light mb-3 text-sm">
                    0 to {show} of{" "}
                    {filter === "all" ? data?.length : users.length} records
                  </Text>
                  <Select
                    defaultValue={show}
                    onChange={(e) => setShow(parseInt(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                    <option value={10000}>10000</option>
                  </Select>
                </div>

                <div className="flex-grow">
                  <Text className="font-light text-center mb-3 text-sm">
                    Search for a user
                  </Text>
                  <InputGroup>
                    <InputLeftElement>
                      <FaSearch />
                    </InputLeftElement>
                    <Input
                      onChange={(e) => setTerm(e.target.value)}
                      type="text"
                      placeholder="...."
                    />
                  </InputGroup>
                </div>
              </div>
              {isLoading ||
                (fetchStatus === "fetching" && (
                  <TableLoading loading={isLoading} />
                ))}
              <Skeleton isLoaded={!isLoading} height="5rem">
                <AllUsersTable users={users} filter={filter} />
              </Skeleton>
            </>
          )}
        </div>
      </Skeleton>
    </CashbackAdminLayout>
  );
}

export default ReadyToPayPage;
