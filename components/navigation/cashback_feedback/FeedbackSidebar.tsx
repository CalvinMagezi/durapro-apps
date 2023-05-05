import React from "react";
import { FaAppStore, FaPlus } from "react-icons/fa";
import NavbarLink from "../NavbarLink";
import { AiOutlineDashboard } from "react-icons/ai";
import { TbFileReport } from "react-icons/tb";

function FeedbackSidebar() {
  return (
    <div className="w-64 border-r h-screen sticky top-16 overflow-y-scroll border-b-gray-500 border border-opacity-40">
      <div className="flex flex-col space-y-4 mt-5 px-2">
        <NavbarLink title="Apps" Icon={FaAppStore} href="/" />
        <NavbarLink
          title="Dashboard"
          Icon={AiOutlineDashboard}
          href="/apps/cashback_feedback"
        />
        <NavbarLink
          title="New Feedback"
          Icon={FaPlus}
          href="/apps/cashback_feedback/new"
        />
        <NavbarLink
          title="Previous Feedback"
          Icon={TbFileReport}
          href="/apps/cashback_feedback/previous"
        />
      </div>
    </div>
  );
}

export default FeedbackSidebar;
