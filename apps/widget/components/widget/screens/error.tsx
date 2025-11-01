import { useAtomValue } from "jotai";
import { AlertTriangle } from "lucide-react";
import { errorMessageAtom } from "@/components/widget/atoms";
import WidgetHeader from "@/components/widget/header";

export default function WidgetErrorScreen() {
  const errorMessage = useAtomValue(errorMessageAtom);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started!</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-col items-center justify-center gap-4 h-[calc(100%-8rem)]">
        <AlertTriangle className="size-16 text-danger" />
        <p className="text-lg text-danger">{errorMessage}</p>
      </div>
    </>
  );
}
