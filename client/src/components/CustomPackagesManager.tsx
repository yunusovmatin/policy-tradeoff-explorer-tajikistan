/**
 * CUSTOM PACKAGES MANAGER
 * 
 * Interface for creating, editing, and managing custom intervention packages.
 */

import { useState } from "react";
import { CustomPackage, createCustomPackage, loadCustomPackages, saveCustomPackages, deleteCustomPackage, validateCustomPackage } from "@/lib/customPackages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Trash2, Plus } from "lucide-react";

interface CustomPackagesManagerProps {
  onPackageSelect?: (pkg: CustomPackage) => void;
}

export default function CustomPackagesManager({ onPackageSelect }: CustomPackagesManagerProps) {
  const [packages, setPackages] = useState<CustomPackage[]>(loadCustomPackages());
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitCost: 500,
    timeToEffect: "medium" as "short" | "medium" | "long",
    povertyEffectiveness: 0.5,
    employmentEffectiveness: 0.5,
    implementationComplexity: "medium" as "low" | "medium" | "high",
    evidenceConfidence: "medium" as "high" | "medium" | "lower",
    operationalNote: "",
  });

  const handleSavePackage = () => {
    const validationErrors = validateCustomPackage(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    let updatedPackages: CustomPackage[];
    if (editingId) {
      updatedPackages = packages.map((p) =>
        p.id === editingId
          ? {
              ...p,
              ...formData,
            }
          : p
      );
    } else {
      const newPackage = createCustomPackage(
        formData.name,
        formData.description,
        formData.unitCost,
        formData.timeToEffect,
        formData.povertyEffectiveness,
        formData.employmentEffectiveness,
        formData.implementationComplexity,
        formData.evidenceConfidence,
        formData.operationalNote
      );
      updatedPackages = [...packages, newPackage];
    }

    saveCustomPackages(updatedPackages);
    setPackages(updatedPackages);
    resetForm();
    setIsOpen(false);
  };

  const handleDeletePackage = (id: string) => {
    deleteCustomPackage(id);
    const updated = packages.filter((p) => p.id !== id);
    setPackages(updated);
  };

  const handleEditPackage = (pkg: CustomPackage) => {
    setFormData({
      name: pkg.name,
      description: pkg.description,
      unitCost: pkg.unitCost,
      timeToEffect: pkg.timeToEffect,
      povertyEffectiveness: pkg.povertyEffectiveness,
      employmentEffectiveness: pkg.employmentEffectiveness,
      implementationComplexity: pkg.implementationComplexity,
      evidenceConfidence: pkg.evidenceConfidence,
      operationalNote: pkg.operationalNote,
    });
    setEditingId(pkg.id);
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      unitCost: 500,
      timeToEffect: "medium",
      povertyEffectiveness: 0.5,
      employmentEffectiveness: 0.5,
      implementationComplexity: "medium",
      evidenceConfidence: "medium",
      operationalNote: "",
    });
    setEditingId(null);
    setErrors([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Intervention Packages</CardTitle>
          <CardDescription>
            Create and manage custom intervention packages beyond the three default options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-xs text-amber-900">
              <strong>Important:</strong> Custom packages are illustrative and subject to the same feasibility and political constraints as standard options.
            </AlertDescription>
          </Alert>
          {packages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom packages yet. Create one to get started.</p>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-3 border border-border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{pkg.name}</h4>
                      <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPackage(pkg)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Unit Cost</p>
                      <p className="font-semibold">${pkg.unitCost}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time-to-Effect</p>
                      <p className="font-semibold capitalize">{pkg.timeToEffect}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Complexity</p>
                      <p className="font-semibold capitalize">{pkg.implementationComplexity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Package" : "Create Custom Package"}</DialogTitle>
                <DialogDescription>
                  Define a new intervention package with your own parameters and assumptions
                </DialogDescription>
              </DialogHeader>

              {errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-900 text-sm">
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Package Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Agricultural Extension + Microfinance"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the intervention"
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="unitCost" className="text-sm font-semibold">
                    Unit Cost per Beneficiary per Year: ${formData.unitCost}
                  </Label>
                  <Slider
                    value={[formData.unitCost]}
                    onValueChange={(value) => setFormData({ ...formData, unitCost: value[0] })}
                    min={50}
                    max={2000}
                    step={50}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="timeToEffect" className="text-sm font-semibold">
                    Time-to-Effect
                  </Label>
                  <Select
                    value={formData.timeToEffect}
                    onValueChange={(value) =>
                      setFormData({ ...formData, timeToEffect: value as "short" | "medium" | "long" })
                    }
                  >
                    <SelectTrigger id="timeToEffect" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (0–1 year)</SelectItem>
                      <SelectItem value="medium">Medium (1–2 years)</SelectItem>
                      <SelectItem value="long">Long (2–4 years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold">
                    Poverty Effectiveness: {(formData.povertyEffectiveness * 100).toFixed(0)}%
                  </Label>
                  <Slider
                    value={[formData.povertyEffectiveness]}
                    onValueChange={(value) => setFormData({ ...formData, povertyEffectiveness: value[0] })}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected poverty impact (0 = none, 1 = very strong)
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold">
                    Employment Effectiveness: {(formData.employmentEffectiveness * 100).toFixed(0)}%
                  </Label>
                  <Slider
                    value={[formData.employmentEffectiveness]}
                    onValueChange={(value) => setFormData({ ...formData, employmentEffectiveness: value[0] })}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected employment impact (0 = none, 1 = very strong)
                  </p>
                </div>

                <div>
                  <Label htmlFor="complexity" className="text-sm font-semibold">
                    Implementation Complexity
                  </Label>
                  <Select
                    value={formData.implementationComplexity}
                    onValueChange={(value) =>
                      setFormData({ ...formData, implementationComplexity: value as "low" | "medium" | "high" })
                    }
                  >
                    <SelectTrigger id="complexity" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="confidence" className="text-sm font-semibold">
                    Evidence Confidence
                  </Label>
                  <Select
                    value={formData.evidenceConfidence}
                    onValueChange={(value) =>
                      setFormData({ ...formData, evidenceConfidence: value as "high" | "medium" | "lower" })
                    }
                  >
                    <SelectTrigger id="confidence" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="lower">Lower</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="operationalNote" className="text-sm font-semibold">
                    Operational Note
                  </Label>
                  <Textarea
                    id="operationalNote"
                    value={formData.operationalNote}
                    onChange={(e) => setFormData({ ...formData, operationalNote: e.target.value })}
                    placeholder="e.g., 'Requires strong private sector engagement'"
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSavePackage} className="flex-1">
                    {editingId ? "Update Package" : "Create Package"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsOpen(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
