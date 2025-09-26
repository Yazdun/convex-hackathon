import React, { useState } from "react";
import { useAssistant } from "./assistant-provider";
import { Button } from "@/components/ui/button";

export function AssistantContainer() {
  const { threadId } = useAssistant();

  return (
    <div className="fixed bottom-2.5 right-2.5 p-2.5">
      {threadId ? <Assistant threadId={threadId} /> : null}
    </div>
  );
}

export function Assistant({ threadId }: { threadId: string }) {
  const { sendMessageToAgent } = useAssistant();
  const [response, setResponse] = useState("");

  return (
    <div className="p-5 border rounded-lg w-[400px]">
      {response}
      <Button
        onClick={() => {
          sendMessageToAgent({
            threadId,
            prompt: "what is 1+1?",
          })
            .then(setResponse)
            .finally(() => console.log("done"));
        }}
        variant="outline"
      >
        Click me!!!
      </Button>
    </div>
  );
}
