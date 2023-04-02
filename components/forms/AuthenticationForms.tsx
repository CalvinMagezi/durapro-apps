import { AuthAtom } from "@/atoms/ProfileAtom";
import { supabase } from "@/lib/supabaseClient";
import { Button, Heading, Input, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRecoilState } from "recoil";

type FormValues = {
  full_name: string;
  password: string;
  email: string;
  confirm_password: string;
};

function AuthenticationForms() {
  const [isRegistration, setIsRegistration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useRecoilState(AuthAtom);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    if (isRegistration) {
      if (data.password !== data.confirm_password) {
        toast.error("Passwords do not match ", {
          duration: 8000,
        });
        setLoading(false);
        return;
      }

      //   console.log(data.password);

      const { data: new_user, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      });

      if (error) {
        console.log(error);
        toast.error(error.message, {
          duration: 3000,
        });
        setLoading(false);
        return;
      }
      toast.success("Successfully registered, please sign in", {
        duration: 3000,
      });
      setLoading(false);
      setIsRegistration(false);
    } else {
      //   console.log(data.password);
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
      setAuthenticated(true);
    }
  };

  return (
    <>
      {!isRegistration ? (
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="border-2 border-gray-500 border-opacity-40 rounded-lg shadow-lg p-5"
          >
            <Heading size="md" className="text-center mb-5">
              Sign In
            </Heading>
            <div className="flex flex-col space-y-3">
              <div>
                <Text className="font-bold mb-3">Email:</Text>
                <Input
                  borderWidth={1}
                  border="1px"
                  type="email"
                  {...register("email", {
                    required: true,
                  })}
                />
                {errors.email && (
                  <Text className="text-red-500 mt-2 font-light italic text-sm">
                    {errors.email.message}
                  </Text>
                )}
              </div>
              <div>
                <Text className="font-bold mb-3">Password:</Text>
                <Input
                  borderWidth={1}
                  border="1px"
                  type="password"
                  {...register("password", {
                    required: true,
                  })}
                />
                {errors.password && (
                  <Text className="text-red-500 mt-2 font-light italic text-sm">
                    {errors.password.message}
                  </Text>
                )}
              </div>
              <div className="flex justify-center w-full">
                <Button colorScheme="green" type="submit" isLoading={loading}>
                  Sign In
                </Button>
              </div>
              <div className="flex justify-center items-center w-full">
                <Text
                  className="text-center text-sm font-semibold cursor-pointer hover:scale-105 transition duration-105 ease-in-out"
                  onClick={() => setIsRegistration(true)}
                >
                  {"Don't"} have an account?{" "}
                  <span className="text-blue-500">Sign Up</span>
                </Text>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="border-2 border-gray-500 border-opacity-40 rounded-lg shadow-lg p-5"
          >
            <Heading size="md" className="text-center mb-5">
              Sign Up
            </Heading>
            <div className="flex flex-col space-y-3">
              <div>
                <Text className="font-bold mb-3">Full Name:</Text>
                <Input
                  borderWidth={1}
                  border="1px"
                  type="text"
                  {...register("full_name", {
                    required: true,
                  })}
                />
                {errors.full_name && (
                  <Text className="text-red-500 mt-2 font-light italic text-sm">
                    {errors.full_name.message}
                  </Text>
                )}
              </div>
              <div>
                <Text className="font-bold mb-3">Email:</Text>
                <Input
                  borderWidth={1}
                  border="1px"
                  type="email"
                  {...register("email", {
                    required: true,
                  })}
                />
                {errors.email && (
                  <Text className="text-red-500 mt-2 font-light italic text-sm">
                    {errors.email.message}
                  </Text>
                )}
              </div>
              <div>
                <Text className="font-bold mb-3">Password:</Text>
                <Input
                  borderWidth={1}
                  border="1px"
                  type="password"
                  {...register("password", {
                    required: true,
                  })}
                />
                {errors.password && (
                  <Text className="text-red-500 mt-2 font-light italic text-sm">
                    {errors.password.message}
                  </Text>
                )}
              </div>
              <div>
                <Text className="font-bold mb-3">Confirm Password:</Text>
                <Input
                  borderWidth={1}
                  border="1px"
                  type="password"
                  {...register("confirm_password", {
                    required: true,
                  })}
                />
                {errors.confirm_password && (
                  <Text className="text-red-500 mt-2 font-light italic text-sm">
                    {errors.confirm_password.message}
                  </Text>
                )}
              </div>
              <div className="flex justify-center w-full">
                <Button colorScheme="green" type="submit" isLoading={loading}>
                  Sign Up
                </Button>
              </div>
              <div className="flex justify-center items-center w-full">
                <Text
                  className="text-center text-sm font-semibold cursor-pointer hover:scale-105 transition duration-105 ease-in-out"
                  onClick={() => setIsRegistration(false)}
                >
                  Already have an account?{" "}
                  <span className="text-blue-500">Sign In</span>
                </Text>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default AuthenticationForms;
