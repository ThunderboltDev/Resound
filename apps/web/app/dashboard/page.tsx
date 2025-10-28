import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect(`/auth?origin=${encodeURIComponent("/dashboard")}`);
  }

  return <div>Logged in</div>;
}
