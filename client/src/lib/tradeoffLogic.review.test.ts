import { describe, expect, it } from "vitest";
import {
  AssumptionMatrix, OPTIONS, calculateComparativeResults, packageFor, comparisonRows,
  rankOptions, runSensitivityAnalysis, snapshotRows, formatResultsForCSV, CSV_DISCLAIMER,
} from "./tradeoffLogic";
import { assessFeasibilityConstraint, assessOptionFeasibility, calculateEnhancedResults, determineTopFeasibleOptions } from "./tradeoffLogicEnhanced";

const base: AssumptionMatrix = {
  policyObjective: "poverty", macroContext: "baseline", inflationEnvironment: "low", implementationCapacity: "medium",
  successRate: 30, leakageRate: 20, timeToEffect: "medium",
  packageA_unitCost: 300, packageB_unitCost: 500, packageB_placementIntensity: "training-placement",
  packageC_unitCost: 700, packageC_shockSensitivity: "medium",
  budgetEnvelope: 5, overheadShare: 20, targetingRule: "need-feasibility", populationWeighted: true,
};
const run = (a = base, level: "none" | "moderate" | "severe" = "none") =>
  calculateEnhancedResults(calculateComparativeResults(a), a, level);

describe("input-to-output coherence", () => {
  it("conversion changes every package's per-participant pathways", () => {
    const low = calculateComparativeResults({ ...base, successRate: 15 });
    const high = calculateComparativeResults({ ...base, successRate: 45 });
    for (const id of OPTIONS) {
      expect(packageFor(high, id).povertyImpact.illustrativeIndex).toBeGreaterThan(packageFor(low, id).povertyImpact.illustrativeIndex);
      expect(packageFor(high, id).resiliencePathway.illustrativeIndex).toBeGreaterThan(packageFor(low, id).resiliencePathway.illustrativeIndex);
    }
    expect(low.optionB.employmentImpact.direction).toBe("→");
    expect(high.optionB.employmentImpact.direction).toBe("↑");
  });
  it("resources and leakage affect funded/reached places without changing per-participant arrows", () => {
    const small = calculateComparativeResults({ ...base, budgetEnvelope: 2 });
    const large = calculateComparativeResults({ ...base, budgetEnvelope: 20 });
    const overhead = calculateComparativeResults({ ...base, overheadShare: 30 });
    const leakage = calculateComparativeResults({ ...base, leakageRate: 35 });
    const normal = calculateComparativeResults(base);
    for (const id of OPTIONS) {
      expect(packageFor(large, id).illustrativeReachedPlaces).toBeGreaterThan(packageFor(small, id).illustrativeReachedPlaces);
      expect(packageFor(overhead, id).fundedPlaces).toBeLessThan(packageFor(normal, id).fundedPlaces);
      expect(packageFor(leakage, id).fundedPlaces).toBe(packageFor(normal, id).fundedPlaces);
      expect(packageFor(leakage, id).illustrativeReachedPlaces).toBeLessThan(packageFor(normal, id).illustrativeReachedPlaces);
      expect(packageFor(small, id).povertyImpact.direction).toBe(packageFor(large, id).povertyImpact.direction);
    }
    expect(small.optionC.reachBand).not.toBe(large.optionC.reachBand);
  });
  it.each([
    ["A", "packageA_unitCost", 150, 600], ["B", "packageB_unitCost", 250, 900], ["C", "packageC_unitCost", 300, 1200],
  ] as const)("cost band changes Option %s reach", (id, key, lower, higher) => {
    const low = packageFor(calculateComparativeResults({ ...base, [key]: lower }), id);
    const high = packageFor(calculateComparativeResults({ ...base, [key]: higher }), id);
    expect(low.fundedPlaces).toBeGreaterThan(high.fundedPlaces);
    expect(low.reachBand).not.toBe(high.reachBand);
  });
  it("inflation affects purchasing-power pathways and price-adjusted reach", () => {
    const low = calculateComparativeResults(base), high = calculateComparativeResults({ ...base, inflationEnvironment: "high" });
    for (const id of OPTIONS) {
      expect(packageFor(high, id).povertyImpact.illustrativeIndex).toBeLessThan(packageFor(low, id).povertyImpact.illustrativeIndex);
      expect(packageFor(high, id).illustrativeReachedPlaces).toBeLessThan(packageFor(low, id).illustrativeReachedPlaces);
    }
  });
  it("capacity affects reach, conversion and asymmetric delivery risk", () => {
    const low = calculateComparativeResults({ ...base, implementationCapacity: "low" });
    const high = calculateComparativeResults({ ...base, implementationCapacity: "high" });
    expect([low.optionA.implementationRisk, low.optionB.implementationRisk, low.optionC.implementationRisk]).toEqual(["medium", "high", "high"]);
    for (const id of OPTIONS) {
      expect(packageFor(high, id).illustrativeReachedPlaces).toBeGreaterThan(packageFor(low, id).illustrativeReachedPlaces);
      expect(packageFor(high, id).employmentImpact.illustrativeIndex).toBeGreaterThan(packageFor(low, id).employmentImpact.illustrativeIndex);
    }
  });
  it("placement and horizon change their declared pathways", () => {
    const short = calculateComparativeResults({ ...base, timeToEffect: "short", packageB_placementIntensity: "training-only" });
    const long = calculateComparativeResults({ ...base, timeToEffect: "long", packageB_placementIntensity: "training-placement-subsidy" });
    expect(short.optionB.employmentImpact.illustrativeIndex).toBeLessThan(long.optionB.employmentImpact.illustrativeIndex);
    expect(short.optionC.resiliencePathway.illustrativeIndex).toBeLessThan(long.optionC.resiliencePathway.illustrativeIndex);
    expect(short.optionA.povertyImpact.illustrativeIndex).toBeGreaterThan(long.optionA.povertyImpact.illustrativeIndex);
  });
  it("adaptation and macro context change the declared robustness categories", () => {
    expect(calculateComparativeResults({ ...base, packageC_shockSensitivity: "low" }).optionC.shockRobustness).toBe("low");
    expect(calculateComparativeResults({ ...base, packageC_shockSensitivity: "high" }).optionC.shockRobustness).toBe("high");
    expect(calculateComparativeResults({ ...base, macroContext: "adverse" }).optionB.shockRobustness).toBe("low");
    expect(calculateComparativeResults(base).optionB.shockRobustness).toBe("medium");
  });
  it("contextual lenses explicitly have no mathematical allocation effect", () => {
    const changed = calculateComparativeResults({ ...base, targetingRule: "need-only", populationWeighted: false });
    const normal = calculateComparativeResults(base);
    expect(comparisonRows(changed)).toEqual(comparisonRows(normal));
    expect(changed.keyInterpretation).toContain("No district allocation");
    expect(changed.optionA).not.toHaveProperty("estimatedCoverage");
    expect(changed.optionA).not.toHaveProperty("costPerOutcome");
  });
});

