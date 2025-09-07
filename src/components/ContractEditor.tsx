"use client";
import { useEffect, useState } from "react";
import { Box, Button, FormControl, FormLabel, Grid, GridItem, Input, Stack, Textarea, Text, Heading } from "@chakra-ui/react";

type Props = { projectId: string; template: string };

export default function ContractEditor({ projectId, template }: Props) {
  const [values, setValues] = useState<Record<string, string>>({
    PROVIDER_NAME: "",
    PROVIDER_RFC: "",
    PROVIDER_ADDRESS: "",
    CLIENT_NAME: "",
    CLIENT_RFC: "",
    CLIENT_ADDRESS: "",
    PROJECT_SCOPE: "",
    START_DATE: "",
    END_DATE: "",
    FEE_AMOUNT: "",
    FEE_CURRENCY: "MXN",
    FEE_TERMS: "",
    IP_TERMS: "Código fuente propiedad del cliente tras el pago total.",
    WARRANTY_TERMS: "Treinta (30) días de correcciones menores.",
    TERMINATION_TERMS: "Preaviso de 15 días por escrito.",
    JURISDICTION: "CDMX, México",
    PROVIDER_SIGN_DATE: "",
    CLIENT_SIGN_DATE: "",
  });
  const [content, setContent] = useState(template);
  const [clientSig, setClientSig] = useState("");
  const [providerSig, setProviderSig] = useState("");

  useEffect(() => {
    let c = template;
    for (const [k, v] of Object.entries(values)) {
      const re = new RegExp(`{{${k}}}`, "g");
      c = c.replace(re, v || `{{${k}}}`);
    }
    setContent(c);
  }, [values, template]);

  async function save() {
    const res = await fetch(`/api/projects/${projectId}/contract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, clientSignature: clientSig, providerSignature: providerSig }),
    });
    if (!res.ok) alert("Error al guardar contrato");
  }

  return (
    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
      <GridItem>
        <Heading size="md" mb={2}>Datos</Heading>
        <Stack spacing={3}>
          {Object.keys(values).map((k) => (
            <FormControl key={k}>
              <FormLabel>{k.replace(/_/g, " ")}</FormLabel>
              <Input value={values[k]} onChange={(e) => setValues((s) => ({ ...s, [k]: e.target.value }))} />
            </FormControl>
          ))}
        </Stack>
      </GridItem>
      <GridItem>
        <Heading size="md" mb={2}>Contrato</Heading>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} minH="lg" />
        <Text mt={4}>Firmas (pega dataURL o usa módulo de firma en KYC y copia aquí temporalmente):</Text>
        <Stack>
          <FormControl>
            <FormLabel>Firma Cliente (dataURL)</FormLabel>
            <Input value={clientSig} onChange={(e) => setClientSig(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Firma Prestador (dataURL)</FormLabel>
            <Input value={providerSig} onChange={(e) => setProviderSig(e.target.value)} />
          </FormControl>
          <Button onClick={save} colorScheme="blue">Guardar contrato</Button>
        </Stack>
      </GridItem>
    </Grid>
  );
}
