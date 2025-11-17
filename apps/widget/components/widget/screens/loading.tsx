import { api } from "@workspace/backend/_generated/api";
import { Loader } from "@workspace/ui/components/loader";
import { useAction, useMutation, useQuery } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
  vapiSecretsAtom,
  widgetSessionIdAtomFamily,
  widgetSettingsAtom,
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
  const setWidgetSettings = useSetAtom(widgetSettingsAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setVapiSecrets = useSetAtom(vapiSecretsAtom);
  const setScreen = useSetAtom(screenAtom);

  const validateOrganization = useMutation(api.widget.organization.validate);
  const validateWidgetSession = useMutation(api.widget.widgetSession.validate);

  const widgetSettings = useQuery(
    api.widget.widgetSettings.getByOrganizationId,
    organizationId
      ? {
          organizationId: organizationId,
        }
      : "skip"
  );

  const getVapiSecrets = useAction(api.widget.secret.getVapi);

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
      setStep("settings");
      return;
    }

    setLoadingMessage("Validating session...");

    validateWidgetSession({
      widgetSessionId,
    })
      .then((result) => {
        setIsSessionValid(result?.isValid ?? false);
        setStep("settings");
      })
      .catch(() => {
        setIsSessionValid(false);
        setStep("settings");
      });
  }, [step, widgetSessionId, setLoadingMessage, validateWidgetSession]);

  useEffect(() => {
    if (step !== "settings") return;

    setLoadingMessage("Loading settings...");

    if (widgetSettings !== undefined) {
      setWidgetSettings(widgetSettings);
    }

    setStep("vapi");
  }, [step, widgetSettings, setLoadingMessage, setWidgetSettings]);

  useEffect(() => {
    if (step !== "vapi") return;

    setLoadingMessage("Loading voice features...");

    if (!organizationId) {
      setErrorMessage("Unable to verify organization!");
      setScreen("error");
      return;
    }

    getVapiSecrets({ organizationId }).then((vapiSecrets) => {
      if (!vapiSecrets) return;
      setVapiSecrets({
        public: vapiSecrets.public,
      });
    });

    setStep("done");
  }, [
    step,
    setLoadingMessage,
    setVapiSecrets,
    getVapiSecrets,
    organizationId,
    setErrorMessage,
    setScreen,
  ]);

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
        <Loader className="size-12 text-primary" />
        <p className="text-lg">{loadingMessage}</p>
      </div>
    </>
  );
}
