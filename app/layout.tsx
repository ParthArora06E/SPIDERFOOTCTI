import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import { InvestigationProvider } from "@/components/InvestigationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpiderFoot CTI Platform",
  description: "Enterprise-Grade Security Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-300 min-h-screen selection:bg-blue-500/30`}>
        <InvestigationProvider>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#fff',
                border: '1px solid #334155',
              },
              success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
            }} 
          />
          <Sidebar />
          <TopHeader />
          <main className="ml-64 p-6 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </InvestigationProvider>
      </body>
    </html>
  );
}
