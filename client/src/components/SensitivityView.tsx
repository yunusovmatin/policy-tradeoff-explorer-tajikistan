import { SensitivityScenario, OPTIONS, packageFor } from "@/lib/tradeoffLogic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SensitivityView({ scenarios }: { scenarios: SensitivityScenario[] }) {
  return (
    <div className="space-y-6">
      {scenarios.map(scenario => (
        <Card key={scenario.name}>
          <CardHeader>
            <CardTitle className="text-base">{scenario.name}</CardTitle>
            <CardDescription>{scenario.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {OPTIONS.map(id => {
                const pkg = packageFor(scenario.results, id);
                return (
                  <div key={id} className="p-3 bg-secondary/50 rounded">
                    <h3 className="font-semibold mb-2">Option {id}</h3>
                    <p>Poverty: {pkg.povertyImpact.direction} ({pkg.povertyImpact.strength} pathway)</p>
                    <p>Employment: {pkg.employmentImpact.direction} ({pkg.employmentImpact.strength} pathway)</p>
                    <p>Resilience: {pkg.resiliencePathway.direction} ({pkg.resiliencePathway.strength} pathway)</p>
                    <p>Illustrative reach: {pkg.reachBand}</p>
                  </div>
                );
              })}
            </div>
            <Alert><AlertDescription>{scenario.rankingChange}</AlertDescription></Alert>
            <div>
              <h3 className="font-semibold text-sm mb-2">Displayed changes relative to the current scenario</h3>
              {scenario.changes.length ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {scenario.changes.map(change => <li key={change}>{change}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{scenario.alreadySelected
                  ? "No assumption or displayed result changed."
                  : "Displayed categories are unchanged. Underlying illustrative amounts may differ within the same bands."}</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Each stress test changes one assumption and holds the comparison focus fixed. Feasibility level is held fixed in the decision-confidence checks; the cards show analytical pathways before feasibility exclusion.</p>
            <p className="text-sm">{scenario.results.keyInterpretation}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
