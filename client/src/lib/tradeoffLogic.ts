import type { EnhancedComparativeResults } from "./tradeoffLogicEnhanced";

/**
 * Illustrative discussion conventions, not calibrated Tajikistan parameters.
 * Resource reach is separate from per-participant pathway directions.
 * No population denominator, causal estimate or policy prescription is computed.
 */
export type MacroContext = "baseline" | "adverse" | "favorable";
export type InflationEnvironment = "low" | "high";
export type ImplementationCapacity = "low" | "medium" | "high";
export type SuccessRate = 15 | 30 | 45;
export type LeakageRate = 10 | 20 | 35;
export type TimeToEffect = "short" | "medium" | "long";
export type BudgetEnvelope = 2 | 5 | 10 | 20;
export type OverheadShare = 10 | 20 | 30;
export type TargetingRule = "need-only" | "need-feasibility" | "need-feasibility-shock";
export type PolicyObjective = "poverty" | "employment" | "resilience";
export type OptionId = "A" | "B" | "C";
export type ImpactDirection = "↑" | "→" | "↓";
export type ConfidenceLevel = "high" | "medium" | "lower";
export type Band = "low" | "medium" | "high";
export const OPTIONS: OptionId[] = ["A", "B", "C"];
export const ASSUMPTION_BANDS = {
  success: { 15: "Conservative", 30: "Base", 45: "Optimistic" },
  leakage: { 10: "Low", 20: "Medium", 35: "High" },
  overhead: { 10: "Low", 20: "Medium", 30: "High" },
  budget: { 2: "Limited", 5: "Base", 10: "Expanded", 20: "Broad" },
} as const;
export const OBJECTIVE_LABELS: Record<PolicyObjective, string> = {
  poverty: "Poverty relief", employment: "Employment pathways", resilience: "Long-term resilience",
};
export const CSV_DISCLAIMER = "Single-scenario transparency snapshot. Not for forecasting, optimisation, scenario comparison, or downstream analytical reuse.";
export const DIRECTION_NOTE = "Directions describe illustrative per-participant pathways, not national outcomes or total programme effects. Resource reach is shown separately; ↑ is an illustrative improvement direction, → limited directional change, and ↓ deterioration.";
export const EVIDENCE_NOTE = "Evidence judgments are provisional, unreviewed qualitative conventions, not established evidence grades or probabilities. They require a programme-specific evidence review.";
export const TARGETING_NOTE = "Targeting and population weighting are contextual discussion lenses only. No district allocation or population-weighted calculation is implemented.";
export const RESOURCE_NOTE = "Illustrative reach combines funded places, delivery capacity and leakage. It is not a share of a target population. Budget, overhead and unit costs affect reach, not per-participant pathway arrows.";
export const COMPARISON_NOTE = "The selected focus is compared by pathway-strength band first. For resilience only, equal pathway bands are compared by shock-robustness band before lower implementation risk and broader illustrative reach. Other focuses compare lower implementation risk and reach after the pathway band. Equal categorical profiles remain tied; within-band numerical indices do not determine ordering. This ordering is a declared discussion convention, not a validated cross-objective judgment.";
export const CONVENTIONS_NOTE = "All coefficients, thresholds, delivery factors and feasibility rules are illustrative conventions. Direction and strength bands may change if these conventions change; no empirical calibration is claimed.";
export const POLICY_DISCUSSION_NOTE = "This tool supports analytical discussion under explicit assumptions. It does not forecast outcomes or replace political dialogue and fiduciary review. Relative attractiveness remains subject to feasibility constraints.";
export const REVIEW_NOTE = "Real-world choices require programme evidence, political dialogue and fiduciary review.";
export const PLACEMENT_COST_NOTE = "Placement support and unit cost are independent assumptions. More intensive support, including wage subsidies, does not automatically raise cost; select a cost band that would reflect the assumed package design.";
export const SHOCK_NOTE = "For the assumed remittance/inflation/labour-demand shock, income support is treated as protective rather than adaptive, employment remains demand-sensitive, and resilience depends on the selected adaptation band. These design judgments are not universal programme characteristics.";

