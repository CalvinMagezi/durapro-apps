import FeedbackLayout from "@/components/layouts/FeedbackLayout";
import AllTilersTable from "@/components/tables/cashback_feedback/AllTilersTable";
import CheckRedeemed from "@/helpers/CheckRedeemed";
import { supabase } from "@/lib/supabaseClient";
import { CashbackCodeType, ProfileType } from "@/typings";
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
import { PostgrestResponse } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaSearch } from "react-icons/fa";

function TilersPage() {
  const [users, setUsers] = useState<ProfileType[]>([]);
  const [show, setShow] = useState(10);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");

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

  async function fetchAllRedeemedCodes(
    lastCodeId: string | null,
    allRedeemedCodes: CashbackCodeType[] = []
  ): Promise<CashbackCodeType[]> {
    const response: any = await supabase
      .from("cashback_codes")
      .select("*")
      .filter("redeemed", "eq", true)
      .range(0, 1000)
      .gt("_id", lastCodeId || "");

    const { data, error, count } = response;

    if (error || !data || data.length === 0) {
      if (error) {
        console.error("Error fetching codes", error);
      }
      return allRedeemedCodes;
    } else {
      const lastIdInResponse = data[data.length - 1]._id;
      return fetchAllRedeemedCodes(lastIdInResponse, [
        ...allRedeemedCodes,
        ...data,
      ]);
    }
  }

  const fetchAllUsers = async () => {
    const response = await fetch("/api/users/all");
    const res = await response.json();

    const data = await fetchAllRedeemedCodes(null);
    console.log(res);
    console.log(data);

    if (res.success) {
      // create a lookup table from redeemed codes by phone number
      const redeemedCodesByPhoneNumber: { [key: string]: CashbackCodeType[] } =
        {};
      data.forEach((code) => {
        if (!redeemedCodesByPhoneNumber[code.redeemed_by]) {
          redeemedCodesByPhoneNumber[code.redeemed_by] = [];
        }
        redeemedCodesByPhoneNumber[code.redeemed_by].push(code);
      });

      const users_with_codes = res.users.map((user: ProfileType) => {
        const user_codes = redeemedCodesByPhoneNumber[user.phone_number] || [];
        return { ...user, redeemed_codes: user_codes };
      });
      return users_with_codes.sort(
        (a: any, b: any) =>
          CheckRedeemed(b.redeemed_codes) - CheckRedeemed(a.redeemed_codes)
      ) as ProfileType[];
    } else {
      return [] as ProfileType[];
    }
  };

  const { data, isLoading, status } = useQuery(["all_users"], fetchAllUsers);

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

  console.log(data);

  return (
    <FeedbackLayout>
      <Heading className="text-center">All Tilers:</Heading>

      <Skeleton isLoaded={!isLoading}>
        {data && (
          <>
            <div className="flex items-center space-x-4 w-full">
              <div>
                <Text className="font-light mb-3 text-sm">
                  0 to {show} of {filter === "all" ? data.length : users.length}{" "}
                  records
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
            <AllTilersTable users={data} />
            <div className="flex justify-center w-full mt-10 items-center space-x-6">
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
            </div>
          </>
        )}
      </Skeleton>
    </FeedbackLayout>
  );
}

export default TilersPage;
