import React from "react";
import * as FadeIn from "@/components/motion/staggers/fade";
import { AuthForm } from "../_components/auth-form";
import { Link } from "next-view-transitions";

export default function Page() {
  return (
    <FadeIn.Container>
      <div className="h-screen flex justify-center items-center">
        <div className="w-full max-w-md">
          <FadeIn.Item>
            <AuthForm flow="signUp" />
            <p className="text-center mt-5">
              Already have an account? <Link href="/login">Login</Link>
            </p>
          </FadeIn.Item>
        </div>
      </div>
    </FadeIn.Container>
  );
}
