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
  Button,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";
import { TilerProfileType } from "@/typings";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

type FormValues = {
  shop_name: string;
  city: string;
  site_location: string;
  quantity_bought: string;
  comment: string;
  transaction_date: string;
};

function NewTransactionModal({ tiler }: { tiler: TilerProfileType }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    const { error } = await supabase.from("tiler_transaction").insert([
      {
        tiler_profile: tiler._id,
        shop_name: data.shop_name,
        city: data.city,
        site_location: data.site_location,
        quantity_bought: data.quantity_bought,
        comment: data.comment,
      },
    ]);

    if (error) {
      console.log(error);
      toast.error("Error creating transaction", { duration: 5000 });
      setLoading(false);
      return;
    }

    toast.success("Transaction created successfully", { duration: 5000 });
    onClose();
    setLoading(false);
  };
  return (
    <>
      <Button onClick={onOpen} rightIcon={<FaPlus />} colorScheme="green">
        New Transaction
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form
              className="flex flex-col space-y-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <label htmlFor="transaction_date">Transaction Date</label>
                <Input
                  type="datetime-local"
                  {...register("transaction_date")}
                  id="transaction_date"
                />
              </div>
              <div>
                <label htmlFor="shop_name">Shop Name</label>
                <Input type="text" {...register("shop_name")} id="shop_name" />
              </div>
              <div>
                <label htmlFor="city">City</label>
                <Input type="text" {...register("city")} id="city" />
              </div>
              <div>
                <label htmlFor="site_location">Site Location</label>
                <Input
                  type="text"
                  {...register("site_location")}
                  id="site_location"
                />
              </div>
              <div>
                <label htmlFor="quantity_bought">Quantity Bought</label>
                <Input
                  type="number"
                  {...register("quantity_bought")}
                  id="quantity_bought"
                />
              </div>
              <div>
                <label htmlFor="comment">Comment</label>
                <Textarea {...register("comment")} id="comment" />
              </div>
              <div className="flex items-center w-full justify-center">
                <Button type="submit" colorScheme="green" isLoading={loading}>
                  Submit
                </Button>
              </div>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default NewTransactionModal;
