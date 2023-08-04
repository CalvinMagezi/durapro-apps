import FeedbackLayout from "@/components/layouts/FeedbackLayout";
import AssignTilerModal from "@/components/modals/cashback_feedback/AssignTilerModal";
import AllTilersTable from "@/components/tables/cashback_feedback/AllTilersTable";
import TilerProfilesTable from "@/components/tables/cashback_feedback/TilerProfilesTable";
import { useDB } from "@/contexts/DBContext";
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
  const [users, setUsers] = useState<TilerProfileType[]>([]);
  const [allTrackers, setAllTrackers] = useState<string[]>([]);
  const [show, setShow] = useState(10);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const { permissions } = useDB();

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

  // console.log(data);

  useEffect(() => {
    if (!data) return;
    setUsers(data.slice(0, show));

    const trackers = data.map((profile) => profile.tracked_by?.full_name || "");

    const uniqueTrackers = trackers.filter(
      (tracker, index) => trackers.indexOf(tracker) === index
    );

    setAllTrackers(uniqueTrackers);

    if (term) {
      const profiles = data.filter((profile) => {
        return (
          profile.phone_number
            .toLocaleLowerCase()
            .includes(term.toLocaleLowerCase()) ||
          profile.first_name
            .toLocaleLowerCase()
            .includes(term.toLocaleLowerCase()) ||
          profile.last_name
            .toLocaleLowerCase()
            .includes(term.toLocaleLowerCase())
        );
      });
      setUsers(profiles.slice(0, show));
    }

    if (filter !== "all") {
      const profiles = data.filter((profile) => {
        return profile.tracked_by?.full_name === filter;
      });
      setUsers(profiles.slice(0, show));
    }
  }, [term, filter, show, data]);

  return (
    <FeedbackLayout>
      <Heading className="text-center">All Tilers:</Heading>

      <div className="justify-center w-full items-center flex my-5">
        <AssignTilerModal />
      </div>

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
                  Filter tracked by
                </Text>
                <Select
                  defaultValue={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value={"all"}>All</option>
                  {allTrackers.map((tracker, index) => (
                    <option key={index} value={tracker}>
                      {tracker}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <TilerProfilesTable tilers={users} />
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
