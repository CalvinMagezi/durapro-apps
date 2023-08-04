import {
  Box,
  CloseButton,
  Flex,
  Button,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
} from "@chakra-ui/react";
import { AppStoreLogo } from "@phosphor-icons/react";

import Link from "next/link";

interface Section {
  title: string;
  links: {
    title: string;
    href: string;
  }[];
}

function PrimarySidebar({ sections }: { sections: Section[] }) {
  // console.log(sections);
  return (
    <Box
      transition="3s ease"
      bg={`#253e97`}
      color={`white`}
      borderRight="1px"
      fontWeight={400}
      borderRightColor={`#253e97`}
      w={{ base: "full", md: 60 }}
      pos="sticky"
      className="h-[90vh] overflow-y-scroll"
    >
      <Link href="/apps" style={{ textDecoration: "none", borderRadius: 0 }}>
        <Flex
          align="center"
          p={3}
          role="group"
          pl={`60px`}
          cursor="pointer"
          _hover={{ bg: "#1c3184" }}
          data-active={true}
          _active={{ bg: "#1c3184" }}
          className="space-x-4"
        >
          <AppStoreLogo className="text-xl" />
          <Text>Apps</Text>
          {/* <Badge
            w={5}
            h={5}
            ml={10}
            textAlign={`center`}
            borderRadius={`full`}
            variant="solid"
            bg="#00becb"
          >
            2
          </Badge> */}
        </Flex>
      </Link>
      <Accordion allowMultiple>
        {sections?.map((section, index) => (
          <AccordionItem key={index} border={0}>
            <AccordionButton _hover={{ bg: "#1c3184" }}>
              <Box as="span" flex="1" pl={5} fontWeight={400} textAlign="left">
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
    </Box>
  );
}

export default PrimarySidebar;
