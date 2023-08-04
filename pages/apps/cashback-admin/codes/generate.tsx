import GenerateCodesForm from "@/components/forms/GenerateCodesForm";
import CashbackAdminLayout from "@/components/layouts/CashbackAdminLayout";
import { Heading } from "@chakra-ui/react";
import React from "react";

function GenerateNewCodesPage() {
  return (
    <CashbackAdminLayout>
      <Heading className="text-center">Generate New Codes</Heading>

      <div className="mt-10">
        <GenerateCodesForm />
      </div>
    </CashbackAdminLayout>
  );
}

export default GenerateNewCodesPage;
