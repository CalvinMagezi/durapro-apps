import { ProfileType, TilerProfileType } from "@/typings";
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
import CheckRedeemed from "@/helpers/CheckRedeemed";
import { FaPlus } from "react-icons/fa";
import { TilerAtom } from "@/atoms/TilerAtom";
import { useRecoilState } from "recoil";
import TilerDetailsDrawer from "@/components/drawers/cashback_feedback/TilerDetailsDrawer";

function MyTilersTable({ tilers }: { tilers: TilerProfileType[] }) {
  const tableRef = useRef(null);
  const [tiler, setTiler] = useRecoilState(TilerAtom);
  return (
    <>
      <Flex flexDir="column">
        <Flex overflow="auto">
          <TableContainer>
            <Table variant="simple" mt={4} ref={tableRef}>
              <Thead>
                <Tr color="white" bg="red">
                  <Th color="white">Phone Number</Th>
                  <Th color="white">First Name </Th>
                  <Th color="white">Last Name </Th>
                </Tr>
              </Thead>
              <Tbody>
                {tilers?.map((tiler) => (
                  <Tr key={tiler._id} className="text-center">
                    <Td>
                      <button
                        onClick={() => setTiler(tiler)}
                        className="underline text-blue-500"
                      >
                        {tiler.phone_number}
                      </button>
                    </Td>
                    <Td>{tiler.first_name}</Td>
                    <Td>{tiler.last_name}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>

      <TilerDetailsDrawer />
    </>
  );
}

export default MyTilersTable;
