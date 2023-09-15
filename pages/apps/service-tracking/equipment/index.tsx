import { supabase } from "@/lib/supabaseClient";
import { Button, Grid, GridItem, Heading, Skeleton } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

import { formatSupabaseData } from "@/helpers/DataToTableConvertion";
import { Plus } from "@phosphor-icons/react";
import Link from "next/link";
import ServiceTrackingLayout from "@/components/layouts/ServiceTrackingLayout";
import ReusableTable from "@/components/tables/ReusableTable";
import { EquipmentType } from "@/typings";
import EquipmentCard from "@/components/service-tracking/EquipmentCard";

function EquipmentPage() {
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const { data, isLoading } = useQuery(["all_equipment"], async () => {
    const { data, error } = await supabase.from("equipment").select("*");
    if (error) {
      return [];
    }
    return data;
  });

  useEffect(() => {
    if (data) {
      const { data: table_data, columns } = formatSupabaseData(data);
      setResults(table_data);
      setColumns(columns);
    }
  }, [data]);

  return (
    <ServiceTrackingLayout>
      <Heading className="mt-10 text-center" size="md">
        All Equipment
      </Heading>

      <div className="mt-5 flex items-center justify-center">
        <Link href="/apps/service-tracking/equipment/add">
          <Button colorScheme="green" leftIcon={<Plus />}>
            New Equipment
          </Button>
        </Link>
      </div>

      <div className="mx-auto mt-10 px-5 ">
        <Skeleton isLoaded={!isLoading}>
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
            {results.length <= 0 && (
              <div className="text-center">No equipment found</div>
            )}
            {results?.map((equipment: EquipmentType) => (
              <GridItem key={equipment.id}>
                <EquipmentCard equipment={equipment} />
              </GridItem>
            ))}
          </Grid>
          {/* {results.length > 0 ? (
            <ReusableTable
              data={results}
              columns={columns}
              item_url="/apps/service-tracking/equipment"
              delete_table="equipment"
            />
          ) : (
            <div>No equipment found</div>
          )} */}
        </Skeleton>
      </div>
    </ServiceTrackingLayout>
  );
}

export default EquipmentPage;
