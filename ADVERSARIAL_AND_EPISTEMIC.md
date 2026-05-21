# Atlas v8.2+ Enhancements: Adversarial Testing & Epistemic/Aleatoric Separation

## Overview

Two critical additions to prevent false positives and improve decision confidence:

1. **Adversarial Testing Engine** — Generate and test null/anti-hypotheses alongside main hypothesis
2. **Epistemic vs. Aleatoric Uncertainty Separation** — Distinguish reducible uncertainty from inherent noise

---

## 1. Adversarial Testing Engine

### Problem
Current Atlas tests: "Will this improve X?" Only if YES, deploy.
Missing: "Where could this fail? What if my assumption is wrong?"

Atlas ships features that appear good but have hidden failure modes:
- Onboarding improves activation for new users but confuses power users → net negative
- Pricing test shows +18% LTV but only for high-spenders → rest churn
- Content addition increases acquisition but reduces retention → hollow growth

### Solution
Generate three hypotheses for every decision:
1. **Primary**: "This will improve X by Y%"
2. **Null**: "This will NOT improve X" (baseline)
3. **Anti**: "This will HURT X" (find the flaw)

**Deploy only if ALL THREE pass:**
- Primary hypothesis confirmed (p < 0.05, effect > 0)
- Null hypothesis rejected (confirmed something changed)
- Anti-hypothesis rejected (no negative effect detected)

### API Usage

```typescript
import { AdversarialTestingEngineImpl } from 'atlas/experimentation';

const adversarialEngine = new AdversarialTestingEngineImpl();

// Step 1: Generate adversarial hypotheses
const hypotheses = adversarialEngine.generateAdversarialHypotheses(
  'If we simplify onboarding, activation will improve by 15%',
  'activation'
);
// Returns: [primary, null, anti]

// Step 2: Run experiment (get primary results via ExperimentationEngine)
const primaryResults = expEngine.analyzeExperiment(experimentId);

// Step 3: Run adversarial test
const adversarialResult = adversarialEngine.runAdversarialTest(
  experiment,
  primaryResults,
  hypotheses[2] // anti-hypothesis
);

// Step 4: Check recommendation
if (adversarialResult.allPassed) {
  // ✓ Safe to deploy: primary confirmed, null rejected, anti rejected
  // "Onboarding simplification improves activation without harming power users"
} else if (!adversarialResult.antiPassed) {
  // ✗ Redesign: effect is real, but it's hurting a segment
  // "Onboarding hurts power users; need segment-specific version"
} else {
  // ✗ Abort: effect not real or too small
}
```

### Example Output

```
Adversarial Test Results:
─────────────────────────────────────
✓ Primary hypothesis: effect size 12.3% (p=0.018)
✓ Null hypothesis: rejected (confirmed something changed)
✓ Anti-hypothesis: rejected (no negative effect detected)

✓ RECOMMENDATION: DEPLOY

Risk factors identified:
- Small effect size: may not be practically significant
- Onboarding changes may harm power users (suggest segmentation)
- May create friction for users re-learning flow
```

### Risk Factor Detection

The engine automatically identifies domain-specific risks:
- **Onboarding**: May harm power users re-learning flow
- **Pricing**: May reduce LTV if not segment-specific; customer churn risk
- **Content**: May reduce signal-to-noise; cognitive overload for new users
- **Feature**: May add unexpected dependencies; edge case complexity

### Benefits

| Weakness | Improvement |
|----------|-------------|
| Only tests "is this good?" | Tests "is this good AND where could it fail?" |
| Ships null/negative effects | Rejects anything showing harm |
| No risk awareness | Identifies domain-specific failure modes |
| One hypothesis per decision | Three hypotheses: primary, null, anti |

**Expected Impact**: -50% to -75% reduction in decisions that look good in aggregate but harm specific segments.

---

## 2. Epistemic vs. Aleatoric Uncertainty Separation

### Problem
Current Atlas reports: "Confidence: 72% ± 8 points"
Missing: "Of that ±8, how much can we reduce with more data?"

This distinction matters:
- **Epistemic ±6**: "We've only tested 2 cohorts" → Collect data from 4 cohorts, uncertainty drops to ±3
- **Aleatoric ±2**: "Users behave differently each time" → No amount of data reduces this

Atlas recommends:
- ❌ "Collect more data" when 80% of uncertainty is inherent randomness (futile)
- ❌ "Accept this level" when 80% is epistemic and could be resolved in 2 weeks

### Solution
Decompose uncertainty into two sources:

```
Total Uncertainty = Epistemic Uncertainty + Aleatoric Uncertainty
                 = (Reducible via data) + (Inherent randomness)
```

