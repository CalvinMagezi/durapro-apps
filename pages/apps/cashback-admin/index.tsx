import CashbackAdminLayout from "@/components/layouts/CashbackAdminLayout";
import DefaultDashboardBanner from "@/components/utils/DefaultDashboardBanner";
import { CashbackCodeType, CashbackUserType } from "@/typings";
import {
  Heading,
  Skeleton,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import numeral from "numeral";
import React from "react";

function CashbackAdminDashboard() {
  const { data, isLoading } = useQuery(["cashback_stats"], async () => {
    const response = await fetch("/api/db/cashback/stats");
    const data = await response.json();
    return data;
  });
  return (
    <CashbackAdminLayout>
      <DefaultDashboardBanner title="Cashback Admin" />
      <Skeleton isLoaded={!isLoading}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          <div className="rounded-lg bg-gray-100 flex flex-col text-center items-center space-y-4 ">
            <Heading size="md">Total Codes</Heading>
            <Heading size="lg">
              {numeral(data?.total_codes).format("0,0")}
            </Heading>
          </div>
          <div className="rounded-lg bg-gray-100 flex flex-col text-center items-center space-y-4 ">
            <Heading size="md">Total Redeemed Codes</Heading>
            <Heading size="lg">
              {numeral(data?.total_redeemed_codes).format("0,0")}
            </Heading>
          </div>
          <div className="rounded-lg bg-gray-100 flex flex-col text-center items-center space-y-4 ">
            <Heading size="md">Total Users</Heading>
            <Heading size="lg">
              {numeral(data?.total_users).format("0,0")}
            </Heading>
          </div>
        </div>
        <br />
        <div className="flex w-full items-center">
          <div className="w-full lg:w-1/2 ">
            <Heading size="md" className="mb-6 text-center">
              Latest redeemed codes
            </Heading>
            <TableContainer>
              <Table variant="striped" colorScheme="green">
                <Thead>
                  <Th>Code</Th>
                  <Th>Redeemed By</Th>
                  <Th>Redeemed On</Th>
                </Thead>
                <Tbody>
                  {data?.latest_redeemed_codes?.map(
                    (code: CashbackCodeType) => (
                      <Tr key={code.code}>
                        <Td>{code.code}</Td>
                        <Td>{code.redeemed_by}</Td>
                        <Td>{format(new Date(code.redeemed_on), "PPpp")}</Td>
                      </Tr>
                    )
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </div>
          <div className="w-full lg:w-1/2 ">
            <Heading size="md" className="mb-6 text-center">
              Latest users
            </Heading>
            <TableContainer>
              <Table variant="striped" colorScheme="blue">
                <Thead>
                  <Th>Phone number</Th>
                  <Th>USSD or Web</Th>
                </Thead>
                <Tbody>
                  {data?.latest_users?.map((user: CashbackUserType) => (
                    <Tr key={user._id}>
                      <Td>{user.phone_number}</Td>
                      <Td>{user.first_login === true ? "Web" : "USSD"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </Skeleton>
    </CashbackAdminLayout>
  );
}

export default CashbackAdminDashboard;
