import ServiceTrackingLayout from "@/components/layouts/ServiceTrackingLayout";
import { supabase } from "@/lib/supabaseClient";
import {
  Button,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  Textarea,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";

type FormValues = {
  name: string;
  service_days: string;
  description: string;
};

function AddNewPart() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id, name } = router.query;
  const { register, handleSubmit } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);

    const { error } = await supabase.from("equipment_part").insert([
      {
        name: data.name,
        service_days: `${data.service_days} hours`,
        description: data.description,
        parent: id,
      },
    ]);

    if (error) {
      console.log(error);
      toast.error("Error adding equipment", {
        duration: 4000,
      });
    } else {
      toast.success("Equipment added successfully", {
        duration: 4000,
      });
      router.push("/apps/service-tracking/equipment");
    }

    setLoading(false);
  };

  return (
    <ServiceTrackingLayout>
      <Heading className="mt-10 text-center" size="md">
        Add New Equipment Part To {name}
      </Heading>
      <div className="mx-auto mt-10 max-w-4xl rounded-lg border border-gray-500 border-opacity-50">
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
              Hours between servicing
            </label>
            <InputGroup>
              <Input
                type="number"
                {...register("service_days")}
                placeholder="Eg. 100 "
              />
              <InputRightAddon>hours</InputRightAddon>
            </InputGroup>
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
      </div>
    </ServiceTrackingLayout>
  );
}

export default AddNewPart;
