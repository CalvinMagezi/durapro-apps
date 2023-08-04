import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Chats } from "@phosphor-icons/react";
import { Avatar, IconButton } from "@chakra-ui/react";
import { ColorModeSwitcher } from "../utils/ColorModeSwitcher";
import PrimaryMobileNavbar from "./PrimaryMobileNavbar";

function PrimaryHeader({
  username,
  avatar,
  sections,
}: {
  username?: string;
  avatar?: string;
  sections?: any[];
}) {
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
