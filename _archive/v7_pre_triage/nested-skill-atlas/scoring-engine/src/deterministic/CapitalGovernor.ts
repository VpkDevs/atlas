import fs from 'fs';
import path from 'path';

export type CapitalMode = 'SCALE' | 'BALANCED' | 'PRESERVE' | 'SURVIVE';

export interface CapitalState {
  as_of: string;
  available_cash: number;
  runway_days: number;
  monthly_net_burn: number;
  burn_volatility: number;
  failed_payment_ratio: number;
  refund_dispute_ratio: number;
  data_confidence: 'high' | 'medium' | 'low';
  open_incidents: {
    p0: number;
    p1: number;
    p2: number;
    p3: number;
  };
}

export interface DecisionResult {
  base_mode: CapitalMode;
  overrides: string[];
  final_mode: CapitalMode;
  reason: string;
  constraints: Record<string, string>;
  experiment_budget_percent: number;
}

export class CapitalGovernor {
  private stateDir: string;

  constructor(stateDir: string) {
    this.stateDir = stateDir;
  }

  evaluate(state: CapitalState): DecisionResult {
    const overrides: string[] = [];
    let finalMode: CapitalMode = this.getBaseMode(state.runway_days);
    const baseMode = finalMode;

    // Apply Overrides in order of priority
    if (state.open_incidents.p0 > 0) {
      finalMode = 'SURVIVE';
      overrides.push('Unresolved P0 Incident');
    } else if (state.open_incidents.p1 > 0) {
      finalMode = this.restrictMode(finalMode, 'PRESERVE');
      overrides.push('Unresolved P1 Incident');
    }

    if (state.data_confidence === 'low') {
      finalMode = this.restrictMode(finalMode, 'PRESERVE');
      overrides.push('Low Data Confidence / Stale Finance Data');
    }

    if (state.failed_payment_ratio > 0.2) {
      finalMode = this.restrictMode(finalMode, 'PRESERVE');
      overrides.push('Failed Payments > 20% of MRR');
    }

    if (state.refund_dispute_ratio > 0.08) {
      finalMode = this.restrictMode(finalMode, 'PRESERVE');
      overrides.push('Refunds/Disputes > 8% of Revenue');
    }

    if (state.burn_volatility > 0.35 && finalMode === 'SCALE') {
      finalMode = 'BALANCED';
      overrides.push('Burn Volatility > 35%');
    }

    const result: DecisionResult = {
      base_mode: baseMode,
      overrides,
      final_mode: finalMode,
      reason: this.generateReason(state, finalMode, overrides),
      constraints: this.getConstraints(finalMode),
      experiment_budget_percent: this.getBudgetPercent(finalMode)
    };

    return result;
  }

  private getBaseMode(runwayDays: number): CapitalMode {
    if (runwayDays >= 180) return 'SCALE';
    if (runwayDays >= 90) return 'BALANCED';
    if (runwayDays >= 45) return 'PRESERVE';
    return 'SURVIVE';
  }

  private restrictMode(current: CapitalMode, floor: CapitalMode): CapitalMode {
    const hierarchy: CapitalMode[] = ['SURVIVE', 'PRESERVE', 'BALANCED', 'SCALE'];
    const currentIndex = hierarchy.indexOf(current);
    const floorIndex = hierarchy.indexOf(floor);
    return hierarchy[Math.min(currentIndex, floorIndex)];
  }

  private getBudgetPercent(mode: CapitalMode): number {
    const budgets = {
      'SCALE': 6,
      'BALANCED': 3,
      'PRESERVE': 1,
      'SURVIVE': 0
    };
    return budgets[mode];
  }

  private getConstraints(mode: CapitalMode): Record<string, string> {
    const constraints: Record<CapitalMode, Record<string, string>> = {
      'SCALE': {
        'paid_tools': 'Allowed with ROI case',
        'growth': 'Multiple lanes',
        'build': 'Revenue or retention linked',
        'portfolio': 'Primary plus secondary prep'
      },
      'BALANCED': {
        'paid_tools': 'Only if payback <= 30d',
        'growth': 'One or two ROI-gated lanes',
        'build': 'Revenue or reliability linked',
        'portfolio': 'Primary plus limited prep'
      },
      'PRESERVE': {
        'paid_tools': 'Blocked unless critical',
        'growth': 'One cash-near lane',
        'build': 'Conversion, retention, uptime only',
        'portfolio': 'Primary only'
      },
      'SURVIVE': {
        'paid_tools': 'Blocked unless uptime/payment/security',
        'growth': 'Only immediate cash recovery',
        'build': 'Critical fixes only',
        'portfolio': 'Active revenue lane only'
      }
    };
    return constraints[mode];
  }

  private generateReason(state: CapitalState, mode: CapitalMode, overrides: string[]): string {
    if (overrides.length > 0) {
      return `Mode adjusted to ${mode} due to: ${overrides.join(', ')}. Runway is ${state.runway_days} days.`;
    }
    return `Mode set to ${mode} based on stable runway of ${state.runway_days} days.`;
  }

  updateProjectContext(slug: string, decision: DecisionResult) {
    const contextPath = path.join(this.stateDir, 'portfolio', slug, 'context.json');
    if (fs.existsSync(contextPath)) {
      try {
        const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
        context.governance = {
          capital_mode: decision.final_mode,
          last_governance_review: new Date().toISOString(),
          constraints: decision.constraints,
          experiment_budget_percent: decision.experiment_budget_percent
        };
        fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));
      } catch (e) {
        console.error(`[CapitalGovernor] Failed to update context for ${slug}: ${e}`);
      }
    }
  }

  logDecision(slug: string, decision: DecisionResult, state: CapitalState) {
    const logPath = path.join(this.stateDir, 'portfolio', slug, 'capital_log.md');
    const content = `
## Capital Governor - ${new Date().toISOString().split('T')[0]}
**Final Mode:** ${decision.final_mode}
**Runway:** ${state.runway_days} days
**Data Confidence:** ${state.data_confidence}
**Overrides:** ${decision.overrides.length > 0 ? decision.overrides.join(', ') : 'none'}
**Allowed Work:** ${decision.constraints.build}
**Blocked Work:** ${decision.final_mode === 'SURVIVE' ? 'All non-critical build' : 'High-burn experiments'}
**Experiment Budget:** ${decision.experiment_budget_percent}% of monthly cash
**Rationale:** ${decision.reason}
**Next Review:** ${decision.final_mode === 'SURVIVE' ? 'Daily' : 'Weekly'}
`;
    fs.appendFileSync(logPath, content);
  }
}