export interface AssumptionMatrix {
  policyObjective: PolicyObjective;
  macroContext: MacroContext;
  inflationEnvironment: InflationEnvironment;
  implementationCapacity: ImplementationCapacity;
  successRate: SuccessRate;
  leakageRate: LeakageRate;
  timeToEffect: TimeToEffect;
  packageA_unitCost: 150 | 300 | 600;
  packageB_unitCost: 250 | 500 | 900;
  packageB_placementIntensity: "training-only" | "training-placement" | "training-placement-subsidy";
  packageC_unitCost: 300 | 700 | 1200;
  packageC_shockSensitivity: Band;
  budgetEnvelope: BudgetEnvelope;
  overheadShare: OverheadShare;
  targetingRule: TargetingRule;
  populationWeighted: boolean;
}
export interface OutcomeIndicator {
  direction: ImpactDirection;
  strength: Band;
  confidence: ConfidenceLevel;
  rationale: string;
  illustrativeIndex: number;
}
export interface PackageResults {
  povertyImpact: OutcomeIndicator;
  employmentImpact: OutcomeIndicator;
  resiliencePathway: OutcomeIndicator;
  timeToEffect: TimeToEffect;
  implementationRisk: Band;
  shockRobustness: Band;
  evidenceConfidence: ConfidenceLevel;
  reachBand: Band;
  fundedPlaces: number;
  illustrativeReachedPlaces: number;
  directBudgetUSD: number;
  annualUnitCostUSD: number;
  priceAdjustedUnitCostUSD: number;
}
export interface ComparativeResults {
  optionA: PackageResults;
  optionB: PackageResults;
  optionC: PackageResults;
  policyObjective: PolicyObjective;
  analyticalOrder: OptionId[][];
  keyInterpretation: string;
  riskFlags: string[];
}
export function packageFor(results: ComparativeResults, option: OptionId): PackageResults {
  return results[("option" + option) as "optionA" | "optionB" | "optionC"];
}
export function describeOptions(options: OptionId[]): string {
  return options.length ? options.map(o => "Option " + o).join(" / ") : "No eligible option identified";
}
export function describeOrder(order: OptionId[][]): string {
  return order.map(group => describeOptions(group)).join(" → ");
}
function pathwayBand(index: number): Band {
  return index < 0.5 ? "low" : index < 0.9 ? "medium" : "high";
}
function outcome(index: number, confidence: ConfidenceLevel, rationale: string): OutcomeIndicator {
  return {
    illustrativeIndex: index, strength: pathwayBand(index),
    direction: index >= 0.5 ? "↑" : index > -0.5 ? "→" : "↓",
    confidence, rationale,
  };
}
function implementationRisk(option: OptionId, capacity: ImplementationCapacity): Band {
  // Illustrative complexity assumptions: existing transfer systems; job-linkage
  // coordination; longer-lived infrastructure/adaptation procurement.
  if (option === "A") return capacity === "low" ? "medium" : "low";
  if (option === "B") return capacity === "high" ? "medium" : "high";
  return "high";
}
function robustness(option: OptionId, a: AssumptionMatrix): Band {
  if (option === "A") return "low";
  if (option === "B") return a.macroContext === "adverse" ? "low" : "medium";
  if (a.packageC_shockSensitivity === "low") return "low";
  if (a.packageC_shockSensitivity === "high") return "high";
  return a.macroContext === "adverse" ? "medium" : "high";
}
function calculatePackage(option: OptionId, a: AssumptionMatrix): PackageResults {
  const macro = { adverse: 0.7, baseline: 1, favorable: 1.3 }[a.macroContext];
  const capacity = { low: 0.4, medium: 0.65, high: 0.85 }[a.implementationCapacity];
  // Success is a conversion convention for each reached participant, normalised
  // against the base band. It is not a probability of national outcome change.
  const conversion = (a.successRate / 30) * { low: 0.8, medium: 1, high: 1.15 }[a.implementationCapacity];
  const inflationPathway = a.inflationEnvironment === "high" ? 0.85 : 1;
  const priceFactor = a.inflationEnvironment === "high" ? 1.2 : 1;
  const costs = { A: a.packageA_unitCost, B: a.packageB_unitCost, C: a.packageC_unitCost };
  const directBudgetUSD = a.budgetEnvelope * 1_000_000 * (1 - a.overheadShare / 100);
  const annualUnitCostUSD = costs[option];
  const priceAdjustedUnitCostUSD = annualUnitCostUSD * priceFactor;
  const fundedPlaces = Math.floor(directBudgetUSD / priceAdjustedUnitCostUSD);
  const illustrativeReachedPlaces = Math.floor(fundedPlaces * capacity * (1 - a.leakageRate / 100));
  // These reach thresholds are demonstration conventions, not coverage targets.
  const reachBand = illustrativeReachedPlaces < 2500 ? "low" : illustrativeReachedPlaces < 10000 ? "medium" : "high";
  const placement = { "training-only": 1, "training-placement": 1.15, "training-placement-subsidy": 1.3 }[a.packageB_placementIntensity];
  const adaptation = { low: 0.7, medium: 1, high: 1.4 }[a.packageC_shockSensitivity];
  const horizon = { short: 0.35, medium: 0.65, long: 1 }[a.timeToEffect];
  const common = macro * conversion * inflationPathway;
  const povertyIndex = option === "A" ? 0.8 * common * (a.timeToEffect === "short" ? 1.2 : 0.9)
    : option === "B" ? 0.5 * common * placement * (a.timeToEffect === "short" ? 0.55 : 1)
    : 0.4 * common * adaptation * horizon;
  const employmentIndex = option === "A" ? 0.2 * common
    : option === "B" ? 0.75 * common * placement * (a.timeToEffect === "short" ? 0.55 : 1.1)
    : 0.25 * common * horizon;
  // Adaptive pathway uses a separate structural convention; adverse context
  // tests robustness rather than assuming structural programmes avoid all shocks.
  const resilienceIndex = (option === "A" ? 0.2 : option === "B" ? 0.35 : 0.9 * adaptation * horizon)
    * conversion * inflationPathway * (a.macroContext === "adverse" ? 0.85 : 1);
  const confidence: ConfidenceLevel = option === "A" ? "high" : option === "B" ? "medium" : "lower";
  return {
    povertyImpact: outcome(povertyIndex, confidence, "Illustrative poverty pathway under the selected conversion, macro, price and horizon conventions."),
    employmentImpact: outcome(employmentIndex, confidence, "Illustrative employment pathway; placement intensity applies to Option B."),
    resiliencePathway: outcome(resilienceIndex, confidence, "Illustrative adaptive pathway; Option C depends on adaptation intensity and horizon."),
    timeToEffect: option === "A" ? "short" : option === "B" ? "medium" : "long",
    implementationRisk: implementationRisk(option, a.implementationCapacity),
    shockRobustness: robustness(option, a), evidenceConfidence: confidence, reachBand,
    fundedPlaces, illustrativeReachedPlaces, directBudgetUSD, annualUnitCostUSD, priceAdjustedUnitCostUSD,
  };
}
const BAND_ORDER: Record<Band, number> = { low: 0, medium: 1, high: 2 };
export function primaryStrength(pkg: PackageResults, objective: PolicyObjective): Band {
  return objective === "poverty" ? pkg.povertyImpact.strength
    : objective === "employment" ? pkg.employmentImpact.strength : pkg.resiliencePathway.strength;
}
export function rankOptions(results: Pick<ComparativeResults, "optionA" | "optionB" | "optionC">, objective: PolicyObjective): OptionId[][] {
  const profile = (id: OptionId) => {
    const pkg = results[("option" + id) as "optionA" | "optionB" | "optionC"];
    return [BAND_ORDER[primaryStrength(pkg, objective)],
      ...(objective === "resilience" ? [BAND_ORDER[pkg.shockRobustness]] : []),
      -BAND_ORDER[pkg.implementationRisk], BAND_ORDER[pkg.reachBand]];
  };
  const compare = (a: OptionId, b: OptionId) => {
    const pa = profile(a), pb = profile(b);
    for (let i = 0; i < pa.length; i++) if (pa[i] !== pb[i]) return pb[i] - pa[i];
    return 0; // Alphabetical input order is presentation only, not a tie breaker.
  };
  const sorted = [...OPTIONS].sort(compare), groups: OptionId[][] = [];
  for (const id of sorted) {
    const previous = groups.at(-1);
    if (previous && compare(previous[0], id) === 0) previous.push(id);
    else groups.push([id]);
  }
  return groups;
}
export function calculateComparativeResults(a: AssumptionMatrix): ComparativeResults {
  const optionA = calculatePackage("A", a), optionB = calculatePackage("B", a), optionC = calculatePackage("C", a);
  const analyticalOrder = rankOptions({ optionA, optionB, optionC }, a.policyObjective);
  const riskFlags = ["Evidence judgments and numerical conventions require programme-specific validation."];
  if (a.leakageRate === 35) riskFlags.push("High targeting leakage may weaken illustrative reach; per-participant pathway directions do not represent total reach.");
  if (a.overheadShare === 30) riskFlags.push("High overhead may narrow direct delivery resources.");
  if (a.implementationCapacity === "low") riskFlags.push("Low capacity may narrow reach and weaken conversion; complex packages retain higher delivery risk.");
  if (a.inflationEnvironment === "high") riskFlags.push("High inflation may narrow funded reach and weaken illustrative purchasing-power pathways.");
  if (a.budgetEnvelope === 2) riskFlags.push("A limited resource envelope may require sequencing; no population coverage target is assessed.");
  const leaders = analyticalOrder[0];
  const keyInterpretation = "Under the selected assumptions, with the focus on " + OBJECTIVE_LABELS[a.policyObjective].toLowerCase()
    + ", " + describeOptions(leaders) + (leaders.length > 1 ? " appear tied" : " appears analytically stronger")
    + " under the stated categorical comparison rule, subject to feasibility constraints. "
    + RESOURCE_NOTE + " " + TARGETING_NOTE;
  return { optionA, optionB, optionC, policyObjective: a.policyObjective, analyticalOrder, keyInterpretation, riskFlags };
}

