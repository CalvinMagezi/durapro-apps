import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Chats, SignOut } from "@phosphor-icons/react";
import {
  Avatar,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
  Heading,
  Select,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "../utils/ColorModeSwitcher";
import PrimaryMobileNavbar from "./PrimaryMobileNavbar";
import { useRouter } from "next/router";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import parsePhoneNumber from "libphonenumber-js";
import { useRecoilState } from "recoil";
import { CurrentTilerAtom } from "@/atoms/TilerAtom";
import { CashbackCodeType } from "@/typings";
import AllCodesTable from "../tables/cashback_feedback/AllCodesTable";

function PrimaryHeader({
  username,
  avatar,
  sections,
  cbfeedback,
}: {
  username?: string;
  avatar?: string;
  sections?: any[];
  cbfeedback?: boolean;
}) {
  const router = useRouter();
  const { profile, setProfile } = useUser();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentTiler, setCurrentTiler] = useRecoilState(CurrentTilerAtom);
  const [filter, setFilter] = useState("all");

  async function searchCashbackCode(phoneNumber: string) {
    const p = parsePhoneNumber(phoneNumber, "UG");
    // console.log(p);
    setLoading(true);

    if (!p?.isValid()) {
      toast.error("Please enter a valid phone number", {
        duration: 5000,
      });
    } else {
      const { data, error } = await supabase
        .from("cashback_codes")
        .select("*")
        .eq("redeemed_by", p.number);

      // console.log(data);

      if (error) {
        console.error(error);
        toast.error("Error searching for user, please try again", {
          duration: 5000,
        });
      } else if (data && data.length > 0) {
        console.log(data);
        toast.success(`Successfully retrieved user data`, { duration: 5000 });
        setCurrentTiler({
          tiler: p.number,
          codes: data as CashbackCodeType[],
        });
        onOpen();
      } else {
        toast.error("No cashback code found for this phone number", {
          duration: 5000,
        });
      }
    }

    setLoading(false);
    setSearchText("");
  }

  const handleSearch = () => {
    searchCashbackCode(searchText);
  };

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between bg-[#253e97] px-5 py-3">
        <div className="flex items-center space-x-10 ">
          <div className="rounded-lg bg-white p-1">
            <Image
              priority
              width="200"
              height="80"
              src="/logo.png"
              alt="Durapro Solutions"
            />
          </div>

          <div className="hidden items-center space-x-3 lg:flex">
            <Avatar
              src={avatar ? avatar : ""}
              name={profile?.full_name ? profile?.full_name : "user"}
            />
            <p className="text-lg font-semibold text-white">
              {profile?.full_name ? profile?.full_name : "User"}
            </p>
          </div>
        </div>

        {cbfeedback && (
          <div className="flex-grow px-3">
            <InputGroup>
              <InputLeftElement>
                <FaSearch className="text-white" />
              </InputLeftElement>
              <Input
                color="white"
                disabled={loading}
                type="tel"
                placeholder="Search for a user by phone number"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </InputGroup>
          </div>
        )}

        <div className="flex items-center space-x-4 ">
          {/* <Link href="/dashboard/comms">
          <IconButton
            bg="#ee2f26"
            color="white"
            className="bg-[#ee2f26] text-white"
            icon={<Chats className="text-3xl" />}
            aria-label="chats"
          />
        </Link> */}
          <ColorModeSwitcher />
          <IconButton
            bg="#ee2f26"
            color="white"
            className="bg-[#ee2f26] text-white"
            icon={<SignOut className="text-3xl" />}
            aria-label="signout"
            onClick={async () => {
              await supabase.auth
                .signOut()
                .then(() => {
                  setProfile(null);
                  router.push("/");
                })
                .catch((error) => {
                  console.log(error);
                  toast.error("Error signing out, please try again", {
                    duration: 5000,
                  });
                });
            }}
          />

          {sections && (
            <div className="flex-end flex lg:hidden">
              <PrimaryMobileNavbar sections={sections} />
            </div>
          )}
        </div>
      </div>

      <Drawer
        isOpen={isOpen}
        placement="bottom"
        size="xl"
        onClose={() => {
          onClose();
          setCurrentTiler(null);
        }}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Heading className="text-center">{currentTiler?.tiler}</Heading>
          </DrawerHeader>

          <DrawerBody>
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
                      currentTiler?.codes.filter(
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
                      currentTiler?.codes.filter(
                        (code) => code.funds_disbursed === false
                      ).length
                    }
                  </Heading>
                </div>
              </div>
              {currentTiler?.codes && currentTiler?.codes.length > 0 ? (
                <AllCodesTable
                  codes={currentTiler.codes}
                  total={currentTiler?.codes.length}
                />
              ) : (
                <div className="text-center">No codes found</div>
              )}
            </div>
          </DrawerBody>

          <DrawerFooter>
            <Button colorScheme="red" onClick={onClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default PrimaryHeader;
