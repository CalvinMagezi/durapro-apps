import { AuthAtom } from "@/atoms/ProfileAtom";
import { supabase } from "@/lib/supabaseClient";
import {
  Button,
  Heading,
  Input,
  Text,
  Container,
  Stack,
  Box,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRecoilState } from "recoil";
import FormSubmitButton from "../buttons/FormSubmitButton";

type FormValues = {
  full_name: string;
  password: string;
  email: string;
  confirm_password: string;
};

function AuthenticationForms() {
  const [isRegistration, setIsRegistration] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.log(error);
      toast.error(error.message, {
        duration: 8000,
      });
      setLoading(false);
      setIsRegistration(false);
      return;
    }

    toast.success("Welcome back", {
      duration: 3000,
    });

    router.push("/apps");
  };

  return (
    <Container>
      <Box
        py={{ base: "0", sm: "8" }}
        px={{ base: "4", sm: "10" }}
        bg={{ base: "transparent", sm: "bg.surface" }}
        boxShadow="md"
        borderRadius={{ base: "none", sm: "xl" }}
      >
        <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
          <Heading size={{ base: "xs", md: "sm" }}>Sign In</Heading>
        </Stack>
        <Stack spacing="6">
          <Stack spacing="5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl className={`mb-3`}>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  type="email"
                  borderWidth={1}
                  placeholder={"example@gmail.com"}
                  border="1px"
                  _hover={{ borderColor: "black" }}
                  {...register("email", {
                    required: true,
                  })}
                />
                {errors.email && (
                  <Text className="mt-2 text-sm font-light italic text-red-500">
                    {errors.email.message}
                  </Text>
                )}
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder={"*********"}
                  borderWidth={1}
                  border="1px"
                  _hover={{ borderColor: "black" }}
                  {...register("password", {
                    required: true,
                  })}
                />

                {errors.password && (
                  <Text className="mt-2 text-sm font-light italic text-red-500">
                    {errors.password.message}
                  </Text>
                )}
              </FormControl>
              <div className="mt-5 mb-5">
                <FormSubmitButton loading={loading} text="Sign In" />
              </div>
            </form>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}

export default AuthenticationForms;
