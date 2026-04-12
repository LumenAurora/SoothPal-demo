import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { painRegions, scenarios, type BodySide, type PainRegionId } from '../../shared/mock/demoData';
import { GlassCard } from '../../shared/ui/GlassCard';
import { SectionTitle } from '../../shared/ui/SectionTitle';
import { useDemoStore } from '../../store/demoStore';

const bubbleVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

interface CoarseZoneLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  shortLabel: string;
}

const coarseZoneLayout: Partial<Record<PainRegionId, CoarseZoneLayout>> = {
  front_head: { x: 50, y: 16, width: 20, height: 9, shortLabel: '头部' },
  front_neck: { x: 50, y: 24, width: 18, height: 7, shortLabel: '颈前' },
  front_shoulder_left: { x: 36, y: 31, width: 16, height: 8, shortLabel: '左肩' },
  front_shoulder_right: { x: 64, y: 31, width: 16, height: 8, shortLabel: '右肩' },
  front_chest_left: { x: 41, y: 39, width: 18, height: 9, shortLabel: '左胸' },
  front_chest_right: { x: 59, y: 39, width: 18, height: 9, shortLabel: '右胸' },
  front_abdomen_upper: { x: 50, y: 48, width: 24, height: 9, shortLabel: '上腹' },
  front_abdomen_lower: { x: 50, y: 57, width: 24, height: 9, shortLabel: '下腹' },
  front_hip_left: { x: 42, y: 65, width: 16, height: 9, shortLabel: '左髋' },
  front_hip_right: { x: 58, y: 65, width: 16, height: 9, shortLabel: '右髋' },
  front_knee_left: { x: 43, y: 84, width: 14, height: 9, shortLabel: '左膝' },
  front_knee_right: { x: 57, y: 84, width: 14, height: 9, shortLabel: '右膝' },
  back_neck: { x: 50, y: 22, width: 20, height: 7, shortLabel: '颈后' },
  back_shoulder_left: { x: 37, y: 30, width: 18, height: 8, shortLabel: '左肩背' },
  back_shoulder_right: { x: 63, y: 30, width: 18, height: 8, shortLabel: '右肩背' },
  back_upper: { x: 50, y: 41, width: 29, height: 11, shortLabel: '上背' },
  back_lumbar: { x: 50, y: 54, width: 29, height: 11, shortLabel: '腰背' },
  back_glute_left: { x: 43, y: 65, width: 16, height: 9, shortLabel: '左臀' },
  back_glute_right: { x: 57, y: 65, width: 16, height: 9, shortLabel: '右臀' },
  back_calf_left: { x: 43, y: 82, width: 15, height: 16, shortLabel: '左下肢' },
  back_calf_right: { x: 57, y: 82, width: 15, height: 16, shortLabel: '右下肢' },
};

const getFallbackLayout = (regionLabel: string, x: number, y: number): CoarseZoneLayout => ({
  x,
  y,
  width: 14,
  height: 8,
  shortLabel: regionLabel,
});

