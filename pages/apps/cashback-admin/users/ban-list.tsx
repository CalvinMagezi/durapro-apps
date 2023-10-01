import CashbackAdminLayout from "@/components/layouts/CashbackAdminLayout";
import TableLoading from "@/components/loaders/TableLoading";
import BanlistUsersTable from "@/components/tables/cashback_admin/BanlistUsersTable";
import { supabase } from "@/lib/supabaseClient";
import { queryClient } from "@/pages/_app";
import { BanlistUserType } from "@/typings";
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
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaRedo, FaSearch } from "react-icons/fa";

interface BanlistFiltered {
  phone_number: string;
  reasons: string[];
  occurrences: number;
}

function BanList() {
  const [users, setUsers] = useState<BanlistFiltered[]>([]);
  const [show, setShow] = useState(10);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const { data, isLoading, refetch, fetchStatus } = useQuery(
    ["banlist_users"],
    async () => {
      const { data, error } = await supabase.from("ban_list").select("*");
      if (error) {
        return [] as BanlistUserType[];
      }

      return data as BanlistUserType[];
    }
  );

  useEffect(() => {
    if (!data) return;

    let filtered: BanlistFiltered[] = [];

    data.forEach((user) => {
      let found = filtered.find((f) => f.phone_number === user.phone_number);
      if (found) {
        found.occurrences += 1;
        found.reasons.push(user.reason);
      } else {
        filtered.push({
          phone_number: user.phone_number,
          reasons: [user.reason],
          occurrences: 1,
        });
      }
    });

    //Filter out duplicate phone numbers

    filtered = filtered.filter(
      (user, index, self) =>
        index === self.findIndex((u) => u.phone_number === user.phone_number)
    );

    if (filter === "Invalid code entry." || filter === "Invalid code entry") {
      setUsers(
        filtered
          .filter((user) =>
            user.reasons.includes("Invalid code entry." || "Invalid code entry")
          )
          .slice(0, show)
          .sort((a, b) => b.reasons.length - a.reasons.length)
      );
    } else if (filter === "Attempting to redeem a redeemed code.") {
      setUsers(
        filtered
          .filter((user) =>
            user.reasons.includes("Attempting to redeem a redeemed code.")
          )
          .slice(0, show)
          .sort((a, b) => b.reasons.length - a.reasons.length)
      );
    } else {
      setUsers(
        filtered
          .slice(0, show)
          .sort((a, b) => b.reasons.length - a.reasons.length)
      );
    }

    if (term) {
      setUsers(
        users
          .filter((u) => u.phone_number.includes(term))
          .slice(0, show)
          //sort by number of reasons
          .sort((a, b) => b.reasons.length - a.reasons.length)
      );
    } else {
      setUsers(
        users.slice(0, show).sort((a, b) => b.reasons.length - a.reasons.length)
      );
    }
  }, [term, show, data, filter]);

  return (
    <CashbackAdminLayout>
      <div>
        <div className="justify-center text-center">
          <Heading className="text-center">Users On The Banlist</Heading>
          <IconButton
            aria-label="Refresh"
            icon={<FaRedo />}
            colorScheme="orange"
            isLoading={loading}
            onClick={async () => {
              setLoading(true);

              await queryClient
                .invalidateQueries(["banlist_users"])
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
                      Filter by reason
                    </Text>
                    <Select
                      defaultValue={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value={"all"}>All</option>
                      <option value={"Invalid code entry"}>
                        Invalid code entry
                      </option>
                      <option value={"Attempting to redeem a redeemed code."}>
                        Attempting to redeem a redeemed code.
                      </option>
                    </Select>
                  </div>
                </div>
                {isLoading ||
                  (fetchStatus === "fetching" && (
                    <TableLoading loading={isLoading} />
                  ))}
                <Skeleton isLoaded={!isLoading} height="5rem">
                  <BanlistUsersTable banlist_user={users} filter={filter} />
                </Skeleton>
              </>
            )}
          </div>
        </Skeleton>
      </div>
    </CashbackAdminLayout>
  );
}

export default BanList;
