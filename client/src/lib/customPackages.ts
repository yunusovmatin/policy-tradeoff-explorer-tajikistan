/**
 * CUSTOM PACKAGE MANAGEMENT
 * 
 * Allows users to create, save, and manage custom intervention packages
 * beyond the three default options (Social Protection, Employment, Resilience).
 */

export interface CustomPackage {
  id: string;
  name: string;
  description: string;
  unitCost: number;
  timeToEffect: "short" | "medium" | "long";
  povertyEffectiveness: number; // 0-1 scale
  employmentEffectiveness: number; // 0-1 scale
  implementationComplexity: "low" | "medium" | "high";
  evidenceConfidence: "high" | "medium" | "lower";
  operationalNote: string;
  createdAt: Date;
}

export interface CustomPackageLibrary {
  packages: CustomPackage[];
  lastModified: Date;
}

/**
 * Load custom packages from localStorage
 */
export function loadCustomPackages(): CustomPackage[] {
  try {
    const stored = localStorage.getItem("customPackages");
    if (!stored) return [];
    const data = JSON.parse(stored);
    return data.packages || [];
  } catch (error) {
    console.error("Error loading custom packages:", error);
    return [];
  }
}

/**
 * Save custom packages to localStorage
 */
export function saveCustomPackages(packages: CustomPackage[]): void {
  try {
    const library: CustomPackageLibrary = {
      packages,
      lastModified: new Date(),
    };
    localStorage.setItem("customPackages", JSON.stringify(library));
  } catch (error) {
    console.error("Error saving custom packages:", error);
  }
}

/**
 * Create a new custom package
 */
export function createCustomPackage(
  name: string,
  description: string,
  unitCost: number,
  timeToEffect: "short" | "medium" | "long",
  povertyEffectiveness: number,
  employmentEffectiveness: number,
  implementationComplexity: "low" | "medium" | "high",
  evidenceConfidence: "high" | "medium" | "lower",
  operationalNote: string
): CustomPackage {
  return {
    id: `custom-${Date.now()}`,
    name,
    description,
    unitCost,
    timeToEffect,
    povertyEffectiveness: Math.min(Math.max(povertyEffectiveness, 0), 1),
    employmentEffectiveness: Math.min(Math.max(employmentEffectiveness, 0), 1),
    implementationComplexity,
    evidenceConfidence,
    operationalNote,
    createdAt: new Date(),
  };
}

/**
 * Delete a custom package
 */
export function deleteCustomPackage(packageId: string): void {
  const packages = loadCustomPackages();
  const filtered = packages.filter((p) => p.id !== packageId);
  saveCustomPackages(filtered);
}

/**
 * Update a custom package
 */
export function updateCustomPackage(updated: CustomPackage): void {
  const packages = loadCustomPackages();
  const index = packages.findIndex((p) => p.id === updated.id);
  if (index !== -1) {
    packages[index] = updated;
    saveCustomPackages(packages);
  }
}

/**
 * Convert effectiveness score to directional indicator
 */
export function effectivenessToDirection(
  value: number
): "↑" | "→" | "↓" {
  if (value >= 0.5) return "↑";
  if (value > -0.5) return "→";
  return "↓";
}

/**
 * Validate custom package data
 */
export function validateCustomPackage(pkg: Partial<CustomPackage>): string[] {
  const errors: string[] = [];

  if (!pkg.name || pkg.name.trim().length === 0) {
    errors.push("Package name is required");
  }

  if (!pkg.description || pkg.description.trim().length === 0) {
    errors.push("Package description is required");
  }

  if (!pkg.unitCost || pkg.unitCost <= 0) {
    errors.push("Unit cost must be greater than 0");
  }

  if (!pkg.timeToEffect) {
    errors.push("Time-to-effect is required");
  }

  if (
    pkg.povertyEffectiveness === undefined ||
    pkg.povertyEffectiveness < 0 ||
    pkg.povertyEffectiveness > 1
  ) {
    errors.push("Poverty effectiveness must be between 0 and 1");
  }

  if (
    pkg.employmentEffectiveness === undefined ||
    pkg.employmentEffectiveness < 0 ||
    pkg.employmentEffectiveness > 1
  ) {
    errors.push("Employment effectiveness must be between 0 and 1");
  }

  if (!pkg.implementationComplexity) {
    errors.push("Implementation complexity is required");
  }

  if (!pkg.evidenceConfidence) {
    errors.push("Evidence confidence is required");
  }

  return errors;
}

/**
 * Export custom packages as JSON
 */
export function exportCustomPackages(packages: CustomPackage[]): string {
  return JSON.stringify(packages, null, 2);
}

/**
 * Import custom packages from JSON
 */
export function importCustomPackages(jsonString: string): CustomPackage[] {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      throw new Error("Invalid format: expected array of packages");
    }
    return data;
  } catch (error) {
    throw new Error(`Failed to import packages: ${error}`);
  }
}
