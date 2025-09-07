import { prisma } from "@/src/lib/prisma";
import { Box, Heading, Text, Stack, Button, SimpleGrid, Badge, HStack, Progress, Flex } from "@chakra-ui/react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";

interface Params { params: { id: string } }

export default async function ProjectPage({ params }: Params) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { parties: { include: { idDocs: true, proofs: true } }, contract: true, documents: true },
  });
  if (!project) return notFound();

  const kycParties = project.parties.length;
  const kycDocs = project.parties.reduce((n, p) => n + (p.idDocs?.length || 0), 0);
  const kycProofs = project.parties.reduce((n, p) => n + (p.proofs?.length || 0), 0);
  const kycDone = kycParties >= 2 && kycDocs >= 2 && kycProofs >= 1;

  const contract = project.contract;
  const cSigned = !!contract?.clientSignedAt && !!contract?.providerSignedAt;

  const docsCount = project.documents.length;

  const completed = [kycDone, cSigned, docsCount > 0].filter(Boolean).length;
  const progress = (completed / 3) * 100;

  return (
    <Box>
      {/* Hero con portada */}
      <Box borderRadius="lg" overflow="hidden" mb={6} borderWidth="1px" borderColor="whiteAlpha.200">
        <Box position="relative" h={{ base: 40, md: 52 }} bgGradient={!project.coverImage ? "linear(to-r, gray.800, gray.700)" : undefined}>
          {project.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.coverImage} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </Box>
        <Box p={4} bg="gray.800">
          <Heading size="lg">{project.title}</Heading>
          {project.description && <Text color="gray.300" mt={1}>{project.description}</Text>}
          <HStack mt={3} spacing={4} align="center">
            <Badge colorScheme="blue" variant="subtle">Status: {project.status}</Badge>
            {kycDone && <HStack color="green.300"><IconBubble label="✔" /><Text>KYC listo</Text></HStack>}
            {cSigned && <HStack color="green.300"><IconBubble label="✔" /><Text>Contrato firmado</Text></HStack>}
            {docsCount > 0 && <HStack color="green.300"><IconBubble label="✔" /><Text>{docsCount} docs</Text></HStack>}
          </HStack>
          <Box mt={3}>
            <Progress value={progress} size="sm" colorScheme="blue" borderRadius="md" />
          </Box>
        </Box>
      </Box>

      {/* Acciones guiadas */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <ActionCard
          icon={<IconBubble label="i" />}
          title="KYC de las partes"
          description="Sube INE frente y reverso, agrega firma y comprobante de domicilio para Cliente y Prestador."
          bullets={["INE frente y reverso", "Firma manuscrita digital", "Comprobante de domicilio"]}
          status={kycDone ? "Completado" : kycParties ? "En progreso" : "Pendiente"}
          ctaLabel={kycDone ? "Revisar KYC" : "Completar KYC"}
          href={`/projects/${params.id}/kyc` as Route}
          colorScheme={kycDone ? "green" : "blue"}
        />
        <ActionCard
          icon={<IconBubble label="✍" />}
          title="Contrato de servicios"
          description="Rellena la plantilla con datos del proyecto y recolecta firmas de ambas partes."
          bullets={["Completa datos del contrato", "Firma del cliente", "Firma del prestador"]}
          status={cSigned ? "Completado" : contract ? "En progreso" : "Pendiente"}
          ctaLabel={contract ? (cSigned ? "Ver contrato" : "Continuar firma") : "Crear contrato"}
          href={`/projects/${params.id}/contract` as Route}
          colorScheme={cSigned ? "green" : "blue"}
        />
        <ActionCard
          icon={<IconBubble label="📎" />}
          title="Proceso del proyecto"
          description="Organiza módulos, fechas e hitos en una tabla editable (tipo Excel)."
          bullets={["Crea documentos del proyecto", "Registra horas y notas", "Actualiza estados"]}
          status={docsCount > 0 ? `${docsCount} creados` : "Pendiente"}
          ctaLabel={docsCount > 0 ? "Gestionar proceso" : "Agregar tarea"}
          href={`/projects/${params.id}/documents` as Route}
          colorScheme={docsCount > 0 ? "green" : "blue"}
        />
      </SimpleGrid>
    </Box>
  );
}

function ActionCard({
  icon,
  title,
  description,
  bullets,
  status,
  href,
  colorScheme = "blue",
  ctaLabel,
}: {
  icon: any;
  title: string;
  description: string;
  bullets: string[];
  status: string;
  href: Route;
  colorScheme?: string;
  ctaLabel?: string;
}) {
  return (
    <Box borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="lg" p={4} bg="gray.800" _hover={{ borderColor: "blue.400", transform: "translateY(-2px)", transition: "all 0.2s" }}>
      <HStack justify="space-between" mb={2}>
        <HStack spacing={3} color="blue.300">
          {icon}
          <Heading size="md">{title}</Heading>
        </HStack>
        <Badge colorScheme={colorScheme as any}>{status}</Badge>
      </HStack>
      <Text color="gray.300" mb={3}>{description}</Text>
      <Stack spacing={1} color="gray.400" mb={4}>
        {bullets.map((b) => (<HStack key={b} spacing={2}><Box as="span">•</Box><Text>{b}</Text></HStack>))}
      </Stack>
      <Flex>
        <Button as={Link} href={href} colorScheme={colorScheme as any} ml="auto">{ctaLabel || (status === "Completado" ? "Revisar" : "Continuar")}</Button>
      </Flex>
    </Box>
  );
}

function IconBubble({ label }: { label: string }) {
  return (
    <Box
      as="span"
      w={7}
      h={7}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="full"
      bg="blue.900"
      color="blue.300"
      fontWeight="bold"
      fontSize="sm"
    >
      {label}
    </Box>
  );
}
