"use client";
import Link from "next/link";
import { Box, HStack, Button } from "@chakra-ui/react";

export default function MobileNav() {
  return (
    <Box position="fixed" bottom={0} left={0} right={0} display={{ base: "block", md: "none" }} bg="gray.900" borderTopWidth="1px" borderColor="whiteAlpha.200" p={2} zIndex={20}>
      <HStack justify="space-around">
        <Button as={Link} href="/" variant="ghost" size="sm">Inicio</Button>
        <Button as={Link} href="/projects" variant="ghost" size="sm">Proyectos</Button>
        <Button as={Link} href="/projects/new" colorScheme="blue" size="sm">+ Proyecto</Button>
      </HStack>
    </Box>
  );
}

