import { create } from 'zustand';

import { defaultScenarioId, painRegions, scenarios, type BodySide, type PainRegionId } from '../shared/mock/demoData';

interface DemoState {
  bodySide: BodySide;
  scenarioId: string;
  selectedRegions: PainRegionId[];
  selectedFineRegions: Record<PainRegionId, string[]>;
  activeRegionId?: PainRegionId;
  intensity: number;
  lastSavedAt?: string;
  setBodySide: (side: BodySide) => void;
  setScenario: (scenarioId: string) => void;
  activateRegion: (regionId: PainRegionId) => void;
  markRegion: (regionId: PainRegionId) => void;
  removeRegion: (regionId: PainRegionId) => void;
  toggleFineRegion: (regionId: PainRegionId, fineRegionId: string) => void;
  setIntensity: (intensity: number) => void;
  saveCapture: () => void;
}

const fallbackScenario = scenarios.find((item) => item.id === defaultScenarioId) ?? scenarios[0];
const regionMap = new Map(painRegions.map((region) => [region.id, region]));

const clampIntensity = (value: number) => Math.max(0, Math.min(10, Math.round(value)));

const inferSide = (regions: PainRegionId[]): BodySide => {
  const firstRegion = regions[0];
  if (!firstRegion) {
    return 'back';
  }

  return regionMap.get(firstRegion)?.side ?? 'back';
};

const uniq = (items: PainRegionId[]) => Array.from(new Set(items));

export const useDemoStore = create<DemoState>((set, get) => ({
  bodySide: inferSide(fallbackScenario.selectedRegions),
  scenarioId: fallbackScenario.id,
  selectedRegions: uniq(fallbackScenario.selectedRegions),
  selectedFineRegions: { ...fallbackScenario.selectedFineRegions },
  activeRegionId: fallbackScenario.selectedRegions[0],
  intensity: fallbackScenario.intensity,
  lastSavedAt: undefined,

  setBodySide: (side) => {
    const { selectedRegions, activeRegionId } = get();
    const activeRegion = activeRegionId ? regionMap.get(activeRegionId) : undefined;
    const nextActiveRegion =
      activeRegion?.side === side
        ? activeRegionId
        : selectedRegions.find((regionId) => regionMap.get(regionId)?.side === side);

    set({ bodySide: side, activeRegionId: nextActiveRegion });
  },

  setScenario: (scenarioId) => {
    const target = scenarios.find((item) => item.id === scenarioId);
    if (!target) {
      return;
    }

    set({
      bodySide: inferSide(target.selectedRegions),
      scenarioId: target.id,
      selectedRegions: uniq(target.selectedRegions),
      selectedFineRegions: { ...target.selectedFineRegions },
      activeRegionId: target.selectedRegions[0],
      intensity: target.intensity,
      lastSavedAt: undefined,
    });
  },

  activateRegion: (regionId) => {
    const region = regionMap.get(regionId);
    if (!region) {
      return;
    }

    const { selectedRegions } = get();
    const hasRegion = selectedRegions.includes(regionId);
    set({
      bodySide: region.side,
      activeRegionId: regionId,
      selectedRegions: hasRegion ? selectedRegions : [...selectedRegions, regionId],
    });
  },

  markRegion: (regionId) => {
    const region = regionMap.get(regionId);
    if (!region) {
      return;
    }

    const { selectedRegions } = get();
    if (selectedRegions.includes(regionId)) {
      return;
    }

    set({
      bodySide: region.side,
      selectedRegions: [...selectedRegions, regionId],
      activeRegionId: regionId,
    });
  },

  removeRegion: (regionId) => {
    const { selectedRegions, selectedFineRegions, activeRegionId } = get();
    if (!selectedRegions.includes(regionId)) {
      return;
    }

    const nextFine = { ...selectedFineRegions };
    delete nextFine[regionId];

    set({
      selectedRegions: selectedRegions.filter((item) => item !== regionId),
      selectedFineRegions: nextFine,
      activeRegionId: activeRegionId === regionId ? undefined : activeRegionId,
    });
  },

  toggleFineRegion: (regionId, fineRegionId) => {
    const region = regionMap.get(regionId);
    if (!region) {
      return;
    }

    const supportsFine = region.fineRegions.some((fine) => fine.id === fineRegionId);
    if (!supportsFine) {
      return;
    }

    const { selectedRegions, selectedFineRegions } = get();
    const currentFine = selectedFineRegions[regionId] ?? [];
    const hasFine = currentFine.includes(fineRegionId);

    set({
      bodySide: region.side,
      activeRegionId: regionId,
      selectedRegions: selectedRegions.includes(regionId)
        ? selectedRegions
        : [...selectedRegions, regionId],
      selectedFineRegions: {
        ...selectedFineRegions,
        [regionId]: hasFine
          ? currentFine.filter((item) => item !== fineRegionId)
          : [...currentFine, fineRegionId],
      },
    });
  },

  setIntensity: (intensity) => {
    set({ intensity: clampIntensity(intensity) });
  },

  saveCapture: () => {
    set({ lastSavedAt: new Date().toLocaleTimeString('zh-CN', { hour12: false }) });
  },
}));
