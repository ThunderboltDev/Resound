import type { Id } from "@workspace/backend/_generated/dataModel";
import type { widgetScreen } from "@/components/widget/constants";

export type WidgetScreen = (typeof widgetScreen)[number];

export type PropsWithOrganizationId<P = object> = P & {
  organizationId: Id<"organizations"> | null;
};
