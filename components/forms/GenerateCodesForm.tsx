import { supabase } from "@/lib/supabaseClient";
import { Button, Grid, GridItem, Input, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";

type FormValues = {
  product_name: string;
  product_sku: string;
  number_of_codes: string;
};

function GenerateCodesForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function removeDuplicates(arr: number[]) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);

    const codes = [];

    for (let index = 0; index < parseInt(data.number_of_codes); index++) {
      let code = Math.floor(100000 + Math.random() * 900000);
      codes.push(code);
    }

    const no_dupes = removeDuplicates(codes);
    const creatable = no_dupes.map((code) => {
      return {
        code: code,
        _id: `code-${code}`,
        _createdAt: new Date().toISOString(),
        product_name: data.product_name,
        redeemed: false,
        funds_disbursed: false,
      };
    });

    const { data: created, error } = await supabase
      .from("cashback_codes")
      .upsert(creatable)
      .select();

    if (error) {
      console.log(error);
      toast.error("Oops, something went wrong. Please try again", {
        duration: 3000,
      });
    } else {
      toast.success(
        `Successfully generated ${created.length} new codes for ${data.product_name}`,
        {
          duration: 6000,
        }
      );
      reset();
      // router.push("/admin/dashboard/codes");
    }
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GridItem>
          <Text className="font-semibold text-lg mb-3">Product Name:</Text>
          <Input
            {...register("product_name", { required: true })}
            type="text"
          />
          {errors.product_name && (
            <Text className="text-red-400">This field is required</Text>
          )}
        </GridItem>
        <GridItem>
          <Text className="font-semibold text-lg mb-3">Number of codes:</Text>
          <Input
            {...register("number_of_codes", { required: true })}
            type="number"
          />
          {errors.number_of_codes && (
            <Text className="text-red-400">This field is required</Text>
          )}
        </GridItem>
        <GridItem className="md:col-span-2 lg:col-span-3">
          <div className="flex justify-center">
            <Button type="submit" colorScheme="green" isLoading={loading}>
              Generate
            </Button>
          </div>
        </GridItem>
      </Grid>
    </form>
  );
}

export default GenerateCodesForm;
