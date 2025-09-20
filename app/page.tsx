import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import * as FadeIn from "@/components/motion/staggers/fade";
import React from "react";

export default function Page() {
  return (
    <FadeIn.Container>
      <div className="h-screen flex justify-center p-5 items-center">
        <div className="w-full text-center max-w-xl flex flex-col gap-4">
          <h1 className="text-5xl">Campfires</h1>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam
            consequuntur quo animi asperiores suscipit earum molestias, ab!
          </p>
          <div>
            <Button asChild variant="outline">
              <Link href="/get-started">🔥 Let&apos;s Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </FadeIn.Container>
  );
}
