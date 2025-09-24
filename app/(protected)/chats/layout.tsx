import React from "react";
import { ChatProvider } from "./_components/providers/chat-provider";
import { Navbar } from "./_components/navbar/navbar";

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
