import ReactECharts from 'echarts-for-react';

import { scenarios } from '../../shared/mock/demoData';
import { GlassCard } from '../../shared/ui/GlassCard';
import { SectionTitle } from '../../shared/ui/SectionTitle';
import { useDemoStore } from '../../store/demoStore';

export function WeeklyReportPanel() {
  const scenarioId = useDemoStore((state) => state.scenarioId);
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];

  const chartOption = {
    grid: { left: 30, right: 18, top: 26, bottom: 24 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: scenario.weekly.map((item) => item.day),
      axisLine: { lineStyle: { color: '#5f7096' } },
      axisLabel: { color: '#d6e2ff' },
    },
    yAxis: [
      {
        type: 'value',
        name: '疼痛',
        min: 0,
        max: 10,
        axisLabel: { color: '#d6e2ff' },
        splitLine: { lineStyle: { color: 'rgba(154, 176, 219, 0.2)' } },
      },
      {
        type: 'value',
        name: '步数',
        axisLabel: { color: '#d6e2ff' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '疼痛强度',
        type: 'line',
        smooth: true,
        data: scenario.weekly.map((item) => item.pain),
        lineStyle: { color: '#ff7070', width: 3 },
        itemStyle: { color: '#ff7070' },
        areaStyle: { color: 'rgba(255, 112, 112, 0.2)' },
      },
      {
        name: '步数',
        type: 'bar',
        yAxisIndex: 1,
        data: scenario.weekly.map((item) => item.steps),
        itemStyle: { color: '#4ad1c2', borderRadius: [6, 6, 0, 0] },
        barWidth: 18,
      },
    ],
  };

  return (
    <div className="feature-grid feature-grid--weekly" id="weekly-section">
      <GlassCard>
        <SectionTitle
          kicker="Scene D / Weekly Summary"
          title="一键生成适老周报"
          description="趋势图 + 三条重点结论 + 一条可执行建议，便于患者与家属快速理解。"
        />

        <div className="weekly-layout">
          <div className="weekly-chart">
            <ReactECharts option={chartOption} style={{ width: '100%', height: 300 }} />
          </div>

          <aside className="weekly-summary">
            <h3>AI 周报摘要</h3>
            <ul>
              {scenario.reportBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button type="button" className="primary-btn">
              导出给医生/家属
            </button>
          </aside>
        </div>
      </GlassCard>
    </div>
  );
}