describe("declared ordering and feasibility", () => {
  it("uses categorical robustness before risk when resilience pathways share a band", () => {
    const result = run({ ...base, policyObjective: "resilience", implementationCapacity: "low" });
    expect(OPTIONS.map(id => packageFor(result, id).resiliencePathway.strength)).toEqual(["low", "low", "low"]);
    expect(result.analyticalOrder).toEqual([["C"], ["B"], ["A"]]);
    expect(result.topOptionsFeasible).toEqual(["C"]);
    const severe = run({ ...base, policyObjective: "resilience" }, "severe");
    expect(severe.topOptionsFeasible).toEqual(["A"]);
    expect(severe.secondBestOption).toBeUndefined(); // A is third under the revised declared rule.
  });
  it("retains a resilience tie when every compared category is equal despite different internal indices", () => {
    const result = calculateComparativeResults(base);
    const template = result.optionA;
    const tied = {
      optionA: template,
      optionB: { ...template, resiliencePathway: { ...template.resiliencePathway, illustrativeIndex: 0.28 } },
      optionC: { ...template, resiliencePathway: { ...template.resiliencePathway, illustrativeIndex: 0.468 } },
    };
    expect(rankOptions(tied, "resilience")).toEqual([["A", "B", "C"]]);
  });
  it("placement intensity does not silently recost the independently selected package", () => {
    const training = calculateComparativeResults({ ...base, packageB_placementIntensity: "training-only" });
    const subsidy = calculateComparativeResults({ ...base, packageB_placementIntensity: "training-placement-subsidy" });
    expect(subsidy.optionB.annualUnitCostUSD).toBe(training.optionB.annualUnitCostUSD);
    expect(subsidy.optionB.fundedPlaces).toBe(training.optionB.fundedPlaces);
    expect(subsidy.optionB.employmentImpact.illustrativeIndex).toBeGreaterThan(training.optionB.employmentImpact.illustrativeIndex);
    expect(formatResultsForCSV(subsidy, base)).toContain("does not automatically raise cost");
  });
  it.each([["poverty", "A"], ["employment", "B"], ["resilience", "C"]] as const)("focus %s can lead with %s", (policyObjective, leader) => {
    expect(run({ ...base, policyObjective }).topOptionsAnalytical).toEqual([leader]);
  });
  it("retains genuinely tied categorical profiles", () => {
    const result = calculateComparativeResults({ ...base, successRate: 15, budgetEnvelope: 20, timeToEffect: "short" });
    expect(result.analyticalOrder).toEqual([["A"], ["B", "C"]]);
    expect(rankOptions(result, base.policyObjective)).toEqual(result.analyticalOrder);
  });
  it("distinguishes moderate and severe categories and follows the analytical order among eligible options", () => {
    const a = { ...base, policyObjective: "employment" as const, implementationCapacity: "high" as const };
    const moderate = run(a, "moderate"), severe = run(a, "severe");
    expect(moderate.optionFeasibility).not.toEqual(severe.optionFeasibility);
    expect(moderate.topOptionsFeasible).toEqual(["B"]);
    expect(moderate.feasibilityOverrideApplied).toBe(false);
    expect(severe.topOptionsFeasible).toEqual(["A"]);
    expect(severe.secondBestOption).toBe("A");
    expect(severe.decisionConfidence).toBe("low");
  });
  it("does not force a fallback when every option is excluded", () => {
    const result = run({ ...base, implementationCapacity: "low" }, "severe");
    expect(result.topOptionsFeasible).toEqual([]);
    expect(result.secondBestOption).toBeUndefined();
    expect(result.rejectionReasons.A).toBeDefined();
    expect(result.keyInterpretationDynamic).toContain("no option would remain eligible");
    expect(result.decisionConfidence).toBe("low");
  });
  it("does not mislabel a third-ranked eligible alternative as second-best", () => {
    const source = calculateComparativeResults(base);
    const synthetic = { ...source, analyticalOrder: [["C"], ["B"], ["A"]] as ("A" | "B" | "C")[][] };
    const result = calculateEnhancedResults(synthetic, base, "severe");
    expect(result.topOptionsFeasible).toEqual(["A"]);
    expect(result.secondBestOption).toBeUndefined();
    expect(result.feasibleAlternativeLabel).toContain("unique second place is not established");
  });
  it("preserves ties within the leading eligible group", () => {
    const mapping = assessOptionFeasibility(assessFeasibilityConstraint("none"), "medium");
    expect(determineTopFeasibleOptions([["B", "C"], ["A"]], mapping)).toEqual(["B", "C"]);
  });
  it("conditions distinguish general prerequisites from constraint-relaxing steps", () => {
    expect(run(base, "none").viabilityConditions.B).not.toEqual(run(base, "severe").viabilityConditions.B);
    expect(run(base, "severe").viabilityConditions.B?.join(" ")).toContain("capacity improvement alone is insufficient");
  });
});

