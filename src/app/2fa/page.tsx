"use client";
import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Image, Input, Stack, Text } from "@chakra-ui/react";

export default function TwoFASetupPage() {
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function generate() {
    setStatus(null);
    const res = await fetch("/api/2fa/setup", { method: "POST" });
    const j = await res.json();
    setOtpauth(j.otpauth);
    setSecret(j.secret);
  }

  async function verify() {
    setStatus(null);
    const res = await fetch("/api/2fa/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    setStatus(res.ok ? "Activado" : "Código inválido");
  }

  return (
    <Box maxW="md" mx="auto" py={10}>
      <Heading mb={4}>Activar 2FA</Heading>
      <Stack spacing={4}>
        <Button onClick={generate} colorScheme="blue">Generar clave</Button>
        {otpauth && (
          <>
            <Text>Escanea este código con Google Authenticator/1Password, o usa la clave secreta.</Text>
            {/* Simple QR via third-party chart API avoided; show otpauth string */}
            <Box p={3} borderWidth="1px" borderRadius="md" wordBreak="break-all">{otpauth}</Box>
            <Text>Secreta: {secret}</Text>
            <FormControl>
              <FormLabel>Ingresa código de 6 dígitos</FormLabel>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </FormControl>
            <Button onClick={verify} colorScheme="blue">Verificar</Button>
            {status && <Text>{status}</Text>}
          </>
        )}
      </Stack>
    </Box>
  );
}
