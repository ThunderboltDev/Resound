import { Protect } from "@/components/ui/protect";
import VapiView from "./view";

export default function Page() {
  return (
    <Protect requiredPlan="plus">
      <VapiView />
    </Protect>
  );
}
