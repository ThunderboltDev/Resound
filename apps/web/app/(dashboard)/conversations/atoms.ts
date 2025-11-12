import type { Doc } from "@workspace/backend/_generated/dataModel";
import { atomWithStorage } from "jotai/utils";
import { STATUS_FILTER_KEY } from "@/app/(dashboard)/conversations/constants";

export const statusFilterAtom = atomWithStorage<
  Doc<"conversations">["status"] | "all"
>(STATUS_FILTER_KEY, "all");
