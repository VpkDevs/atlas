import { PerformanceMonitor } from './PerformanceMonitor';

export interface Agent {
  id: string;
  name: string;
  capabilities: string[];
  health: {
    status: 'available' | 'busy' | 'offline';
    current_load: number;
  };
  cost: {
    tier: 'free' | 'low' | 'medium' | 'high';
  };
}

export interface TaskAnalysis {
  taskType: string;
  requiredCapabilities: string[];
  urgency: 'normal' | 'high' | 'critical';
  costSensitivity: 'low' | 'medium' | 'high';
}

export class IntelligentRouter {
  private monitor: PerformanceMonitor;
  private agents: Agent[] = [
    {
      id: 'atlas-ops',
      name: 'Atlas Ops',
      capabilities: ['infrastructure', 'deployment', 'security', 'backup'],
      health: { status: 'available', current_load: 0.1 },
      cost: { tier: 'free' }
    },
    {
      id: 'atlas-growth',
      name: 'Atlas Growth',
      capabilities: ['marketing', 'content', 'analytics', 'seo'],
      health: { status: 'available', current_load: 0.2 },
      cost: { tier: 'free' }
    },
    {
      id: 'atlas-product',
      name: 'Atlas Product',
      capabilities: ['features', 'ux', 'code-sprint', 'onboarding'],
      health: { status: 'available', current_load: 0.3 },
      cost: { tier: 'free' }
    },
    {
      id: 'atlas-wealth',
      name: 'Atlas Wealth',
      capabilities: ['finance', 'pricing', 'cashflow', 'legal'],
      health: { status: 'available', current_load: 0.05 },
      cost: { tier: 'free' }
    }
  ];

  constructor(monitor: PerformanceMonitor) {
    this.monitor = monitor;
  }

  async routeTask(task: string, constraints?: any): Promise<{ agent: Agent; score: number }> {
    const analysis = this.analyzeTask(task, constraints);
    const candidates = this.agents.filter(a => a.health.status === 'available');
    
    const scoredCandidates = candidates.map(agent => ({
      agent,
      score: this.scoreCandidate(agent, analysis)
    }));

    if (scoredCandidates.length === 0) {
      throw new Error('No available agents for task');
    }

    scoredCandidates.sort((a, b) => b.score - a.score);
    
    // Consideration for load balancing
    const top = scoredCandidates[0];
    if (scoredCandidates.length > 1 && top.score - scoredCandidates[1].score < 0.05) {
      return scoredCandidates.sort((a, b) => a.agent.health.current_load - b.agent.health.current_load)[0];
    }

    return top;
  }

  private analyzeTask(task: string, constraints: any = {}): TaskAnalysis {
    const lowerTask = task.toLowerCase();
    const analysis: TaskAnalysis = {
      taskType: 'general',
      requiredCapabilities: [],
      urgency: constraints.urgency || 'normal',
      costSensitivity: constraints.costSensitivity || 'medium'
    };

    if (/\b(deploy|server|infra|backup|security)\b/.test(lowerTask)) {
      analysis.taskType = 'infrastructure';
      analysis.requiredCapabilities.push('infrastructure');
    } else if (/\b(marketing|seo|content|growth)\b/.test(lowerTask)) {
      analysis.taskType = 'marketing';
      analysis.requiredCapabilities.push('marketing');
    } else if (/\b(code|feature|ux|ui|product)\b/.test(lowerTask)) {
      analysis.taskType = 'product';
      analysis.requiredCapabilities.push('features');
    } else if (/\b(money|price|legal|finance|cash)\b/.test(lowerTask)) {
      analysis.taskType = 'finance';
      analysis.requiredCapabilities.push('finance');
    }

    return analysis;
  }

  private scoreCandidate(agent: Agent, analysis: TaskAnalysis): number {
    let score = 0;

    // 1. Performance Score (40%)
    const performanceScore = this.monitor.getAgentScore(agent.id, analysis.taskType);
    score += performanceScore * 0.4;

    // 2. Capability Match (30%)
    const matchCount = analysis.requiredCapabilities.filter(req => 
      agent.capabilities.includes(req)
    ).length;
    const capabilityMatch = analysis.requiredCapabilities.length > 0 
      ? matchCount / analysis.requiredCapabilities.length 
      : 0.5;
    score += capabilityMatch * 0.3;

    // 3. Load Penalty (20%)
    score -= agent.health.current_load * 0.2;

    // 4. Cost Score (10%)
    const costScore = this.calculateCostScore(agent.cost, analysis.costSensitivity);
    score += costScore * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  private calculateCostScore(cost: Agent['cost'], sensitivity: string): number {
    if (cost.tier === 'free') return 1;
    if (sensitivity === 'high') return cost.tier === 'low' ? 0.5 : 0.1;
    return 0.7;
  }
}
