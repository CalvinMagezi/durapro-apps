import React from "react";
import { Heading, useDisclosure } from "@chakra-ui/react";

import ServiceTrackingLayout from "@/components/layouts/ServiceTrackingLayout";
import DefaultDashboardBanner from "@/components/utils/DefaultDashboardBanner";

function ServiceTrackingDashboard() {
  return (
    <ServiceTrackingLayout>
      <DefaultDashboardBanner title="Equipment Servicing Tracking" />
    </ServiceTrackingLayout>
  );
}

export default ServiceTrackingDashboard;
