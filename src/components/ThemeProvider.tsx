import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
    {children}
  </NextThemesProvider>
);

export default ThemeProvider;
