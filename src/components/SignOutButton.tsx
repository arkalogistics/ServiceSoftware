"use client";
import { Button } from "@chakra-ui/react";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <Button onClick={() => signOut({ callbackUrl: "/" })} variant="outline">Salir</Button>
  );
}

