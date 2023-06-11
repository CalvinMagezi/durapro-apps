import React, { useEffect, useState } from "react";
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
  Text,
  Input,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import useUser from "@/hooks/useUser";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import parsePhoneNumber from "libphonenumber-js";

type FormValues = {
  password: string;
  confirm_password: string;
  full_name: string;
  phone_number: string;
};

function FirstLoginModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const { profile } = useUser();

  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (data.password !== data.confirm_password) {
      toast.error("Passwords do not match", {
        duration: 5000,
      });
      return;
    }
    setLoading(true);

    try {
      // Update password using new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update user to have a password
      toast.success("Password changed successfully", {
        duration: 5000,
      });

      const p = parsePhoneNumber(data.phone_number, "UG");
      if (!p || !p.isValid()) {
        console.log("Error parsing phone number");
        toast.error("Error parsing phone number", {
          duration: 5000,
        });
        setLoading(false);
        return;
      }
      const parsed_number = p.number;

      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          first_login: true,
          full_name: data.full_name,
          phone_number: parsed_number,
          email: user.email,
        })
        .eq("id", profile?.id);
      if (updateProfileError) {
        toast.error("Error updating profile, please try again", {
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      // Close modal
      onClose();

      return true; // Password changed successfully
    } catch (error) {
      console.log(error);
      toast.error("Error changing password, please try again", {
        duration: 5000,
      });
      setLoading(false);
      return false; // Failed to change password
    }
  };

  useEffect(() => {
    if (!profile) return;
    if (profile?.first_login === false) {
      onOpen();
    }
  }, [profile]);
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete Profile</ModalHeader>
          <ModalBody>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col space-y-4"
            >
              <div>
                <Text className="font-semibold mb-3">Full Name:</Text>
                <Input
                  type="text"
                  {...register("full_name", { required: true })}
                />
                {errors.full_name && (
                  <Text className="text-red-500">This field is required</Text>
                )}
              </div>
              <div>
                <Text className="font-semibold mb-3">Phone Number:</Text>
                <Input
                  type="tel"
                  {...register("phone_number", { required: true })}
                />
                {errors.phone_number && (
                  <Text className="text-red-500">This field is required</Text>
                )}
              </div>
              <div>
                <Text className="font-semibold mb-3">New Password:</Text>
                <Input
                  type="password"
                  {...register("password", { required: true })}
                />
                {errors.password && (
                  <Text className="text-red-500">This field is required</Text>
                )}
              </div>
              <div>
                <Text className="font-semibold mb-3">Confirm Password:</Text>
                <Input
                  type="password"
                  {...register("confirm_password", { required: true })}
                />
                {errors.confirm_password && (
                  <Text className="text-red-500">This field is required</Text>
                )}
              </div>
              <div className="flex items-center w-full justify-center">
                <Button isLoading={loading} colorScheme="green" type="submit">
                  Submit
                </Button>
              </div>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default FirstLoginModal;
