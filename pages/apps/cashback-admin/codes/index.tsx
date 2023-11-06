import TableLoading from "@/components/loaders/TableLoading";

import sanityClient from "@/lib/sanity/sanityClient";
import { supabase } from "@/lib/supabaseClient";
import {
  Button,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCross,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { ImCross } from "react-icons/im";

import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { CashbackCodeType } from "@/typings";
import CashbackAdminLayout from "@/components/layouts/CashbackAdminLayout";
import AllCodesTable from "@/components/tables/cashback_admin/AllCodesTable";

type FormValues = {
  code: string;
};

function AllCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [show, setShow] = useState(10);
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [page, setPage] = useState(1);

  const fetchCodes = async () => {
    const PAGE_SIZE = 1000;
    let codes: any[] = [];

    const { data: pageData, error } = await supabase
      .from("cashback_codes")
      .select("*")
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (error) {
      throw new Error("Failed to fetch cashback codes");
    }

    if (pageData) {
      codes = [...codes, ...pageData];
    }

    return codes as CashbackCodeType[];
  };

  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setSearched(true);
    const { data: foundCodes, error } = await supabase
      .from("cashback_codes")
      .select("*")
      .eq("code", data.code);

    if (error) {
      console.log(error);
      setCodes([]);
      setLoading(false);
      return;
    }

    if (foundCodes) {
      setCodes(foundCodes);
    } else {
      setCodes([]);
    }

    setLoading(false);
  };

  const { data, isLoading } = useQuery(["all_codes"], fetchCodes);

  useEffect(() => {
    if (!data || data?.length === 0) return;

    setCodes(data.slice(0, show));
  }, [data, show]);

  useEffect(() => {
    if (!data || data?.length === 0) return;

    if (!term || filter === "all") {
      setCodes(data.slice(0, show));
    } else {
      setCodes(
        data.filter((code) => {
          const str = code.code.toString();
          if (str === term) {
            return code;
          }
        })
      );
    }

    if (sortBy === "unredeemed") {
      setCodes(data.filter((code) => code.redeemed === false).slice(0, show));
    }

    if (sortBy === "created_at") {
      setCodes(
        data
          .sort((a, b) => (a._createdAt > b._createdAt ? -1 : 1))
          .slice(0, show)
      );
    }
  }, [term, show, data, sortBy, filter]);

  const filterCodes = async (filter: string) => {
    setLoading(true);

    if (filter === "date redeemed") {
      const { data: filteredCodes, error } = await supabase
        .from("cashback_codes")
        .select("*")
        .lt("redeemed_on", endDate)
        .gt("redeemed_on", startDate)
        .eq("redeemed", true)
        .order("redeemed_on", { ascending: false });

      if (error) {
        console.log(error);
        toast.error("Error running filter, please try again", {
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      if (filteredCodes) {
        setCodes(filteredCodes);
        setLoading(false);
        console.log(filteredCodes);
        return;
      } else {
        setCodes([]);
        setLoading(false);
        return;
      }
    } else if (filter === "date disbursed") {
      const { data: filteredCodes, error } = await supabase
        .from("cashback_codes")
        .select("*")
        .lt("disbursed_on", endDate)
        .gt("disbursed_on", startDate)
        .eq("funds_disbursed", true)
        .order("redeemed_on", { ascending: false });

      if (error) {
        console.log(error);
        toast.error("Error running filter, please try again", {
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      if (filteredCodes) {
        setCodes(filteredCodes);
        setLoading(false);
        console.log(filteredCodes);
        return;
      } else {
        setCodes([]);
        setLoading(false);
        return;
      }
    } else {
      setCodes([]);
    }
  };

  const getAllCodes = async () => {
    const response = await fetch("/api/codes/all");
    const data = await response.json();
    // console.log(data);
    return;
  };

  return (
    <CashbackAdminLayout>
      <Heading className="text-center" onClick={getAllCodes}>
        View All Codes
      </Heading>

      <div className="mt-10">
        <Skeleton isLoaded={!isLoading}>
          {data && (
            <>
              <div className="flex items-center space-x-4 w-full">
                <div>
                  <Text className="font-light mb-3 text-sm">Page {page}</Text>
                  <Select
                    defaultValue={page.toString()}
                    onChange={async (e) => {
                      setPage(parseInt(e.target.value));

                      await fetchCodes();
                    }}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={7}>7</option>
                  </Select>
                </div>

                <form className="flex-grow" onSubmit={handleSubmit(onSubmit)}>
                  <Text className="font-light text-center mb-3 text-sm">
                    Search for a code
                  </Text>
                  <InputGroup>
                    <InputLeftElement>
                      <FaSearch />
                    </InputLeftElement>
                    <Input
                      {...register("code")}
                      type="text"
                      placeholder="...."
                    />
                    {searched && (
                      <InputRightElement>
                        <IconButton
                          aria-label="cancel"
                          colorScheme="red"
                          size="sm"
                          icon={<ImCross />}
                          onClick={() => {
                            setSearched(false);
                            setTerm("");
                            setCodes(data.slice(0, show));
                          }}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>
                </form>
                <div>
                  <Text className="font-light text-center mb-3 text-sm">
                    Filter Codes
                  </Text>
                  <Select
                    defaultValue={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value={"all"}>All</option>
                    <option value={"date redeemed"}>Date Redeemed</option>
                    <option value={"date disbursed"}>Date Paid By</option>
                  </Select>
                </div>
                <div>
                  <Text className="font-light text-center mb-3 text-sm">
                    Sort Codes
                  </Text>
                  <Select
                    defaultValue={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value={"default"}>Default</option>
                    <option value={"unredeemed"}>Unredeemed</option>
                    <option value="created_at">Date Created</option>
                  </Select>
                </div>
              </div>
              {filter !== "all" && (
                <div>
                  <div className="w-full flex items-center space-x-4 mt-5">
                    <div className="w-1/2">
                      <Text className="font-semibold text-center mb-3 text-sm">
                        Start Date
                      </Text>
                      <Input
                        type="date"
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="w-1/2">
                      <Text className="font-semibold text-center mb-3 text-sm">
                        End Date
                      </Text>
                      <Input
                        type="date"
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full flex justify-center items-center my-5">
                    <Button
                      isLoading={loading}
                      onClick={() => {
                        if (filter !== "all" && startDate && endDate) {
                          filterCodes(filter);
                        }
                      }}
                      leftIcon={<FaFilter />}
                      colorScheme="green"
                    >
                      Filter
                    </Button>
                  </div>
                </div>
              )}
              <AllCodesTable codes={codes} total={codes.length} />
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
      </div>
    </CashbackAdminLayout>
  );
}

export default AllCodesPage;