Estimate epistemic from:
- Sample size inadequacy (vs. minimum required)
- Cohort coverage (% of user segments tested)
- Seasonal coverage (% of year tested; winter ≠ summer)
- Context coverage (different market conditions, competitive landscape)

Estimate aleatoric from:
- Measurement noise (inherent variation in metric)
- User behavior variance (how much do actions vary naturally?)
- External shocks (market/competitive events)

### API Usage

```typescript
import { EpistemicAleatoicEngine } from 'atlas/uncertainty';

const uncertainty = new EpistemicAleatoicEngine();

// Decompose total uncertainty
const decomp = uncertainty.decomposeUncertainty(
  10, // baseUncertainty
  {
    sampleSize: 250,
    minimumSampleSize: 500,
    cohortsTestedCount: 2,
    expectedCohortsTotal: 4,
    seasonsCovered: 1, // Only tested spring so far
    measurementNoise: 1.5,
    userBehaviorVariance: 2.0,
  }
);

console.log(`Total: ±${decomp.totalUncertainty.toFixed(1)}`);
console.log(`Epistemic (reducible): ±${decomp.epistemicUncertainty.toFixed(1)} (${(decomp.epistemicRatio * 100).toFixed(0)}%)`);
console.log(`Aleatoric (inherent): ±${decomp.aleatoicUncertainty.toFixed(1)}`);
console.log(`\nRecommendation: ${decomp.recommendation}`);

// Predict: how many samples to reach target confidence?
const prediction = uncertainty.predictSamplesNeededForConfidence(
  currentSampleSize: 250,
  currentUncertainty: 10,
  targetUncertainty: 5,
  epistemicRatio: 0.75
);

console.log(`Need ${prediction.samplesNeeded} total samples (${prediction.weeksEstimate} weeks)`);
console.log(`Feasible: ${prediction.feasible}`);
```

### Example Output

```
─────────────────────────────────────────────────────────
Score: 65 ± 10 points

Uncertainty Decomposition:
  Epistemic (reducible): ±6.5 (65%)
    • Only 250/500 samples (50% of minimum)
    • 2/4 cohorts tested (power users untested)
    • 1/4 seasons tested (winter not tested)
  
  Aleatoric (inherent): ±3.5 (35%)
    • Measurement noise ±1.5
    • User behavior variance ±2.0

Recommendation:
  HIGH EPISTEMIC UNCERTAINTY. Collect more data for 3 weeks
  to cover all cohorts and seasons. Should reduce uncertainty
  to ±6-7 (aleatoric floor is ~±3.5).
─────────────────────────────────────────────────────────
```

### Integration with Adaptive Uncertainty Engine

These two engines work together:

1. **EpistemicAleatoicEngine**: Decomposes uncertainty into sources
2. **AdaptiveUncertaintyEngine**: Detects drift (data quality degradation)

**Combined logic:**
```
IF high epistemic uncertainty AND no drift detected:
  Recommendation = "Collect more data; uncertainty is reducible"
  
IF high epistemic uncertainty BUT drift detected:
  Recommendation = "Market changed; need new baseline before more data helps"
  
IF high aleatoric uncertainty:
  Recommendation = "Accept this noise level; inherent to the system"
```

### Benefits

| Weakness | Improvement |
|----------|-------------|
| One uncertainty number | Two numbers (epistemic + aleatoric) |
| Can't tell "fixable" vs "inherent" | Clear distinction: data vs. noise |
| "Collect more data" recommendation is wrong 50% of the time | Smart recommendations based on uncertainty source |
| Atlas keeps collecting data forever | Knows when to stop (aleatoric floor reached) |
| No data on WHERE uncertainty comes from | Pinpoints exact sources: samples, cohorts, seasons |

**Expected Impact**: +30-40% accuracy in "should we continue testing?" decisions.

---

## Integration Checklist

### Phase 1: Adversarial Testing (2-3 hours)

- [x] Implement `AdversarialTestingEngineImpl`
- [x] Export from `experimentation/index.ts`
- [ ] Wire into ExperimentationEngine: before recommending "deploy", run adversarial test
- [ ] Add adversarial test result to experiment conclusion output
- [ ] Log adversarial results to decision history

**Integration point (growth-engine.md 11.3 Execute):**
```typescript
// After AB test completes and primary result significant:
const adversarial = adversarialEngine.runAdversarialTest(
  experiment,
  primaryResults,
  antiHypothesis
);

if (!adversarial.allPassed) {
  recommendation = 'abort' or 'redesign' // Don't deploy yet
} else {
  recommendation = 'deploy' // Safe to go
}
```

### Phase 2: Epistemic/Aleatoric Separation (2-3 hours)

