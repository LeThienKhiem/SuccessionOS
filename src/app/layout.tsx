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
    <html lang="vi" className={`${inter.variable} h-full antialiased overflow-x-hidden`}>
      <body className="min-h-full bg-[#F8F9FC] text-[#374151] overflow-x-hidden">
        <ModuleProvider>
          <div
            className="min-h-full"
            style={{ ["--sidebar-w" as any]: "216px" }}
          >
            <AppSidebar />
            <main className="min-h-full ml-[var(--sidebar-w)] w-[calc(100%-var(--sidebar-w))] bg-[#F8F9FC] overflow-x-hidden">
              <div className="p-8">{children}</div>
            </main>
          </div>
        </ModuleProvider>
      </body>
    </html>
  );
}
