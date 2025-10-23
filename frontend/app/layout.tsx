import type { Metadata } from "next";
import "./globals.css";
import AppShell from "../components/layout/AppShell";

export const metadata: Metadata = {
  title: "Quiz Builder",
  description: "Create and manage custom quizzes with multiple question types.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
