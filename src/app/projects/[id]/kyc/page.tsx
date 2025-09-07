import KYCForm from "@/src/components/KYCForm";
import { Heading, Text, Stack } from "@chakra-ui/react";

interface Params { params: { id: string } }

export default function KYCPage({ params }: Params) {
  return (
    <Stack spacing={4}>
      <Heading size="lg">Verificación KYC</Heading>
      <Text>Sube INE del cliente y prestador, además de domicilio. Revisa los datos antes de guardar. La extracción automática (OCR) puede agregarse luego; por ahora se capturan y validan manualmente.</Text>
      <KYCForm projectId={params.id} />
    </Stack>
  );
}

