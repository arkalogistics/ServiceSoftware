"use client";
import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Alert, AlertIcon } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/user/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Error al registrar");
      return;
    }
    router.push("/login");
  }

  return (
    <Box maxW="md" mx="auto" py={10}>
      <Heading mb={6}>Crear cuenta</Heading>
      <form onSubmit={onSubmit}>
        <Stack spacing={4}>
          {error && (
            <Alert status="error"><AlertIcon />{error}</Alert>
          )}
          <FormControl isRequired>
            <FormLabel>Nombre</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Contraseña</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button type="submit" colorScheme="blue">Registrarme</Button>
        </Stack>
      </form>
    </Box>
  );
}
