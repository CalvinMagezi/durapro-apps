import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Textarea } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";

type FormValues = {
  name: string;
  service_days: string;
  description: string;
  location: string;
};

function AddEquipmentForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);

    const { error } = await supabase.from("equipment").insert([
      {
        name: data.name,
        service_days: data.service_days,
        description: data.description,
        location: data.location,
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
      router.push("/dashboard/equipment/add");
    }

    setLoading(false);
  };
  return (
    <div>
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
        <div>
          <label htmlFor="location" className="text-lg font-semibold">
            Location:
          </label>
          <Textarea {...register("location")} />
        </div>

        <div className="my-5 flex w-full items-center justify-center">
          <Button type="submit" colorScheme="green" isLoading={loading}>
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddEquipmentForm;
