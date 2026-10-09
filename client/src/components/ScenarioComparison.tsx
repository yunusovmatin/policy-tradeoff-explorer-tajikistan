/**
 * SCENARIO COMPARISON COMPONENT
 * 
 * Side-by-side comparison of two different assumption scenarios.
 * Allows users to see how results change when assumptions change.
 */

import { useState } from "react";
import { AssumptionMatrix, ASSUMPTION_BANDS, OBJECTIVE_LABELS, comparisonRows, describeOrder, ComparativeResults } from "@/lib/tradeoffLogic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, X } from "lucide-react";

const ASSUMPTION_LABELS: Record<keyof AssumptionMatrix, string> = {
  policyObjective: "Comparison focus", macroContext: "Demand & remittance conditions",
  inflationEnvironment: "Price environment", implementationCapacity: "Implementation capacity",
  successRate: "Outcome conversion band", leakageRate: "Leakage band", timeToEffect: "Assessment horizon",
  packageA_unitCost: "Option A cost band", packageB_unitCost: "Option B cost band",
  packageB_placementIntensity: "Placement support intensity", packageC_unitCost: "Option C cost band",
  packageC_shockSensitivity: "Adaptation band", budgetEnvelope: "Budget band", overheadShare: "Overhead band",
  targetingRule: "Targeting lens (contextual only)", populationWeighted: "Population weighting (contextual only)",
};
export function changedAssumptionLabels(recorded: AssumptionMatrix, current: AssumptionMatrix): string[] {
  return (Object.keys(ASSUMPTION_LABELS) as (keyof AssumptionMatrix)[])
    .filter(key => recorded[key] !== current[key]).map(key => ASSUMPTION_LABELS[key]);
}

export interface RecordedAnalyticalScenario {
  assumptions: AssumptionMatrix;
  results: ComparativeResults;
  name: string;
}
interface ScenarioComparisonProps {
  currentAssumptions: AssumptionMatrix;
  currentResults: ComparativeResults;
  savedScenario: RecordedAnalyticalScenario | null;
  onSavedScenarioChange: (scenario: RecordedAnalyticalScenario | null) => void;
}

export default function ScenarioComparison({ currentAssumptions, currentResults, savedScenario, onSavedScenarioChange }: ScenarioComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveScenario = () => {
    onSavedScenarioChange({
      assumptions: currentAssumptions,
      results: currentResults,
      name: `Scenario – ${new Date().toLocaleTimeString()}`,
    });
    setIsOpen(false);
  };

  const handleClearSavedScenario = () => {
    onSavedScenarioChange(null);
  };

  if (!savedScenario) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
              <Copy className="w-3 h-3 mr-1" />
              Record Pre-feasibility Scenario
            </Button>
        </DialogTrigger>
        <p className="text-xs text-muted-foreground text-center">Session-only; not stored or shareable. Compares analytical results before feasibility constraints; constraint settings and eligible leading groups are excluded.</p>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Scenario</DialogTitle>
            <DialogDescription>
              Record analytical assumptions and results before feasibility constraints. This comparison excludes institutional eligibility and decision-confidence assessments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Current Assumptions</h4>
              <p className="text-xs mb-2">Focus: {OBJECTIVE_LABELS[currentAssumptions.policyObjective]}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Macro</p>
                  <p className="font-semibold capitalize">{currentAssumptions.macroContext}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Capacity</p>
                  <p className="font-semibold capitalize">{currentAssumptions.implementationCapacity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-semibold">{ASSUMPTION_BANDS.budget[currentAssumptions.budgetEnvelope]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Overhead</p>
                  <p className="font-semibold">{ASSUMPTION_BANDS.overhead[currentAssumptions.overheadShare]}</p>
                </div>
              </div>
            </div>
            <Button onClick={handleSaveScenario} className="w-full">
              Record Scenario for Discussion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">Pre-feasibility Analytical Comparison</CardTitle>
            <CardDescription>
              Comparing analytical results before feasibility constraints
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Clear recorded scenario"
            onClick={handleClearSavedScenario}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-300 bg-white">
          <AlertDescription className="text-sm">
            <strong>Analytical comparison before feasibility constraints:</strong> This table excludes institutional eligibility, constraint settings and decision confidence. Changing only the feasibility constraint would leave this comparison unchanged. Review each scenario’s Results separately for feasibility.
          </AlertDescription>
        </Alert>

        <div className="text-xs space-y-1">
          <p>Summaries show selected assumptions. Differences are checked across the full recorded analytical assumption matrix; institutional feasibility settings are excluded.</p>
          <p><strong>Differing assumption categories:</strong> {changedAssumptionLabels(savedScenario.assumptions, currentAssumptions).join("; ") || "None — all recorded analytical assumptions match."}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-blue-200">
                <th className="px-3 py-2 text-left font-semibold">Dimension</th>
                <th className="px-3 py-2 text-center font-semibold">Recorded Scenario</th>
                <th className="px-3 py-2 text-center font-semibold">Current</th>
                <th className="px-3 py-2 text-center font-semibold">Change</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows(currentResults).map((row, r) => row.values.map((value, o) => {
                const saved = comparisonRows(savedScenario.results)[r].values[o];
                return (
                  <tr key={row.dimension + o} className="border-b border-blue-100">
                    <th scope="row" className="text-left px-3 py-2 font-medium">{row.dimension} ({["A", "B", "C"][o]})</th>
                    <td className="text-center px-3 py-2">{saved}</td>
                    <td className="text-center px-3 py-2">{value}</td>
                    <td className="text-center px-3 py-2">{saved === value ? "Unchanged" : "Changed"}</td>
                  </tr>
                );
              }))}
              <tr>
                <th scope="row" className="text-left px-3 py-2">Declared analytical ordering</th>
                <td className="px-3 py-2">{describeOrder(savedScenario.results.analyticalOrder)}</td>
                <td className="px-3 py-2">{describeOrder(currentResults.analyticalOrder)}</td>
                <td className="px-3 py-2">{describeOrder(savedScenario.results.analyticalOrder) === describeOrder(currentResults.analyticalOrder) ? "Unchanged" : "Changed"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <h4 className="font-semibold text-sm mb-2">Recorded Scenario Assumptions</h4>
          <p className="text-xs mb-2">Focus: {OBJECTIVE_LABELS[savedScenario.assumptions.policyObjective]}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Macro</p>
              <p className="font-semibold capitalize">{savedScenario.assumptions.macroContext}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Capacity</p>
              <p className="font-semibold capitalize">{savedScenario.assumptions.implementationCapacity}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Budget</p>
              <p className="font-semibold">{ASSUMPTION_BANDS.budget[savedScenario.assumptions.budgetEnvelope]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Overhead</p>
              <p className="font-semibold">{ASSUMPTION_BANDS.overhead[savedScenario.assumptions.overheadShare]}</p>
            </div>
          </div>
        </div>

        <Button onClick={handleClearSavedScenario} variant="outline" className="w-full">
          Clear Recorded Scenario
        </Button>
      </CardContent>
    </Card>
  );
}
