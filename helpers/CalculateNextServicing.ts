import { EquipmentType } from "@/typings";

export async function CalculateNextServicing(equipment: EquipmentType) {
  const hours_between_servicing =
    Number(equipment.service_days?.split(" ")[0]) || 0;

  const start_track_time = new Date();

  //Add the hours between servicing to the start track time
  const next_service_time = new Date(
    start_track_time.setHours(
      start_track_time.getHours() + hours_between_servicing
    )
  );

  return { next_service_time };
}
