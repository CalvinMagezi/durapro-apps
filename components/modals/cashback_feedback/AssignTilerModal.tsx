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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  Select,
  Checkbox,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import { FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";
import { ProfileType, TilerProfileType } from "@/typings";
import { queryClient } from "@/pages/_app";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

function AssignTilerModal() {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedTilers, setSelectedTilers] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [show, setShow] = useState(10);
  const [filteredTilers, setFilteredTilers] = useState<
    any[] | null | undefined
  >([]);
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { profile } = useUser();
  const router = useRouter();

  const { data, isLoading } = useQuery(["tilers_and_staff"], async () => {
    const { data: tilers } = await supabase.from("tiler_profile").select("*");

    const { data: staff } = await supabase
      .from("profiles")
      .select("*")
      .eq("position", "sales");

    return { tilers, staff };
  });

  const handleAssign = async () => {
    if (!selectedStaff || selectedTilers.length === 0) {
      toast.error("Please select a staff member and tilers to assign", {
        duration: 5000,
      });
      return;
    }
    setLoading(true);

    const errors = [];

    //Update all selected tilers
    for (const tiler of selectedTilers) {
      const { error } = await supabase
        .from("tiler_profile")
        .update({ tracked_by: selectedStaff })
        .eq("_id", tiler);

      if (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      toast.error("Error assigning tilers to staff member", {
        duration: 5000,
      });
      setLoading(false);
      return;
    } else {
      toast.success("Tilers assigned successfully", {
        duration: 5000,
      });
      queryClient.invalidateQueries(["tilers_and_staff", "all_profiles"]);
      onClose();
      setLoading(false);
      setSelectedStaff("");
      setSelectedTilers([]);
      router.push("/apps/cashback_feedback/tilers");
      return;
    }
  };

  useEffect(() => {
    if (!data) return;

    if (filter) {
      const filtered = data?.tilers?.filter(
        (tiler) =>
          tiler.first_name.toLowerCase().includes(filter.toLowerCase()) ||
          tiler.last_name.toLowerCase().includes(filter.toLowerCase()) ||
          tiler.phone_number.includes(filter)
      );

      setFilteredTilers(filtered?.slice(0, show));
    }

    if (!filter) {
      setFilteredTilers(data?.tilers?.slice(0, show));
    }
  }, [show, data, filter]);

  // console.log(selectedStaff);

  return (
    <>
      <Button onClick={onOpen} leftIcon={<FaPlus />} colorScheme="green">
        Assign Tilers
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign a tiler to a staff member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Skeleton isLoaded={!isLoading}>
              <Tabs index={tabIndex} variant="soft-rounded" colorScheme="green">
                <TabList>
                  <Tab onClick={() => setTabIndex(0)}>Staff</Tab>
                  <Tab onClick={() => setTabIndex(1)}>Tiler</Tab>
                  <Tab onClick={() => setTabIndex(2)}>Confirm</Tab>
                </TabList>

                {data ? (
                  <TabPanels>
                    <TabPanel>
                      <p className="mb-5 font-semibold italic">
                        Select a staff member:
                      </p>
                      <Select
                        onChange={(e) => {
                          setTabIndex(1);
                          setSelectedStaff(e.target.value);
                        }}
                      >
                        <option value="">Select..</option>
                        {data?.staff
                          ?.filter((st) => st.full_name !== null)
                          .map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.full_name}
                            </option>
                          ))}
                      </Select>
                    </TabPanel>
                    <TabPanel>
                      <p className="mb-5 font-semibold italic">
                        Select tiler or tilers to assign:
                      </p>
                      <Input
                        type="text"
                        className="mb-5"
                        placeholder="Search for a tiler"
                        onChange={(e) => setFilter(e.target.value)}
                      />
                      {filteredTilers?.map((tiler) => (
                        <div
                          key={tiler._id}
                          className="flex items-center space-x-8"
                        >
                          <Checkbox
                            isChecked={selectedTilers.includes(tiler._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTilers((prev) => [
                                  ...prev,
                                  tiler._id,
                                ]);
                              } else {
                                setSelectedTilers((prev) =>
                                  prev.filter((id) => id !== tiler._id)
                                );
                              }
                            }}
                          />
                          <p>
                            {tiler.first_name} {tiler.last_name}{" "}
                            <span className="font-light">
                              ({tiler.phone_number})
                            </span>
                          </p>
                        </div>
                      ))}

                      <div className="flex items-center space-x-8 justify-center mt-10">
                        <IconButton
                          colorScheme="green"
                          onClick={() => setShow((prev) => prev + 10)}
                          aria-label="Show more tilers"
                          icon={<FaChevronDown />}
                        />
                        <IconButton
                          colorScheme="orange"
                          onClick={() => {
                            if (show > 10) {
                              setShow((prev) => prev - 10);
                            }
                          }}
                          aria-label="Show less tilers"
                          icon={<FaChevronUp />}
                        />
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <p className="mb-5 font-semibold italic">
                        Confirm Action:
                      </p>

                      <p>
                        Assigning to:
                        <span className="font-semibold">
                          {" "}
                          {
                            data?.staff?.find((st) => st.id === selectedStaff)
                              ?.full_name
                          }
                        </span>
                      </p>
                      <br />
                      <p className="font-semibold mb-2">
                        Tilers being assigned:
                      </p>
                      <ul>
                        {selectedTilers.map((id) => (
                          <li key={id}>
                            {
                              data?.tilers?.find((tiler) => tiler._id === id)
                                ?.first_name
                            }{" "}
                            {
                              data?.tilers?.find((tiler) => tiler._id === id)
                                ?.last_name
                            }
                            {" - "}
                            <span className="font-light">
                              (
                              {
                                data?.tilers?.find((tiler) => tiler._id === id)
                                  ?.phone_number
                              }
                              )
                            </span>
                          </li>
                        ))}
                      </ul>
                    </TabPanel>
                  </TabPanels>
                ) : (
                  <div>
                    <p>Error fetching staff and tiler data</p>
                  </div>
                )}
              </Tabs>
            </Skeleton>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              colorScheme="green"
              isLoading={loading}
            >
              Assign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AssignTilerModal;
