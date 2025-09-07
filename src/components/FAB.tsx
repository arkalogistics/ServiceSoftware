"use client";
import Link from "next/link";
import { Box, IconButton } from "@chakra-ui/react";
import type { Route } from "next";

export default function FAB({ href = "/projects/new" as Route }: { href?: Route }) {
  return (
    <Box position="fixed" bottom={{ base: 16, md: 10 }} right={{ base: 4, md: 10 }} display={{ base: "block", md: "none" }} zIndex={30}>
      <IconButton as={Link} href={href} aria-label="nuevo" colorScheme="blue" rounded="full" icon={<span style={{ fontWeight: 700 }}>+</span> as any} />
    </Box>
  );
}
