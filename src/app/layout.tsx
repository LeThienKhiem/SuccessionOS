import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";
import { ModuleProvider } from "@/context/ModuleContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuccessionOS",
  description: "Succession management prototype for PTSC M&C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F8F9FC] text-[#374151]">
        <ModuleProvider>
          <AppSidebar />
          <main className="min-h-full pl-[240px] bg-[#F8F9FC]">
            <div className="p-8">{children}</div>
          </main>
        </ModuleProvider>
      </body>
    </html>
  );
}
