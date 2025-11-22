"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { LayoutGrid, Zap, User, LifeBuoy, LogOut, ZapIcon } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutGrid /> },
  { href: "/emergency", label: "Emergency", icon: <Zap /> },
  { href: "/profile", label: "Profile", icon: <User /> },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline">
             <ZapIcon className="size-6 text-primary" />
             <span className="text-lg">ChargeAssist</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton 
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="justify-start"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href="/">
                    <LogOut className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                </Link>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
