"use client";

import Vapi from "@vapi-ai/web";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { vapiSecretsAtom, widgetSettingsAtom } from "@/components/widget/atoms";

type TranscriptMessage = {
  role: "user" | "assistant";
  text: string;
};

export function useVapi() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  const vapiSecrets = useAtomValue(vapiSecretsAtom);
  const widgetSettings = useAtomValue(widgetSettingsAtom);

  useEffect(() => {
    if (!vapiSecrets) {
      return;
    }

    const vapiInstance = new Vapi(vapiSecrets.public);
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
      console.error("Vapi error:", error);
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
                text: message.transcript,
              },
            ] as TranscriptMessage[]
        );
      }
    });

    return () => {
      vapiInstance.stop();
    };
  }, [vapiSecrets]);

  const startCall = async () => {
    if (!vapiSecrets || !widgetSettings?.vapiSettings.assistantId) {
      return;
    }

    setIsConnecting(true);

    if (vapi) {
      await vapi.start(widgetSettings.vapiSettings.assistantId);
    }
  };

  const endCall = async () => {
    if (vapi) {
      await vapi.stop();
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
