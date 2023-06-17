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

import { useDownloadExcel } from "react-export-table-to-excel";
import { SiMicrosoftexcel } from "react-icons/si";
import { CashbackCodeType, ProfileType, TilerTransactionType } from "@/typings";
import { queryClient } from "@/pages/_app";

function TilerTransactionsTable({
  data,
  total,
  isAdmin,
  personInCharge,
}: {
  data: TilerTransactionType[];
  total: number;
  isAdmin?: boolean;
  personInCharge?: ProfileType;
}) {
  const [codeIds, setCodeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const tableRef = useRef(null);

  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: "Cashback Codes",
    sheet: "Cashback Codes",
  });

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
        onClick={onDownload}
        className="my-2"
      />
      <Flex overflow="auto">
        <TableContainer>
          <Table variant="unstyled" mt={4} ref={tableRef}>
            <Thead>
              <Tr color="gray">
                <Th>#</Th>
                <Th>Tiler Contact</Th>
                <Th>Tiler Name</Th>
                <Th>City</Th>
                <Th>Shop Name</Th>
                <Th>Site Location</Th>
                <Th>Quantity Bought</Th>
                {isAdmin && <Th>Person In Charge</Th>}
                {/* <Th>Action</Th> */}
              </Tr>
            </Thead>
            <Tbody>
              {data?.map((d, index) => (
                <Tr key={d.id} className="flex-shrink-0">
                  <Td>{index + 1}</Td>
                  <Td>
                    <Text>{d.tiler_profile?.phone_number}</Text>
                  </Td>
                  <Td>
                    <Text>
                      {d.tiler_profile?.first_name} {d.tiler_profile?.last_name}
                    </Text>
                  </Td>
                  <Td>
                    <Text>{d.city}</Text>
                  </Td>
                  <Td>
                    <Text>{d.shop_name}</Text>
                  </Td>
                  <Td>
                    <Text>{d.site_location}</Text>
                  </Td>
                  <Td>
                    <Text>{d.quantity_bought}</Text>
                  </Td>
                  {isAdmin && (
                    <Td>
                      <Text>{d.tiler_profile?.tracked_by?.email}</Text>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
}

export default TilerTransactionsTable;
