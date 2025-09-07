import { promises as fs } from "fs";
import path from "path";
import ContractEditor from "@/src/components/ContractEditor";
import { Heading, Text, Stack } from "@chakra-ui/react";

interface Params { params: { id: string } }

export default async function ContractPage({ params }: Params) {
  const file = path.join(process.cwd(), "contracts", "prestacion_servicios_software.md");
  const template = await fs.readFile(file, "utf8");
  return (
    <Stack spacing={4}>
      <Heading size="lg">Contrato de Prestación de Servicios</Heading>
      <Text>Este modelo es de referencia. Verifica con tu notario/abogado.</Text>
      <ContractEditor projectId={params.id} template={template} />
    </Stack>
  );
}

