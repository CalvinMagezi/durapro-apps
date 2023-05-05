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
  IconButton,
  Avatar,
  Button,
} from "@chakra-ui/react";
import useUser from "@/hooks/useUser";
import { ColorModeSwitcher } from "../../utils/ColorModeSwitcher";
import NavbarLink from "../NavbarLink";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaAppStore, FaBars } from "react-icons/fa";

function FeedbackMobileMenu({ logout }: { logout: any }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useUser();
  return (
    <>
      <IconButton
        aria-label="open"
        icon={<FaBars />}
        colorScheme="teal"
        onClick={onOpen}
      />
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <div className="flex items-center justify-center space-x-6">
              <Avatar src="" name={user ? user.user_metadata.full_name : ""} />
              <div>
                <ColorModeSwitcher />
              </div>
            </div>
          </DrawerHeader>

          <DrawerBody>
            <div className="flex flex-col space-y-4 pl-5">
              <NavbarLink title="Apps" Icon={FaAppStore} href="/" />
              <NavbarLink
                title="Dashboard"
                Icon={AiOutlineDashboard}
                href="/apps/commission"
              />
            </div>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button onClick={logout} colorScheme="orange">
              Logout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default FeedbackMobileMenu;
