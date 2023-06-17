import { AuthAtom } from "@/atoms/ProfileAtom";
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import {
  Avatar,
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaChevronDown } from "react-icons/fa";
import { useRecoilState } from "recoil";
import MobileMenu from "../navigation/MobileMenu";
import Sidebar from "../navigation/Sidebar";
import { ColorModeSwitcher } from "../utils/ColorModeSwitcher";

function CommissionLayout({ children }: React.PropsWithChildren<{}>) {
  const bg = useColorModeValue("white", "black");
  const color = useColorModeValue("black", "white");
  const { user, setProfile } = useUser();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useRecoilState(AuthAtom);

  const logout = async () => {
    await supabase.auth
      .signOut()
      .then(() => {
        setProfile(null);
        toast.success("Successfully logged out", { duration: 3000 });
        setAuthenticated(false);
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error logging out, please try again", { duration: 3000 });
      });
  };

  useEffect(() => {
    if (user) return;

    if (!user) {
      setAuthenticated(false);
    }

    if (!user && authenticated === false) {
      setTimeout(() => {
        router.push("/");
        toast.error("Please login to continue", { duration: 3000 });
      }, 3000);
    }
  }, [user, authenticated]);

  return (
    <Box bg={bg} color={color}>
      <Box
        bg={bg}
        color={color}
        className="sticky top-0 z-50 w-full p-2 border border-b-gray-500 border-opacity-30"
      >
        <div className="flex justify-between items-center space-x-8">
          <Link href="/">
            <Image src="/logo.png" width="200" height="160" alt="Logo" />
          </Link>
          <div className="flex-grow lg:px-6">
            {/* <Heading className="text-center">
            {profile?.role === "admin" && "Admin"}
          </Heading> */}
          </div>
          <div className="lg:flex items-center space-x-4 hidden ">
            <div>
              <ColorModeSwitcher />
            </div>
            {/* <div className="border border-black h-4"></div>
          <div>
            <FaBell className="text-xl" />
          </div> */}
            <div className="border border-black h-4"></div>
            <div>
              <Menu>
                <MenuButton>
                  <div className="flex items-center space-x-4">
                    <Avatar
                      src=""
                      name={user ? user.user_metadata.full_name : ""}
                    />
                    <FaChevronDown />
                  </div>
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={logout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </div>
          </div>
          <div className="lg:hidden">
            <MobileMenu logout={logout} />
          </div>
        </div>
      </Box>
      <div className="flex w-full">
        <div className="hidden lg:flex">
          <Sidebar />
        </div>
        <div className="flex-grow overflow-auto lg:p-2">
          <div>{children}</div>
        </div>
      </div>
    </Box>
  );
}

export default CommissionLayout;
