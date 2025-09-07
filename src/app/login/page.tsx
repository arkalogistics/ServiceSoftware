"use client";
import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Alert, AlertIcon } from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  // Sanitize and type-narrow callback URL to internal routes only
  const rawCallback = params.get("callbackUrl");
  const callbackUrl: Route = (
    rawCallback && rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/dashboard"
  ) as Route;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { email, password, totp, redirect: false });
    if (res?.error) {
      setError("Credenciales inválidas o 2FA incorrecto");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <Box maxW="md" mx="auto" py={10}>
      <Heading mb={6}>Entrar</Heading>
      <form onSubmit={onSubmit}>
        <Stack spacing={4}>
          {error && (
            <Alert status="error"><AlertIcon />{error}</Alert>
          )}
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Contraseña</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Código 2FA (si está activo)</FormLabel>
            <Input type="text" value={totp} onChange={(e) => setTotp(e.target.value)} />
          </FormControl>
          <Button type="submit" colorScheme="blue">Entrar</Button>
        </Stack>
      </form>
    </Box>
  );
}
