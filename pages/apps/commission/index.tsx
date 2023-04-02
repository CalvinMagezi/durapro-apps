import CommissionLayout from "@/components/layouts/CommissionLayout";
import UserCommissionTable from "@/components/tables/UserCommissionTable";
import useUser from "@/hooks/useUser";
import { Heading } from "@chakra-ui/react";
import React from "react";

function CommissionAppPage() {
  const { user, manualFetch } = useUser();
  return (
    <CommissionLayout>
      <div>
        <Heading className="mb-10  text-center">
          {user?.user_metadata.full_name}
        </Heading>
        <div className="lg:p-5 rounded-lg w-screen lg:w-full overflow-y-auto border border-gray-500 border-opacity-30">
          <UserCommissionTable />
        </div>
      </div>
    </CommissionLayout>
  );
}

export default CommissionAppPage;
