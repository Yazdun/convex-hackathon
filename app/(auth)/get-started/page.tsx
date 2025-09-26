import React from "react";
import { AuthForm } from "../_components/auth-form";
import Link from "next/link";

export default function Page() {
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-full max-w-md">
        <div>
          <AuthForm flow="signUp" />
          <p className="text-center mt-5">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
