import React from "react";
import { Box, Heading } from "@chakra-ui/react";

function DefaultDashboardBanner({ title }: { title: string }) {
  return (
    <Box
      className="relative h-36 w-full"
      bg="url('https://wallpapers.com/images/featured/nature-2ygv7ssy2k0lxlzu.jpg')"
    >
      <div className="absolute h-full w-full bg-black bg-opacity-50" />
      <div className="relative z-20 flex h-full w-full flex-col items-center justify-center">
        <Heading className="text-center" color="white">
          {title}
        </Heading>
      </div>
    </Box>
  );
}

export default DefaultDashboardBanner;
