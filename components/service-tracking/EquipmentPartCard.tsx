import { EquipmentPartType } from "@/typings";
import React from "react";

function EquipmentPartCard({ part }: { part: EquipmentPartType }) {
  return <div>{part.name}</div>;
}

export default EquipmentPartCard;
