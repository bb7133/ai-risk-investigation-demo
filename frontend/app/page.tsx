import { redirect } from "next/navigation";
import { listRealCases } from "@/lib/api/backend-adapter";

export default async function RootPage() {
  try {
    const cases = await listRealCases(1);
    redirect(`/cases/${cases[0]?.id ?? "RC00000697"}`);
  } catch {
    redirect("/cases/RC00000697");
  }
}
