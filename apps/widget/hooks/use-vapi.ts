"use client";

import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

// api keys used here are only for testing
// customers will provider their own API keys

type TranscrpitMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function useVapi() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<TranscrpitMessage[]>([]);

  useEffect(() => {
    const vapiInstance = new Vapi("57764966-128c-4852-9174-7f2724d427be");
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => {
      setIsConnected(true);
      setIsConnecting(false);
      setTranscript([]);
    });

    vapiInstance.on("call-end", () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsSpeaking(false);
    });

    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });

    vapiInstance.on("error", (error) => {
      console.log("Vapi error:", error);
      setIsConnecting(false);
    });

    vapiInstance.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript(
          (prev) =>
            [
              ...prev,
              {
                role: message.role === "user" ? "user" : "assistant",
                message: message.transcript,
              },
            ] as TranscrpitMessage[]
        );
      }
    });

    return () => {
      vapiInstance.stop();
    };
  }, []);

  const startCall = () => {
    setIsConnecting(true);

    if (vapi) {
      vapi.start("0cfc93d6-6eda-4b0e-94be-44e4c91b1792");
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  return {
    isSpeaking,
    isConnecting,
    isConnected,
    transcript,
    startCall,
    endCall,
  };
}
