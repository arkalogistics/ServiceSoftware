"use client";
import { useState } from "react";
import { Box, Button, FormControl, FormLabel, HStack, Input, Select, Stack, Text } from "@chakra-ui/react";
import SignaturePad from "./SignaturePad";

type Props = { projectId: string };

export default function KYCForm({ projectId }: Props) {
  const [role, setRole] = useState("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rfc, setRfc] = useState("");
  const [address, setAddress] = useState("");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function upload(file: File, subdir: string) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("subdir", subdir);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "Upload failed");
    return j.path as string;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    let idFrontPath: string | undefined;
    let idBackPath: string | undefined;
    let proofPath: string | undefined;
    if (idFront) idFrontPath = await upload(idFront, `${projectId}/id`);
    if (idBack) idBackPath = await upload(idBack, `${projectId}/id`);
    if (proof) proofPath = await upload(proof, `${projectId}/proof`);

    const res = await fetch("/api/kyc/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, role, name, email, phone, rfc, address, isCompany: role === "company", idFrontPath, idBackPath, proofPath, signatureDataUrl: signature }),
    });
    setStatus(res.ok ? "KYC guardado" : "Error al guardar KYC");
  }

  return (
    <Box as="form" onSubmit={onSubmit}>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Rol</FormLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="client">Cliente</option>
            <option value="provider">Prestador</option>
            <option value="company">Empresa</option>
          </Select>
        </FormControl>
        <Stack direction={{ base: "column", md: "row" }}>
          <FormControl isRequired>
            <FormLabel>Nombre/Razón social</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>RFC</FormLabel>
            <Input value={rfc} onChange={(e) => setRfc(e.target.value)} />
          </FormControl>
        </Stack>
        <Stack direction={{ base: "column", md: "row" }}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Teléfono</FormLabel>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormControl>
        </Stack>
        <FormControl>
          <FormLabel>Domicilio</FormLabel>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormControl>
        <Stack direction={{ base: "column", md: "row" }}>
          <FormControl>
            <FormLabel>INE Frente</FormLabel>
            <Input type="file" accept="image/*" onChange={(e) => setIdFront(e.target.files?.[0] || null)} />
          </FormControl>
          <FormControl>
            <FormLabel>INE Reverso</FormLabel>
            <Input type="file" accept="image/*" onChange={(e) => setIdBack(e.target.files?.[0] || null)} />
          </FormControl>
        </Stack>
        <FormControl>
          <FormLabel>Comprobante de domicilio</FormLabel>
          <Input type="file" accept="image/*,application/pdf" onChange={(e) => setProof(e.target.files?.[0] || null)} />
        </FormControl>
        <Box>
          <FormLabel>Firma</FormLabel>
          <SignaturePad onChange={setSignature} />
        </Box>
        <Button type="submit" colorScheme="blue">Guardar KYC</Button>
        {status && <Text>{status}</Text>}
      </Stack>
    </Box>
  );
}
