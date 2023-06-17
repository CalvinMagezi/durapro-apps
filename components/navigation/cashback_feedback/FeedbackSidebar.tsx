import React from "react";
import {
  FaAppStore,
  FaBullseye,
  FaCartPlus,
  FaChevronCircleDown,
  FaPlus,
  FaUsers,
} from "react-icons/fa";
import NavbarLink from "../NavbarLink";
import { AiOutlineDashboard } from "react-icons/ai";
import { TbFileReport } from "react-icons/tb";
import useUser from "@/hooks/useUser";
import CashbackNavbarChooser from "./CashbackNavbarChooser";

function FeedbackSidebar() {
  const { profile } = useUser();
  return (
    <div className="w-64 border-r h-screen sticky top-16 overflow-y-scroll border-b-gray-500 border border-opacity-40">
      <CashbackNavbarChooser />
    </div>
  );
}

export default FeedbackSidebar;
