import { EquipmentPartType, EquipmentType } from "@/typings";
import {
  Tag,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
  Button,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputRightAddon,
  SkeletonText,
} from "@chakra-ui/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import CPImageUpload from "../utils/CPImageUpload";
import { queryClient } from "@/pages/_app";
import { useRouter } from "next/router";
import EquipmentPartCard from "./EquipmentPartCard";
import ViewPartsModal from "./ViewPartsModal";
import { CalculateNextServicing } from "@/helpers/CalculateNextServicing";

type FormValues = {
  name: string;
  service_days: string;
  description: string;
  location: string;
};

function EquipmentCard({ equipment }: { equipment: EquipmentType }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [parts, setParts] = useState<EquipmentPartType[]>([]);

  const router = useRouter();

  const { register, handleSubmit } = useForm<FormValues>();

  const updateImage = async (url: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("equipment")
        .update({ image_url: url })
        .eq("id", equipment.id);
      if (error) {
        toast.error("Error updating image", {
          duration: 3000,
        });
      } else {
        toast.success("Image updated successfully", {
          duration: 3000,
        });
        queryClient.invalidateQueries(["all_equipment"]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating image", {
        duration: 3000,
      });
    } finally {
      setLoading(false);
      return;
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);

    const { error } = await supabase
      .from("equipment")
      .update(data)
      .eq("id", equipment.id);

    if (error) {
      console.log(error);
      toast.error("Error updating equipment", {
        duration: 4000,
      });
    } else {
      toast.success("Equipment updated successfully", {
        duration: 4000,
      });
      router.push(`/apps/service-tracking/equipment`);
    }

    setLoading(false);
  };

  const createServicingEvent = async () => {
    setLoading(true);
    const { next_service_time } = await CalculateNextServicing(equipment);
    try {
      const content = {
        title: `Safe period for: ${equipment.name}`,
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
          .from("equipment")
          .update({
            needs_servicing: false,
            start_track_time: new Date(),
            next_service_time: next_service_time,
          })
          .eq("id", equipment.id);

        if (error) {
          console.log(error);
          toast.error("Error updating equipment", {
            duration: 4000,
          });
          return;
        }

        toast.success("Equipment updated successfully", {
          duration: 4000,
        });

        router.push(`/apps/service-tracking/equipment`);
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
    if (equipment?.image_url) {
      setImageUrl(equipment.image_url);
    }
  }, [equipment?.image_url]);
  return (
    <>
      <div
        onClick={onOpen}
        className="flex relative flex-col rounded-lg shadow-md px-2 py-4 justify-center space-y-4 cursor-pointer hover:scale-105 transition duration-150 ease-linear"
      >
        <Tag
          colorScheme={equipment?.needs_servicing ? "red" : "green"}
          className={`absolute left-3 top-3 z-10`}
        >
          {equipment?.needs_servicing ? "Needs Servicing" : "No Service Needed"}
        </Tag>
        <div className="relative w-full h-64">
          <Image
            fill
            src={equipment?.image_url || "/placeholder.jpeg"}
            className="object-cover"
            alt="Image"
          />
        </div>
        <h1 className="text-center text-xl font-bold">{equipment?.name}</h1>
      </div>

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <div className="flex items-center space-x-12">
              <h1 className="font-bold text-xl">{equipment?.name}</h1>
              <Tag
                colorScheme={equipment?.needs_servicing ? "red" : "green"}
                className={``}
              >
                {equipment?.needs_servicing
                  ? "Needs Servicing"
                  : "No Service Needed"}
              </Tag>
            </div>
          </DrawerHeader>

          <DrawerBody>
            <Tabs variant="soft-rounded" colorScheme="green">
              <TabList>
                <Tab>Edit Details</Tab>
                <Tab>Edit Image</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex-col space-y-6 p-2"
                  >
                    <div>
                      <label htmlFor="name" className="text-lg font-semibold">
                        Name:
                      </label>
                      <Input
                        {...register("name")}
                        defaultValue={equipment?.name ? equipment.name : ""}
                        placeholder="Eg. Old grout machine reducer"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="service_day"
                        className="text-lg font-semibold"
                      >
                        Hours between servicing:{" "}
                        {equipment?.service_days ? equipment.service_days : ""}
                      </label>
                      <InputGroup>
                        <Input
                          type="number"
                          {...register("service_days")}
                          placeholder="Eg. 100 "
                        />
                        <InputRightAddon>hours</InputRightAddon>
                      </InputGroup>
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="text-lg font-semibold"
                      >
                        Description:
                      </label>
                      <Textarea
                        {...register("description")}
                        defaultValue={
                          equipment?.description ? equipment.description : ""
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="location"
                        className="text-lg font-semibold"
                      >
                        Location:
                      </label>
                      <Textarea
                        {...register("location")}
                        defaultValue={
                          equipment?.location ? equipment.location : ""
                        }
                      />
                    </div>

                    <div className="my-5 flex w-full items-center justify-center">
                      <Button
                        type="submit"
                        colorScheme="green"
                        isLoading={loading}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </TabPanel>
                <TabPanel>
                  <CPImageUpload
                    value={imageUrl ? imageUrl : ""}
                    onChange={async (e) => {
                      console.log(e);
                      setImageUrl(e);
                      await updateImage(e);
                    }}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>

          <DrawerFooter>
            <ViewPartsModal id={equipment.id} name={equipment.name} />
            <Button
              colorScheme="blue"
              ml={3}
              mr={3}
              isLoading={loading}
              onClick={createServicingEvent}
            >
              Mark As Serviced
            </Button>
            <Button colorScheme="red" isLoading={loading} onClick={onClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default EquipmentCard;
