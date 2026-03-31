import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heartwood Timeline",
  description: "An interactive timeline visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Theme accentColor="amber" grayColor="sand" radius="medium" scaling="95%">
          {children}
        </Theme>
      </body>
    </html>
  );
}
