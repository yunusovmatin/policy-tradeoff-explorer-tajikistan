/**
 * POLICY TRADE-OFF EXPLORER
 * 
 * Main page component implementing the 6-tab UN-internal tool interface.
 * Design: Minimal color, text > charts, defaults pre-filled, warnings always visible.
 */

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Download, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  AssumptionMatrix,
  MacroContext,
  ImplementationCapacity,
  SuccessRate,
  LeakageRate,
  TimeToEffect,
  BudgetEnvelope,
  OverheadShare,
  TargetingRule,
  calculateComparativeResults,
  runSensitivityAnalysis,
  formatResultsForCSV,
} from "@/lib/tradeoffLogic";
import { ASSUMPTION_BANDS, OBJECTIVE_LABELS, PolicyObjective, TARGETING_NOTE, RESOURCE_NOTE, COMPARISON_NOTE, EVIDENCE_NOTE, CONVENTIONS_NOTE, SHOCK_NOTE, PLACEMENT_COST_NOTE } from "@/lib/tradeoffLogic";
import SensitivityView from "@/components/SensitivityView";

import ScenarioComparison, { RecordedAnalyticalScenario } from "@/components/ScenarioComparison";
import FeasibilityConstraintToggle from "@/components/FeasibilityConstraintToggle";
import EnhancedResultsTable from "@/components/EnhancedResultsTable";
import { FeasibilityConstraintLevel, calculateEnhancedResults } from "@/lib/tradeoffLogicEnhanced";

const FEASIBILITY_CONTEXT_NOTE = "The tool illustrates how user-defined institutional and political feasibility constraints may affect the relative attractiveness of intervention options. These hypothetical assumptions do not constitute an empirical assessment of political conditions, stakeholder preferences, or implementation feasibility in Tajikistan.";

// Default assumptions (UN-safe baseline)
const DEFAULT_ASSUMPTIONS: AssumptionMatrix = {
  policyObjective: "poverty",
  macroContext: "baseline",
  inflationEnvironment: "low",
  implementationCapacity: "medium",
  successRate: 30,
  leakageRate: 20,
  timeToEffect: "medium",
  packageA_unitCost: 300,
  packageB_unitCost: 500,
  packageB_placementIntensity: "training-placement",
  packageC_unitCost: 700,
  packageC_shockSensitivity: "medium",
  budgetEnvelope: 5,
  overheadShare: 20,
  targetingRule: "need-feasibility",
  populationWeighted: true,
};

