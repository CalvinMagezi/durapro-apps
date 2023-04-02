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

function UserCommissionTable() {
  const tableRef = useRef(null);

  return (
    <Flex flexDir="column">
      <Flex overflow="auto">
        <TableContainer>
          <Table variant="unstyled" mt={4} ref={tableRef}>
            <Thead>
              <Tr color="white" bg="red">
                <Th>Month</Th>
                <Th>Target </Th>
                <Th>Sales</Th>
                <Th>Base Tier</Th>
                <Th>1% Tier</Th>
                <Th>2% Tier</Th>
                <Th>5% Tier</Th>
                <Th>Commission</Th>
              </Tr>
            </Thead>
            <Tbody></Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
}

export default UserCommissionTable;
