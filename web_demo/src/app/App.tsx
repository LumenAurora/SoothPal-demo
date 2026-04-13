import { useMemo, useState } from 'react';

import { AIExtractPanel } from '../features/ai-extract/AIExtractPanel';
import { AskRagPanel } from '../features/ask-rag/AskRagPanel';
import { FamilyPanel } from '../features/family/FamilyPanel';
import { PainCapturePanel } from '../features/pain-capture/PainCapturePanel';
import { RiskAlertPanel } from '../features/risk-engine/RiskAlertPanel';
import { WeeklyReportPanel } from '../features/weekly-report/WeeklyReportPanel';
import { painRegions, scenarios } from '../shared/mock/demoData';
import { useDemoStore } from '../store/demoStore';

type WorkspaceTab = 'content' | 'community' | 'profile' | 'report';
type HomeStepAction = 'assessment' | 'risk' | 'weekly' | 'none';
type QualityLevel = 'none' | 'low' | 'medium' | 'high';
type IntakeStep = 'name' | 'pain';
type ReportPage = 'sample' | 'showcase';

interface PainSampleReport {
  generatedAt: string;
  patientName: string;
  scenarioTitle: string;
  riskLabel: string;
  avgPain: string;
  peakPain: number;
  keyRegion: string;
  trend: string;
  findings: string[];
  actions: string[];
}

const promptText = '您好，请先告诉我怎么称呼您。';
const emergencyPattern = /sudden|severe|numb|weak|acute|8\/10|9\/10|剧痛|麻木|无力|突发|急性/i;

const riskTagMap = {
  low: 'L3 绿色',
  medium: 'L2 橙色',
  high: 'L1 红色',
} as const;

const communitySeed = [
  { id: 't1', room: '术后康复', title: '今天走路 20 分钟，大家都怎么分段？', meta: '18 条新消息' },
  { id: 't2', room: '腰背管理', title: '久坐后腰痛，有没有 3 分钟动作？', meta: '9 条新消息' },
  { id: 't3', room: '睡眠支持', title: '夜间疼痛影响入睡，求经验', meta: '27 条新消息' },
];

const infoCards = [
  {
    id: 'k1',
    tag: '今日推荐',
    title: '疼痛突然加重时，先做这 3 步',
    snippet: '先降负荷，再记录，再判断是否就医。',
  },
  {
    id: 'k2',
    tag: '康复动作',
    title: '久坐人群：30 秒腰背解压',
    snippet: '坐姿也能做，动作慢一点。',
  },
  {
    id: 'k3',
    tag: '家属协同',
    title: '如何看懂风险等级变化',
    snippet: '重点看连续上升，不看单次波动。',
  },
  {
    id: 'k4',
    tag: '用药提醒',
    title: '止痛药何时需要复评',
    snippet: '连续依赖止痛时，建议尽快复评。',
  },
];

const homeFlow: {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  action: HomeStepAction;
}[] = [
  {
    id: 'step_1',
    title: '先记录疼痛（核心入口）',
    description: '打开 2D 人体图，完成部位与强度采集。',
    actionLabel: '开始记录',
    action: 'assessment',
  },
  {
    id: 'step_2',
    title: '再看风险预警',
    description: '先看触发原因，再决定下一步处理。',
    actionLabel: '查看风险',
    action: 'risk',
  },
  {
    id: 'step_3',
    title: '然后看周趋势',
    description: '判断是单次波动，还是连续恶化。',
    actionLabel: '查看趋势',
    action: 'weekly',
  },
  {
    id: 'step_4',
    title: '最后看延伸内容',
    description: '信息流后置，避免第一屏分散注意力。',
    actionLabel: '查看延伸内容',
    action: 'none',
  },
];

const inferScenario = (text: string) => {
  if (emergencyPattern.test(text)) {
    return 'critical';
  }

  if (/worse|radiat|numb|walking|持续|加重|放射/.test(text)) {
    return 'rising';
  }

  return 'stable';
};

