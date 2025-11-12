import type { Doc, Id } from "@workspace/backend/_generated/dataModel";
import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { sessionKey } from "@/components/widget/constants";
import type { WidgetScreen } from "@/types/widget";

export type WidgetSettings = Omit<
  Doc<"widgetSettings">,
  "_id" | "_creationTime" | "organizationId"
>;

export const screenAtom = atom<WidgetScreen>("loading");

export const loadingMessageAtom = atom<string>("Loading...");
export const errorMessageAtom = atom<string>("An unknown error occured!");

export const organizationIdAtom = atom<Id<"organizations"> | null>(null);
export const conversationIdAtom = atom<Id<"conversations"> | null>(null);
export const widgetSessionIdAtom = atom<Id<"widgetSessions"> | null>(null);

export const widgetSettingsAtom = atom<WidgetSettings | null>(null);
export const vapiSecretsAtom = atom<{ public: string } | null>(null);

export const hasVapiSecretsAtom = atom<boolean>((get) => {
  return get(vapiSecretsAtom) !== null;
});

const createWidgetSessionAtom = atomWithStorage<Id<"widgetSessions"> | null>;

export const widgetSessionIdAtomFamily = atomFamily<
  string,
  ReturnType<typeof createWidgetSessionAtom>
>((organizationId: string) => {
  return createWidgetSessionAtom(`${sessionKey}-${organizationId}`, null);
});
