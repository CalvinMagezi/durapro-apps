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
import { CashbackFeedbackType } from "@/typings";
import Link from "next/link";

function FeedbackTable({ results }: { results: CashbackFeedbackType[] }) {
  const tableRef = useRef(null);
  return (
    <Flex flexDir="column">
      <Flex overflow="auto">
        <TableContainer>
          <Table variant="simple" mt={4} ref={tableRef}>
            <Thead>
              <Tr color="white" bg="red">
                <Th color="white">Tiler 1st Name</Th>
                <Th color="white">Last Name</Th>
                <Th color="white">Contact </Th>
                <Th color="white">Quantity Bought</Th>
                <Th color="white">Redeemed</Th>
                <Th color="white">Not Redeemed</Th>
              </Tr>
            </Thead>
            <Tbody>
              {results?.map((result) => (
                <Tr key={result.id}>
                  <Td>
                    <Link
                      href={`/apps/cashback_feedback/previous/${result.id}`}
                    >
                      {result.first_name}
                    </Link>
                  </Td>
                  <Td>{result.last_name}</Td>
                  <Td>{result.contact}</Td>
                  <Td>{result.qty_bought}</Td>
                  <Td>{result.redeemed}</Td>
                  <Td>{result.not_redeemed}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
}

export default FeedbackTable;
