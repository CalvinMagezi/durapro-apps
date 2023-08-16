import React from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Image,
  Badge,
  useDisclosure,
} from "@chakra-ui/react";

function CommsHeader() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box p={5}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={15} alignItems={"center"}>
            <Image
              boxSize="40px"
              borderRadius={"10px"}
              src="https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
              alt="user"
            />
            <Text fontSize="sm" color="white">
              Welcome Back, Calvin Magezi
            </Text>
          </HStack>
          <Flex alignItems={"center"}>
            <Text fontSize="sm" color="white" mr="5">
              Mar 12, 2019 - Apr 10, 2019
            </Text>
            <HStack position={`relative`} mr={5}>
              <Image
                boxSize="15px"
                src="https://icons.iconarchive.com/icons/iconsmind/outline/512/Data-Storage-icon.png"
                alt="user"
              />
              <Badge
                w={5}
                h={5}
                textAlign={`center`}
                position={`absolute`}
                top={"-4"}
                right={"-3"}
                bg="#00becb"
                color={`white`}
                borderRadius="full"
              >
                2
              </Badge>
            </HStack>
            <HStack position={`relative`}>
              <Image
                boxSize="15px"
                src="https://icons.iconarchive.com/icons/iconsmind/outline/512/Data-Storage-icon.png"
                alt="user"
              />
              <Badge
                w={5}
                h={5}
                textAlign={`center`}
                position={`absolute`}
                top={"-4"}
                right={"-3"}
                bg={`#ff313d`}
                color={`white`}
                borderRadius="full"
              >
                2
              </Badge>
            </HStack>
          </Flex>
        </Flex>
      </Box>

      <Box p={5} m={5} bg={"white"}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Image
              boxSize="15px"
              src="https://cdn-icons-png.flaticon.com/512/54/54481.png"
              alt="search"
            />
          </InputLeftElement>
          <Input borderWidth={1} border="1px" type="text" />
        </InputGroup>
      </Box>
    </>
  );
}

export default CommsHeader;
