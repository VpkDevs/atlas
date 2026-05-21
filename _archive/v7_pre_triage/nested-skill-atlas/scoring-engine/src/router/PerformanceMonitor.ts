import fs from 'fs';
import path from 'path';

export interface AgentMetrics {
  agent_id: string;
  name: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  success_rate: number;
  avg_execution_time: number;
  reliability_score: number;
  executions_by_type: Record<string, number>;
  failure_reasons: Record<string, number>;
}

export class PerformanceMonitor {
  private metricsPath: string;
  private metrics: Map<string, AgentMetrics> = new Map();

  constructor(stateDir: string) {
    this.metricsPath = path.join(stateDir, 'agent_metrics.json');
    this.loadMetrics();
  }

  private loadMetrics() {
    if (fs.existsSync(this.metricsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
        Object.entries(data).forEach(([id, metric]) => {
          this.metrics.set(id, metric as AgentMetrics);
        });
      } catch (e) {
        console.error(`[PerformanceMonitor] Failed to load metrics: ${e}`);
      }
    }
  }

  private saveMetrics() {
    try {
      const data = Object.fromEntries(this.metrics);
      fs.writeFileSync(this.metricsPath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`[PerformanceMonitor] Failed to save metrics: ${e}`);
    }
  }

  recordExecution(agentId: string, name: string, taskType: string, result: { success: boolean; executionTime: number; errorType?: string }) {
    let metrics = this.metrics.get(agentId);
    
    if (!metrics) {
      metrics = {
        agent_id: agentId,
        name: name,
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        success_rate: 0,
        avg_execution_time: 0,
        reliability_score: 0.5,
        executions_by_type: {},
        failure_reasons: {}
      };
    }

    metrics.total_executions++;
    metrics.executions_by_type[taskType] = (metrics.executions_by_type[taskType] || 0) + 1;

    if (result.success) {
      metrics.successful_executions++;
    } else {
      metrics.failed_executions++;
      if (result.errorType) {
        metrics.failure_reasons[result.errorType] = (metrics.failure_reasons[result.errorType] || 0) + 1;
      }
    }

    metrics.success_rate = metrics.successful_executions / metrics.total_executions;
    
    metrics.avg_execution_time = (
      (metrics.avg_execution_time * (metrics.total_executions - 1)) + result.executionTime
    ) / metrics.total_executions;

    // Reliability score (weighted moving average)
    const weight = 0.1;
    metrics.reliability_score = (
      (1 - weight) * metrics.reliability_score + 
      weight * (result.success ? 1 : 0)
    );

    this.metrics.set(agentId, metrics);
    this.saveMetrics();
  }

  getAgentScore(agentId: string, taskType: string): number {
    const metrics = this.metrics.get(agentId);
    if (!metrics) return 0.5;

    const weights = {
      success_rate: 0.4,
      reliability_score: 0.3,
      speed_factor: 0.2,
      specialization_factor: 0.1
    };

    const speedFactor = Math.max(0, 1 - (metrics.avg_execution_time / 300000)); // Normalize to 5 mins
    const specializationFactor = metrics.executions_by_type[taskType] 
      ? Math.min(1, metrics.executions_by_type[taskType] / 10) 
      : 0.5;

    return (
      weights.success_rate * metrics.success_rate +
      weights.reliability_score * metrics.reliability_score +
      weights.speed_factor * speedFactor +
      weights.specialization_factor * specializationFactor
    );
  }

  getAllMetrics(): AgentMetrics[] {
    return Array.from(this.metrics.values());
  }
}