export interface ComparisonRow { dimension: string; values: [string, string, string] }
export function comparisonRows(results: ComparativeResults): ComparisonRow[] {
  const map = (fn: (p: PackageResults) => string): [string, string, string] =>
    [fn(results.optionA), fn(results.optionB), fn(results.optionC)];
  const indicator = (i: OutcomeIndicator) => i.direction + " (" + i.strength + " pathway)";
  return [
    { dimension: "Poverty Pathway", values: map(p => indicator(p.povertyImpact)) },
    { dimension: "Employment Pathway", values: map(p => indicator(p.employmentImpact)) },
    { dimension: "Resilience Pathway", values: map(p => indicator(p.resiliencePathway)) },
    { dimension: "Illustrative Reach Band", values: map(p => p.reachBand) },
    { dimension: "Typical Package Lag", values: map(p => p.timeToEffect) },
    { dimension: "Implementation Risk", values: map(p => p.implementationRisk) },
    { dimension: "Shock Robustness", values: map(p => p.shockRobustness) },
    { dimension: "Provisional Evidence Judgment", values: map(p => p.evidenceConfidence) },
  ];
}
export interface SensitivityScenario {
  name: string;
  description: string;
  assumptions: AssumptionMatrix;
  results: ComparativeResults;
  rankingChange: string;
  changes: string[];
  alreadySelected: boolean;
}
export function runSensitivityAnalysis(baseAssumptions: AssumptionMatrix): SensitivityScenario[] {
  const base = calculateComparativeResults(baseAssumptions);
  const alternatives: { name: string; description: string; changes: Partial<AssumptionMatrix> }[] = [
    { name: "Adverse Macro Shock", description: "Remittances down and labour demand tighter; price environment held at the selected band to isolate this change.", changes: { macroContext: "adverse" } },
    { name: "Low Implementation Capacity", description: "Delivery and conversion capacity at the low band.", changes: { implementationCapacity: "low" } },
    { name: "High Targeting Leakage", description: "Leakage at the high band; the qualitative targeting lens is held fixed.", changes: { leakageRate: 35 } },
  ];
  return alternatives.map(alternative => {
    const assumptions = { ...baseAssumptions, ...alternative.changes };
    const results = calculateComparativeResults(assumptions);
    const alreadySelected = Object.entries(alternative.changes).every(([k, v]) => baseAssumptions[k as keyof AssumptionMatrix] === v);
    const before = comparisonRows(base), after = comparisonRows(results), changes: string[] = [];
    before.forEach((row, r) => row.values.forEach((value, o) => {
      if (value !== after[r].values[o]) changes.push("Option " + OPTIONS[o] + " — " + row.dimension + ": " + value + " → " + after[r].values[o] + ".");
    }));
    const sameOrder = JSON.stringify(base.analyticalOrder) === JSON.stringify(results.analyticalOrder);
    const rankingChange = alreadySelected ? "This alternative is already selected; there is no assumption change."
      : sameOrder ? "Categorical analytical ordering would remain unchanged; directional and delivery changes are listed separately."
      : "Categorical analytical ordering would change from " + describeOrder(base.analyticalOrder) + " to " + describeOrder(results.analyticalOrder) + ", subject to feasibility constraints.";
    return { ...alternative, assumptions, results, changes,
      description: alternative.description, alreadySelected, rankingChange };
  });
}

