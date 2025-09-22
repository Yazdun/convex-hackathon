import React from "react";
import { Navbar } from "./_components/desktop/navbar";
import { ChatProvider } from "./_components/shared/provider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <Navbar />
      {children}
    </ChatProvider>
  );
}
