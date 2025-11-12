import { Button } from "@workspace/ui/components/button";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeft, Check, Copy, Phone, PhoneCall } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { screenAtom, widgetSettingsAtom } from "@/components/widget/atoms";
import WidgetHeader from "@/components/widget/header";

export default function WidgetContactScreen() {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const setScreen = useSetAtom(screenAtom);

  const phoneNumber = widgetSettings?.vapiSettings?.phoneNumber;

  const handleCopy = async () => {
    if (!phoneNumber) return;

    try {
      await navigator.clipboard.writeText(phoneNumber);
    } catch {
      console.error("Failed to copy phone number to clipboard");
    } finally {
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setScreen("selection")}
          >
            <ArrowLeft />
          </Button>
          <h4 className="text-lg">Contact Us</h4>
        </div>
      </WidgetHeader>
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center rounded-full bg-secondary border border-border p-3">
          <PhoneCall className="size-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Available 24/7</p>
        <p className="font-bold text-2xl">{phoneNumber}</p>
      </div>
      <div className="border-t border-border bg-background p-4">
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleCopy}
          >
            {isCopied ? (
              <>
                <Check /> Copied!
              </>
            ) : (
              <>
                <Copy /> Copy Number
              </>
            )}
          </Button>
          <Button variant="primary" size="lg" className="w-full" asChild>
            <Link href={`tel:${phoneNumber}`}>
              <Phone />
              Call Now
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
