import React, { useEffect, useRef, useState } from "react";
import {
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Button,
  Input,
  TableContainer,
  Checkbox,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
} from "@chakra-ui/react";
import { SiMicrosoftexcel } from "react-icons/si";
import { BanlistUserType } from "@/typings";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { format } from "date-fns";

interface BanlistFiltered {
  phone_number: string;
  reasons: string[];
  occurrences: number;
}

function BanlistUsersTable({
  banlist_user,
  filter,
}: {
  banlist_user: BanlistFiltered[];
  filter: string;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const tableRef = useRef(null);

  console.log(banlist_user);

  const exportToExcel = () => {
    if (!banlist_user) {
      toast.error("No data to export", {
        duration: 3000,
      });
      return;
    }
    let table = document.getElementById("banlist_users");

    let wb = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });

    //Create sheet of all users and their count of reasons

    XLSX.writeFile(
      wb,
      `banlist-${filter.replaceAll(" ", "_")}-${format(
        new Date(),
        "PPpp"
      ).replaceAll(" ", "_")}.xlsx`
    );
  };

  const returnReasonsCount = (reasons: string[]) => {
    const counts = [
      { title: "Invalid code entry.", count: 0 },
      { title: "Attempting to redeem a redeemed code.", count: 0 },
    ];

    reasons.forEach((reason) => {
      if (reason === "Invalid code entry." || reason === "Invalid code entry") {
        counts[0].count += 1;
      } else if (reason === "Attempting to redeem a redeemed code.") {
        counts[1].count += 1;
      }
    });

    return counts;
  };

  return (
    <>
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
            <Table variant="unstyled" mt={4} id="banlist_users" ref={tableRef}>
              <Thead>
                <Tr color="gray">
                  <Th>Phone Number</Th>
                  <Th>Reason</Th>
                </Tr>
              </Thead>
              <Tbody>
                {banlist_user.map((user, i) => (
                  <Tr key={i}>
                    <Td>{user.phone_number}</Td>
                    <Td>
                      <Popover placement="right">
                        <PopoverTrigger>
                          <Button>{user.reasons?.length} reasons</Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverHeader>Flagged actions</PopoverHeader>
                          <PopoverBody>
                            <div className="overflow-auto"></div>
                            <ul className="flex flex-col space-y-2">
                              <li>
                                <span>Invalid code entries:</span>{" "}
                                <span className="font-bold">
                                  {returnReasonsCount(user.reasons)[0].count}
                                </span>
                              </li>
                              <li>
                                Attempts to redeem a redeemed code:
                                <span className="font-bold">
                                  {returnReasonsCount(user.reasons)[1].count}
                                </span>
                              </li>
                            </ul>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to remove this user from the banlist?
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={() => {
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              mr={3}
              onClick={() => {
                onClose();
              }}
            >
              confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default BanlistUsersTable;
