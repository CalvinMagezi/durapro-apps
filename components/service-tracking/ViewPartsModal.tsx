import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  SkeletonText,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Tag,
  IconButton,
} from "@chakra-ui/react";
import { EquipmentPartType } from "@/typings";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import { Trash } from "@phosphor-icons/react";
import { CalculateNextServicing } from "@/helpers/CalculateNextServicing";
import { format } from "date-fns";

function ViewPartsModal({
  id,
  name,
}: {
  id: string | undefined;
  name: string | undefined | null;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [parts, setParts] = useState<EquipmentPartType[]>([]);
  const [fetchingParts, setFetchingParts] = useState(false);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchParts = async (id: string | undefined) => {
    try {
      setFetchingParts(true);

      const { data, error } = await supabase
        .from("equipment_part")
        .select("*")
        .eq("parent", id);

      if (error) {
        console.log(error);
        toast.error("Error fetching parts", {
          duration: 4000,
        });
      } else {
        if (data) {
          setParts(data as EquipmentPartType[]);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching parts", {
        duration: 4000,
      });
    } finally {
      setFetchingParts(false);
    }
  };

  const deletePart = async (part_id: string) => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("equipment_part")
        .delete()
        .eq("id", part_id);

      if (error) {
        console.log(error);
        toast.error("Error deleting part", {
          duration: 4000,
        });
      } else {
        toast.success("Part deleted successfully", {
          duration: 4000,
        });
        fetchParts(id);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error deleting part", {
        duration: 4000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const createServicingEvent = async (part: EquipmentPartType) => {
    setLoading(true);
    const { next_service_time } = await CalculateNextServicing(part);
    try {
      const content = {
        title: `Safe period for: ${part.name}`,
        starts: new Date(),
        ends: next_service_time,
      };

      const { error } = await supabase.from("servicing_event").insert(content);

      if (error) {
        console.log(error);
        toast.error("Error creating servicing event", {
          duration: 4000,
        });
        return;
      }

      toast.success("Servicing event created successfully", {
        duration: 4000,
      });

      try {
        const { error } = await supabase
          .from("equipment_part")
          .update({
            needs_servicing: false,
            last_serviced: new Date(),
            next_servicing: next_service_time,
          })
          .eq("id", part.id);

        if (error) {
          console.log(error);
          toast.error("Error updating equipment", {
            duration: 4000,
          });
          return;
        }

        toast.success("Equipment part updated successfully", {
          duration: 4000,
        });

        fetchParts(id);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && id) {
      fetchParts(id);
    }
  }, [isOpen, id]);
  return (
    <>
      <Button colorScheme="orange" onClick={onOpen}>
        View Parts
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{name} Parts</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SkeletonText isLoaded={!fetchingParts} noOfLines={6}>
              <div className="flex overflow-auto">
                <div className="flex flex-shrink-0 w-full">
                  <TableContainer>
                    <Table variant="striped" colorScheme="teal">
                      <TableCaption>
                        Imperial to metric conversion factors
                      </TableCaption>
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Hours Between Servicing</Th>
                          <Th>Needs Servicing</Th>
                          <Th>Last Serviced</Th>
                          <Th>Next Servicing</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {parts?.map((part) => (
                          <Tr key={part.id}>
                            <Td>{part.name}</Td>
                            <Td>{part.service_days}</Td>
                            <Td>
                              <Tag
                                colorScheme={
                                  part.needs_servicing ? "red" : "green"
                                }
                              >
                                {part.needs_servicing ? "Yes" : "No"}
                              </Tag>
                            </Td>
                            <Td>
                              {part.last_serviced && (
                                <>
                                  {format(new Date(part.last_serviced), "PPp")}
                                </>
                              )}
                            </Td>
                            <Td>
                              {part.next_servicing && (
                                <>
                                  {format(new Date(part.next_servicing), "PPp")}
                                </>
                              )}
                            </Td>

                            <Td>
                              <div className="flex items-center space-x-4">
                                <Button
                                  size="sm"
                                  onClick={() => createServicingEvent(part)}
                                  isLoading={loading}
                                  colorScheme="blue"
                                >
                                  Service
                                </Button>
                                <IconButton
                                  aria-label="delete"
                                  icon={<Trash />}
                                  colorScheme="red"
                                  onClick={() => deletePart(part.id)}
                                  isLoading={deleting}
                                />
                              </div>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </div>
              </div>
            </SkeletonText>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="green"
              onClick={() => {
                router.push({
                  pathname: "/apps/service-tracking/equipment/parts/add",
                  query: { id: id, name: name },
                });
              }}
            >
              Add New Part
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ViewPartsModal;
