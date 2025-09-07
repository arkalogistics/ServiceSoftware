"use client";
import { Button, HStack, Menu, MenuButton, MenuItem, MenuList, Box, Text } from "@chakra-ui/react";

export default function StatusSelect({
  value,
  onChange,
  options = ["Planning", "Development", "Review", "Done"],
  size = "sm",
}: {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Menu matchWidth>
      <MenuButton
        as={Button}
        size={size}
        variant="outline"
        bg="gray.900"
        color="gray.100"
        borderColor="whiteAlpha.300"
        _hover={{ bg: "gray.800" }}
        _expanded={{ bg: "gray.800" }}
      >
        <HStack justify="space-between" w="full">
          <Box as="span">{value || "Seleccionar"}</Box>
          <Box as="span" opacity={0.7}>▾</Box>
        </HStack>
      </MenuButton>
      <MenuList bg="gray.800" borderColor="whiteAlpha.300" color="gray.100" py={1}>
        {options.map((opt) => (
          <MenuItem
            key={opt}
            bg="gray.800"
            _hover={{ bg: "blue.900" }}
            _focus={{ bg: "blue.900" }}
            onClick={() => onChange(opt)}
          >
            <Text>{opt}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
