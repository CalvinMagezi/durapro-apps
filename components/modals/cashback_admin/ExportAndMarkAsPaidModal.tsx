import React, { useState } from "react";
import {
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
  Text,
  Input,
} from "@chakra-ui/react";
import { SiMicrosoftexcel } from "react-icons/si";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import NotifyUser from "@/helpers/sms/NotifyUser";
import * as XLSX from "xlsx";

import { format } from "date-fns";
import { useRouter } from "next/router";
import { CashbackUserType, CashbackUserWithCodesType } from "@/typings";
import { queryClient } from "@/pages/_app";

type FormValues = {
  momo_number: string;
};

function ExportAndMarkAsPaidModal({
  selectedUsers,
}: {
  selectedUsers: CashbackUserWithCodesType[];
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);

    const { momo_number } = data;

    const promises = selectedUsers.map(async (user) => {
      const { data, error } = await supabase
        .from("cashback_codes")
        .update({
          funds_disbursed: true,
          mm_confirmation: momo_number,
          disbursed_on: new Date().toISOString(),
        })
        .eq("redeemed_by", user.codes[0]?.redeemed_by)
        .eq("funds_disbursed", false);

      if (error) {
        toast.error("An error occured");
      } else {
        // toast.success("Codes marked as paid");
        NotifyUser(user.codes[0]?.redeemed_by);
      }
    });

    await Promise.all(promises)
      .then(() => {
        let table = document.getElementById("all_users");

        let wb = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });

        for (let i = 0; i < selectedUsers.length; i++) {
          const element = selectedUsers[i];
          console.log(element.codes);

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

          XLSX.utils.book_append_sheet(wb, ws, element.codes[0]?.redeemed_by);
        }

        XLSX.writeFile(
          wb,
          `$ready_to_pay-${format(new Date(), "PPpp").replaceAll(
            " ",
            "_"
          )}.xlsx`
        );

        reset();
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error("An error occured", {
          duration: 3000,
        });
        setLoading(false);
      });

    setLoading(false);
    onClose();
    queryClient.invalidateQueries(["all_users"]);
    router.reload();
  };
  return (
    <>
      <IconButton
        aria-label="Pay"
        icon={<SiMicrosoftexcel />}
        colorScheme="orange"
        onClick={() => {
          onOpen();
        }}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export List & Mark as paid</ModalHeader>
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
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ExportAndMarkAsPaidModal;
