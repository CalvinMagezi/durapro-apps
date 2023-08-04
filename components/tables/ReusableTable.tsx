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
import { PencilSimple } from "@phosphor-icons/react";

import Link from "next/link";

interface TableProps {
  data: any[];
  columns: string[];
  item_url?: string;
}

const ReusableTable: React.FC<TableProps> = ({ data, columns, item_url }) => {
  const variant = useBreakpointValue({ base: "simple", md: "striped" });

  const visibleColumns = columns.filter((column) => column !== "id");
  const withoutParentColumns = visibleColumns.filter(
    (column) => column !== "parent"
  );

  return (
    <Box overflowX="auto">
      <Table variant={variant} size="sm">
        <Thead>
          <Tr>
            {withoutParentColumns.map((column, index) => (
              <Th key={index}>{column}</Th>
            ))}
            {item_url && <Th></Th>}
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
                    />
                  </Link>
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
