import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ScenarioComparison, { changedAssumptionLabels } from "./ScenarioComparison";
import { AssumptionMatrix, calculateComparativeResults } from "@/lib/tradeoffLogic";

const recorded: AssumptionMatrix = {
  policyObjective: "poverty", macroContext: "baseline", inflationEnvironment: "low",
  implementationCapacity: "medium", successRate: 30, leakageRate: 20, timeToEffect: "medium",
  packageA_unitCost: 300, packageB_unitCost: 500, packageB_placementIntensity: "training-placement",
  packageC_unitCost: 700, packageC_shockSensitivity: "medium", budgetEnvelope: 5, overheadShare: 20,
  targetingRule: "need-feasibility", populationWeighted: true,
};

describe("pre-feasibility comparison disclosure", () => {
  it("identifies differences omitted from the brief assumption summaries", () => {
    const current: AssumptionMatrix = { ...recorded, inflationEnvironment: "high", successRate: 15,
      timeToEffect: "long", packageB_unitCost: 900, packageB_placementIntensity: "training-placement-subsidy",
      populationWeighted: false };
    expect(changedAssumptionLabels(recorded, current)).toEqual([
      "Price environment", "Outcome conversion band", "Assessment horizon", "Option B cost band",
      "Placement support intensity", "Population weighting (contextual only)",
    ]);
  });
  it("does not treat an institutional setting as an analytical assumption difference", () => {
    const current = { ...recorded, feasibilityConstraint: "severe" };
    expect(changedAssumptionLabels(recorded, current)).toEqual([]);
  });
  it("renders full-matrix differences and the pre-feasibility exclusion together", () => {
    const current: AssumptionMatrix = { ...recorded, leakageRate: 35 };
    const markup = renderToStaticMarkup(<ScenarioComparison
      currentAssumptions={current} currentResults={calculateComparativeResults(current)}
      savedScenario={{ assumptions: recorded, results: calculateComparativeResults(recorded), name: "Recorded" }}
      onSavedScenarioChange={() => {}} />);
    expect(markup).toContain("Pre-feasibility Analytical Comparison");
    expect(markup).toContain("institutional eligibility, constraint settings and decision confidence");
    expect(markup).toContain("Differing assumption categories:");
    expect(markup).toContain("Leakage band");
    expect(markup).toContain("Clear Recorded Scenario");
  });
});
