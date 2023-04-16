import React, { useRef } from "react";

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
                  <Td>{result.target}</Td>
                  <Td>{result.sales}</Td>
                  <Td>{result.base_tier}</Td>
                  <Td>{result.one_percent}</Td>
                  <Td>{result.two_percent}</Td>
                  <Td>{result.five_percent}</Td>
                  <Td>{result.commission}</Td>
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
