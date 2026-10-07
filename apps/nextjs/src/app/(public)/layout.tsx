import type React from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-14">{children}</main>
      <Footer />
    </>
  );
}
