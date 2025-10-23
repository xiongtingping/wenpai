/**
 * 多版本生成性能遥测（A/B）
 * - 记录每次生成的启动时间、完成时间（作为TTFB与总耗时的近似）
 * - 计算 p50 / p95 分位
 */

export type VersionId = 'version-a' | 'version-b';

interface Sample {
  startedAt: number;
  completedAt: number;
  ttfbMs: number;      // 非流式近似为完成时间
  durationMs: number;  // 与 ttfbMs 相同（占位，若未来添加流式可区分）
  success: boolean;
}

class ABPerfAggregator {
  private data: Record<VersionId, Sample[]> = {
    'version-a': [],
    'version-b': []
  };
  private starts: Map<string, number> = new Map();

  recordStart(runId: string, version: VersionId): void {
    this.starts.set(`${runId}:${version}`, Date.now());
  }

  recordComplete(runId: string, version: VersionId, success: boolean): void {
    const key = `${runId}:${version}`;
    const startedAt = this.starts.get(key) ?? Date.now();
    const completedAt = Date.now();
    const ttfbMs = completedAt - startedAt;
    const durationMs = ttfbMs;
    this.data[version].push({ startedAt, completedAt, ttfbMs, durationMs, success });

    // 限制内存占用
    if (this.data[version].length > 2000) {
      this.data[version] = this.data[version].slice(-1000);
    }
    this.starts.delete(key);
  }

  summarize(): {
    countA: number; countB: number;
    p50: Record<VersionId, number>;
    p95: Record<VersionId, number>;
  } {
    const p = (arr: number[], q: number) => {
      if (!arr.length) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(q * (sorted.length - 1))));
      return sorted[idx];
    };

    const a = this.data['version-a'].map(s => s.ttfbMs);
    const b = this.data['version-b'].map(s => s.ttfbMs);

    return {
      countA: a.length,
      countB: b.length,
      p50: { 'version-a': p(a, 0.5), 'version-b': p(b, 0.5) },
      p95: { 'version-a': p(a, 0.95), 'version-b': p(b, 0.95) }
    };
  }

  summarizeAndLog(runId?: string): void {
    const s = this.summarize();
    // 只做开发期控制台输出，避免污染生产日志系统
    // 如需持久化，可接入现有 performanceMonitoringService
    // 或统一 TelemetryService（见 services/*）
    // runId 仅用于将本次运行与历史区分的辅助标记
    // eslint-disable-next-line no-console
    console.log(`📊 A/B生成性能汇总${runId ? ` [${runId}]` : ''}: `,
      `countA=${s.countA}, countB=${s.countB}, ` +
      `p50(A/B)=${s.p50['version-a']}/${s.p50['version-b']}ms, ` +
      `p95(A/B)=${s.p95['version-a']}/${s.p95['version-b']}ms`
    );
  }
}

export const abPerf = new ABPerfAggregator();

