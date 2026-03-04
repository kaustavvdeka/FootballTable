import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/components/AdminProvider";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Football League Table",
  description: "Manage football leagues, teams, and match schedules dynamically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-950 text-slate-50">
      <body className={`${inter.className} min-h-screen text-slate-50 antialiased`}>
        <AdminProvider>
          <Header />
          <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {children}
          </main>
        </AdminProvider>
      </body>
    </html>
  );
}
