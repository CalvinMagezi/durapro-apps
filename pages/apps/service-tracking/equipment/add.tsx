import AddEquipmentForm from "@/components/forms/AddEquipmentForm";
import ServiceTrackingLayout from "@/components/layouts/ServiceTrackingLayout";
import { Heading } from "@chakra-ui/react";
import React from "react";

function AddNewEquipment() {
  return (
    <ServiceTrackingLayout>
      <Heading className="mt-10 text-center" size="md">
        Add New Equipment
      </Heading>
      <div className="mx-auto mt-10 max-w-4xl rounded-lg border border-gray-500 border-opacity-50">
        <AddEquipmentForm />
      </div>
    </ServiceTrackingLayout>
  );
}

export default AddNewEquipment;
