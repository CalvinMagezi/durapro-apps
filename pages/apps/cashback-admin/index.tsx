import CashbackAdminLayout from "@/components/layouts/CashbackAdminLayout";
import { Heading } from "@chakra-ui/react";
import React from "react";

function CashbackAdminDashboard() {
  return (
    <CashbackAdminLayout>
      <Heading className="text-center my-10">Welcome Admin Member</Heading>
      <p>Analytics coming soon..</p>
    </CashbackAdminLayout>
  );
}

export default CashbackAdminDashboard;
