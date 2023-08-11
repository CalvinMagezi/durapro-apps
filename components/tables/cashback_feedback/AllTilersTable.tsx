import { ProfileType } from "@/typings";
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
import Link from "next/link";
import { GiPayMoney } from "react-icons/gi";
import { FiUserCheck } from "react-icons/fi";
import CheckRedeemed from "@/helpers/CheckRedeemed";

function AllTilersTable({ users }: { users: ProfileType[] }) {
  const tableRef = useRef(null);
  return (
    <Flex flexDir="column">
      <Flex overflow="auto">
        <TableContainer>
          <Table variant="simple" mt={4} ref={tableRef}>
            <Thead>
              <Tr color="white" bg="red">
                <Th color="white">Phone Number</Th>
                <Th color="white">Unpaid Codes Redeemed </Th>
                <Th color="white">Total Codes Redeemed </Th>
                <Th color="white">Person In-charge</Th>
                <Th color="white">Assign</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users?.map((user, index) => (
                <Tr key={user.id} className="text-center">
                  <Td>
                    <a href="#" className="underline text-blue-500">
                      {user.phone_number}
                    </a>
                  </Td>
                  <Td
                    className={`${
                      CheckRedeemed(user.redeemed_codes) >= 10 &&
                      "text-green-500 font-bold"
                    }`}
                  >
                    {CheckRedeemed(user.redeemed_codes)}
                  </Td>
                  <Td>{user.redeemed_codes.length}</Td>
                  <Td></Td>
                  <Td>
                    <IconButton
                      aria-label="Assign"
                      icon={<FiUserCheck />}
                      colorScheme="green"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
}

export default AllTilersTable;
