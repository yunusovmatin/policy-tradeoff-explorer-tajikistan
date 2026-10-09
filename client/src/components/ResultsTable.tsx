/**
 * RESULTS TABLE COMPONENT
 * 
 * Displays the core comparative results table with directional indicators.
 * Uses arrows and words, no decimals. Illustrative under current assumptions.
 */

import { ComparativeResults } from "@/lib/tradeoffLogic";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ResultsTableProps {
  results: ComparativeResults;
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const { optionA, optionB, optionC } = results;

  const rows = [
    {
      dimension: "Poverty Impact",
      a: optionA.povertyImpact.direction,
      b: optionB.povertyImpact.direction,
      c: optionC.povertyImpact.direction,
      tooltip: "Direction of change in poverty outcomes under current assumptions",
    },
    {
      dimension: "Employment Impact",
      a: optionA.employmentImpact.direction,
      b: optionB.employmentImpact.direction,
      c: optionC.employmentImpact.direction,
      tooltip: "Direction of change in youth employment outcomes",
    },
    {
      dimension: "Time to Effect",
      a: optionA.timeToEffect === "short" ? "Short" : optionA.timeToEffect === "medium" ? "Medium" : "Long",
      b: optionB.timeToEffect === "short" ? "Short" : optionB.timeToEffect === "medium" ? "Medium" : "Long",
      c: optionC.timeToEffect === "short" ? "Short" : optionC.timeToEffect === "medium" ? "Medium" : "Long",
      tooltip: "Expected timeframe for results to appear in indicators",
    },
    {
      dimension: "Implementation Risk",
      a: optionA.implementationRisk === "low" ? "Low" : optionA.implementationRisk === "medium" ? "Medium" : "High",
      b: optionB.implementationRisk === "low" ? "Low" : optionB.implementationRisk === "medium" ? "Medium" : "High",
      c: optionC.implementationRisk === "low" ? "Low" : optionC.implementationRisk === "medium" ? "Medium" : "High",
      tooltip: "Execution risk based on capacity and complexity",
    },
    {
      dimension: "Shock Robustness",
      a: optionA.shockRobustness === "low" ? "Low" : optionA.shockRobustness === "medium" ? "Medium" : "High",
      b: optionB.shockRobustness === "low" ? "Low" : optionB.shockRobustness === "medium" ? "Medium" : "High",
      c: optionC.shockRobustness === "low" ? "Low" : optionC.shockRobustness === "medium" ? "Medium" : "High",
      tooltip: "Resilience to adverse macro shocks",
    },
    {
      dimension: "Evidence Confidence",
      a: optionA.evidenceConfidence === "high" ? "High" : optionA.evidenceConfidence === "medium" ? "Medium" : "Lower",
      b: optionB.evidenceConfidence === "high" ? "High" : optionB.evidenceConfidence === "medium" ? "Medium" : "Lower",
      c: optionC.evidenceConfidence === "high" ? "High" : optionC.evidenceConfidence === "medium" ? "Medium" : "Lower",
      tooltip: "Strength of evidence base. 'Lower' indicates relative to short-term poverty and employment interventions.",
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Dimension</th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">
                Option A<br />
                <span className="text-xs font-normal text-muted-foreground">Social Protection</span>
              </th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">
                Option B<br />
                <span className="text-xs font-normal text-muted-foreground">Youth Employment</span>
              </th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">
                Option C<br />
                <span className="text-xs font-normal text-muted-foreground">Resilience</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-secondary/20"}>
                <td className="px-4 py-3 font-medium text-foreground">
                  <Tooltip>
                    <TooltipTrigger className="cursor-help underline decoration-dotted">
                      {row.dimension}
                    </TooltipTrigger>
                    <TooltipContent>{row.tooltip}</TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-4 py-3 text-center text-foreground font-semibold">{row.a}</td>
                <td className="px-4 py-3 text-center text-foreground font-semibold">{row.b}</td>
                <td className="px-4 py-3 text-center text-foreground font-semibold">{row.c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-secondary/30 text-xs text-muted-foreground border-t border-border">
        <em>Indicative under current assumptions. 'Lower' evidence confidence for Option C reflects relative maturity of short-term poverty and employment evidence bases.</em>
      </div>
    </Card>
  );
}
