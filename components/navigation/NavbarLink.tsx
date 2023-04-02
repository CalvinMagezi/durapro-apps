import { Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";

function NavbarLink({
  title,
  href,
  Icon,
}: {
  title: string;
  href: string;
  Icon: any;
}) {
  const router = useRouter();
  const isActive = router.pathname === href ? true : false;
  return (
    <div
      onClick={() => router.push(href)}
      className="flex items-center space-x-4 hover:scale group cursor-pointer transition duration-100 ease-in-out hover:scale-105"
    >
      <Icon className="text-3xl text-[#273e87]" />
      <Text
        className={`group-hover:underline text-lg ${
          isActive && "font-bold underline"
        }`}
      >
        {title}
      </Text>
    </div>
  );
}

export default NavbarLink;
