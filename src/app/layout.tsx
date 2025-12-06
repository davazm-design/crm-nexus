import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar, SidebarProvider } from "@/components/Sidebar";
import { BottomTabBar } from "@/components/BottomTabBar";
import { MobileProvider } from "@/components/MobileProvider";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "TEEM CRM",
  description: "Advanced Lead Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#020617" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <MobileProvider>
          <SidebarProvider>
            <div className="flex h-screen overflow-hidden overflow-x-hidden bg-slate-950 text-slate-200 max-w-[100vw]">
              {/* Desktop Sidebar - hidden on mobile */}
              <div className="hidden lg:block">
                <Sidebar />
              </div>

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto relative w-full">

                {/* Background ambient glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                  <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
                  <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
                </div>

                {/* Page Content */}
                <div className="lg:p-4">
                  {children}
                </div>
              </main>

              {/* Mobile Bottom Tab Bar - hidden on desktop */}
              <div className="lg:hidden">
                <BottomTabBar />
              </div>
            </div>
          </SidebarProvider>
        </MobileProvider>
      </body>
    </html>
  );
}
