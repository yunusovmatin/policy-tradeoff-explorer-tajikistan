/**
 * FEASIBILITY CONSTRAINT TOGGLE
 * 
 * 3-level toggle for institutional/political feasibility constraints.
 * Affects interpretation, availability signals, and risk flags.
 * Does NOT change impact arrows directly.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { assessFeasibilityConstraint } from "@/lib/tradeoffLogicEnhanced";

export interface FeasibilityConstraintToggleProps {
  value: "none" | "moderate" | "severe";
  onChange: (value: "none" | "moderate" | "severe") => void;
}

export default function FeasibilityConstraintToggle({
  value,
  onChange,
}: FeasibilityConstraintToggleProps) {
  return (
    <Card className="border-blue-100 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-base">Institutional / Political Feasibility Constraint</CardTitle>
        <CardDescription>
          User-defined hypothetical exclusions; not an empirical assessment of political conditions or implementation feasibility in Tajikistan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={value} onValueChange={(v) => onChange(v as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="feasibility-none" />
            <Label htmlFor="feasibility-none" className="font-normal cursor-pointer flex-1">
              <div>
                <p className="font-medium">No additional constraint (default)</p>
                <p className="text-xs text-muted-foreground">
                  All options remain eligible; delivery risks are assessed separately
                </p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="moderate" id="feasibility-moderate" />
            <Label htmlFor="feasibility-moderate" className="font-normal cursor-pointer flex-1">
              <div>
                <p className="font-medium">Moderate feasibility constraint</p>
                <p className="text-xs text-muted-foreground">
                  Approval processes, coordination, partner capacity, earmarking may limit complex options
                </p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="severe" id="feasibility-severe" />
            <Label htmlFor="feasibility-severe" className="font-normal cursor-pointer flex-1">
              <div>
                <p className="font-medium">Severe feasibility constraint</p>
                <p className="text-xs text-muted-foreground">
                  Political economy, restrictive earmarking, limited capacity significantly narrow options
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <Alert className="border-blue-200 bg-blue-100">
          <Info className="h-4 w-4 text-blue-700" />
          <AlertDescription className="text-xs text-blue-900">
            {assessFeasibilityConstraint(value).description}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
