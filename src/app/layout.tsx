import Providers from "./providers";
import { ReactNode } from "react";
import Link from "next/link";
import { Box, Flex, HStack, Spacer, Button, Container, Text } from "@chakra-ui/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import SignOutButton from "@/src/components/SignOutButton";
import MobileNav from "@/src/components/MobileNav";

export const metadata = {
  title: "OrgProj",
  description: "Gestor de proyectos con KYC y contratos",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es">
      <body>
        <Providers>
          <Box as="header" borderBottomWidth="1px" borderColor="whiteAlpha.200" bg="gray.800" backdropFilter="saturate(180%) blur(6px)" position="sticky" top={0} zIndex={10}>
            <Container maxW="6xl" py={3}>
              <Flex align="center">
                <HStack spacing={4}>
                  <Button as={Link} href="/" variant="ghost" color="gray.100">Inicio</Button>
                  {session ? (
                    <Button as={Link} href="/projects" variant="ghost" color="gray.100">Proyectos</Button>
                  ) : null}
                </HStack>
                <Spacer />
                <HStack>
                  {session ? (
                    <SignOutButton />
                  ) : (
                    <>
                      <Button as={Link} href="/login">Entrar</Button>
                      <Button as={Link} href="/register" variant="outline">Crear cuenta</Button>
                    </>
                  )}
                </HStack>
              </Flex>
            </Container>
          </Box>
          <Container as="main" maxW="6xl" py={6} pb={{ base: 16, md: 6 }}>{children}</Container>
          <MobileNav />
          <Box as="footer" py={8} textAlign="center" color="gray.500">
            <Text fontSize="sm">OrgProj • Gestiona proyectos con KYC y contratos</Text>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
