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
  Textarea,
  Input,
} from "@chakra-ui/react";
import { Plus } from "@phosphor-icons/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { queryClient } from "@/pages/_app";
import { EquipmentType } from "@/typings";

type FormValues = {
  name: string;
  service_days: string;
  description: string;
  location: string;
};

function AddPartModal({ item }: { item: EquipmentType }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);

    const { error } = await supabase.from("equipment_part").insert({
      name: data.name,
      parent: item.id,
      service_days: data.service_days,
      description: data.description,
    });

    if (error) {
      console.log(error);
      toast.error("Error adding part", {
        duration: 4000,
      });
    } else {
      toast.success("Part added successfully", {
        duration: 4000,
      });
      queryClient.invalidateQueries(["equipment_parts"]);
      reset();
      onClose();
    }

    setLoading(false);
  };
  return (
    <>
      <Button leftIcon={<Plus />} colorScheme="green" onClick={onOpen}>
        Add part
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Part To {item?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex-col space-y-6 p-2"
            >
              <div>
                <label htmlFor="name" className="text-lg font-semibold">
                  Name:
                </label>
                <Input
                  {...register("name")}
                  placeholder="Eg. Old grout machine reducer"
                />
              </div>
              <div>
                <label htmlFor="service_day" className="text-lg font-semibold">
                  Service Days:
                </label>
                <Input
                  {...register("service_days")}
                  placeholder="Eg. Old grout machine reducer"
                />
              </div>
              <div>
                <label htmlFor="description" className="text-lg font-semibold">
                  Description:
                </label>
                <Textarea {...register("description")} />
              </div>

              <div className="my-5 flex w-full items-center justify-center">
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

export default AddPartModal;
