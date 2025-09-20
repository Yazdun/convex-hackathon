import React from "react";
import { SignupForm } from "./_components/form";
import * as FadeIn from "@/components/motion/staggers/fade";

export default function Page() {
  return (
    <FadeIn.Container>
      <div className="h-screen flex justify-center items-center">
        <SignupForm />
      </div>
    </FadeIn.Container>
  );
}
