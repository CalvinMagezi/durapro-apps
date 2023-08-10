import { Button, Flex, Heading } from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";

type ErrorPageProps = {
  statusCode: number;
};

const Error500Page = ({ statusCode }: ErrorPageProps) => {
  const router = useRouter();

  useEffect(() => {
    document.body.style.backgroundColor = "#F7FAFC";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Flex
      height="100vh"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Image src="/logo.png" alt="Logo" width="150" height="100" />
      <Heading as="h1" size="lg" textAlign="center" my={8}>
        Oops something went wrong, please contact support or try again
      </Heading>
      <Button onClick={handleGoBack}>Go back</Button>
    </Flex>
  );
};

export default Error500Page;
