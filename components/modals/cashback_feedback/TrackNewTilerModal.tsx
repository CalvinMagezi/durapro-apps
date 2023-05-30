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
  Heading,
  Grid,
  GridItem,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { queryClient } from "@/pages/_app";
import parsePhoneNumber from "libphonenumber-js";
import generateUniqueId from "@/helpers/generateUniqueId";

type FormValues = {
  first_name: string;
  last_name: string;
  contact: string;
};

function TrackNewTilerModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
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

    const phone_number = parsePhoneNumber(data.contact, "UG");
    if (!phone_number || !phone_number.isValid()) {
      toast.error("Invalid phone number", {
        duration: 3000,
      });
      return;
    }

    const { data: exists, error } = await supabase
      .from("tiler_profile")
      .select("*")
      .eq("phone_number", phone_number.number);

    if (error) {
      console.log(error);
      toast.error("Error submitting feedback, please try again", {
        duration: 3000,
      });
      setLoading(false);
      return;
    }

    if (exists && exists.length > 0) {
      //Check whether the tiler is being tracked by the current user
      const { data: tracked, error } = await supabase
        .from("tiler_profile")
        .select("*")
        .eq("_id", exists[0]._id)
        .eq("tracked_by", profile?.id);

      if (error) {
        console.log(error);
        toast.error("Error submitting feedback, please try again", {
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      if (tracked && tracked.length > 0) {
        toast.success(
          "You are already tracking this tiler, you shall now be redirected to their page.",
          {
            duration: 3000,
          }
        );
        router.push(`/apps/cashback_feedback/tilers/${phone_number.number}`);
        return;
      } else {
        toast.error(
          "You are currently not tracking this tiler. A tracking conflict request has been created.",
          {
            duration: 3000,
          }
        );
        const { error } = await supabase.from("tracking_requests").insert({
          request_by: profile?.id,
          request_for: exists[0]._id,
          isConflict: true,
        });
        if (error) {
          console.log(error);
          toast.error("Error requesting. please try again", {
            duration: 3000,
          });
        }

        setLoading(false);
        return;
      }
    } else {
      //Create new tiler profile
      const { error } = await supabase.from("tiler_profile").insert({
        _id: generateUniqueId(),
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: phone_number.number,
        tracked_by: profile?.id,
      });

      if (error) {
        console.log(error);
        toast.error("Error creating tiler profile, please try again", {
          duration: 3000,
        });

        setLoading(false);
        return;
      }
      toast.success(
        "New tiler profile has been created for tracking. You shall now be redirected to their page.",
        {
          duration: 8000,
        }
      );
      router.push(`/apps/cashback_feedback/tilers/${phone_number.number}`);
      setLoading(false);
      return;
    }
    setLoading(false);
  };
  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme="green"
        size="lg"
        leftIcon={<FaPlus />}
      >
        Track New Tiler
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request To Track New Tiler</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Heading className="text-center mb-10" size="md">
              Details
            </Heading>

            <form className="mt-10" onSubmit={handleSubmit(onSubmit)}>
              <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                <GridItem>
                  <Text className="font-semibold mb-3">
                    <span className="text-red-500">*</span>Contact:
                  </Text>
                  <Input
                    type="tel"
                    placeholder="0771234567"
                    {...register("contact", { required: true })}
                  />
                  {errors.contact && (
                    <Text className="text-red-500">This field is required</Text>
                  )}
                </GridItem>
                <GridItem>
                  <Text className="font-semibold mb-3">Tiler First Name:</Text>
                  <Input type="text" {...register("first_name")} />
                </GridItem>
                <GridItem>
                  <Text className="font-semibold mb-3">Tiler Last Name:</Text>
                  <Input type="text" {...register("last_name")} />
                </GridItem>
              </Grid>
              <Button
                colorScheme="green"
                type="submit"
                className="w-full h-full mt-10"
                isLoading={loading}
              >
                Submit
              </Button>
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

export default TrackNewTilerModal;
