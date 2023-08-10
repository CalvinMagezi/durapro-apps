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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";

import { format } from "date-fns";
import Link from "next/link";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

import { SiMicrosoftexcel } from "react-icons/si";
import { CashbackCodeType, ProfileType, TilerTransactionType } from "@/typings";
import { queryClient } from "@/pages/_app";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { updateTilerTransaction } from "@/lib/supabase/updateTilerTransaction";
import { useRouter } from "next/router";

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
  const router = useRouter();

  const tableRef = useRef(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTransaction, setSelectedTransaction] =
    useState<TilerTransactionType | null>(null);
  const [editedTransaction, setEditedTransaction] =
    useState<TilerTransactionType | null>(null);

  const { mutate: updateTransaction } = useMutation(updateTilerTransaction, {
    onSuccess: () => {
      toast.success("Transaction updated successfully", { duration: 3000 });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["all_tiler_transactions"] });
    },
    onError: () => {
      toast.error("Failed to update transaction", { duration: 3000 });
    },
  });

  const { mutate: deleteTransaction } = useMutation(
    async (id: string) => {
      const { error } = await supabase
        .from("tiler_transaction")
        .delete()
        .eq("id", id);
      if (error) {
        // throw new Error("Failed to delete transaction");
        console.log(error);
      }
    },
    {
      onSuccess: () => {
        toast.success("Transaction deleted successfully", { duration: 3000 });
        queryClient.invalidateQueries({ queryKey: ["all_tiler_transactions"] });
      },
      onError: () => {
        toast.error("Failed to delete transaction", { duration: 3000 });
      },
    }
  );

  const handleEdit = (transaction: TilerTransactionType) => {
    setSelectedTransaction(transaction);
    setEditedTransaction({ ...transaction });
    onOpen();
  };

  const handleSave = () => {
    if (!editedTransaction) return;
    setLoading(true);
    updateTransaction(editedTransaction);
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    setLoading(true);
    deleteTransaction(id);
    setLoading(false);
  };

  return (
    <Flex flexDir="column">
      <IconButton
        aria-label="generate"
        icon={<SiMicrosoftexcel />}
        colorScheme="green"
        onClick={() => {}}
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
                {/* <Th>Actions</Th> */}
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
                  {/* <Td>
                    <Flex>
                      <IconButton
                        aria-label="edit"
                        icon={<FaEdit size={24} />}
                        colorScheme="orange"
                        onClick={() => handleEdit(d)}
                        mr={2}
                      />
                      <IconButton
                        aria-label="delete"
                        icon={<FaTrash />}
                        colorScheme="red"
                        onClick={() => handleDelete(d.id)}
                        isLoading={loading}
                      />
                    </Flex>
                  </Td> */}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>City</FormLabel>
              <Input
                value={editedTransaction?.city}
                onChange={(e) =>
                  setEditedTransaction((prevState) => {
                    if (!prevState) {
                      return null;
                    }
                    return {
                      ...prevState,
                      city: e.target.value,
                    };
                  })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Shop Name</FormLabel>
              <Input
                value={editedTransaction?.shop_name}
                onChange={(e) =>
                  setEditedTransaction((prevState) => {
                    if (!prevState) {
                      return null;
                    }
                    return {
                      ...prevState,
                      shop_name: e.target.value,
                    };
                  })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Site Location</FormLabel>
              <Input
                value={editedTransaction?.site_location}
                onChange={(e) =>
                  setEditedTransaction((prevState) => {
                    if (!prevState) {
                      return null;
                    }
                    return {
                      ...prevState,
                      site_location: e.target.value,
                    };
                  })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Quantity Bought</FormLabel>
              <Input
                value={editedTransaction?.quantity_bought.toString()}
                onChange={(e) =>
                  setEditedTransaction((prevState) => {
                    if (!prevState) {
                      return null;
                    }
                    return {
                      ...prevState,
                      quantity_bought: e.target.value,
                    };
                  })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              isLoading={loading}
              mr={3}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default TilerTransactionsTable;