describe("comparative sensitivity and confidence", () => {
  it("shows pathway changes even when the analytical leader stays the same", () => {
    const scenario = runSensitivityAnalysis({ ...base, policyObjective: "employment" })[0];
    expect(scenario.results.analyticalOrder[0]).toEqual(["B"]);
    expect(scenario.rankingChange).toContain("unchanged");
    expect(scenario.changes.some(change => change.includes("Poverty Pathway"))).toBe(true);
    expect(scenario.changes.some(change => change.includes("Shock Robustness"))).toBe(true);
  });
  it("reports no change when an alternative is already selected", () => {
    const scenarios = runSensitivityAnalysis({ ...base, macroContext: "adverse", implementationCapacity: "low", leakageRate: 35 });
    for (const s of scenarios) {
      expect(s.alreadySelected).toBe(true);
      expect(s.changes).toEqual([]);
    }
    expect(run({ ...base, macroContext: "adverse", implementationCapacity: "low", leakageRate: 35 }).decisionConfidence).not.toBe("high");
  });
  it("can label stable leading/pathway categories high while explicitly reporting changing delivery bands", () => {
    const result = run({ ...base, successRate: 15, budgetEnvelope: 20, timeToEffect: "short" });
    expect(result.decisionConfidence).toBe("high");
    expect(result.decisionConfidenceExplanation).toContain("not a probability");
    expect(result.decisionConfidenceExplanation).toContain("reach, risk");
  });
});

describe("single-scenario export fidelity", () => {
  it("includes every shared visible table value, confidence explanation and override flag", () => {
    const a = { ...base, policyObjective: "employment" as const };
    const result = run(a, "severe"), rows = snapshotRows(result, a);
    for (const row of comparisonRows(result)) row.values.forEach((value, i) =>
      expect(rows).toContainEqual(["Results", row.dimension, OPTIONS[i], value]));
    expect(rows).toContainEqual(["Interpretation", "Feasibility Override Applied", "", "true"]);
    expect(rows).toContainEqual(["Confidence", "Decision Confidence Explanation", "", result.decisionConfidenceExplanation]);
    expect(rows).toContainEqual(["Interpretation", "Conditional Interpretation", "", result.keyInterpretationDynamic]);
    expect(rows).toContainEqual(["Assumptions", "Success Rate (illustrative percent)", "", "30"]);
    expect(rows).toContainEqual(["Scope", "Disclaimer", "", CSV_DISCLAIMER]);
    expect(rows.some(row => row[1] === "estimatedCoverage" || row[1] === "costPerOutcome")).toBe(false);
  });
  it("uses a rectangular four-column CSV and escapes quotes and line breaks", () => {
    const result = { ...run(), keyInterpretation: 'Discussion, "quoted"\nnext line' };
    const csv = formatResultsForCSV(result, base);
    expect(csv.startsWith('"Section","Field","Option","Value"\r\n')).toBe(true);
    expect(csv).toContain('"Discussion, ""quoted""\nnext line"');
    expect(snapshotRows(result, base).every(row => row.length === 4)).toBe(true);
    expect(csv).not.toMatch(/↑↑|↓↓|Recommended Option/);
    expect(csv).not.toContain("Adverse Macro Shock");
  });
});
