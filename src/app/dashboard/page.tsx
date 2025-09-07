import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { Box, Heading, Text, SimpleGrid, Button } from "@chakra-ui/react";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;
  const count = await prisma.project.count({ where: { ownerId: userId } });
  return (
    <Box>
      <Heading mb={4}>Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <Box borderWidth="1px" p={4} borderRadius="md">
          <Text fontWeight="bold">Tus proyectos</Text>
          <Text fontSize="3xl">{count}</Text>
          <Button as={Link} href="/projects" mt={2}>Ver</Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

