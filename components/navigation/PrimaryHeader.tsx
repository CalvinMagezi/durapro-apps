import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Chats, SignOut } from "@phosphor-icons/react";
import { Avatar, IconButton } from "@chakra-ui/react";
import { ColorModeSwitcher } from "../utils/ColorModeSwitcher";
import PrimaryMobileNavbar from "./PrimaryMobileNavbar";
import { useRouter } from "next/router";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

function PrimaryHeader({
  username,
  avatar,
  sections,
}: {
  username?: string;
  avatar?: string;
  sections?: any[];
}) {
  const router = useRouter();
  const { setProfile } = useUser();
  return (
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
            name={username ? username : "user"}
          />
          <p className="text-lg font-semibold text-white">
            {username ? username : "User"}
          </p>
        </div>
      </div>
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
  );
}

export default PrimaryHeader;
