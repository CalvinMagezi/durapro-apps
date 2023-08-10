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

import { GetServerSideProps } from "next";
import { GetUsersWithCodes } from "@/lib/graphql/queries";
import client from "@/lib/graphql/apollo-client";
import { GetStaticProps } from "next";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { CashbackCodeType, CashbackUserType } from "@/typings";
import CashbackAdminLayout from "@/components/layouts/CashbackAdminLayout";
import { queryClient } from "@/pages/_app";
import TableLoading from "@/components/loaders/TableLoading";
import AllUsersTable from "@/components/tables/cashback_admin/AllUsersTable";

// export const getStaticProps: GetStaticProps = async (ctx) => {
//   const { data } = await client.query({
//     query: GetUsersWithCodes,
//   });

//   const d = data.cashback_usersList;

//   return {
//     props: {
//       d,
//     },
//     revalidate: 10,
//   };
// };

function UsersPage() {
  const [users, setUsers] = useState<CashbackUserType[]>([]);
  const [show, setShow] = useState(10);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // console.log(d);

  const { data, isLoading, refetch, fetchStatus } = useQuery(
    ["all_users"],
    async () => {
      const { data } = await client.query({
        query: GetUsersWithCodes,
      });
      return data.cashback_usersList as CashbackUserType[];
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
    if (!data || data?.length === 0) return;

    if (term) {
      setUsers(data.filter((u) => u.phone_number.includes(term)));
    } else {
      setUsers(
        data
          .slice(0, show)
          .sort(
            (a, b) =>
              CheckRedeemed(b.redeemed_codes) - CheckRedeemed(a.redeemed_codes)
          )
      );
    }

    if (filter === "ready to pay") {
      setUsers(
        data
          .filter((user) => CheckRedeemed(user.redeemed_codes) >= 10)
          .slice(0, show)
          .sort((a, b) => b.redeemed_codes.length - a.redeemed_codes.length)
      );
    } else if (filter === "redeemed codes") {
      setUsers(
        data
          .filter((user) => user.redeemed_codes.length > 0)
          .slice(0, show)
          .sort((a, b) => b.redeemed_codes.length - a.redeemed_codes.length)
      );
    } else if (filter === "redeemed but not ready to paid") {
      setUsers(
        data
          .filter(
            (user) =>
              user.redeemed_codes.length > 0 &&
              CheckRedeemed(user.redeemed_codes) > 0
          )
          .slice(0, show)
          .sort((a, b) => b.redeemed_codes.length - a.redeemed_codes.length)
      );
    }
  }, [term, show, data, filter]);

  console.log(fetchStatus);

  return (
    <CashbackAdminLayout>
      <div className="justify-center text-center">
        <Heading className="text-center">View All Users</Heading>
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

                <div>
                  <Text className="font-light text-center mb-3 text-sm">
                    Filter users
                  </Text>
                  <Select
                    defaultValue={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value={"all"}>All</option>
                    <option value={"ready to pay"}>Ready To Pay</option>
                    <option value={"redeemed codes"}>Has Redeemed Codes</option>
                    <option value={"redeemed but not ready to paid"}>
                      Has redeemed but not ready to pay
                    </option>
                  </Select>
                </div>
              </div>
              {isLoading ||
                (fetchStatus === "fetching" && (
                  <TableLoading loading={isLoading} />
                ))}
              <Skeleton isLoaded={!isLoading} height="5rem">
                <AllUsersTable users={users} filter={filter} />
              </Skeleton>
              {/* <div className="flex justify-center w-full mt-10 items-center space-x-6">
              {show === 10 ? (
                <>
                  <IconButton
                    aria-label="more"
                    icon={<FaArrowDown />}
                    colorScheme="green"
                    onClick={() => setShow(show + 10)}
                  />
                </>
              ) : (
                <>
                  <IconButton
                    aria-label="more"
                    icon={<FaArrowDown />}
                    colorScheme="green"
                    onClick={() => setShow(show + 10)}
                  />
                  <IconButton
                    aria-label="more"
                    icon={<FaArrowUp />}
                    colorScheme="orange"
                    onClick={() => {
                      if (show !== 10) {
                        setShow(show - 10);
                      }
                    }}
                  />
                </>
              )}
            </div> */}
            </>
          )}
        </div>
      </Skeleton>
    </CashbackAdminLayout>
  );
}

export default UsersPage;