import React from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Badge,
  Box,
  IconButton,
} from "@chakra-ui/react";
import Image from "next/image";

import Link from "next/link";
import { List, Chats } from "@phosphor-icons/react";
import { ColorModeSwitcher } from "../utils/ColorModeSwitcher";

interface Section {
  title: string;
  links: {
    title: string;
    href: string;
  }[];
}

function PrimaryMobileNavbar({ sections }: { sections: Section[] }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <IconButton
        aria-label="menu"
        icon={<List size={32} />}
        onClick={onOpen}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader color="white" bg="#1c3184">
            <div className="rounded-lg bg-white p-1">
              <Image
                priority
                width="200"
                height="80"
                src="https://res.cloudinary.com/magezi-tech-solutions/image/upload/v1668595786/Tiles%20Gallery/Logo_pudhpl.png"
                alt="Durapro Solutions"
              />
            </div>
          </DrawerHeader>

          <DrawerBody color="white" bg="#1c3184">
            <div className="flex flex-col">
              <Link
                href="/dashboard"
                style={{ textDecoration: "none", borderRadius: 0 }}
              >
                <Flex
                  align="center"
                  p={3}
                  role="group"
                  pl={`60px`}
                  cursor="pointer"
                  _hover={{ bg: "#1c3184" }}
                  data-active={true}
                  _active={{ bg: "#1c3184" }}
                >
                  Dashboard
                  <Badge
                    w={5}
                    h={5}
                    ml={10}
                    textAlign={`center`}
                    borderRadius={`full`}
                    variant="solid"
                    bg="#00becb"
                  >
                    2
                  </Badge>
                </Flex>
              </Link>
              <Accordion allowMultiple>
                {sections?.map((section, index) => (
                  <AccordionItem key={index} border={0}>
                    <AccordionButton _hover={{ bg: "#1c3184" }}>
                      <Box
                        as="span"
                        flex="1"
                        pl={5}
                        fontWeight={400}
                        textAlign="left"
                      >
                        {section?.title}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel p={0}>
                      {section?.links?.map((link, index) => (
                        <Link
                          key={index}
                          href={link?.href}
                          style={{ textDecoration: "none", borderRadius: 0 }}
                        >
                          <Flex
                            align="center"
                            p={3}
                            role="group"
                            pl={`60px`}
                            cursor="pointer"
                            _hover={{ bg: "#1c3184" }}
                          >
                            {link?.title}
                          </Flex>
                        </Link>
                      ))}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </DrawerBody>

          <DrawerFooter color="white" bg="#1c3184">
            <div className="hidden items-center space-x-4 lg:flex ">
              <Link href="/dashboard/comms">
                <IconButton
                  bg="#ee2f26"
                  color="white"
                  className="bg-[#ee2f26] text-white"
                  icon={<Chats className="text-3xl" />}
                  aria-label="chats"
                />
              </Link>
              <ColorModeSwitcher />
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default PrimaryMobileNavbar;