const buildAskReply = (query: string, scenarioTitle: string) => {
  if (!query.trim()) {
    return '请输入问题。';
  }

  if (emergencyPattern.test(query)) {
    return '检测到高风险关键词，建议立即线下就医评估。';
  }

  return `预设回答：结合当前“${scenarioTitle}”状态，先降低活动强度，记录 24 小时变化，再决定是否复评。`;
};

const jumpToSection = (sectionId: string) => {
  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function App() {
  const scenarioId = useDemoStore((state) => state.scenarioId);
  const setScenario = useDemoStore((state) => state.setScenario);
  const bodySide = useDemoStore((state) => state.bodySide);
  const setBodySide = useDemoStore((state) => state.setBodySide);
  const selectedRegions = useDemoStore((state) => state.selectedRegions);
  const selectedFineRegions = useDemoStore((state) => state.selectedFineRegions);
  const activeRegionId = useDemoStore((state) => state.activeRegionId);
  const activateRegion = useDemoStore((state) => state.activateRegion);
  const toggleFineRegion = useDemoStore((state) => state.toggleFineRegion);
  const intensity = useDemoStore((state) => state.intensity);
  const setIntensity = useDemoStore((state) => state.setIntensity);
  const saveCapture = useDemoStore((state) => state.saveCapture);
  const lastSavedAt = useDemoStore((state) => state.lastSavedAt);

  const [painInput, setPainInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [intakeStep, setIntakeStep] = useState<IntakeStep>('name');
  const [profileName, setProfileName] = useState('');
  const [needAssessment, setNeedAssessment] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentError, setAssessmentError] = useState('');
  const [submittedPain, setSubmittedPain] = useState(false);
  const [tab, setTab] = useState<WorkspaceTab>('content');
  const [reportPage, setReportPage] = useState<ReportPage>('sample');
  const [sampleReport, setSampleReport] = useState<PainSampleReport | null>(null);
  const [askInput, setAskInput] = useState('');
  const [askReply, setAskReply] = useState('');
  const [communityInput, setCommunityInput] = useState('');
  const [communityFeed, setCommunityFeed] = useState(communitySeed);

  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);

  const mapRegions = useMemo(() => painRegions.filter((region) => region.side === bodySide), [bodySide]);
  const activeRegion = useMemo(
    () => painRegions.find((region) => region.id === activeRegionId),
    [activeRegionId],
  );

  const selectedRegionNames = useMemo(
    () =>
      painRegions
        .filter((region) => selectedRegions.includes(region.id))
        .map((region) => {
          const fineCount = selectedFineRegions[region.id]?.length ?? 0;
          return fineCount > 0 ? `${region.label} · ${fineCount}个细分` : `${region.label} · 粗粒度`;
        }),
    [selectedFineRegions, selectedRegions],
  );

  const fineRegionCount = useMemo(
    () => Object.values(selectedFineRegions).reduce((sum, list) => sum + list.length, 0),
    [selectedFineRegions],
  );

  const qualityLevel: QualityLevel =
    selectedRegions.length === 0
      ? 'none'
      : fineRegionCount === 0
        ? 'low'
        : fineRegionCount < selectedRegions.length
          ? 'medium'
          : 'high';

  const qualityLabelMap: Record<QualityLevel, string> = {
    none: '未采集',
    low: '粗粒度记录',
    medium: '中等质量',
    high: '高质量记录',
  };

  const qualityScore =
    selectedRegions.length === 0 ? 0 : Math.min(100, Math.round(40 + (fineRegionCount / selectedRegions.length) * 60));

  const weeklyAvg = useMemo(() => {
    const sum = scenario.weekly.reduce((acc, item) => acc + item.pain, 0);
    return (sum / scenario.weekly.length).toFixed(1);
  }, [scenario.weekly]);

  const riskToneClass = {
    low: 'home-stat-card--safe',
    medium: 'home-stat-card--warning',
    high: 'home-stat-card--danger',
  }[scenario.riskLevel];

  const hasPainInput = painInput.trim().length > 0;
  const hasNameInput = nameInput.trim().length > 0;
  const hasCommunityInput = communityInput.trim().length > 0;
  const hasAskInput = askInput.trim().length > 0;
  const displayName = nameInput.trim() || '朋友';

  const onboardDone = profileName.length > 0;

  const openAssessment = () => {
    setAssessmentError('');
    setShowAssessment(true);
  };

  const goReportSection = (sectionId: string) => {
    setTab('report');
    setReportPage('showcase');
    window.setTimeout(() => jumpToSection(sectionId), 220);
  };

  const handleHomeFlowAction = (action: HomeStepAction) => {
    if (action === 'assessment') {
      openAssessment();
      return;
    }

    if (action === 'risk') {
      goReportSection('risk-section');
      return;
    }

    if (action === 'weekly') {
      goReportSection('weekly-section');
    }
  };

  const handleSubmitPain = () => {
    const text = painInput.trim();
    if (!text) {
      return;
    }

    setSubmittedPain(true);
    const nextScenarioId = inferScenario(text);
    setScenario(nextScenarioId);

    const shouldAssess = emergencyPattern.test(text);
    setNeedAssessment(shouldAssess);
  };

  const handleGoPainStep = () => {
    if (!hasNameInput) {
      return;
    }

    setSubmittedPain(false);
    setNeedAssessment(false);
    setIntakeStep('pain');
  };

  const handleBackToNameStep = () => {
    setIntakeStep('name');
  };

  const handleFinishAssessment = () => {
    if (selectedRegions.length === 0) {
      setAssessmentError('请至少选择一个疼痛区域。');
      return;
    }

    saveCapture();
    setAssessmentError('');
    setShowAssessment(false);
  };

  const handleCreateProfile = () => {
    const text = nameInput.trim();
    if (!text || !submittedPain) {
      return;
    }

    setProfileName(text);
    setTab('content');
  };

  const handlePostCommunity = () => {
    const text = communityInput.trim();
    if (!text) {
      return;
    }

    const draft = {
      id: `draft-${Date.now()}`,
      room: '我的提问',
      title: text,
      meta: '刚刚发布',
    };

    setCommunityFeed((prev) => [draft, ...prev]);
    setCommunityInput('');
  };

  const handleGenerateSampleReport = () => {
    const painPoints = scenario.weekly.map((item) => item.pain);
    const firstPain = painPoints[0] ?? intensity;
    const latestPain = painPoints[painPoints.length - 1] ?? intensity;
    const delta = latestPain - firstPain;
    const trend =
      delta >= 1
        ? `近7天疼痛整体上升 ${delta.toFixed(1)} 分，需要重点观察。`
        : delta <= -1
          ? `近7天疼痛整体下降 ${Math.abs(delta).toFixed(1)} 分，趋势向好。`
          : '近7天疼痛总体平稳，建议继续连续记录。';

    const report: PainSampleReport = {
      generatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      patientName: profileName || displayName,
      scenarioTitle: scenario.title,
      riskLabel: riskTagMap[scenario.riskLevel],
      avgPain: weeklyAvg,
      peakPain: painPoints.length > 0 ? Math.max(...painPoints) : intensity,
      keyRegion: selectedRegionNames[0] ?? '腰背（待补充细分）',
      trend,
      findings: [
        scenario.riskReason,
        scenario.reportBullets[0] ?? '当前数据不足，建议先补充连续记录。',
        `本次记录：强度 ${intensity}/10；区域：${selectedRegionNames.join('、') || '未采集'}。`,
      ],
      actions: [
        scenario.riskLevel === 'high' || needAssessment
          ? '优先完成 2D 细分评估，并准备线下复诊材料。'
          : '保持当前康复方案，连续记录 7 天后复评。',
        '家属端重点关注连续上升与失访提醒。',
        '出现突发剧痛、麻木无力等红旗征象时立即就医。',
      ],
    };

    setSampleReport(report);
  };

  return (
    <div className="stream-shell">
      <main className="stream-main">
        {!onboardDone ? (
          <section className="intake-card intake-step-shell">
            <div key={intakeStep} className="intake-step-card">
              {intakeStep === 'name' ? (
                <>
                  <h1 className="intake-title">{promptText}</h1>
                  <p className="intake-step-tip">我们会基于你的称呼生成个性化档案。</p>

                  <div className="intake-input-row">
                    <input
                      value={nameInput}
                      onChange={(event) => setNameInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleGoPainStep();
                        }
                      }}
                      placeholder="例如：王阿姨 / 李先生"
                      aria-label="用户称呼"
                    />
                    <button type="button" className="primary-btn" onClick={handleGoPainStep} disabled={!hasNameInput}>
                      下一步
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="intake-title">{displayName}，请描述你现在的疼痛情况。</h1>
                  <p className="intake-step-tip">这一页完成后即可创建档案并进入功能界面。</p>

                  <div className="intake-input-row">
                    <input
                      value={painInput}
                      onChange={(event) => setPainInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleSubmitPain();
                        }
                      }}
                      placeholder="例如：右侧腰背突然刺痛，走路更疼"
                      aria-label="疼痛描述"
                    />
                    <button type="button" className="primary-btn" onClick={handleSubmitPain} disabled={!hasPainInput}>
                      分析疼痛
                    </button>
                  </div>

                  <div className="intake-step-actions">
                    <button type="button" className="ghost-btn" onClick={handleBackToNameStep}>
                      返回上一步
                    </button>
                    <button type="button" className="primary-btn" onClick={handleCreateProfile} disabled={!submittedPain}>
                      创建档案并进入
                    </button>
                  </div>

                  {submittedPain ? (
                    <article className={needAssessment ? 'first-feedback first-feedback--high' : 'first-feedback'}>
                      <span className="feedback-badge">{riskTagMap[scenario.riskLevel]}</span>
                      <h3>{scenario.title}</h3>
                      <p>{scenario.riskReason}</p>
                      <div className="first-feedback__actions">
                        {needAssessment ? (
                          <button type="button" className="ghost-btn" onClick={openAssessment}>
                            先做 2D 评估
                          </button>
                        ) : null}
                        <button type="button" className="primary-btn" onClick={handleCreateProfile}>
                          创建档案并进入
                        </button>
                      </div>
                    </article>
                  ) : null}
                </>
              )}
            </div>
          </section>
        ) : (
          <section className="mini-workspace">
            <div className="mini-stage">
              {tab === 'content' ? (
                <>
                  <section className="home-hero">
                    <p className="home-hero__kicker">首页主路径</p>
                    <h2>{scenario.title}</h2>
                    <p className="home-hero__summary">{scenario.subtitle}</p>
                    <p className="home-hero__focus">当前重点：{scenario.riskReason}</p>
                    <div className="home-hero__actions">
                      <button type="button" className="primary-btn" onClick={openAssessment}>
                        开始记录
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => setTab('report')}>
                        查看演示报告
                      </button>
                    </div>
                  </section>

                  <section className="home-flow-card">
                    <div className="home-flow-card__head">
                      <h3>首页交互顺序</h3>
                      <p>先做任务，再看信息卡片。第一屏只聚焦关键动作。</p>
                    </div>
                    <ol className="home-flow-list" aria-label="首页步骤">
                      {homeFlow.map((step, index) => (
                        <li key={step.id} className="home-flow-item">
                          <span className="home-flow-index" aria-hidden="true">
                            {index + 1}
                          </span>
                          <div className="home-flow-copy">
                            <strong>{step.title}</strong>
                            <p>{step.description}</p>
                          </div>
                          {step.action === 'none' ? (
                            <span className="home-flow-action home-flow-action--text">{step.actionLabel}</span>
                          ) : (
                            <button
                              type="button"
                              className="ghost-btn home-flow-action"
                              onClick={() => handleHomeFlowAction(step.action)}
                            >
                              {step.actionLabel}
                            </button>
                          )}
                        </li>
                      ))}
                    </ol>
                  </section>

                  <section className="home-stats-grid" aria-label="今日摘要">
                    <article className={`home-stat-card ${riskToneClass}`}>
                      <span>风险等级</span>
                      <strong>{riskTagMap[scenario.riskLevel]}</strong>
                      <p>{scenario.riskRuleId}</p>
                    </article>
                    <article className="home-stat-card">
                      <span>当前强度</span>
                      <strong>{intensity}/10</strong>
                      <p>今日主观打分</p>
                    </article>
                    <article className="home-stat-card">
                      <span>采集质量</span>
                      <strong>{qualityScore}</strong>
                      <p>{qualityLabelMap[qualityLevel]}</p>
                    </article>
                    <article className="home-stat-card">
                      <span>7日均值</span>
                      <strong>{weeklyAvg}</strong>
                      <p>趋势基线</p>
                    </article>
                  </section>

                  <section className="home-scenario-card">
                    <div>
                      <h3>场景切换</h3>
                      <p>一键联动风险、趋势和报告内容。</p>
                    </div>
                    <div className="home-scenario-list">
                      {scenarios.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={item.id === scenario.id ? 'home-scenario-btn home-scenario-btn--active' : 'home-scenario-btn'}
                          onClick={() => setScenario(item.id)}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="home-feed-grid" aria-label="延伸信息卡片">
                    {infoCards.map((card) => (
                      <article className="home-feed-card" key={card.id}>
                        <span className="home-feed-card__tag">{card.tag}</span>
                        <h4>{card.title}</h4>
                        <p>{card.snippet}</p>
                      </article>
                    ))}
                  </section>
                </>
              ) : null}

              {tab === 'community' ? (
                <>
                  <section className="mini-hero-card">
                    <p className="mini-kicker">社群</p>
                    <h2 className="mini-title">一起交流，互相支持</h2>
                    <p className="mini-subtitle">提问、经验、打卡心得</p>
                    <div className="mini-post-row">
                      <input
                        value={communityInput}
                        onChange={(event) => setCommunityInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handlePostCommunity();
                          }
                        }}
                        placeholder="说说你今天的情况"
                        aria-label="社群输入"
                      />
                      <button type="button" className="primary-btn" onClick={handlePostCommunity} disabled={!hasCommunityInput}>
                        发布
                      </button>
                    </div>
                  </section>

                  {communityFeed.map((thread) => (
                    <article key={thread.id} className="mini-card mini-thread-card">
                      <div className="mini-thread-avatar">{thread.room.slice(0, 1)}</div>
                      <div>
                        <h4>{thread.room}</h4>
                        <p>{thread.title}</p>
                        <span>{thread.meta}</span>
                      </div>
                    </article>
                  ))}
                </>
              ) : null}

              {tab === 'profile' ? (
                <>
                  <section className="mini-hero-card">
                    <p className="mini-kicker">个人档案</p>
                    <h2 className="mini-title">{profileName}，你好</h2>
                    <p className="mini-subtitle">档案持续更新中</p>
                    <div className="mini-actions">
                      <button type="button" className="primary-btn" onClick={openAssessment}>
                        记录疼痛
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => setTab('report')}>
                        查看演示报告
                      </button>
                    </div>
                  </section>

                  <section className="mini-profile-grid">
                    <article className="mini-card">
                      <span>当前痛感</span>
                      <strong>{scenario.intensity} / 10</strong>
                    </article>
                    <article className="mini-card">
                      <span>风险等级</span>
                      <strong>{riskTagMap[scenario.riskLevel]}</strong>
                    </article>
                    <article className="mini-card">
                      <span>最近保存</span>
                      <strong>{lastSavedAt ?? '尚未保存'}</strong>
                    </article>
                  </section>

                  <section className="mini-card">
                    <h3>疼痛趋势</h3>
                    <div className="trend-bars" aria-label="疼痛趋势图">
                      {scenario.weekly.map((item) => (
                        <div key={item.day} className="trend-bar-wrap">
                          <div className="trend-bar" style={{ height: `${24 + item.pain * 9}px` }} />
                          <span>{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mini-card">
                    <h3>发作模式与用药</h3>
                    <div className="mini-bullet-row">
                      <span>已选区域</span>
                      <strong>{selectedRegionNames.join('、') || '未采集'}</strong>
                    </div>
                    <div className="mini-bullet-row">
                      <span>AI建议</span>
                      <strong>{scenario.reportBullets[0]}</strong>
                    </div>
                  </section>

                  <section className="mini-card">
                    <h3>医学问答</h3>
                    <div className="qa-row">
                      <input
                        value={askInput}
                        onChange={(event) => setAskInput(event.target.value)}
                        placeholder="请输入医学问题"
                        aria-label="医学问答输入"
                      />
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => setAskReply(buildAskReply(askInput, scenario.title))}
                        disabled={!hasAskInput}
                      >
                        提问
                      </button>
                    </div>
                    {askReply ? <p className="qa-reply">{askReply}</p> : null}
                  </section>
                </>
              ) : null}

              {tab === 'report' ? (
                <>
                  <section className="report-shell">
                    <section className="mini-hero-card report-hero">
                      <p className="mini-kicker">演示报告</p>
                      <h2 className="mini-title">样例报告与动态演示双页面</h2>
                      <p className="mini-subtitle">一个用于现场生成疼痛样例报告，一个用于高级动效讲故事。</p>

                      <div className="report-page-switch" role="tablist" aria-label="报告页面切换">
                        <button
                          type="button"
                          className={reportPage === 'sample' ? 'report-page-btn report-page-btn--active' : 'report-page-btn'}
                          onClick={() => setReportPage('sample')}
                        >
                          样例报告页
                        </button>
                        <button
                          type="button"
                          className={reportPage === 'showcase' ? 'report-page-btn report-page-btn--active' : 'report-page-btn'}
                          onClick={() => setReportPage('showcase')}
                        >
                          动态演示页
                        </button>
                      </div>
                    </section>

                    {reportPage === 'sample' ? (
                      <section className="report-sample-shell" key="sample-report-page">
                        <article className="mini-card report-generator-card">
                          <h3>疼痛样例报告生成器</h3>
                          <p>基于当前场景与采集结果，一键生成可展示的样例报告。</p>
                          <div className="report-generator-meta">
                            <span>当前场景：{scenario.title}</span>
                            <span>风险等级：{riskTagMap[scenario.riskLevel]}</span>
                          </div>
                          <div className="mini-actions">
                            <button type="button" className="primary-btn" onClick={handleGenerateSampleReport}>
                              生成疼痛样例报告
                            </button>
                          </div>
                        </article>

                        {sampleReport ? (
                          <article className="report-sheet">
                            <header className="report-sheet__header">
                              <h3>舒伴 SoothPal 疼痛样例报告</h3>
                              <span>生成时间：{sampleReport.generatedAt}</span>
                            </header>

                            <div className="report-sheet__grid">
                              <div>
                                <p className="report-label">患者称呼</p>
                                <strong>{sampleReport.patientName}</strong>
                              </div>
                              <div>
                                <p className="report-label">风险等级</p>
                                <strong>{sampleReport.riskLabel}</strong>
                              </div>
                              <div>
                                <p className="report-label">7日均值</p>
                                <strong>{sampleReport.avgPain}</strong>
                              </div>
                              <div>
                                <p className="report-label">峰值强度</p>
                                <strong>{sampleReport.peakPain}/10</strong>
                              </div>
                            </div>

                            <section className="report-block">
                              <h4>疼痛概况</h4>
                              <p>场景：{sampleReport.scenarioTitle}</p>
                              <p>重点区域：{sampleReport.keyRegion}</p>
                              <p>{sampleReport.trend}</p>
                            </section>

                            <section className="report-block">
                              <h4>关键发现</h4>
                              <ul>
                                {sampleReport.findings.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </section>

                            <section className="report-block">
                              <h4>建议动作</h4>
                              <ul>
                                {sampleReport.actions.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </section>
                          </article>
                        ) : (
                          <article className="report-sheet report-sheet--placeholder">
                            <h3>等待生成样例报告</h3>
                            <p>点击上方按钮后，将自动填充风险、趋势与建议内容，可直接用于产品展示。</p>
                          </article>
                        )}
                      </section>
                    ) : (
                      <section className="showcase-shell" key="showcase-page">
                        <article className="showcase-hero-card">
                          <p className="showcase-kicker">SoothPal 动态演示</p>
                          <h3>动态演示页：滚动分屏展示完整价值链</h3>
                          <p>
                            我们把原有链路重构为逐页滚动的动态展示：
                            从采集、抽取、预警、周报到问答与家属协同，
                            每一屏只讲一个关键价值点，整体观感更接近产品官网叙事体验。
                          </p>
                          <div className="showcase-actions">
                            <button type="button" className="primary-btn" onClick={() => setReportPage('sample')}>
                              去生成样例报告
                            </button>
                            <button type="button" className="ghost-btn" onClick={() => setReportPage('sample')}>
                              返回样例报告页
                            </button>
                          </div>
                        </article>

                        <section className="showcase-scroll-deck" aria-label="动态演示滚动分屏">
                          <article className="showcase-scroll-page showcase-scroll-page--capture">
                            <header className="showcase-scroll-page__head">
                              <span>01 / 零负担采集</span>
                              <h4>我们用 2D 人体交互替代冗长问卷</h4>
                              <p>让用户以最低认知负担完成疼痛部位与强度上报。</p>
                            </header>
                            <div className="showcase-scroll-page__body">
                              <PainCapturePanel />
                            </div>
                          </article>

                          <article className="showcase-scroll-page showcase-scroll-page--extract">
                            <header className="showcase-scroll-page__head">
                              <span>02 / AI 结构化</span>
                              <h4>我们把自然语言自动提炼为结构化指标</h4>
                              <p>保留原始语义，同时生成可计算、可追踪的数据字段。</p>
                            </header>
                            <div className="showcase-scroll-page__body">
                              <AIExtractPanel />
                            </div>
                          </article>

                          <article className="showcase-scroll-page showcase-scroll-page--risk">
                            <header className="showcase-scroll-page__head">
                              <span>03 / 风险分级</span>
                              <h4>我们输出可解释、可审计的分级预警</h4>
                              <p>风险结论由规则引擎产生，AI 负责解释与行动建议。</p>
                            </header>
                            <div className="showcase-scroll-page__body">
                              <RiskAlertPanel />
                            </div>
                          </article>

                          <article className="showcase-scroll-page showcase-scroll-page--weekly">
                            <header className="showcase-scroll-page__head">
                              <span>04 / 周报生成</span>
                              <h4>我们把复杂趋势压缩为一页可读摘要</h4>
                              <p>让患者、家属和服务团队在同一视图快速达成共识。</p>
                            </header>
                            <div className="showcase-scroll-page__body">
                              <WeeklyReportPanel />
                            </div>
                          </article>

                          <article className="showcase-scroll-page showcase-scroll-page--ask">
                            <header className="showcase-scroll-page__head">
                              <span>05 / RAG 问答</span>
                              <h4>我们提供带引用与护栏的个体化问答</h4>
                              <p>在可解释前提下提高回答质量，并对高危问题优先就医引导。</p>
                            </header>
                            <div className="showcase-scroll-page__body">
                              <AskRagPanel />
                            </div>
                          </article>

                          <article className="showcase-scroll-page showcase-scroll-page--family">
                            <header className="showcase-scroll-page__head">
                              <span>06 / 亲情协同</span>
                              <h4>我们用最小必要信息完成家属协同闭环</h4>
                              <p>共享趋势与预警，不暴露多余隐私字段。</p>
                            </header>
                            <div className="showcase-scroll-page__body">
                              <FamilyPanel />
                            </div>
                          </article>
                        </section>
                      </section>
                    )}
                  </section>
                </>
              ) : null}
            </div>

            <footer className="mini-tabbar" aria-label="主选项卡">
              <button
                type="button"
                className={tab === 'content' ? 'mini-tabbar-btn mini-tabbar-btn--active' : 'mini-tabbar-btn'}
                onClick={() => setTab('content')}
              >
                内容
              </button>
              <button
                type="button"
                className={tab === 'community' ? 'mini-tabbar-btn mini-tabbar-btn--active' : 'mini-tabbar-btn'}
                onClick={() => setTab('community')}
              >
                社群
              </button>
              <button
                type="button"
                className={tab === 'profile' ? 'mini-tabbar-btn mini-tabbar-btn--active' : 'mini-tabbar-btn'}
                onClick={() => setTab('profile')}
              >
                个人+问答
              </button>
              <button
                type="button"
                className={tab === 'report' ? 'mini-tabbar-btn mini-tabbar-btn--active' : 'mini-tabbar-btn'}
                onClick={() => setTab('report')}
              >
                演示报告
              </button>
            </footer>
          </section>
        )}

        {showAssessment ? (
          <div className="intake-modal" role="dialog" aria-modal="true" aria-label="2D人体评估">
            <div className="intake-modal__panel">
              <h3>检测到疼痛发作，请开始 2D 评估。</h3>

              <div className="side-switch">
                <button
                  type="button"
                  className={bodySide === 'front' ? 'side-switch__btn side-switch__btn--active' : 'side-switch__btn'}
                  onClick={() => setBodySide('front')}
                >
                  前视
                </button>
                <button
                  type="button"
                  className={bodySide === 'back' ? 'side-switch__btn side-switch__btn--active' : 'side-switch__btn'}
                  onClick={() => setBodySide('back')}
                >
                  后视
                </button>
              </div>

              <div className="compact-map">
                {mapRegions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    className={selectedRegions.includes(region.id) ? 'compact-zone compact-zone--active' : 'compact-zone'}
                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                    onClick={() => activateRegion(region.id)}
                  >
                    {region.label.length > 8 ? region.label.slice(0, 8) : region.label}
                  </button>
                ))}
              </div>

              <div className={`quality-card quality-card--${qualityLevel}`}>
                <p className="quality-card__title">数据质量：{qualityLabelMap[qualityLevel]}</p>
                <p className="muted">细分点位越完整，后续 AI 建议越稳定。</p>
                <div className="quality-score">
                  <span>记录可信度</span>
                  <strong>{qualityScore}</strong>
                </div>
              </div>

              {activeRegion ? (
                <div className="region-detail">
                  <div className="region-detail__header">
                    <h4>{activeRegion.label} · 细分定位</h4>
                  </div>
                  <div className="fine-chip-wrap">
                    {activeRegion.fineRegions.map((fine) => {
                      const checked = (selectedFineRegions[activeRegion.id] ?? []).includes(fine.id);
                      return (
                        <button
                          key={fine.id}
                          type="button"
                          className={checked ? 'fine-chip fine-chip--active' : 'fine-chip'}
                          onClick={() => toggleFineRegion(activeRegion.id, fine.id)}
                        >
                          {fine.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="compact-meter">
                <label htmlFor="quick-intensity">强度 {intensity}/10</label>
                <input
                  id="quick-intensity"
                  type="range"
                  min={0}
                  max={10}
                  value={intensity}
                  onChange={(event) => setIntensity(Number(event.target.value))}
                />
              </div>

              {assessmentError ? <p className="assessment-error">{assessmentError}</p> : null}

              <div className="intake-modal__actions">
                <button type="button" className="ghost-btn" onClick={() => setShowAssessment(false)}>
                  稍后处理
                </button>
                <button type="button" className="primary-btn" onClick={handleFinishAssessment}>
                  完成采集
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
