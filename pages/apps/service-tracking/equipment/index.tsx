import { supabase } from "@/lib/supabaseClient";
import { Button, Heading, Skeleton } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

import { formatSupabaseData } from "@/helpers/DataToTableConvertion";
import { Plus } from "@phosphor-icons/react";
import Link from "next/link";
import ServiceTrackingLayout from "@/components/layouts/ServiceTrackingLayout";
import ReusableTable from "@/components/tables/ReusableTable";

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
          {results.length > 0 ? (
            <ReusableTable
              data={results}
              columns={columns}
              item_url="/apps/service-tracking/equipment"
            />
          ) : (
            <div>No equipment found</div>
          )}
        </Skeleton>
      </div>
    </ServiceTrackingLayout>
  );
}

export default EquipmentPage;
