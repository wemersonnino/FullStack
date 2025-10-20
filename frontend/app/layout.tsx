import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escala - Schedule Management",
  description: "Full-stack schedule and shift management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
