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
          <div className="flex min-h-screen w-full">
            {/* Spacer for fixed sidebar (desktop/tablet only) */}
            <div className="w-[220px] lg:w-[220px] md:w-16 max-md:hidden flex-shrink-0" />
            <AppSidebar />
            <main className="flex min-w-0 flex-1 flex-col overflow-auto bg-[#F8F9FC]">
              <div className="box-border w-full px-8 py-6 max-lg:px-6 max-sm:px-4 max-sm:py-5">
                {children}
              </div>
            </main>
          </div>
        </ModuleProvider>
      </body>
    </html>
  );
}