export type SnapshotRow = [section: string, field: string, option: string, value: string];
export function snapshotRows(results: ComparativeResults | EnhancedComparativeResults, a: AssumptionMatrix): SnapshotRow[] {
  const rows: SnapshotRow[] = [];
  const add = (section: string, field: string, value: string | number | boolean, option = "") => rows.push([section, field, option, String(value)]);
  add("Scope", "Disclaimer", CSV_DISCLAIMER);
  add("Scope", "Generated (UTC)", new Date().toISOString());
  add("Scope", "Numeric Basis", "Underlying selected illustrative values; not calibrated programme data.");
  const labels: Record<keyof AssumptionMatrix, string> = {
    policyObjective: "Comparison Focus", macroContext: "Macro Context", inflationEnvironment: "Price Environment",
    implementationCapacity: "Implementation Capacity", successRate: "Success Rate (illustrative percent)",
    leakageRate: "Leakage (illustrative percent)", timeToEffect: "Assessment Horizon",
    packageA_unitCost: "Option A Annual Unit Cost (USD)", packageB_unitCost: "Option B Annual Unit Cost (USD)",
    packageC_unitCost: "Option C Annual Unit Cost (USD)", packageB_placementIntensity: "Placement Intensity",
    packageC_shockSensitivity: "Adaptation Band", budgetEnvelope: "Budget Envelope (USD millions)",
    overheadShare: "Overhead (illustrative percent)", targetingRule: "Contextual Targeting Lens",
    populationWeighted: "Contextual Population Weighting",
  };
  for (const key of Object.keys(labels) as (keyof AssumptionMatrix)[]) add("Assumptions", labels[key], a[key]);
  add("Display", "Success Band", ASSUMPTION_BANDS.success[a.successRate]);
  add("Display", "Leakage Band", ASSUMPTION_BANDS.leakage[a.leakageRate]);
  add("Display", "Overhead Band", ASSUMPTION_BANDS.overhead[a.overheadShare]);
  add("Display", "Budget Band", ASSUMPTION_BANDS.budget[a.budgetEnvelope]);
  for (const row of comparisonRows(results)) row.values.forEach((value, i) => add("Results", row.dimension, value, OPTIONS[i]));
  for (const id of OPTIONS) {
    const pkg = packageFor(results, id);
    for (const field of ["fundedPlaces", "illustrativeReachedPlaces", "directBudgetUSD", "annualUnitCostUSD", "priceAdjustedUnitCostUSD"] as const)
      add("Underlying illustrative resources", field, pkg[field], id);
    for (const field of ["povertyImpact", "employmentImpact", "resiliencePathway"] as const) {
      add("Underlying illustrative pathways", field + " index (not a probability)", pkg[field].illustrativeIndex, id);
      add("Underlying illustrative pathways", field + " rationale", pkg[field].rationale, id);
    }
  }
  add("Interpretation", "Categorical Analytical Ordering", describeOrder(results.analyticalOrder));
  add("Interpretation", "Core Interpretation", results.keyInterpretation);
  if ("feasibilityConstraint" in results) {
    add("Feasibility", "Constraint Level", results.feasibilityConstraint.level);
    add("Feasibility", "Constraint Description", results.feasibilityConstraint.description);
    for (const id of OPTIONS) {
      add("Feasibility", "Feasibility under Constraints", results.optionFeasibility[("option" + id) as "optionA" | "optionB" | "optionC"], id);
      add("Feasibility", "Rejection Reason", results.rejectionReasons[id] ?? "No categorical exclusion stated.", id);
      results.viabilityConditions[id]?.forEach(condition => add("Viability", "Prerequisite or Constraint-relaxing Condition", condition, id));
    }
    add("Interpretation", "Analytical Leading Group", describeOptions(results.topOptionsAnalytical));
    add("Interpretation", "Feasible Leading Group", describeOptions(results.topOptionsFeasible));
    add("Interpretation", "Feasibility Override Applied", results.feasibilityOverrideApplied);
    add("Interpretation", "Second-best Analytical Option", results.secondBestOption ? "Option " + results.secondBestOption : "Not established");
    add("Interpretation", "Feasible Alternative Label", results.feasibleAlternativeLabel);
    add("Interpretation", "Conditional Interpretation", results.keyInterpretationDynamic);
    add("Confidence", "Decision Confidence", results.decisionConfidence);
    add("Confidence", "Decision Confidence Explanation", results.decisionConfidenceExplanation);
    results.riskFlagsWithFeasibility.forEach(flag => add("Risk", "Risk Flag", flag));
  } else results.riskFlags.forEach(flag => add("Risk", "Risk Flag", flag));
  for (const note of [DIRECTION_NOTE, RESOURCE_NOTE, COMPARISON_NOTE, EVIDENCE_NOTE, TARGETING_NOTE, CONVENTIONS_NOTE, SHOCK_NOTE, PLACEMENT_COST_NOTE, POLICY_DISCUSSION_NOTE, REVIEW_NOTE]) add("Methodology", "Note", note);
  return rows;
}
export function formatResultsForCSV(results: ComparativeResults | EnhancedComparativeResults, assumptions: AssumptionMatrix): string {
  const quote = (value: string) => '"' + value.replaceAll('"', '""') + '"';
  return [["Section", "Field", "Option", "Value"], ...snapshotRows(results, assumptions)]
    .map(row => row.map(quote).join(",")).join("\r\n");
}
