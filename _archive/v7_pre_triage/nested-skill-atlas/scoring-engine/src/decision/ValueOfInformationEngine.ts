/**
 * Value of Information (VOI) Engine
 *
 * Closes gap #12 from IDEAL_VS_ACTUAL.md: "should we test this?"
 *
 * Current Atlas: tests every high-impact action.
 * Problem: testing has cost (time, opportunity, complexity).
 *  - Testing "button color" wastes 2 days for a $50 lift.
 *  - Testing "pricing change" pays off massively but rare.
 *
 * VOI framework: only test if Expected Value of Information > Cost of Testing.
 *
 * VOI = (uncertainty reduction × decision value) - cost of test
 *     = (confidence_lift × |effect_size|) - test_cost
 *
 * If VOI > 0: test it.
 * If VOI < 0: use prior knowledge; don't test.
 */

export interface TestOption {
  id: string;
  description: string;
  expectedImpact: number; // Dollar value of correct decision
  priorConfidence: number; // 0-1: how sure are we before testing?
  testCost: number; // Dollar value (time, opportunity, complexity)
  testDurationDays: number;
  decisionReversibility: 'easy' | 'medium' | 'hard'; // How costly to undo if wrong?
}

export interface VOIAnalysis {
  testOption: TestOption;
  posteriorConfidence: number; // Expected confidence after test
  confidenceLift: number; // posterior - prior
  expectedValueOfInfo: number; // EVoI
  netValue: number; // EVoI - testCost
  recommendation: 'test' | 'skip_use_prior' | 'gather_more_priors_first';
  reasoning: string;
}

export interface VOIComparison {
  options: VOIAnalysis[];
  ranked: VOIAnalysis[];
  recommendedAction: string;
  testingBudgetUsed: number;
  testingBudgetRemaining: number;
}

export class ValueOfInformationEngine {
  private testingBudget: number;
  private testingBudgetUsed: number = 0;

  constructor(testingBudgetDollars: number = 10000) {
    this.testingBudget = testingBudgetDollars;
  }

  /**
   * Analyze a single test option: should we run it?
   */
  analyzeOption(option: TestOption): VOIAnalysis {
    // Estimate posterior confidence: how confident will we be AFTER testing?
    // High-impact + low-prior = big confidence gain from testing
    const posteriorConfidence = this.estimatePosteriorConfidence(option);
    const confidenceLift = posteriorConfidence - option.priorConfidence;

    // Expected Value of Information
    // VOI = (confidence_lift × expected_impact × reversibility_factor)
    const reversibilityFactor = this.reversibilityMultiplier(option.decisionReversibility);
    const expectedValueOfInfo =
      confidenceLift * Math.abs(option.expectedImpact) * reversibilityFactor;

    const netValue = expectedValueOfInfo - option.testCost;

    let recommendation: VOIAnalysis['recommendation'] = 'skip_use_prior';
    let reasoning = '';

    if (netValue > 0) {
      recommendation = 'test';
      reasoning = `VOI ($${expectedValueOfInfo.toFixed(0)}) > test cost ($${option.testCost}). Net value: $${netValue.toFixed(0)}.`;
    } else if (option.priorConfidence < 0.3) {
      recommendation = 'gather_more_priors_first';
      reasoning = `Prior confidence too low (${(option.priorConfidence * 100).toFixed(0)}%); gather more historical data before testing.`;
    } else {
      recommendation = 'skip_use_prior';
      reasoning = `VOI ($${expectedValueOfInfo.toFixed(0)}) < test cost ($${option.testCost}). Use prior knowledge instead.`;
    }

    return {
      testOption: option,
      posteriorConfidence,
      confidenceLift,
      expectedValueOfInfo,
      netValue,
      recommendation,
      reasoning,
    };
  }

  /**
   * Compare multiple test options and rank by VOI.
   * Allocates testing budget to highest-value tests.
   */
  compareOptions(options: TestOption[]): VOIComparison {
    const analyses = options.map((opt) => this.analyzeOption(opt));

    // Rank by net value (VOI minus cost)
    const ranked = [...analyses].sort((a, b) => b.netValue - a.netValue);

    // Determine which to recommend given budget
    let budgetUsed = this.testingBudgetUsed;
    let budgetRemaining = this.testingBudget - budgetUsed;
    const recommendedTests: VOIAnalysis[] = [];

    for (const analysis of ranked) {
      if (
        analysis.recommendation === 'test' &&
        analysis.testOption.testCost <= budgetRemaining
      ) {
        recommendedTests.push(analysis);
        budgetUsed += analysis.testOption.testCost;
        budgetRemaining -= analysis.testOption.testCost;
      }
    }

    const recommendedAction = recommendedTests.length > 0
      ? `Run ${recommendedTests.length} test(s): ${recommendedTests.map((t) => t.testOption.description).join(', ')}`
      : 'No tests have positive VOI; use prior knowledge for all decisions';

    return {
      options: analyses,
      ranked,
      recommendedAction,
      testingBudgetUsed: budgetUsed,
      testingBudgetRemaining: budgetRemaining,
    };
  }

  /**
   * Estimate posterior confidence after testing.
   * Tests with stronger expected signals (high effect size) gain more confidence.
   */
  private estimatePosteriorConfidence(option: TestOption): number {
    // Base posterior: prior + uncertainty reduction
    // Larger expected impacts = clearer signals = more confidence gain
    const signalStrength = Math.min(1, Math.abs(option.expectedImpact) / 1000); // Normalize
    const durationBonus = Math.min(0.2, option.testDurationDays / 30); // Longer tests = more confidence

    // Conservative estimate: never assume 100% confidence
    const maxPosterior = 0.95;
    const lift = (1 - option.priorConfidence) * signalStrength * 0.6 + durationBonus;

    return Math.min(maxPosterior, option.priorConfidence + lift);
  }

  /**
   * Reversibility affects value: easy-to-undo decisions are less risky if wrong.
   * Hard-to-undo decisions warrant more testing investment.
   */
  private reversibilityMultiplier(reversibility: TestOption['decisionReversibility']): number {
    switch (reversibility) {
      case 'easy': return 0.7; // Less testing needed; we can fix it later
      case 'medium': return 1.0;
      case 'hard': return 1.5; // More testing needed; mistakes are expensive
    }
  }

  /**
   * Compute "regret" of not testing: how much would we lose if our prior is wrong?
   */
  computeRegret(option: TestOption): {
    expectedRegret: number;
    worstCaseRegret: number;
    recommendation: string;
  } {
    // Expected regret = (1 - priorConfidence) × expectedImpact
    // If we're 70% confident and skip test, 30% chance we're wrong → 30% × impact
    const expectedRegret = (1 - option.priorConfidence) * Math.abs(option.expectedImpact);
    const worstCaseRegret = Math.abs(option.expectedImpact); // If our prior is completely wrong

    let recommendation = 'acceptable to skip test';
    if (expectedRegret > option.testCost * 3) {
      recommendation = 'regret of skipping test is too high; test it';
    } else if (worstCaseRegret > option.testCost * 10) {
      recommendation = 'tail risk is large; test even though expected regret is moderate';
    }

    return { expectedRegret, worstCaseRegret, recommendation };
  }

  /**
   * Reset testing budget for a new period.
   */
  resetBudget(newBudgetDollars: number): void {
    this.testingBudget = newBudgetDollars;
    this.testingBudgetUsed = 0;
  }
}
