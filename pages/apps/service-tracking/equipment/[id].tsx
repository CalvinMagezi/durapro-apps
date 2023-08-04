import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { supabase } from "@/lib/supabaseClient";
import { EquipmentType } from "@/typings";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Textarea,
  Button,
  Heading,
  IconButton,
  Skeleton,
} from "@chakra-ui/react";
import { PencilSimple, Plus } from "@phosphor-icons/react";

import { useQuery } from "@tanstack/react-query";
import { formatSupabaseData } from "@/helpers/DataToTableConvertion";
import ServiceTrackingLayout from "@/components/layouts/ServiceTrackingLayout";
import AddPartModal from "@/components/modals/service_tracking/AddPartModal";
import ReusableTable from "@/components/tables/ReusableTable";

type FormValues = {
  name: string;
  service_days: string;
  description: string;
  location: string;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id;
  const { data } = await supabase
    .from("equipment")
    .select("*")
    .eq("id", id)
    .limit(1)
    .single(); // your fetch function here

  return {
    props: {
      data,
    },
  };
};

function IndividualEquipment({ data }: { data: EquipmentType }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const { register, handleSubmit } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);

    const { error } = await supabase
      .from("equipment")
      .update(data)
      .eq("id", router.query.id);

    if (error) {
      console.log(error);
      toast.error("Error updating equipment", {
        duration: 4000,
      });
    } else {
      toast.success("Equipment updated successfully", {
        duration: 4000,
      });
      router.push(`/dashboard/equipment/${router.query.id}`);
    }

    setLoading(false);
  };

  const { data: parts, isLoading } = useQuery(
    ["equipment_parts", router.query.id],
    async () => {
      const { data, error } = await supabase
        .from("equipment_part")
        .select("*")
        .eq("parent", router.query.id);
      if (error) {
        return [];
      }
      return data;
    },
    {
      enabled: !!router.query.id,
    }
  );

  useEffect(() => {
    if (parts) {
      const { data: table_data, columns } = formatSupabaseData(parts);
      setResults(table_data);
      setColumns(columns);
    }
  }, [parts]);

  return (
    <ServiceTrackingLayout>
      <>
        <div className="my-10 flex flex-col items-center justify-center space-y-4">
          <Heading className=" text-center" size="md">
            View {data?.name}
          </Heading>
          <IconButton
            aria-label="edit"
            icon={<PencilSimple />}
            colorScheme="orange"
            onClick={onOpen}
          />
        </div>
        <div className="mx-auto flex max-w-lg items-center justify-center rounded-lg border border-gray-400 border-opacity-50 p-1">
          <div>
            <div>
              <h1 className="text-xl font-bold ">Name:</h1>
              <p>{data?.name}</p>
            </div>
            <br />
            <div>
              <h1 className="text-xl font-bold ">Service Days:</h1>
              <p>{data?.service_days}</p>
            </div>
            <br />
            <div>
              <h1 className="text-xl font-bold ">Description:</h1>

              <p>{data?.description}</p>
            </div>
            <br />
            <div>
              <h1 className="text-xl font-bold ">Location:</h1>
              <p>{data?.location}</p>
            </div>
          </div>
        </div>

        <div className="my-10 flex flex-col items-center justify-center space-y-4">
          <Heading className=" text-center" size="md">
            {data?.name} Parts
          </Heading>
          <AddPartModal item={data} />
        </div>

        <div>
          <Skeleton isLoaded={!isLoading}>
            {results.length > 0 ? (
              <ReusableTable data={results} columns={columns} />
            ) : (
              <div>No equipment found</div>
            )}
          </Skeleton>
        </div>

        <Skeleton isLoaded={!isLoading}></Skeleton>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit {data?.name}</ModalHeader>
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
                    defaultValue={data?.name ? data.name : ""}
                    placeholder="Eg. Old grout machine reducer"
                  />
                </div>
                <div>
                  <label
                    htmlFor="service_day"
                    className="text-lg font-semibold"
                  >
                    Service Days:
                  </label>
                  <Input
                    {...register("service_days")}
                    defaultValue={data?.service_days ? data.service_days : ""}
                    placeholder="Eg. Old grout machine reducer"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="text-lg font-semibold"
                  >
                    Description:
                  </label>
                  <Textarea
                    {...register("description")}
                    defaultValue={data?.description ? data.description : ""}
                  />
                </div>
                <div>
                  <label htmlFor="location" className="text-lg font-semibold">
                    Location:
                  </label>
                  <Textarea
                    {...register("location")}
                    defaultValue={data?.location ? data.location : ""}
                  />
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
    </ServiceTrackingLayout>
  );
}

export default IndividualEquipment;
