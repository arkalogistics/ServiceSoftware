import { Box, Heading, Text, Stack, Button, SimpleGrid, Flex, Spacer } from "@chakra-ui/react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import ProjectCard from "@/src/components/ProjectCard";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    const projects = await prisma.project.findMany({ where: { ownerId: (session.user as any).id }, orderBy: { createdAt: "desc" } });
    return (
      <Stack spacing={6} py={6}>
        <Flex align="center">
          <Heading size="lg">Tus proyectos</Heading>
          <Spacer />
          <Button as={Link} href="/projects/new">+ proyecto</Button>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
          {projects.map((p) => (<ProjectCard key={p.id} project={p} />))}
        </SimpleGrid>
      </Stack>
    );
  }
  return (
    <Stack spacing={6} py={10}>
      <Heading size="xl">Organiza tus proyectos con KYC y contratos</Heading>
      <Text color="gray.300">Next.js + Chakra UI + Prisma (SQLite) + Auth 2FA.</Text>
      <Box>
        <Button as={Link} href="/register" mr={3}>Crear cuenta</Button>
        <Button as={Link} href="/login" variant="outline">Entrar</Button>
      </Box>
    </Stack>
  );
}
