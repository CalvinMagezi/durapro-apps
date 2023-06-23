import useUser from "@/hooks/useUser";
import React from "react";
import NavbarLink from "../NavbarLink";
import { AiOutlineDashboard } from "react-icons/ai";
import {
  FaAppStore,
  FaCartPlus,
  FaChevronCircleDown,
  FaUsers,
} from "react-icons/fa";
import { useDB } from "@/contexts/DBContext";

function CashbackNavbarChooser() {
  const { profile } = useUser();
  const { permissions } = useDB();

  // console.log(permissions);

  switch (profile?.role) {
    case "admin":
      return (
        <div className="flex flex-col space-y-4 mt-5 px-2">
          <NavbarLink title="Apps" Icon={FaAppStore} href="/" />
          <NavbarLink
            title="Dashboard"
            Icon={AiOutlineDashboard}
            href="/apps/cashback_feedback"
          />

          <div className="flex items-center space-x-2">
            <h1>Admin</h1>
            <FaChevronCircleDown />
          </div>

          <NavbarLink
            title="Tiler Profiles"
            Icon={FaUsers}
            href="/apps/cashback_feedback/tilers"
          />
          <NavbarLink
            title="Tiler Transactions"
            Icon={FaCartPlus}
            href="/apps/cashback_feedback/tilers/transactions"
          />
        </div>
      );
      break;

    default:
      return (
        <div className="flex flex-col space-y-4 mt-5 px-2">
          <NavbarLink title="Apps" Icon={FaAppStore} href="/" />
          <NavbarLink
            title="Dashboard"
            Icon={AiOutlineDashboard}
            href="/apps/cashback_feedback"
          />
          {permissions?.includes("can_assign_sales_staff") && (
            <>
              <NavbarLink
                title="Tiler Profiles"
                Icon={FaUsers}
                href="/apps/cashback_feedback/tilers"
              />
              <NavbarLink
                title="Tiler Transactions"
                Icon={FaCartPlus}
                href="/apps/cashback_feedback/tilers/transactions"
              />
            </>
          )}
        </div>
      );
      break;
  }
  return <div></div>;
}

export default CashbackNavbarChooser;
