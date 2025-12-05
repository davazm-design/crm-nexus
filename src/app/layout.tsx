import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Added Outfit for headings
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "Nexus CRM",
  description: "Advanced Lead Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 relative">
            {/* Background ambient glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
              <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
