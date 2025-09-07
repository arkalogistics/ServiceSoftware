import { Box, Heading, Text, Badge, Stack, Button } from "@chakra-ui/react";
import Link from "next/link";
import type { Route } from "next";

export default function ProjectCard({ project }: { project: any }) {
  const cover = project.coverImage as string | undefined;
  return (
    <Box borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="lg" overflow="hidden" bg="gray.800" _hover={{ borderColor: "blue.400", transform: "translateY(-2px)", transition: "all 0.2s" }}>
      <Box h="140px" bgGradient={cover ? undefined : "linear(to-r, gray.700, gray.600)"} position="relative">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </Box>
      <Box p={4}>
        <Stack spacing={2}>
          <Heading size="md">{project.title}</Heading>
          {project.description && <Text color="gray.300" noOfLines={2}>{project.description}</Text>}
          <Badge variant="subtle" colorScheme={project.status === "Active" ? "green" : project.status === "Completed" ? "blue" : "gray"} w="fit-content">{project.status}</Badge>
          <Button as={Link} href={`/projects/${project.id}` as Route} size="sm">Abrir</Button>
        </Stack>
      </Box>
    </Box>
  );
}
