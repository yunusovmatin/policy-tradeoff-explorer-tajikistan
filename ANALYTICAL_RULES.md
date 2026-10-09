# Inspectable demonstration conventions

All numerical rules are illustrative and uncalibrated. The implementation in client/src/lib/tradeoffLogic.ts and tradeoffLogicEnhanced.ts is authoritative.

Conversion changes per-participant pathways. Macro context, prices, capacity and horizon affect pathways. Placement intensity applies to Option B; adaptation applies to Option C. Budget, overhead, costs, capacity and leakage affect illustrative resource reach. Targeting and population weighting are context only. Comparison focus selects the primary pathway; feasibility determines eligibility after analytical ordering.

Direct budget = budget in millions times one million times the remaining share after overhead. Funded places = integer part of direct budget divided by price-adjusted unit cost. Reached places = integer part of funded places times delivery capacity times the remaining share after leakage. Delivery factors: 0.4 / 0.65 / 0.85. High-price conditions multiply cost by 1.2. Reach: Low below 2,500, Medium below 10,000, High otherwise. There is no population denominator.

Conversion = selected 15 / 30 / 45 value divided by 30, times capacity conversion 0.8 / 1 / 1.15. Macro factors: adverse 0.7, baseline 1, favorable 1.3. High-price pathway factor: 0.85. Placement factors: 1 / 1.15 / 1.3. Adaptation factors: 0.7 / 1 / 1.4. Horizon factors: 0.35 / 0.65 / 1.

Option A emphasizes short-term poverty relief; B employment and placement; C longer-term adaptation. These qualitative design choices motivate asymmetric demonstration coefficients but do not validate their magnitudes. Exact formulas are in source; computed indices are in the CSV. Strength: Low below 0.5, Medium below 0.9, High otherwise. Direction thresholds: improvement 0.5, deterioration -0.5. Current nonnegative formulas do not generate deterioration.

Ordering compares selected pathway strength first. For resilience only, equal strength bands are compared by categorical shock robustness before lower implementation risk and broader reach. Other focuses use risk and reach after strength. Equal complete profiles remain tied; underlying numeric indices never break ties. Provisional evidence judgments are not ordering scores.

Without additional constraints every option is eligible. Moderate constraints exclude B at low capacity and C except at high capacity. Severe constraints exclude B and C, and A at low capacity. Medium feasibility remains eligible; Low is excluded. No eligible option means no fallback. Second-best requires a unique first group, unique second group and the actual second option becoming the unique eligible leader.

Sensitivity separately applies adverse macro context, low capacity and high leakage while holding comparison focus fixed. Confidence checks analytical/eligible leader stability, pathway changes, ties, severity and whether alternatives are distinct. It summarizes rule behavior, not probability or scientific confidence.

Placement intensity does not automatically change unit cost. Cost must be selected independently to reflect the assumed design. Session scenario comparison is explicitly pre-feasibility; institutional eligibility and confidence must be reviewed in Results for each scenario.
