import React, { useRef } from "react";
import numeral from "numeral";
import {
  Avatar,
  Checkbox,
  Divider,
  Flex,
  Heading,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { CommissionType } from "@/typings";

function UserCommissionTable({ results }: { results: CommissionType[] }) {
  const tableRef = useRef(null);

  return (
    <Flex flexDir="column">
      <Flex overflow="auto">
        <TableContainer>
          <Table variant="simple" mt={4} ref={tableRef}>
            <Thead>
              <Tr color="white" bg="red">
                <Th color="white">Name</Th>
                <Th color="white">Month</Th>
                <Th color="white">Target </Th>
                <Th color="white">Sales</Th>
                <Th color="white">Base Tier</Th>
                <Th color="white">1% Tier</Th>
                <Th color="white">2% Tier</Th>
                <Th color="white">5% Tier</Th>
                <Th color="white">Commission</Th>
              </Tr>
            </Thead>
            <Tbody>
              {results?.map((result) => (
                <Tr key={result.id}>
                  <Td>{result.employee_id?.name || result.employee_id?.id}</Td>
                  <Td>{result.month}</Td>
                  <Td>{numeral(result.target).format("0,0") || "N/A"}</Td>
                  <Td>{numeral(result.sales).format("0,0") || "N/A"}</Td>
                  <Td>{numeral(result.base_tier).format("0,0") || "N/A"}</Td>
                  <Td>{numeral(result.one_percent).format("0,0") || "N/A"}</Td>
                  <Td>{numeral(result.two_percent).format("0,0") || "N/A"}</Td>
                  <Td>{numeral(result.five_percent).format("0,0") || "N/A"}</Td>
                  <Td>{numeral(result.commission).format("0,0") || "N/A"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
}

export default UserCommissionTable;
