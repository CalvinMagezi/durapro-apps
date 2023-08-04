import { Button } from "@chakra-ui/react";

function FormSubmitButton({
  loading,
  text,
}: {
  loading: boolean;
  text: string;
}) {
  return (
    <Button
      color="white"
      bg="#273e87"
      _hover={{ bg: "#ee2f26" }}
      type="submit"
      isLoading={loading}
      loadingText="Submitting"
    >
      {text}
    </Button>
  );
}

export default FormSubmitButton;