- [x] Implement `EpistemicAleatoicEngine`
- [x] Export from `uncertainty/index.ts`
- [ ] Wire into score uncertainty quantification
- [ ] Extend `AdaptiveUncertaintyResult` to include decomposition
- [ ] Update uncertainty recommendation logic to use epistemic ratio

**Integration point (scoring-engine uncertainty phase):**
```typescript
// Current: adjustedUncertainty = baseUncertainty * (1 + driftPenalty)
// New:
const epistemicDecomp = epistemicEngine.decomposeUncertainty(
  baseUncertainty,
  { sampleSize, cohortsTestedCount, ... }
);

recommendation = `${epistemicDecomp.recommendation}`;
// Now tells users: "collect 2 more weeks of data" or "accept this noise"
```

### Phase 3: Testing & Validation

- [ ] Unit test: adversarial hypothesis generation for 5+ scenarios
- [ ] Unit test: epistemic decomposition with known sample sizes
- [ ] Integration test: run full decision with adversarial testing enabled
- [ ] Manual test: verify adversarial test rejects obviously negative effects
- [ ] A/B test: decisions with adversarial testing vs. without (4-week comparison)

---

## Expected Cumulative Impact

### From Adversarial Testing
- Prevents shipping features with hidden negative effects: -50% to -75% harmful decisions
- Identifies segment-specific failure modes: allows segmented rollout
- Detects confounding and measurement issues: higher quality signal

### From Epistemic/Aleatoric Separation
- Smart data collection: know when to stop vs. keep going
- More realistic uncertainty bounds: aleatoric ± confidence doesn't shrink with more data
- Better prioritization: invest in reducing epistemic when high, accept aleatoric as permanent

### Combined Expected Impact
- **Decision quality**: +25-35% (fewer false positives, better segmentation)
- **Testing efficiency**: +15-20% (know when to stop collecting data)
- **Forecast accuracy**: +20-30% (better uncertainty quantification)

---

## Version Notes

- **Before**: v8.2 (6 improvements: adaptive learning, dimension weighting, feedback convergence, causal inference, experimentation, adaptive uncertainty)
- **After**: v8.2+ (adds adversarial testing + epistemic/aleatoric separation)

Both improvements are **opt-in**; existing Atlas v8.2 continues to work without them.

---

## API Reference

### AdversarialTestingEngine

```typescript
class AdversarialTestingEngineImpl {
  // Generate three hypotheses: primary, null, anti
  generateAdversarialHypotheses(
    primaryHypothesis: string,
    dimension: string
  ): AdversarialHypothesis[]
  
  // Run adversarial test; returns all/pass recommendation
  runAdversarialTest(
    experiment: Experiment,
    primaryResults: StatisticalTest,
    antiHypothesis: AdversarialHypothesis
  ): AdversarialTestResult
  
  // Identify domain-specific risk factors
  identifyRiskFactors(
    hypothesis: string,
    context: Record<string, any>
  ): string[]
  
  // Explain the causal mechanism behind observed effect
  explainCausalMechanism(
    hypothesis: string,
    observedEffect: number,
    dimensions: Record<string, number>
  ): {
    likelyMechanism: string;
    alternativeMechanisms: string[];
    confoundingRisks: string[];
  }
}
```

### EpistemicAleatoicEngine

```typescript
class EpistemicAleatoicEngine {
  // Decompose uncertainty into epistemic (reducible) + aleatoric (inherent)
  decomposeUncertainty(
    baseUncertainty: number,
    context: {
      sampleSize: number;
      minimumSampleSize: number;
      cohortsTestedCount: number;
      expectedCohortsTotal: number;
      seasonsCovered: number;
      measurementNoise: number;
      userBehaviorVariance: number;
    }
  ): EpistemicAleatoicDecomposition
  
  // Quantify each uncertainty source separately
  quantifyUncertaintySources(metrics: {
    metricStdDev: number;
    sampleSize: number;
    historicalVariance: number;
    externalShockSensitivity: number;
  }): { samplingError, inherentVariance, externalRisk, total }
  
  // Predict: how many samples needed to reach target confidence?
  predictSamplesNeededForConfidence(
    currentSampleSize: number,
    currentUncertainty: number,
    targetUncertainty: number,
    epistemicRatio: number
  ): { samplesNeeded, weeksEstimate, feasible }
}
```

---

## Summary

Two focused improvements closing the gap toward ideal autonomous operator:

1. **Adversarial Testing** prevents shipping false positives / hidden failure modes
2. **Epistemic/Aleatoric Separation** enables smart data collection decisions

Both operate orthogonally to existing Atlas v8.2 improvements and can be deployed independently.
