import FeedbackLayout from "@/components/layouts/FeedbackLayout";
import { Heading } from "@chakra-ui/react";
import React from "react";

function CashbackFeedbackPage() {
  return (
    <FeedbackLayout>
      <Heading className="text-center">Most Recent Feedback:</Heading>
    </FeedbackLayout>
  );
}

export default CashbackFeedbackPage;
