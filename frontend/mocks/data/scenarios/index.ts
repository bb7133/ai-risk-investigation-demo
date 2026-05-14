import type { Case, Scenario } from "@/types/api";
import { SARAH_CHEN } from "../sarah-chen";
import { SARAH_CHEN_SCENARIO } from "./sarah-chen";
import { stubScenario } from "./stub";

// Returns the scenario the MSW handler should stream for a given case.
// Sarah Chen has a fully scripted investigation; everything else falls
// back to a thin "case opened, agents joining" stub.
export function scenarioFor(caseId: string, fallbackCase: Case | null): Scenario | null {
  if (caseId === SARAH_CHEN.id) return SARAH_CHEN_SCENARIO;
  if (fallbackCase) return stubScenario(fallbackCase);
  return null;
}
