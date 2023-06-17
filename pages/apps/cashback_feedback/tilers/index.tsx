import FeedbackLayout from "@/components/layouts/FeedbackLayout";
import AllTilersTable from "@/components/tables/cashback_feedback/AllTilersTable";
import TilerProfilesTable from "@/components/tables/cashback_feedback/TilerProfilesTable";
import CheckRedeemed from "@/helpers/CheckRedeemed";
import { supabase } from "@/lib/supabaseClient";
import { CashbackCodeType, ProfileType, TilerProfileType } from "@/typings";
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
    const { data: res, error } = await supabase
      .from("tiler_profile")
      .select("*, tracked_by(*)");
    // const data = await fetchAllRedeemedCodes(null);

    if (error) {
      console.log(error);
      return [] as TilerProfileType[];
    }

    return res as TilerProfileType[];
  };

  const { data, isLoading, status } = useQuery(["all_profiles"], fetchAllUsers);

  console.log(data);

  return (
    <FeedbackLayout>
      <Heading className="text-center">All Tilers:</Heading>

      <Skeleton
        isLoaded={!isLoading}
        height={status === "loading" ? "100vh" : "auto"}
      >
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
            <TilerProfilesTable tilers={data} />
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