export function PainCapturePanel() {
  const {
    scenarioId,
    bodySide,
    setBodySide,
    activeRegionId,
    selectedRegions,
    selectedFineRegions,
    activateRegion,
    markRegion,
    toggleFineRegion,
    removeRegion,
    intensity,
    setIntensity,
    saveCapture,
    lastSavedAt,
  } = useDemoStore();
  const [isPainting, setIsPainting] = useState(false);

  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const visibleRegions = useMemo(() => {
    return painRegions
      .filter((region) => region.side === bodySide)
      .map((region) => ({
        region,
        layout: coarseZoneLayout[region.id] ?? getFallbackLayout(region.label, region.x, region.y),
      }));
  }, [bodySide]);
  const activeRegion = painRegions.find((region) => region.id === activeRegionId);
  const selectedLabels = painRegions
    .filter((region) => selectedRegions.includes(region.id))
    .map((region) => {
      const fineCount = selectedFineRegions[region.id]?.length ?? 0;
      return fineCount > 0 ? `${region.label} · ${fineCount}个细分` : `${region.label} · 粗粒度`;
    });

  const totalFineCount = Object.values(selectedFineRegions).reduce((acc, current) => acc + current.length, 0);
  const coverageRatio = selectedRegions.length > 0 ? totalFineCount / selectedRegions.length : 0;
  const qualityScore = selectedRegions.length === 0 ? 0 : Math.min(100, Math.round(40 + coverageRatio * 60));
  const quality =
    selectedRegions.length === 0
      ? { level: 'none', label: '未采集', hint: '请选择至少一个疼痛大区。' }
      : totalFineCount === 0
        ? {
            level: 'low',
            label: '粗粒度记录',
            hint: '可用于基础趋势分析，但精确干预建议会更保守。',
          }
        : totalFineCount < selectedRegions.length
          ? {
              level: 'medium',
              label: '中等质量',
              hint: '建议继续补充关键区域细分，提高随访可信度。',
            }
          : {
              level: 'high',
              label: '高质量记录',
              hint: '部位精细度充足，支持更可靠的模式识别。',
            };

    const handleRegionActivate = (regionId: PainRegionId, side: BodySide) => {
      setBodySide(side);
      activateRegion(regionId);
    };

  return (
    <div className="feature-grid feature-grid--capture" id="capture-section">
      <GlassCard>
        <SectionTitle
          kicker="Scene A / 10s Capture"
          title="零问卷疼痛打卡"
          description="先点大区，再补细分。粗粒度也可用，但会降低数据质量与建议精度。"
        />

        <div className="capture-layout">
          <div className="body-map-shell">
            <div className="body-map-toolbar">
              <p>人体分区图</p>
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
            </div>

            <div className="capture-steps" aria-label="疼痛采集步骤">
              <span className="capture-step capture-step--active">1. 选粗分区</span>
              <span className={activeRegion ? 'capture-step capture-step--active' : 'capture-step'}>
                2. 选细分痛点
              </span>
            </div>

            <div
              className="body-map"
              aria-label="疼痛区域图"
              onPointerLeave={() => setIsPainting(false)}
              onPointerUp={() => setIsPainting(false)}
              onPointerCancel={() => setIsPainting(false)}
            >
              <svg className="body-map__silhouette" viewBox="0 0 220 380" aria-hidden="true">
                <circle cx="110" cy="44" r="22" className="silhouette-fill" />
                <rect x="97" y="64" width="26" height="20" rx="10" className="silhouette-fill" />
                <rect x="70" y="86" width="80" height="108" rx="30" className="silhouette-fill" />
                <rect x="52" y="98" width="18" height="118" rx="9" className="silhouette-fill" />
                <rect x="150" y="98" width="18" height="118" rx="9" className="silhouette-fill" />
                <rect x="80" y="188" width="60" height="66" rx="24" className="silhouette-fill" />
                <rect x="83" y="248" width="22" height="98" rx="11" className="silhouette-fill" />
                <rect x="115" y="248" width="22" height="98" rx="11" className="silhouette-fill" />

                {bodySide === 'back' && (
                  <>
                    <line x1="110" y1="88" x2="110" y2="248" className="silhouette-line" />
                    <line x1="88" y1="124" x2="132" y2="124" className="silhouette-line" />
                    <line x1="88" y1="158" x2="132" y2="158" className="silhouette-line" />
                    <line x1="88" y1="206" x2="132" y2="206" className="silhouette-line" />
                  </>
                )}
              </svg>

              {visibleRegions.map(({ region, layout }) => {
                const selected = selectedRegions.includes(region.id);
                const active = activeRegionId === region.id;
                const fineCount = selectedFineRegions[region.id]?.length ?? 0;
                return (
                  <button
                    key={region.id}
                    type="button"
                    className={`region-zone ${selected ? 'region-zone--active' : ''} ${active ? 'region-zone--focus' : ''}`}
                    style={{
                      left: `${layout.x}%`,
                      top: `${layout.y}%`,
                      width: `${layout.width}%`,
                      height: `${layout.height}%`,
                    }}
                    onPointerDown={() => {
                      setIsPainting(true);
                      handleRegionActivate(region.id, region.side);
                    }}
                    onPointerEnter={() => {
                      if (isPainting) {
                        markRegion(region.id);
                      }
                    }}
                    onClick={() => handleRegionActivate(region.id, region.side)}
                    aria-label={`选择${region.label}`}
                  >
                    <span className="region-zone__label">{layout.shortLabel}</span>
                    {fineCount > 0 && <em>{fineCount}</em>}
                  </button>
                );
              })}

              <p className="body-map__hint">支持拖动涂抹式选区。先粗后细，能兼顾速度与数据质量。</p>
            </div>
          </div>

          <div className="capture-controls">
            <div className={`quality-card quality-card--${quality.level}`}>
              <p className="quality-card__title">数据质量：{quality.label}</p>
              <p className="muted">{quality.hint}</p>
              <div className="quality-score" role="presentation">
                <span>记录可信度</span>
                <strong>{qualityScore}</strong>
              </div>
            </div>

            <div className="capture-controls__meter">
              <label htmlFor="pain-intensity" className="capture-controls__label">
                今日强度: <strong>{intensity}</strong> / 10
              </label>
              <input
                id="pain-intensity"
                type="range"
                min={0}
                max={10}
                value={intensity}
                onChange={(event) => setIntensity(Number(event.target.value))}
              />
            </div>

            <motion.div
              className="capture-controls__regions"
              variants={bubbleVariants}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.3 }}
            >
              <p>已选区域</p>
              {selectedLabels.length > 0 ? (
                <div className="token-wrap">
                  {selectedLabels.map((label) => (
                    <span className="token" key={label}>
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted">请选择至少一个疼痛区域</p>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {activeRegion ? (
                <motion.div
                  key={activeRegion.id}
                  className="region-detail"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <div className="region-detail__header">
                    <h4>{activeRegion.label} · 精细定位</h4>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => removeRegion(activeRegion.id)}
                    >
                      移除此区
                    </button>
                  </div>

                  <p className="muted">建议至少选择 1 个细分痛点，便于后续 AI 生成更可靠建议。</p>

                  <div className="fine-chip-wrap">
                    {activeRegion.fineRegions.map((fine) => {
                      const checked = (selectedFineRegions[activeRegion.id] ?? []).includes(fine.id);
                      return (
                        <button
                          type="button"
                          key={fine.id}
                          className={checked ? 'fine-chip fine-chip--active' : 'fine-chip'}
                          onClick={() => toggleFineRegion(activeRegion.id, fine.id)}
                        >
                          {fine.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="region-placeholder"
                  className="region-detail region-detail--placeholder"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <p className="muted">点击左侧任意大区后，会在这里出现精细子区域选择。</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="button" className="primary-btn" onClick={saveCapture}>
              保存今日疼痛卡片
            </button>

            <p className="muted">
              {lastSavedAt
                ? `已保存 ${lastSavedAt} · ${scenario.title}`
                : '演示提示：点击保存将触发后续 AI 抽取与风险评估流程'}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
