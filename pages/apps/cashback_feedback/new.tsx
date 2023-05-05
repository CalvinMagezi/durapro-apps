import FeedbackLayout from "@/components/layouts/FeedbackLayout";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import {
  Button,
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";

type FormValues = {
  first_name: string;
  last_name: string;
  contact: string;
  shop_name: string;
  city: string;
  site_location: string;
  quantity_bought: string;
  redeemed: string;
  not_redeemed: string;
  comment: string;
};

function NewFeedback() {
  const [loading, setLoading] = useState(false);
  const { profile } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!profile) {
      toast.error("Error submitting feedback, please try again", {
        duration: 3000,
      });
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("cashback_feedback").insert({
      first_name: data.first_name,
      last_name: data.last_name,
      contact: data.contact,
      shop_name: data.shop_name,
      city: data.city,
      site_location: data.site_location,
      qty_bought: parseInt(data.quantity_bought),
      redeemed: parseInt(data.redeemed),
      not_redeemed: parseInt(data.not_redeemed),
      comment: data.comment,
      user_id: profile?.id,
    });

    if (error) {
      console.log(error);
      toast.error("Error submitting feedback, please try again", {
        duration: 3000,
      });
    } else {
      toast.success("Successfully submitted feedback", {
        duration: 3000,
      });
      router.push("/apps/cashback_feedback/previous");
    }

    setLoading(false);
  };

  //   console.log(profile);

  return (
    <FeedbackLayout>
      <div className="border border-black rounded-lg p-3 shadow-lg">
        <Heading className="text-center">Create New Feedback Report</Heading>

        <form className="mt-10" onSubmit={handleSubmit(onSubmit)}>
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
            <GridItem>
              <Text className="font-semibold mb-3">Tiler First Name:</Text>
              <Input
                type="text"
                {...register("first_name", { required: true })}
              />
              {errors.first_name && (
                <Text className="text-red-500">This field is required</Text>
              )}
            </GridItem>
            <GridItem>
              <Text className="font-semibold mb-3">Tiler Last Name:</Text>
              <Input
                type="text"
                {...register("last_name", { required: true })}
              />
              {errors.last_name && (
                <Text className="text-red-500">This field is required</Text>
              )}
            </GridItem>
            <GridItem>
              <Text className="font-semibold mb-3">Contact:</Text>
              <Input type="tel" {...register("contact", { required: true })} />
              {errors.contact && (
                <Text className="text-red-500">This field is required</Text>
              )}
            </GridItem>
            <GridItem>
              <Text className="font-semibold mb-3">Shop Name:</Text>
              <Input
                type="text"
                {...register("shop_name", { required: true })}
              />
              {errors.shop_name && (
                <Text className="text-red-500">This field is required</Text>
              )}
            </GridItem>
            <GridItem>
              <Text className="font-semibold mb-3">City:</Text>
              <Input type="text" {...register("city", { required: true })} />
              {errors.city && (
                <Text className="text-red-500">This field is required</Text>
              )}
            </GridItem>
            <GridItem>
              <Text className="font-semibold mb-3">Site Location:</Text>
              <Input
                type="text"
                {...register("site_location", { required: true })}
              />
              {errors.site_location && (
                <Text className="text-red-500">This field is required</Text>
              )}
            </GridItem>
            <GridItem>
              <Text className="font-semibold mb-3">Quantity Bought:</Text>
              <Input
                type="number"
                {...register("quantity_bought", { required: true })}
              />
              {errors.quantity_bought && (
                <Text className="text-red-500">This field is required</Text>
              )}
            </GridItem>
            <GridItem>
              <Text className="font-semibold mb-3">Redeemed:</Text>
              <Input
                type="number"
                {...register("redeemed", { required: true })}
              />
              {errors.redeemed && (
                <Text className="text-red-500">This field is required</Text>
              )}
            </GridItem>
            <GridItem>
              <Text className="font-semibold mb-3">Not Redeemed:</Text>
              <Input
                type="number"
                {...register("not_redeemed", { required: true })}
              />
              {errors.not_redeemed && (
                <Text className="text-red-500">This field is required</Text>
              )}
            </GridItem>
            <GridItem className="md:col-span-2">
              <Text className="font-semibold mb-3">Comment:</Text>
              <Textarea {...register("comment")} />
            </GridItem>
            <GridItem>
              <Button
                colorScheme="green"
                type="submit"
                className="w-full h-full"
                isLoading={loading}
              >
                Submit
              </Button>
            </GridItem>
          </Grid>
        </form>
      </div>
    </FeedbackLayout>
  );
}

export default NewFeedback;
