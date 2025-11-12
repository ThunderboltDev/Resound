import { Protect } from "@/components/ui/protect";
import { ViewCustomizationPage } from "./view";

export default function Page() {
  return (
    <Protect requiredPlan="plus">
      <ViewCustomizationPage />
    </Protect>
  );
}
