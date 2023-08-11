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
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { SiMicrosoftexcel } from "react-icons/si";

function TilerProfilesTable({ tilers }: { tilers: TilerProfileType[] }) {
  const tableRef = useRef(null);

  const exportToExcel = () => {
    let table = document.getElementById("all_tilers");

    let wb = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });

    XLSX.writeFile(
      wb,
      `tilers-${format(new Date(), "PPpp").replaceAll(" ", "_")}.xlsx`
    );
  };

  // console.log(tilers);
  return (
    <Flex flexDir="column">
      <IconButton
        aria-label="generate"
        icon={<SiMicrosoftexcel />}
        colorScheme="green"
        onClick={exportToExcel}
        className="my-2"
      />
      <Flex overflow="auto">
        <TableContainer>
          <Table variant="simple" mt={4} id="all_tilers" ref={tableRef}>
            <Thead>
              <Tr color="white" bg="red">
                <Th color="white">Phone Number</Th>
                <Th color="white">First Name </Th>
                <Th color="white">Last Name </Th>
                <Th color="white">Tracked By </Th>
              </Tr>
            </Thead>
            <Tbody>
              {tilers?.map((tiler) => (
                <Tr key={tiler._id} className="text-center">
                  <Td>
                    <Link
                      href={`/apps/cashback_feedback/tilers/${tiler._id}`}
                      className="underline text-blue-500"
                    >
                      {tiler.phone_number}
                    </Link>
                  </Td>
                  <Td>{tiler.first_name}</Td>
                  <Td>{tiler.last_name}</Td>
                  <Td>{tiler.tracked_by?.full_name}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
}

export default TilerProfilesTable;
