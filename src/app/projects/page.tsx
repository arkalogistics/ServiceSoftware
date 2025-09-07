import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { Box, Button, Heading, SimpleGrid, Flex, Spacer } from "@chakra-ui/react";
import Link from "next/link";
import ProjectCard from "@/src/components/ProjectCard";
import FAB from "@/src/components/FAB";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;
  const projects = await prisma.project.findMany({ where: { ownerId: userId }, orderBy: { createdAt: "desc" } });
  return (
    <Box>
      <Flex align="center" mb={4}>
        <Heading>Proyectos</Heading>
        <Spacer />
        <Button as={Link} href="/projects/new">+ proyecto</Button>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
      </SimpleGrid>
      <FAB />
    </Box>
  );
}
