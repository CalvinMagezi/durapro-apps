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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Input,
} from "@chakra-ui/react";

import { format } from "date-fns";
import Link from "next/link";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";

import { SiMicrosoftexcel } from "react-icons/si";
import { GiPayMoney } from "react-icons/gi";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import NotifyUser from "@/helpers/sms/NotifyUser";
import * as XLSX from "xlsx";
import { CashbackCodeType, ProfileType } from "@/typings";

type FormValues = {
  momo_number: string;
};

function UserCodesTable({
  codes,
  total,
  customer,
}: {
  codes: CashbackCodeType[];
  total: number;
  customer: ProfileType;
}) {
  const [selectedCodes, setSelectedCodes] = useState<CashbackCodeType[]>([]);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const tableRef = useRef(null);

  const exportToExcel = () => {
    const fileName = `${customer.phone_number} Cashback Codes.xlsx`;
    const sheetName = `${customer.phone_number} Cashback Codes`;

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (selectedCodes.length === 0) {
      toast.error("Please select at least one code to pay for", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    const code_ids = selectedCodes.map((code) => code._id);

    const { error } = await supabase
      .from("cashback_codes")
      .update({
        funds_disbursed: true,
        mm_confirmation: data.momo_number,
        disbursed_on: new Date().toISOString(),
      })
      .in("_id", code_ids);

    if (error) {
      console.log(error);
      toast.error("Oops, something went wrong. Please try again.", {
        duration: 3000,
      });
    } else {
      toast.success("Payment successful", {
        duration: 3000,
      });

      await NotifyUser(customer.phone_number).then((res) => {
        if (res.success) {
          toast.success("SMS sent to user", {
            duration: 3000,
          });
        } else {
          toast.error("SMS not sent to user", {
            duration: 3000,
          });
        }
      });

      reset();
      onClose();
      router.push(`/admin/dashboard/users/${customer._id}`);
    }
    setLoading(false);
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
            <Table variant="unstyled" mt={4} ref={tableRef}>
              <Thead>
                <Tr color="gray">
                  {selectedCodes.length > 0 && (
                    <Th className="flex items-center space-x-2">
                      <IconButton
                        aria-label="delete"
                        icon={<GiPayMoney />}
                        colorScheme="green"
                        size="sm"
                        isLoading={loading}
                        onClick={onOpen}
                      />
                    </Th>
                  )}
                  <Th>
                    {selectedCodes.length > 0 ? (
                      <Checkbox
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCodes(codes);
                          } else {
                            setSelectedCodes([]);
                          }
                        }}
                      />
                    ) : (
                      <Text>{total}</Text>
                    )}
                  </Th>
                  <Th>Code</Th>
                  <Th>Status</Th>
                  <Th>Redeemed On</Th>
                  <Th>Paid</Th>
                  <Th>Receipt #</Th>
                  <Th>Payment Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {codes?.map((code, index) => (
                  <Tr key={code._id} className="flex-shrink-0">
                    {selectedCodes.length > 0 && <Td></Td>}
                    <Td>
                      <Checkbox
                        isChecked={selectedCodes.includes(code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCodes((prev) => [...prev, code]);
                          } else {
                            setSelectedCodes((prev) =>
                              prev.filter((id) => id !== code)
                            );
                          }
                        }}
                      />
                    </Td>
                    <Td>
                      <Link href={`/dashboard/codes/${code._id}`}>
                        {code.code}
                      </Link>
                    </Td>
                    <Td>
                      {code.redeemed === true ? "Redeemed" : "Not yet redeemed"}
                    </Td>
                    <Td>
                      {code.redeemed_on && (
                        <>{format(new Date(code.redeemed_on), "PPp")}</>
                      )}
                    </Td>
                    <Td>{code.funds_disbursed ? "Paid" : "Not yet paid"}</Td>
                    <Td>{code.mm_confirmation}</Td>
                    <Td>
                      {code.disbursed_on && (
                        <>{format(new Date(code.disbursed_on), "PPp")}</>
                      )}
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
          <ModalHeader>Confirm Payment To {customer.phone_number}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                autoComplete="off"
                placeholder="Enter Mobile Money Receipt Number"
                {...register("momo_number", { required: true })}
              />
              {errors.momo_number && (
                <Text color="red">This field is required</Text>
              )}
              <div className="flex justify-center mt-5">
                <Button type="submit" colorScheme="green" isLoading={loading}>
                  Confirm
                </Button>
              </div>
            </form>
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
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default UserCodesTable;
