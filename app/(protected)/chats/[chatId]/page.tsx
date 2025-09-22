import React from "react";
import * as FadeIn from "@/components/motion/staggers/fade";
import { Chats } from "../_components/chats";

export default function Page() {
  return (
    <FadeIn.Container>
      <Chats />
    </FadeIn.Container>
  );
}
