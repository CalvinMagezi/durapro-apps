import CashbackAdminLayout from "@/components/layouts/CashbackAdminLayout";
import DefaultDashboardBanner from "@/components/utils/DefaultDashboardBanner";
import { Heading } from "@chakra-ui/react";
import React from "react";

function CashbackAdminDashboard() {
  return (
    <CashbackAdminLayout>
      <DefaultDashboardBanner title="Cashback Admin" />
      <p>Analytics coming soon..</p>
    </CashbackAdminLayout>
  );
}

export default CashbackAdminDashboard;