export default function Explorer() {
  const [assumptions, setAssumptions] = useState<AssumptionMatrix>(DEFAULT_ASSUMPTIONS);
  const [feasibilityConstraint, setFeasibilityConstraint] = useState<FeasibilityConstraintLevel>("none");
  const [activeTab, setActiveTab] = useState("context");
  const [savedScenario, setSavedScenario] = useState<RecordedAnalyticalScenario | null>(null);

  // Calculate results on assumption change
  const results = useMemo(() => calculateComparativeResults(assumptions), [assumptions]);
  const enhancedResults = useMemo(() => calculateEnhancedResults(results, assumptions, feasibilityConstraint), [results, assumptions, feasibilityConstraint]);
  const sensitivityScenarios = useMemo(() => runSensitivityAnalysis(assumptions), [assumptions]);

  const handleAssumptionChange = (key: keyof AssumptionMatrix, value: any) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleExportCSV = () => {
    const csv = formatResultsForCSV(enhancedResults, assumptions);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `policy-explorer-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-foreground">
            Policy Trade-off Explorer – Tajikistan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Illustrative internal logic prototype.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Navigation Tabs */}
          <TabsList className="grid h-auto w-full grid-cols-3 sm:grid-cols-6 mb-8">
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
            <TabsTrigger value="exports">Notes & Exports</TabsTrigger>
          </TabsList>

          {/* TAB 1: Context */}
          <TabsContent value="context" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Context & Grounding</CardTitle>
                <CardDescription>
                  Illustrative discussion framing; country context requires current evidence and consultation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-foreground">
                  <p>
                    <strong>Regional poverty and youth employment are contextual discussion concerns.</strong> Uneven poverty and employment opportunities are
                    discussion concerns. This prototype contains no district data or current labour-market
                    measurements; country-specific patterns require verification.
                  </p>
                  <p>
                    <strong>Remittance-related shock exposure is a contextual discussion concern.</strong> The assumed adverse scenario represents weaker remittance inflows and labour demand. External economic downturns may weaken household
                    resilience.
                  </p>
                  <p>
                    <strong>Fiscal resources and delivery capacity may constrain programme choices.</strong> Budget and capacity bands are illustrative choices here, not measured
                    assessments of public finances or district institutions.
                  </p>
                  <p>
                    <strong>Policy choices are shaped by political economy considerations.</strong> Final programme
                    choices often reflect second-best solutions shaped by donor priorities, political feasibility,
                    and partner capacity alongside analytical trade-offs. The categorical constraint control illustrates hypothetical exclusions; it does not assess real-world political economy dynamics, elite capture, or social feasibility in Tajikistan.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="font-semibold text-sm mb-2">What This Tool Does / Does Not Do</h3>
                  <p className="text-xs text-muted-foreground mb-2">{FEASIBILITY_CONTEXT_NOTE}</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>
                      <strong>Does:</strong> Compare illustrative options under explicit assumptions, including hypothetical institutional feasibility constraints
                    </li>
                    <li>
                      <strong>Does not:</strong> Forecast outcomes, attribute causal impacts, replace
                      program design, or empirically assess real-world political feasibility in Tajikistan
                    </li>
                    <li>
                      <strong>Limitation:</strong> Analytical prototype for internal discussion; validation
                      requires programme evidence and stakeholder consultation
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Assumptions */}
          <TabsContent value="assumptions" className="space-y-6">
            {/* Warning Box */}
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900 text-sm">
                <strong>All parameters are illustrative.</strong> Results represent illustrative pathway categories under
                stated assumptions, not forecasts or attributable impacts. Validation requires programme
                evidence and stakeholder engagement.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comparison Focus</CardTitle>
                <CardDescription>Declare the policy objective before interpreting relative attractiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="objective">Policy Objective</Label>
                <Select value={assumptions.policyObjective} onValueChange={value => handleAssumptionChange("policyObjective", value as PolicyObjective)}>
                  <SelectTrigger id="objective" className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poverty">Poverty relief</SelectItem>
                    <SelectItem value="employment">Employment pathways</SelectItem>
                    <SelectItem value="resilience">Long-term resilience</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">{COMPARISON_NOTE}</p>
              </CardContent>
            </Card>

            {/* A) Macro Context */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">A. Macro Context</CardTitle>
                <CardDescription>External conditions you do not control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Demand & Remittance Conditions</Label>
                  <RadioGroup
                    value={assumptions.macroContext}
                    onValueChange={(value) =>
                      handleAssumptionChange("macroContext", value as MacroContext)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="baseline" id="macro-baseline" />
                      <Label htmlFor="macro-baseline" className="font-normal cursor-pointer">
                        Baseline (stable remittances and labour demand)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="adverse" id="macro-adverse" />
                      <Label htmlFor="macro-adverse" className="font-normal cursor-pointer">
                        Adverse (remittances down, labour demand tighter)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="favorable" id="macro-favorable" />
                      <Label htmlFor="macro-favorable" className="font-normal cursor-pointer">
                        Favorable (remittances stronger, labour demand higher)
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-2">
                    Changes illustrative pathway multipliers and demand-sensitive robustness. Price conditions are selected independently below; no national trend is computed.
                  </p>
                </div>

                <div>
                  <Label htmlFor="inflation" className="text-sm font-semibold">
                    Price Environment
                  </Label>
                  <Select
                    value={assumptions.inflationEnvironment}
                    onValueChange={(value) =>
                      handleAssumptionChange("inflationEnvironment", value)
                    }
                  >
                    <SelectTrigger id="inflation" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low inflation</SelectItem>
                      <SelectItem value="high">High inflation</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Illustrative placeholder
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* B) Delivery Reality */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">B. Delivery Reality</CardTitle>
                <CardDescription>Implementation performance you partially control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="capacity" className="text-sm font-semibold">
                    Implementation Capacity
                  </Label>
                  <Select
                    value={assumptions.implementationCapacity}
                    onValueChange={(value) =>
                      handleAssumptionChange("implementationCapacity", value as ImplementationCapacity)
                    }
                  >
                    <SelectTrigger id="capacity" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Institutional ability to deliver at scale. Includes procurement delays, partner availability,
                    monitoring quality, and inter-agency coordination.
                  </p>
                </div>

                <div>
                  <Label htmlFor="success" className="text-sm font-semibold">
                    Outcome Conversion Band
                  </Label>
                  <Select
                    value={assumptions.successRate.toString()}
                    onValueChange={(value) =>
                      handleAssumptionChange("successRate", parseInt(value) as SuccessRate)
                    }
                  >
                    <SelectTrigger id="success" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Conservative</SelectItem>
                      <SelectItem value="30">Base</SelectItem>
                      <SelectItem value="45">Optimistic</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Conversion convention per reached participant; affects pathway bands. It is not a probability of national outcome change.
                  </p>
                </div>

                <div>
                  <Label htmlFor="leakage" className="text-sm font-semibold">
                    Leakage / Targeting Error
                  </Label>
                  <Select
                    value={assumptions.leakageRate.toString()}
                    onValueChange={(value) =>
                      handleAssumptionChange("leakageRate", parseInt(value) as LeakageRate)
                    }
                  >
                    <SelectTrigger id="leakage" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Low</SelectItem>
                      <SelectItem value="20">Medium</SelectItem>
                      <SelectItem value="35">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Reduces illustrative reached places; per-participant pathway directions are shown separately.
                  </p>
                </div>

                <div>
                  <Label htmlFor="timelag" className="text-sm font-semibold">
                    Assessment Horizon
                  </Label>
                  <Select
                    value={assumptions.timeToEffect}
                    onValueChange={(value) =>
                      handleAssumptionChange("timeToEffect", value as TimeToEffect)
                    }
                  >
                    <SelectTrigger id="timelag" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected horizon for assessing illustrative pathways; typical package lags are shown separately in Results.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* C) Budget & Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">C. Budget & Costs</CardTitle>
                <CardDescription>Resource envelope and overhead</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Annual Budget Envelope</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 5, 10, 20].map((budget) => (
                      <Button
                        key={budget}
                        variant={assumptions.budgetEnvelope === budget ? "default" : "outline"}
                        onClick={() =>
                          handleAssumptionChange("budgetEnvelope", budget as BudgetEnvelope)
                        }
                        className="text-xs"
                      >
                        {ASSUMPTION_BANDS.budget[budget as BudgetEnvelope]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="overhead" className="text-sm font-semibold">
                    Overhead / Admin Share
                  </Label>
                  <Select
                    value={assumptions.overheadShare.toString()}
                    onValueChange={(value) =>
                      handleAssumptionChange("overheadShare", parseInt(value) as OverheadShare)
                    }
                  >
                    <SelectTrigger id="overhead" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Low</SelectItem>
                      <SelectItem value="20">Medium</SelectItem>
                      <SelectItem value="30">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Resource share for M&E, staffing and logistics; narrows funded reach.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* C) Institutional/Political Feasibility Constraint */}
            <FeasibilityConstraintToggle
              value={feasibilityConstraint}
              onChange={setFeasibilityConstraint}
            />

            {/* D) Targeting & Geography */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">D. Contextual Targeting & Geography</CardTitle>
                <CardDescription>Discussion lenses only; no geographic allocation is calculated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">{TARGETING_NOTE}</p>
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Contextual Geographic Targeting Lens</Label>
                  <RadioGroup
                    value={assumptions.targetingRule}
                    onValueChange={(value) =>
                      handleAssumptionChange("targetingRule", value as TargetingRule)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="need-only" id="targeting-need" />
                      <Label htmlFor="targeting-need" className="font-normal cursor-pointer">
                        Need only (poverty rate)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="need-feasibility" id="targeting-feasibility" />
                      <Label htmlFor="targeting-feasibility" className="font-normal cursor-pointer">
                        Need + feasibility (default)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="need-feasibility-shock" id="targeting-shock" />
                      <Label htmlFor="targeting-shock" className="font-normal cursor-pointer">
                        Need + feasibility + shock exposure
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="population-weighted"
                    checked={assumptions.populationWeighted}
                    onCheckedChange={(checked) =>
                      handleAssumptionChange("populationWeighted", checked)
                    }
                  />
                  <Label htmlFor="population-weighted" className="font-normal cursor-pointer">
                    Population weighting lens (contextual only)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Options */}
          <TabsContent value="options" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option A */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Option A</CardTitle>
                  <CardDescription>Social Protection / Income Support</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground">
                    Cash transfers, social assistance, and safety nets targeting vulnerable populations.
                  </p>

                  <div>
                    <Label htmlFor="costA" className="text-xs font-semibold">
                      Annual Unit Cost Band
                    </Label>
                    <Select
                      value={assumptions.packageA_unitCost.toString()}
                      onValueChange={(value) =>
                        handleAssumptionChange("packageA_unitCost", parseInt(value))
                      }
                    >
                      <SelectTrigger id="costA" className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="150">Lower cost</SelectItem>
                        <SelectItem value="300">Base cost</SelectItem>
                        <SelectItem value="600">Higher cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-2 bg-green-50 rounded text-xs">
                    <strong>Provisional Evidence Judgment: HIGH</strong>
                    <p className="text-xs mt-1">Assumes existing transfer systems; provisional evidence familiarity requires validation.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Option B */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Option B</CardTitle>
                  <CardDescription>Youth Employment & Skills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground">
                    Vocational training, job linkage, and MSME support for youth employment.
                  </p>

                  <div>
                    <Label htmlFor="costB" className="text-xs font-semibold">
                      Annual Unit Cost Band
                    </Label>
                    <Select
                      value={assumptions.packageB_unitCost.toString()}
                      onValueChange={(value) =>
                        handleAssumptionChange("packageB_unitCost", parseInt(value))
                      }
                    >
                      <SelectTrigger id="costB" className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="250">Lower cost</SelectItem>
                        <SelectItem value="500">Base cost</SelectItem>
                        <SelectItem value="900">Higher cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="placementB" className="text-xs font-semibold">
                      Placement Support Intensity
                    </Label>
                    <Select
                      value={assumptions.packageB_placementIntensity}
                      onValueChange={(value) =>
                        handleAssumptionChange("packageB_placementIntensity", value)
                      }
                    >
                      <SelectTrigger id="placementB" className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="training-only">Training only</SelectItem>
                        <SelectItem value="training-placement">Training + placement</SelectItem>
                        <SelectItem value="training-placement-subsidy">
                          Training + placement + wage subsidy
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">{PLACEMENT_COST_NOTE}</p>
                  </div>

                  <div className="p-2 bg-yellow-50 rounded text-xs">
                    <strong>Provisional Evidence Judgment: MEDIUM</strong>
                    <p className="text-xs mt-1">Assumes job-linkage coordination; provisional evidence familiarity requires validation.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Option C */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Option C</CardTitle>
                  <CardDescription>Resilience / Climate / Rural Livelihoods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground">
                    Climate adaptation, rural productivity, and infrastructure for long-term resilience.
                  </p>

                  <div>
                    <Label htmlFor="costC" className="text-xs font-semibold">
                      Annual Unit Cost Band
                    </Label>
                    <Select
                      value={assumptions.packageC_unitCost.toString()}
                      onValueChange={(value) =>
                        handleAssumptionChange("packageC_unitCost", parseInt(value))
                      }
                    >
                      <SelectTrigger id="costC" className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Lower cost</SelectItem>
                        <SelectItem value="700">Base cost</SelectItem>
                        <SelectItem value="1200">Higher cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="shockC" className="text-xs font-semibold">
                      Adaptive Design Band
                    </Label>
                    <Select
                      value={assumptions.packageC_shockSensitivity}
                      onValueChange={(value) =>
                        handleAssumptionChange("packageC_shockSensitivity", value)
                      }
                    >
                      <SelectTrigger id="shockC" className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-2 bg-orange-50 rounded text-xs">
                    <strong>Provisional Evidence Judgment: LOWER</strong>
                    <p className="text-xs mt-1">Assumes long-term procurement and adaptation; provisional evidence familiarity requires validation.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* TAB 4: Results */}
          <TabsContent value="results" className="space-y-6">
            <div className="p-3 border border-border rounded text-xs text-muted-foreground">
              <strong>Not a costed programme.</strong> Results are illustrative pathway categories under stated assumptions.
            </div>

            <EnhancedResultsTable results={enhancedResults} />
          </TabsContent>

          {/* TAB 5: Sensitivity */}
          <TabsContent value="sensitivity" className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Sensitivity compares pathways, reach and analytical ordering against the current scenario; unchanged categories are reported explicitly.
              </AlertDescription>
            </Alert>

            <SensitivityView scenarios={sensitivityScenarios} />


          </TabsContent>

          {/* TAB 6: Notes & Exports */}
          <TabsContent value="exports" className="space-y-6">
            {/* Scenario Comparison */}
            <Card className="border-muted bg-muted/20">
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">Optional: Compare Scenarios</CardTitle>
                <CardDescription className="text-xs">Session-only discussion comparison. The CSV contains the current scenario only and must not be used for scenario comparison.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScenarioComparison currentAssumptions={assumptions} currentResults={results} savedScenario={savedScenario} onSavedScenarioChange={setSavedScenario} />
              </CardContent>
            </Card>

            {/* Assumptions Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assumptions Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Comparison Focus</p>
                    <p className="font-semibold">{OBJECTIVE_LABELS[assumptions.policyObjective]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Feasibility Constraint</p>
                    <p className="font-semibold capitalize">{feasibilityConstraint}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Macro Context</p>
                    <p className="font-semibold">{assumptions.macroContext}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Implementation Capacity</p>
                    <p className="font-semibold">{assumptions.implementationCapacity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Outcome Conversion Band</p>
                    <p className="font-semibold">{ASSUMPTION_BANDS.success[assumptions.successRate]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Leakage Rate</p>
                    <p className="font-semibold">{ASSUMPTION_BANDS.leakage[assumptions.leakageRate]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget Envelope</p>
                    <p className="font-semibold">{ASSUMPTION_BANDS.budget[assumptions.budgetEnvelope]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Overhead Share</p>
                    <p className="font-semibold">{ASSUMPTION_BANDS.overhead[assumptions.overheadShare]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contextual Targeting Lens</p>
                    <p className="font-semibold">{assumptions.targetingRule}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Generated</p>
                    <p className="font-semibold">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Methodological Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Methodological Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Declared Rules & Scope</h4>
                  <p className="text-muted-foreground">{CONVENTIONS_NOTE}</p>
                  <p className="text-muted-foreground mt-2">{RESOURCE_NOTE}</p>
                  <p className="text-muted-foreground mt-2">{COMPARISON_NOTE}</p>
                  <p className="text-muted-foreground mt-2">{EVIDENCE_NOTE}</p>
                  <p className="text-muted-foreground mt-2">{SHOCK_NOTE}</p>
                  <p className="text-muted-foreground mt-2">{PLACEMENT_COST_NOTE}</p>
                  <p className="text-muted-foreground mt-2">{TARGETING_NOTE}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Contribution vs Attribution</h4>
                  <p className="text-muted-foreground">
                    Results indicate illustrative contribution pathways, not causal attribution. Outcomes
                    depend on program design, implementation quality, and external factors.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Data Limitations</h4>
                  <p className="text-muted-foreground">
                    Parameter values are illustrative placeholders selected to demonstrate results-based
                    monitoring logic for discussion under selected assumptions. Validation requires program evidence.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Political Economy & Second-Best Solutions</h4>
                  <p className="text-muted-foreground">
                    {FEASIBILITY_CONTEXT_NOTE} The tool does not empirically assess elite capture or social dynamics. In practice, final programme choices may reflect second-best solutions shaped
                    by donor priorities, political feasibility, and partner capacity alongside analytical
                    trade-offs. Implementation success depends on political commitment and stakeholder coordination.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Analytical Prototype</h4>
                  <p className="text-muted-foreground">
                    This tool is designed for internal analytical discussion and decision support.
                    Drafting and prototyping supported by AI-assisted tools. Validation requires programme evidence and
                    stakeholder consultation.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Future Extensions</h4>
                  <p className="text-muted-foreground text-xs italic">
                    In an operational setting, illustrative parameters could be replaced with programme-specific cost data. This prototype focuses on decision logic rather than operational calibration.
                  </p>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    Final programme decisions require political dialogue, fiduciary review, and partner consultation beyond the scope of this tool.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Exports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Scenario Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleExportCSV} className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Scenario Snapshot (CSV)
                </Button>
                <p className="text-xs text-muted-foreground">
                  Exports a single-scenario transparency snapshot, including underlying illustrative numeric assumptions and displayed outputs. It is not for forecasting, optimisation, scenario comparison, or downstream analytical reuse.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
