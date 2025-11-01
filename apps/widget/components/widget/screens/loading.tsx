import { api } from "@workspace/backend/_generated/api";
import { Spinner } from "@workspace/ui/components/spinner";
import { useMutation } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
  widgetSessionIdAtomFamily,
} from "@/components/widget/atoms";
import WidgetHeader from "@/components/widget/header";
import type { PropsWithOrganizationId } from "@/types/widget";

type Step = "org" | "session" | "settings" | "vapi" | "done";

export default function WidgetLoadingScreen({
  organizationId,
}: PropsWithOrganizationId) {
  const [step, setStep] = useState<Step>("org");
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);

  const loadingMessage = useAtomValue(loadingMessageAtom);

  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);

  const validateOrganization = useMutation(api.organization.validate);
  const validateWidgetSession = useMutation(api.widgetSession.validate);

  const widgetSessionId = useAtomValue(
    widgetSessionIdAtomFamily(organizationId ?? "")
  );

  useEffect(() => {
    if (step !== "org") return;

    setLoadingMessage("Loading organization...");

    if (!organizationId) {
      setErrorMessage("Organization ID not found");
      setScreen("error");
      return;
    }

    setLoadingMessage("Verifying organization...");

    validateOrganization({ organizationId })
      .then((result) => {
        if (result.isValid) {
          setOrganizationId(organizationId);
          setStep("session");
        } else {
          setErrorMessage(result.reason ?? "Something went wrong!");
          setScreen("error");
          return;
        }
      })
      .catch((error) => {
        console.error("Error while verifying organization:", error);
        setErrorMessage("Unable to verify organization!");
        setScreen("error");
        return;
      });
  }, [
    step,
    organizationId,
    setOrganizationId,
    setLoadingMessage,
    setErrorMessage,
    setScreen,
    validateOrganization,
  ]);

  useEffect(() => {
    if (step !== "session") return;

    setLoadingMessage("Loading session...");

    if (!widgetSessionId) {
      setIsSessionValid(false);
      setStep("done");
      return;
    }

    setLoadingMessage("Validating session...");

    validateWidgetSession({
      widgetSessionId,
    })
      .then((result) => {
        setIsSessionValid(result?.isValid ?? false);
        setStep("done");
      })
      .catch(() => {
        setIsSessionValid(false);
        setStep("done");
      });
  }, [step, widgetSessionId, setLoadingMessage, validateWidgetSession]);

  useEffect(() => {
    if (step !== "done") {
      return;
    }

    const hasValidSession = isSessionValid && !!widgetSessionId;

    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, widgetSessionId, isSessionValid, setScreen]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋</p>
          <p className="text-lg">Let&apos;s get you started!</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-col items-center justify-center gap-4 h-[calc(100%-8rem)]">
        <Spinner className="size-12 text-primary" />
        <p className="text-lg">{loadingMessage}</p>
      </div>
    </>
  );
}
