import React, { useRef, useState } from "react";
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
} from "@chakra-ui/react";

import { format } from "date-fns";
import { GiPayMoney } from "react-icons/gi";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { SiMicrosoftexcel } from "react-icons/si";
import NotifyUser from "@/helpers/sms/NotifyUser";
import * as XLSX from "xlsx";
import { useRouter } from "next/router";
import {
  CashbackCodeType,
  CashbackUserType,
  CashbackUserWithCodesType,
} from "@/typings";
import { queryClient } from "@/pages/_app";
import ExportAndMarkAsPaidModal from "@/components/modals/cashback_admin/ExportAndMarkAsPaidModal";

type FormValues = {
  momo_number: string;
};

function AllUsersTable({
  users,
  filter,
}: {
  users: CashbackUserWithCodesType[];
  filter: string;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentUser, setCurrentUser] =
    useState<null | CashbackUserWithCodesType>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [selectedIds, setSetselectedIds] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<
    CashbackUserWithCodesType[]
  >([]);
  // console.log(users);

  const tableRef = useRef(null);

  const exportToExcel = () => {
    if (!users) {
      toast.error("No users to export", {
        duration: 3000,
      });
      return;
    }
    let table = document.getElementById("all_users");

    let wb = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });

    // if (filter === "ready to pay") {
    for (let i = 0; i < users.length; i++) {
      const element = users[i];
      console.log(element.codes);

      //Sort by whether codes funds have been disbursed

      const ws = XLSX.utils.json_to_sheet(
        element.codes
          .filter((code) => code.funds_disbursed === false)
          .map((code) => {
            return {
              ...code,
              redeemed_on: format(
                new Date(code.redeemed_on),
                "PPpp"
              ).replaceAll(" ", "_"),
            };
          })
      );

      XLSX.utils.book_append_sheet(wb, ws, element.codes[0].redeemed_by);
    }
    // }

    XLSX.writeFile(
      wb,
      `${filter.replaceAll(" ", "_")}-${format(new Date(), "PPpp").replaceAll(
        " ",
        "_"
      )}.xlsx`
    );
  };

  function CheckRedeemed(redeemed_codes: CashbackCodeType[]) {
    if (redeemed_codes.length === 0) return 0;
    let count = 0;
    redeemed_codes.forEach((code) => {
      if (code.funds_disbursed === false) {
        count += 1;
      }
    });
    return count;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (currentUser?.codes?.length === 0) {
      toast.error("This user has not redeemed any codes yet", {
        duration: 3000,
      });
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from("cashback_codes")
      .update({
        funds_disbursed: true,
        mm_confirmation: data.momo_number,
        disbursed_on: new Date().toISOString(),
        redeemed: true,
      })
      .eq("redeemed_by", currentUser?.codes[0]?.redeemed_by);

    if (error) {
      console.log(error);
      toast.error("Oops, something went wrong. Please try again.", {
        duration: 3000,
      });
    } else {
      toast.success("Payment successful", {
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["all_users"] });

      await NotifyUser(currentUser?.codes[0]?.redeemed_by!).then((res) => {
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

      await queryClient
        .invalidateQueries(["all_users"])
        .then(() => {
          toast.success("Refreshed Successfully", {
            duration: 3000,
          });

          router.reload();
        })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong", {
            duration: 3000,
          });
        });

      reset();
      onClose();
    }

    setLoading(false);
  };

  // console.log(selectedUsers);
  console.log(users);
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
            <Table variant="unstyled" mt={4} id="all_users" ref={tableRef}>
              <Thead>
                <Tr color="gray">
                  {filter === "ready to pay" && (
                    <Th>
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          colorScheme="green"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users);
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                        {selectedUsers.length > 0 && (
                          <ExportAndMarkAsPaidModal
                            selectedUsers={selectedUsers}
                          />
                        )}
                      </div>
                    </Th>
                  )}
                  {filter === "ready to pay" && <Th>Amount due</Th>}
                  <Th>Phone Number</Th>
                  <Th>Unpaid Codes Redeemed </Th>
                  <Th>Total Codes Redeemed </Th>
                  <Th>Confirm Payment</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(users).map(([phoneNumber, user]) => (
                  <Tr key={phoneNumber}>
                    {filter === "ready to pay" && (
                      <Td>
                        <Checkbox
                          isChecked={selectedUsers.some(
                            (u) => phoneNumber === phoneNumber
                          )}
                          colorScheme="green"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user]);
                            } else {
                              setSelectedUsers(
                                selectedUsers.filter(
                                  (u) => phoneNumber !== phoneNumber
                                )
                              );
                            }
                          }}
                        />
                      </Td>
                    )}
                    {filter === "ready to pay" && (
                      <Td
                        className={`${
                          CheckRedeemed(user.codes) >= 10 &&
                          "text-green-500 font-bold"
                        }`}
                      >
                        {`(Ugx ${CheckRedeemed(user.codes) * 500})`}
                      </Td>
                    )}
                    <Td>
                      <Link
                        href={`/apps/cashback-admin/users/${user.codes[0]?.redeemed_by}`}
                        className="underline text-blue-500"
                      >
                        {user.codes[0]?.redeemed_by}
                      </Link>
                    </Td>
                    <Td
                      className={`${
                        CheckRedeemed(user.codes) >= 10 &&
                        "text-green-500 font-bold"
                      }`}
                    >
                      {CheckRedeemed(user.codes)}
                    </Td>

                    <Td>{user.codes?.length}</Td>
                    <Td>
                      <IconButton
                        aria-label="Pay"
                        icon={<GiPayMoney />}
                        colorScheme="green"
                        onClick={() => {
                          setCurrentUser(user);
                          onOpen();
                        }}
                      />
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
          <ModalHeader>
            Confirm Payment To {currentUser?.codes[0]?.redeemed_by}
          </ModalHeader>
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
                setCurrentUser(null);
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

export default AllUsersTable;
