"use client";

import { ChakraProvider, extendTheme, ThemeConfig } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "gray.100",
      },
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: "blue" },
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </SessionProvider>
  );
}
