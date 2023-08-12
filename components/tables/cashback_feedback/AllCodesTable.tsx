import React, { useRef, useState } from "react";
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

import { format } from "date-fns";
import Link from "next/link";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

import { SiMicrosoftexcel } from "react-icons/si";
import { CashbackCodeType } from "@/typings";
import { queryClient } from "@/pages/_app";
import { useRecoilValue } from "recoil";
import { CurrentTilerAtom } from "@/atoms/TilerAtom";
import * as XLSX from "xlsx";

function AllCodesTable({
  codes,
  total,
}: {
  codes: CashbackCodeType[];
  total: number;
}) {
  const [codeIds, setCodeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const customer = useRecoilValue(CurrentTilerAtom);

  const tableRef = useRef(null);

  const exportToExcel = () => {
    const fileName = `${customer?.tiler} Cashback Codes.xlsx`;
    const sheetName = `${customer?.tiler} Cashback Codes`;

    const worksheet = XLSX.utils.json_to_sheet(
      codes.map((code) => ({
        Code: code.code,
        Status: code.redeemed === true ? "Redeemed" : "Not yet redeemed",
        "Redeemed On": code.redeemed_on
          ? format(new Date(code.redeemed_on), "PPp")
          : "",
        Paid: code.funds_disbursed ? "Paid" : "Not yet paid",
        "Receipt #": code.mm_confirmation,
        "Payment Date": code.disbursed_on
          ? format(new Date(code.disbursed_on), "PPp")
          : "",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, fileName);
  };

  const deleteCodes = async () => {
    if (codeIds.length === 0) return;
    setLoading(true);

    try {
      toast.loading(`Deleting ${codeIds.length} codes...`);
      for (let i = 0; i <= codeIds.length; i++) {
        const element = codeIds[i];
        await fetch("/api/codes/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: element,
          }),
        });
      }
      toast.dismiss();
      toast.success(`Successfully deleted ${codeIds.length} codes.`, {
        duration: 3000,
      });
      setCodeIds([]);
      queryClient.invalidateQueries();
    } catch (error) {
      toast.error("Oops, something went wrong. Please try again", {
        duration: 3000,
      });
    }

    setLoading(false);
  };

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
          <Table variant="unstyled" mt={4} ref={tableRef}>
            <Thead>
              <Tr color="gray">
                <Th>#</Th>
                <Th>Code</Th>
                <Th>Product </Th>
                <Th>Status</Th>
                <Th>Redeemed On</Th>
                <Th>Funds Disbursed</Th>
                <Th>Disbursed On</Th>
                <Th>Receipt #</Th>
              </Tr>
            </Thead>
            <Tbody>
              {codes?.map((code, index) => (
                <Tr key={code._id} className="flex-shrink-0">
                  <Td>{index + 1}</Td>
                  <Td>{code.code}</Td>
                  <Td>{code.product_name}</Td>
                  <Td>
                    {code.redeemed === true ? "Redeemed" : "Not yet redeemed"}
                  </Td>
                  <Td>
                    {code.redeemed_on && (
                      <>{format(new Date(code.redeemed_on), "PPp")}</>
                    )}
                  </Td>
                  <Td>{code.funds_disbursed ? "Yes" : "No"}</Td>
                  <Td>
                    {code.disbursed_on && (
                      <>{format(new Date(code.disbursed_on), "PPp")}</>
                    )}
                  </Td>
                  <Td>{code.mm_confirmation}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
}

export default AllCodesTable;
