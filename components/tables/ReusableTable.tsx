import { supabase } from "@/lib/supabaseClient";
import { queryClient } from "@/pages/_app";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useBreakpointValue,
  IconButton,
} from "@chakra-ui/react";
import { PencilSimple, Trash } from "@phosphor-icons/react";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface TableProps {
  data: any[];
  columns: string[];
  item_url?: string;
  delete_table?: string;
}

const ReusableTable: React.FC<TableProps> = ({
  data,
  columns,
  item_url,
  delete_table,
}) => {
  const variant = useBreakpointValue({ base: "simple", md: "striped" });
  const [isLoading, setIsLoading] = useState(false);

  const visibleColumns = columns.filter((column) => column !== "id");
  const withoutParentColumns = visibleColumns.filter(
    (column) => column !== "parent"
  );

  const deleteItem = async (id: string) => {
    if (!delete_table) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from(delete_table)
        .delete()
        .match({ id });

      if (error) {
        console.log(error);
        toast.error("Error deleting equipment", {
          duration: 4000,
        });
      } else {
        toast.success("Equipment deleted successfully", {
          duration: 4000,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error deleting equipment", {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
      queryClient.invalidateQueries();
    }
  };

  return (
    <Box overflowX="auto">
      <Table variant={variant} size="sm">
        <Thead>
          <Tr>
            {withoutParentColumns.map((column, index) => (
              <Th key={index}>{column}</Th>
            ))}
            {item_url && <Th></Th>}
            {delete_table && <Th></Th>}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              {withoutParentColumns.map((column, columnIndex) => (
                <Td key={columnIndex}>{row[column]}</Td>
              ))}
              {item_url && (
                <Td>
                  <Link href={`${item_url}/${row.id}`}>
                    <IconButton
                      aria-label="edit"
                      icon={<PencilSimple className="font-bold" />}
                      colorScheme="orange"
                      disabled={isLoading}
                      isLoading={isLoading}
                    />
                  </Link>
                </Td>
              )}
              {delete_table && (
                <Td>
                  <IconButton
                    aria-label="delete"
                    icon={<Trash className="font-bold" />}
                    colorScheme="red"
                    onClick={() => deleteItem(row.id)}
                    disabled={isLoading}
                    isLoading={isLoading}
                  />
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ReusableTable;
