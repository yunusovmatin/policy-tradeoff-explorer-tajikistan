import {
  AssumptionMatrix, ComparativeResults, Band, OptionId, OPTIONS,
  describeOptions, runSensitivityAnalysis, comparisonRows, POLICY_DISCUSSION_NOTE,
} from "./tradeoffLogic";

export type FeasibilityConstraintLevel = "none" | "moderate" | "severe";
export type OptionFeasibility = Band;
export type DecisionConfidence = Band;
export interface FeasibilityConstraint { level: FeasibilityConstraintLevel; description: string }
export interface OptionFeasibilityAssessment { optionA: Band; optionB: Band; optionC: Band }
export interface EnhancedComparativeResults extends ComparativeResults {
  feasibilityConstraint: FeasibilityConstraint;
  optionFeasibility: OptionFeasibilityAssessment;
  topOptionsAnalytical: OptionId[];
  topOptionsFeasible: OptionId[];
  feasibilityOverrideApplied: boolean;
  decisionConfidence: DecisionConfidence;
  decisionConfidenceExplanation: string;
  keyInterpretationDynamic: string;
  secondBestOption?: OptionId;
  feasibleAlternativeLabel: string;
  rejectionReasons: Partial<Record<OptionId, string>>;
  viabilityConditions: Partial<Record<OptionId, string[]>>;
  riskFlagsWithFeasibility: string[];
}
export const UN_STYLE_DISCLAIMER = POLICY_DISCUSSION_NOTE;
export const FEASIBILITY_NOTE = "Feasibility categories are scenario conventions, not an assessment of Tajikistan institutions. Low means excluded from the illustrative eligible set; Medium means retained conditionally; High means no exclusion under this rule. Analytical order is preserved among eligible options, including ties.";
export function assessFeasibilityConstraint(level: FeasibilityConstraintLevel): FeasibilityConstraint {
  return { level, description: {
    none: "No additional institutional exclusion is applied; delivery risk is assessed separately.",
    moderate: "Approval and coordination constraints may narrow complex packages; high delivery capacity may retain them conditionally.",
    severe: "Restrictive approvals and earmarking exclude complex packages in this convention; basic transfers require at least medium delivery capacity.",
  }[level] };
}
export function assessOptionFeasibility(constraint: FeasibilityConstraint, capacity: AssumptionMatrix["implementationCapacity"]): OptionFeasibilityAssessment {
  if (constraint.level === "none") return { optionA: "high", optionB: "high", optionC: "high" };
  if (constraint.level === "moderate") return {
    optionA: capacity === "low" ? "medium" : "high",
    optionB: capacity === "high" ? "high" : capacity === "medium" ? "medium" : "low",
    optionC: capacity === "high" ? "medium" : "low",
  };
  return { optionA: capacity === "low" ? "low" : "medium", optionB: "low", optionC: "low" };
}
export function determineTopFeasibleOptions(order: OptionId[][], feasibility: OptionFeasibilityAssessment): OptionId[] {
  for (const group of order) {
    const eligible = group.filter(id => feasibility[("option" + id) as keyof OptionFeasibilityAssessment] !== "low");
    if (eligible.length) return eligible;
  }
  return [];
}
function sameGroup(a: OptionId[], b: OptionId[]): boolean {
  return a.length === b.length && a.every(id => b.includes(id));
}
export function calculateDecisionConfidence(
  base: ComparativeResults, assumptions: AssumptionMatrix, level: FeasibilityConstraintLevel, feasible: OptionId[],
): { label: DecisionConfidence; explanation: string } {
  const scenarios = runSensitivityAnalysis(assumptions);
  const lead = base.analyticalOrder[0];
  const leadChanges = scenarios.some(s => !sameGroup(lead, s.results.analyticalOrder[0]));
  const tableChanges = scenarios.some(s => JSON.stringify(comparisonRows(s.results)) !== JSON.stringify(comparisonRows(base)));
  const pathwayRows = (r: ComparativeResults) => comparisonRows(r).filter(row => row.dimension.endsWith("Pathway"));
  const pathwayChanges = scenarios.some(s => JSON.stringify(pathwayRows(s.results)) !== JSON.stringify(pathwayRows(base)));
  const incompleteTests = scenarios.some(s => s.alreadySelected);
  const eligibleChanges = scenarios.some(s => !sameGroup(feasible, determineTopFeasibleOptions(s.results.analyticalOrder,
    assessOptionFeasibility(assessFeasibilityConstraint(level), s.assumptions.implementationCapacity))));
  const adverse = level === "severe" || !feasible.length || lead.length > 1 || feasible.length > 1 || leadChanges || eligibleChanges;
  const label: DecisionConfidence = adverse ? "low" : level === "moderate" || pathwayChanges || incompleteTests || !sameGroup(lead, feasible) ? "medium" : "high";
  const observations = [
    "This label prioritizes leading-group and pathway stability; High does not imply that reach, risk or every displayed output remains stable.",
    leadChanges ? "The analytical leading group changes in the tested alternatives." : "The analytical leading group is unchanged in the tested alternatives.",
    eligibleChanges ? "The eligible leading group changes in the tested alternatives." : "The eligible leading group is unchanged in the tested alternatives.",
    pathwayChanges ? "Per-participant pathway directions or strength bands change." : "Per-participant pathway directions and strength bands are unchanged.",
    tableChanges ? "Some displayed reach, risk, robustness or pathway bands change." : "Displayed result bands are unchanged in the tested alternatives.",
  ];
  if (incompleteTests) observations.push("Some stress assumptions are already selected; distinct-alternative coverage is incomplete and the label cannot exceed Medium.");
  if (level === "severe") observations.push("Severe constraints cap this discussion-confidence label at Low.");
  if (!feasible.length) observations.push("No eligible option is identified under the stated constraints.");
  if (lead.length > 1 || feasible.length > 1) observations.push("A categorical tie prevents a unique leading option.");
  if (!sameGroup(lead, feasible)) observations.push("Analytical and eligible leading groups differ.");
  observations.push("This is a categorical summary of the three stated stress tests and feasibility rules, not a probability, evidence grade or validation.");
  return { label, explanation: observations.join(" ") };
}
export function generateRejectionReasons(feasibility: OptionFeasibilityAssessment, level: FeasibilityConstraintLevel, capacity: AssumptionMatrix["implementationCapacity"]): Partial<Record<OptionId, string>> {
  const reasons: Partial<Record<OptionId, string>> = {};
  for (const id of OPTIONS) {
    if (feasibility[("option" + id) as keyof OptionFeasibilityAssessment] !== "low") continue;
    reasons[id] = id === "A"
      ? "Severe restrictions combined with low delivery capacity may prevent even basic transfer delivery in this illustrative convention."
      : id === "B"
        ? "Under " + level + " constraints and " + capacity + " capacity, job-linkage coordination is excluded by the stated eligibility rule."
        : "Under " + level + " constraints and " + capacity + " capacity, long-term procurement and coordination are excluded by the stated eligibility rule.";
  }
  return reasons;
}
export function generateViabilityConditions(level: FeasibilityConstraintLevel): Partial<Record<OptionId, string[]>> {
  const conditions: Record<OptionId, string[]> = {
    A: ["General prerequisite: workable targeting and transfer delivery.", "General prerequisite: basic financial-management capacity."],
    B: ["General prerequisite: job-placement partners and training capacity.", "General prerequisite: functioning inter-agency coordination."],
    C: ["General prerequisite: sustained budget commitment and adaptation expertise.", "General prerequisite: workable procurement and community engagement."],
  };
  if (level === "moderate") {
    conditions.A.push("To retain eligibility: maintain at least basic delivery capacity.");
    conditions.B.push("To relax exclusion: raise low delivery capacity to medium and resolve coordination approvals.");
    conditions.C.push("To relax exclusion: establish high delivery capacity and long-term procurement approvals.");
  }
  if (level === "severe") {
    conditions.A.push("To relax exclusion at low capacity: establish at least medium delivery capacity and workable approvals.");
    conditions.B.push("To relax exclusion: reduce restrictive constraints to moderate or none; capacity improvement alone is insufficient under this rule.");
    conditions.C.push("To relax exclusion: reduce restrictive constraints and establish high delivery capacity; review earmarking and procurement approvals.");
  }
  return conditions;
}
export function calculateEnhancedResults(base: ComparativeResults, assumptions: AssumptionMatrix, level: FeasibilityConstraintLevel): EnhancedComparativeResults {
  const feasibilityConstraint = assessFeasibilityConstraint(level);
  const optionFeasibility = assessOptionFeasibility(feasibilityConstraint, assumptions.implementationCapacity);
  const topOptionsAnalytical = base.analyticalOrder[0];
  const topOptionsFeasible = determineTopFeasibleOptions(base.analyticalOrder, optionFeasibility);
  const feasibilityOverrideApplied = !sameGroup(topOptionsAnalytical, topOptionsFeasible);
  // "Second-best" is used only for a unique second categorical group selected
  // after a unique leading group is excluded. Ties and third groups get no label.
  const isUniqueSecond = topOptionsAnalytical.length === 1 && topOptionsFeasible.length === 1
    && base.analyticalOrder[1]?.length === 1 && base.analyticalOrder[1][0] === topOptionsFeasible[0];
  const secondBestOption = feasibilityOverrideApplied && isUniqueSecond ? topOptionsFeasible[0] : undefined;
  const feasibleAlternativeLabel = !topOptionsFeasible.length ? "No eligible alternative identified"
    : secondBestOption ? "Second-best analytical option under the declared ordering"
      : feasibilityOverrideApplied ? "Feasible alternative under stated constraints; a unique second place is not established"
        : topOptionsFeasible.length > 1 ? "Tied analytical options retained under constraints" : "Analytical leading option retained under constraints";
  const confidence = calculateDecisionConfidence(base, assumptions, level, topOptionsFeasible);
  const keyInterpretationDynamic = "Under the selected assumptions and " + level + " feasibility constraints, "
    + (topOptionsFeasible.length ? describeOptions(topOptionsFeasible) + " would remain in the leading eligible group under the declared categorical ordering."
      : "no option would remain eligible under this illustrative rule; relaxing constraints would require further discussion.")
    + " Medium feasibility means conditional eligibility, not assurance of implementation. " + FEASIBILITY_NOTE;
  const riskFlagsWithFeasibility = [...base.riskFlags];
  if (feasibilityOverrideApplied) riskFlagsWithFeasibility.push("The eligible leading group differs from the analytical leading group: " + describeOptions(topOptionsAnalytical) + " versus " + describeOptions(topOptionsFeasible) + ".");
  if (level === "severe") riskFlagsWithFeasibility.push("Severe restrictions may leave a narrow or empty eligible set; no default alternative is forced.");
  if (base.analyticalOrder[0].length > 1) riskFlagsWithFeasibility.push("A categorical tie remains; the tool does not break ties using alphabetical order.");
  return {
    ...base, feasibilityConstraint, optionFeasibility, topOptionsAnalytical, topOptionsFeasible, feasibilityOverrideApplied,
    secondBestOption, feasibleAlternativeLabel,
    decisionConfidence: confidence.label, decisionConfidenceExplanation: confidence.explanation,
    keyInterpretationDynamic, rejectionReasons: generateRejectionReasons(optionFeasibility, level, assumptions.implementationCapacity),
    viabilityConditions: generateViabilityConditions(level), riskFlagsWithFeasibility,
  };
}
