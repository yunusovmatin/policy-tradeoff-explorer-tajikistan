import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  comparisonRows, describeOptions, describeOrder, DIRECTION_NOTE, RESOURCE_NOTE,
  COMPARISON_NOTE, EVIDENCE_NOTE, SHOCK_NOTE, REVIEW_NOTE, OPTIONS,
} from "@/lib/tradeoffLogic";
import { EnhancedComparativeResults, FEASIBILITY_NOTE, UN_STYLE_DISCLAIMER } from "@/lib/tradeoffLogicEnhanced";

export default function EnhancedResultsTable({ results }: { results: EnhancedComparativeResults }) {
  const rows = [
    ...comparisonRows(results),
    { dimension: "Feasibility under Constraints", values: [
      results.optionFeasibility.optionA, results.optionFeasibility.optionB, results.optionFeasibility.optionC,
    ] },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparative Results</CardTitle>
          <CardDescription>Illustrative pathways and delivery bands under the selected assumptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Comparison of Options A, B and C under the selected assumptions</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="text-left p-3">Dimension</th>
                  {OPTIONS.map(id => <th scope="col" key={id} className="text-center p-3">Option {id}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.dimension} className="border-b border-border">
                    <th scope="row" className="text-left p-3 font-medium">{row.dimension}</th>
                    {row.values.map((value, i) => <td key={i} className="text-center p-3 capitalize">{value}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 mt-4 text-xs text-muted-foreground">
            <p>{DIRECTION_NOTE}</p><p>{RESOURCE_NOTE}</p><p>{EVIDENCE_NOTE}</p><p>{SHOCK_NOTE}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Decision Confidence — Leadership & Pathway Stability</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Badge className="capitalize">{results.decisionConfidence}</Badge>
          <p className="text-sm text-muted-foreground">{results.decisionConfidenceExplanation}</p>
        </CardContent>
      </Card>
      <Card className={results.feasibilityOverrideApplied ? "border-amber-200 bg-amber-50" : ""}>
        <CardHeader><CardTitle className="text-base">Relative Attractiveness under Selected Assumptions</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p><strong>Declared analytical ordering:</strong> {describeOrder(results.analyticalOrder)}</p>
          <p><strong>Analytical leading group:</strong> {describeOptions(results.topOptionsAnalytical)}</p>
          <p><strong>Eligible leading group:</strong> {describeOptions(results.topOptionsFeasible)}</p>
          <p>{results.feasibleAlternativeLabel}{results.secondBestOption ? ": Option " + results.secondBestOption : ""}</p>
          <p className="text-xs text-muted-foreground">{COMPARISON_NOTE}</p>
          <p className="text-xs text-muted-foreground">{results.feasibilityConstraint.description}</p>
          <p className="text-xs text-muted-foreground">{FEASIBILITY_NOTE}</p>
        </CardContent>
      </Card>
      {Object.keys(results.rejectionReasons).length > 0 && (
        <Card className="border-orange-100">
          <CardHeader><CardTitle className="text-base">Why Options Are Excluded under the Stated Rule</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {OPTIONS.map(id => results.rejectionReasons[id] && <p key={id} className="text-sm"><strong>Option {id}:</strong> {results.rejectionReasons[id]}</p>)}
          </CardContent>
        </Card>
      )}
      <Card className="border-green-100 bg-green-50">
        <CardHeader><CardTitle className="text-base">General Prerequisites & Conditions for Relaxing Constraints</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {OPTIONS.map(id => (
            <div key={id}>
              <h3 className="font-medium text-sm mb-2">Option {id}</h3>
              <ul className="list-disc pl-5 space-y-1">
                {results.viabilityConditions[id]?.map(condition => <li key={condition} className="text-sm text-muted-foreground">{condition}</li>)}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Key Interpretation</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{results.keyInterpretation}</p>
          <p>{results.keyInterpretationDynamic}</p>
          <p className="text-xs text-muted-foreground">{REVIEW_NOTE}</p>
        </CardContent>
      </Card>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader><CardTitle className="text-base">Risk Flags</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {results.riskFlagsWithFeasibility.map(flag => <li key={flag} className="text-sm">{flag}</li>)}
          </ul>
        </CardContent>
      </Card>
      <Alert><AlertDescription className="text-xs">{UN_STYLE_DISCLAIMER}</AlertDescription></Alert>
    </div>
  );
}
