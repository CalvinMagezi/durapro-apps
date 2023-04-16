import React from "react";
import NavbarLink from "./NavbarLink";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaAppStore } from "react-icons/fa";

function Sidebar() {
  return (
    <div className="w-64 border-r h-screen sticky top-16 overflow-y-scroll border-b-gray-500 border border-opacity-40">
      <div className="flex flex-col space-y-4 mt-5 px-2">
        <NavbarLink title="Apps" Icon={FaAppStore} href="/" />
        <NavbarLink
          title="Dashboard"
          Icon={AiOutlineDashboard}
          href="/apps/commission"
        />
      </div>
    </div>
  );
}

export default Sidebar;
