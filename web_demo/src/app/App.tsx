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

const promptText = 'Please describe your current pain condition.';
const emergencyPattern = /sudden|severe|numb|weak|acute|8\/10|9\/10|剧痛|麻木|无力|突发/i;

const riskTagMap = {
  low: 'L3 Green',
  medium: 'L2 Amber',
  high: 'L1 Red',
} as const;

const communitySeed = [
  { id: 't1', room: 'Post-op Rehab', title: 'How do you split a 20-minute walk?', meta: '18 new messages' },
  { id: 't2', room: 'Back Care', title: 'Any 3-minute move for pain after sitting?', meta: '9 new messages' },
  { id: 't3', room: 'Sleep Support', title: 'Night pain affects sleep, need advice', meta: '27 new messages' },
];

const infoCards = [
  {
    id: 'k1',
    tag: 'Today',
    title: '3 steps when pain spikes',
    snippet: 'Reduce load, record pain, then decide whether to seek care.',
  },
  {
    id: 'k2',
    tag: 'Rehab',
    title: '30-second lower-back release',
    snippet: 'Can be done while seated, keep it slow and smooth.',
  },
  {
    id: 'k3',
    tag: 'Family',
    title: 'How to read risk level changes',
    snippet: 'Focus on continuous increase, not one isolated point.',
  },
  {
    id: 'k4',
    tag: 'Medication',
    title: 'When to re-evaluate pain meds',
    snippet: 'If dependence persists, ask for a professional review.',
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
    title: 'Record pain first',
    description: 'Open 2D body map and finish location + intensity capture.',
    actionLabel: 'Start Record',
    action: 'assessment',
  },
  {
    id: 'step_2',
    title: 'Check risk next',
    description: 'See why the level is triggered before making decisions.',
    actionLabel: 'Open Risk',
    action: 'risk',
  },
  {
    id: 'step_3',
    title: 'Review weekly trend',
    description: 'Tell a one-time fluctuation from a worsening pattern.',
    actionLabel: 'View Trend',
    action: 'weekly',
  },
  {
    id: 'step_4',
    title: 'Read extended guidance',
    description: 'Keep educational cards after core actions to reduce noise.',
    actionLabel: 'Sequence Optimized',
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
    return 'Please enter a question.';
  }

  if (emergencyPattern.test(query)) {
    return 'High-risk keywords detected. Please seek immediate in-person medical assessment.';
  }

  return `Preset answer: under current scenario "${scenarioTitle}", reduce activity load first, track 24-hour change, then decide if re-check is needed.`;
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
  const [profileName, setProfileName] = useState('');
  const [needAssessment, setNeedAssessment] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentError, setAssessmentError] = useState('');
  const [submittedPain, setSubmittedPain] = useState(false);
  const [tab, setTab] = useState<WorkspaceTab>('content');
  const [showDemoFlow, setShowDemoFlow] = useState(true);
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
          return fineCount > 0 ? `${region.label} · ${fineCount} details` : `${region.label} · coarse`;
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
    none: 'Not captured',
    low: 'Coarse only',
    medium: 'Partial detail',
    high: 'High detail',
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

  const onboardDone = profileName.length > 0;
  const canAskName = hasPainInput && (!needAssessment || !showAssessment);

  const openAssessment = () => {
    setAssessmentError('');
    setShowAssessment(true);
  };

  const goReportSection = (sectionId: string) => {
    setTab('report');
    window.setTimeout(() => jumpToSection(sectionId), 120);
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
    if (shouldAssess) {
      openAssessment();
    }
  };

  const handleFinishAssessment = () => {
    if (selectedRegions.length === 0) {
      setAssessmentError('Please select at least one pain region.');
      return;
    }

    saveCapture();
    setAssessmentError('');
    setShowAssessment(false);
  };

  const handleCreateProfile = () => {
    const text = nameInput.trim();
    if (!text) {
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
      room: 'My Topic',
      title: text,
      meta: 'just now',
    };

    setCommunityFeed((prev) => [draft, ...prev]);
    setCommunityInput('');
  };

  return (
    <div className="stream-shell">
      <main className="stream-main">
        {!onboardDone ? (
          <section className="intake-card">
            <h1 className="intake-title">{promptText}</h1>

            <div className="intake-input-row">
              <input
                value={painInput}
                onChange={(event) => setPainInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSubmitPain();
                  }
                }}
                placeholder="Example: right lumbar sharp pain, worse while walking"
                aria-label="Pain description"
              />
              <button type="button" className="primary-btn" onClick={handleSubmitPain} disabled={!hasPainInput}>
                Continue
              </button>
            </div>

            {submittedPain ? (
              <article className={needAssessment ? 'first-feedback first-feedback--high' : 'first-feedback'}>
                <span className="feedback-badge">{riskTagMap[scenario.riskLevel]}</span>
                <h3>{scenario.title}</h3>
                <p>{scenario.riskReason}</p>
                <div className="first-feedback__actions">
                  {needAssessment ? (
                    <button type="button" className="primary-btn" onClick={openAssessment}>
                      Run 2D Assessment
                    </button>
                  ) : (
                    <button type="button" className="ghost-btn" onClick={() => setNeedAssessment(false)}>
                      Continue Onboarding
                    </button>
                  )}
                </div>
              </article>
            ) : null}

            {canAskName ? (
              <div className="intake-name-row">
                <p>How should we call you?</p>
                <div className="intake-input-row">
                  <input
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleCreateProfile();
                      }
                    }}
                    placeholder="Enter your preferred name"
                    aria-label="Preferred name"
                  />
                  <button type="button" className="primary-btn" onClick={handleCreateProfile} disabled={!hasNameInput}>
                    Create Profile
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : (
          <section className="mini-workspace">
            <div className="mini-stage">
              {tab === 'content' ? (
                <>
                  <section className="home-hero">
                    <p className="home-hero__kicker">Primary Path</p>
                    <h2>{scenario.title}</h2>
                    <p className="home-hero__summary">{scenario.subtitle}</p>
                    <p className="home-hero__focus">Current focus: {scenario.riskReason}</p>
                    <div className="home-hero__actions">
                      <button type="button" className="primary-btn" onClick={openAssessment}>
                        Start Record
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => setTab('report')}>
                        Open Demo Report
                      </button>
                    </div>
                  </section>

                  <section className="home-flow-card">
                    <div className="home-flow-card__head">
                      <h3>Homepage Interaction Sequence</h3>
                      <p>Do task first, then read context cards. This keeps the first screen focused.</p>
                    </div>
                    <ol className="home-flow-list" aria-label="Homepage steps">
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

                  <section className="home-stats-grid" aria-label="Today summary">
                    <article className={`home-stat-card ${riskToneClass}`}>
                      <span>Risk Level</span>
                      <strong>{riskTagMap[scenario.riskLevel]}</strong>
                      <p>{scenario.riskRuleId}</p>
                    </article>
                    <article className="home-stat-card">
                      <span>Intensity</span>
                      <strong>{intensity}/10</strong>
                      <p>Current self-report</p>
                    </article>
                    <article className="home-stat-card">
                      <span>Capture Quality</span>
                      <strong>{qualityScore}</strong>
                      <p>{qualityLabelMap[qualityLevel]}</p>
                    </article>
                    <article className="home-stat-card">
                      <span>7-Day Avg</span>
                      <strong>{weeklyAvg}</strong>
                      <p>Trend baseline</p>
                    </article>
                  </section>

                  <section className="home-scenario-card">
                    <div>
                      <h3>Scenario Switch</h3>
                      <p>Switch scenario to update risk, trend, and report in one shot.</p>
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

                  <section className="home-feed-grid" aria-label="Extended cards">
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
                    <p className="mini-kicker">Community</p>
                    <h2 className="mini-title">Share and support each other</h2>
                    <p className="mini-subtitle">Questions, experience, and daily logs</p>
                    <div className="mini-post-row">
                      <input
                        value={communityInput}
                        onChange={(event) => setCommunityInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handlePostCommunity();
                          }
                        }}
                        placeholder="Type your update"
                        aria-label="Community input"
                      />
                      <button type="button" className="primary-btn" onClick={handlePostCommunity} disabled={!hasCommunityInput}>
                        Post
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
                    <p className="mini-kicker">Profile</p>
                    <h2 className="mini-title">Hello, {profileName}</h2>
                    <p className="mini-subtitle">Your record is continuously updated</p>
                    <div className="mini-actions">
                      <button type="button" className="primary-btn" onClick={openAssessment}>
                        Record Pain
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => setTab('report')}>
                        Open Demo Report
                      </button>
                    </div>
                  </section>

                  <section className="mini-profile-grid">
                    <article className="mini-card">
                      <span>Current pain</span>
                      <strong>{scenario.intensity} / 10</strong>
                    </article>
                    <article className="mini-card">
                      <span>Risk level</span>
                      <strong>{riskTagMap[scenario.riskLevel]}</strong>
                    </article>
                    <article className="mini-card">
                      <span>Last saved</span>
                      <strong>{lastSavedAt ?? 'Not saved yet'}</strong>
                    </article>
                  </section>

                  <section className="mini-card">
                    <h3>Pain Trend</h3>
                    <div className="trend-bars" aria-label="Pain trend chart">
                      {scenario.weekly.map((item) => (
                        <div key={item.day} className="trend-bar-wrap">
                          <div className="trend-bar" style={{ height: `${24 + item.pain * 9}px` }} />
                          <span>{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mini-card">
                    <h3>Pattern and Medication</h3>
                    <div className="mini-bullet-row">
                      <span>Selected regions</span>
                      <strong>{selectedRegionNames.join(', ') || 'Not captured'}</strong>
                    </div>
                    <div className="mini-bullet-row">
                      <span>AI suggestion</span>
                      <strong>{scenario.reportBullets[0]}</strong>
                    </div>
                  </section>

                  <section className="mini-card">
                    <h3>Medical QA</h3>
                    <div className="qa-row">
                      <input
                        value={askInput}
                        onChange={(event) => setAskInput(event.target.value)}
                        placeholder="Type a medical question"
                        aria-label="Medical QA input"
                      />
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => setAskReply(buildAskReply(askInput, scenario.title))}
                        disabled={!hasAskInput}
                      >
                        Ask
                      </button>
                    </div>
                    {askReply ? <p className="qa-reply">{askReply}</p> : null}
                  </section>
                </>
              ) : null}

              {tab === 'report' ? (
                <>
                  <section className="mini-hero-card report-hero">
                    <p className="mini-kicker">Demo Report</p>
                    <h2 className="mini-title">Full demo path and highlights</h2>
                    <div className="mini-actions">
                      <button type="button" className="ghost-btn" onClick={() => goReportSection('risk-section')}>
                        Jump to Risk
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => goReportSection('weekly-section')}>
                        Jump to Weekly
                      </button>
                      <button type="button" className="ghost-btn" onClick={() => setShowDemoFlow((value) => !value)}>
                        {showDemoFlow ? 'Collapse Flow' : 'Expand Flow'}
                      </button>
                    </div>
                  </section>

                  {showDemoFlow ? (
                    <section className="report-flow-shell">
                      <PainCapturePanel />
                      <AIExtractPanel />
                      <RiskAlertPanel />
                      <WeeklyReportPanel />
                      <AskRagPanel />
                      <FamilyPanel />
                    </section>
                  ) : null}
                </>
              ) : null}
            </div>

            <footer className="mini-tabbar" aria-label="Main tabs">
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
                Demo Report
              </button>
            </footer>
          </section>
        )}

        {showAssessment ? (
          <div className="intake-modal" role="dialog" aria-modal="true" aria-label="2D body assessment">
            <div className="intake-modal__panel">
              <h3>Pain event detected. Start 2D assessment.</h3>

              <div className="side-switch">
                <button
                  type="button"
                  className={bodySide === 'front' ? 'side-switch__btn side-switch__btn--active' : 'side-switch__btn'}
                  onClick={() => setBodySide('front')}
                >
                  Front
                </button>
                <button
                  type="button"
                  className={bodySide === 'back' ? 'side-switch__btn side-switch__btn--active' : 'side-switch__btn'}
                  onClick={() => setBodySide('back')}
                >
                  Back
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
                <p className="quality-card__title">Quality: {qualityLabelMap[qualityLevel]}</p>
                <p className="muted">More detailed points give more stable AI guidance.</p>
                <div className="quality-score">
                  <span>Record confidence</span>
                  <strong>{qualityScore}</strong>
                </div>
              </div>

              {activeRegion ? (
                <div className="region-detail">
                  <div className="region-detail__header">
                    <h4>{activeRegion.label} · detail points</h4>
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
                <label htmlFor="quick-intensity">Intensity {intensity}/10</label>
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
                  Later
                </button>
                <button type="button" className="primary-btn" onClick={handleFinishAssessment}>
                  Save Capture
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
