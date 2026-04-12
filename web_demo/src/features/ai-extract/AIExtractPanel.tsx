import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { redactQuery, scenarios, type ExtractionField } from '../../shared/mock/demoData';
import { GlassCard } from '../../shared/ui/GlassCard';
import { SectionTitle } from '../../shared/ui/SectionTitle';
import { useDemoStore } from '../../store/demoStore';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionAlternativeLike;
  length: number;
}

interface SpeechRecognitionResultListLike {
  [index: number]: SpeechRecognitionResultLike;
  length: number;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const extractFirstNumber = (text: string) => {
  const match = text.match(/(10|[0-9])\s*(?:分|\/10)/);
  return match?.[1];
};

const findLocation = (text: string, fallbackLocation: string) => {
  const dictionary: Array<[string, string]> = [
    ['头', '头部'],
    ['颈', '颈部'],
    ['肩', '肩部'],
    ['胸', '胸部'],
    ['腹', '腹部'],
    ['腰', '腰背'],
    ['臀', '臀部'],
    ['膝', '膝部'],
    ['腿', '下肢'],
    ['足', '足部'],
  ];
  const hits = dictionary
    .filter(([keyword]) => text.includes(keyword))
    .map(([, label]) => label);
  return hits.length > 0 ? Array.from(new Set(hits)).join(' + ') : fallbackLocation;
};

const byKeyword = (text: string, groups: Array<{ keywords: string[]; output: string }>, fallback: string) => {
  const matched = groups.find((group) => group.keywords.some((keyword) => text.includes(keyword)));
  return matched?.output ?? fallback;
};

const parseTranscriptToFields = (text: string, fallbackFields: ExtractionField[]) => {
  const fallback = new Map(fallbackFields.map((field) => [field.key, field.value]));
  const normalized = text.replace(/\s+/g, '');
  const score = extractFirstNumber(normalized);

  return [
    {
      key: 'location',
      label: '部位',
      value: findLocation(normalized, fallback.get('location') ?? '未识别，请手动补充'),
    },
    {
      key: 'pain_score',
      label: '强度',
      value: score ? `${score} / 10` : fallback.get('intensity') ?? '未识别，请手动补充',
    },
    {
      key: 'trigger',
      label: '诱因',
      value: byKeyword(
        normalized,
        [
          { keywords: ['走路', '行走', '久站'], output: '活动/行走后加重' },
          { keywords: ['久坐'], output: '久坐后加重' },
          { keywords: ['受凉', '天气'], output: '受凉或天气变化相关' },
        ],
        fallback.get('trigger') ?? '未明确提及',
      ),
    },
    {
      key: 'relief',
      label: '缓解',
      value: byKeyword(
        normalized,
        [
          { keywords: ['热敷'], output: '热敷后缓解' },
          { keywords: ['拉伸'], output: '拉伸后缓解' },
          { keywords: ['休息'], output: '休息后缓解' },
          { keywords: ['止痛药', '吃药', '口服'], output: '用药后部分缓解' },
        ],
        fallback.get('relief') ?? '未明确提及',
      ),
    },
    {
      key: 'medication',
      label: '用药',
      value: /止痛药|吃药|口服|贴膏/.test(normalized) ? '已提及用药' : '未提及用药',
    },
    {
      key: 'sleep',
      label: '睡眠',
      value: /夜间|睡|失眠|醒/.test(normalized) ? '睡眠受影响' : '未提及睡眠影响',
    },
  ];
};

export function AIExtractPanel() {
  const scenarioId = useDemoStore((state) => state.scenarioId);
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);
  const [transcriptDraft, setTranscriptDraft] = useState(scenario.transcript);
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('点击按钮可开始语音录入。');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const speechSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  const redacted = useMemo(() => redactQuery(scenario.redactionQuery), [scenario.redactionQuery]);
  const extractionFields = useMemo(
    () => parseTranscriptToFields(transcriptDraft, scenario.extraction),
    [scenario.extraction, transcriptDraft],
  );

  const startVoice = () => {
    if (!speechSupported) {
      setVoiceMessage('当前浏览器不支持语音识别，可直接编辑文本区进行演示。');
      return;
    }

    const RecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setVoiceMessage('语音识别初始化失败，请改用手动输入。');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new RecognitionCtor();
      recognition.lang = 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const parts: string[] = [];
        for (let index = 0; index < event.results.length; index += 1) {
          const transcript = event.results[index][0]?.transcript;
          if (transcript) {
            parts.push(transcript.trim());
          }
        }
        if (parts.length > 0) {
          setTranscriptDraft(parts.join('，'));
        }
      };
      recognition.onend = () => {
        setIsListening(false);
        setVoiceMessage('录音已结束，可继续编辑并确认结构化结果。');
      };
      recognition.onerror = () => {
        setIsListening(false);
        setVoiceMessage('语音识别中断，请重试或改用手动输入。');
      };
      recognitionRef.current = recognition;
    }

    recognitionRef.current.start();
    setIsListening(true);
    setVoiceMessage('正在监听，请自然描述疼痛情况...');
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div className="feature-grid" id="extract-section">
      <GlassCard>
        <SectionTitle
          kicker="Scene B / Structured AI"
          title="语音一句话 -> AI 自动结构化"
          description="Agent 先结构化，再给可解释建议与引用。检索前默认走脱敏，避免敏感信息外发。"
        />

        <div className="extract-layout">
          <div className="chat-thread">
            <motion.div
              className="chat-bubble chat-bubble--user"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="chat-bubble__label">用户语音转写</p>
              <textarea
                className="voice-input"
                value={transcriptDraft}
                onChange={(event) => setTranscriptDraft(event.target.value)}
                aria-label="语音转写文本"
              />

              <div className="voice-actions">
                <button type="button" className={isListening ? 'primary-btn voice-btn' : 'ghost-btn voice-btn'} onClick={isListening ? stopVoice : startVoice}>
                  {isListening ? '停止录音' : '语音输入'}
                </button>
                <button
                  type="button"
                  className="ghost-btn voice-btn"
                  onClick={() => setTranscriptDraft(scenario.transcript)}
                >
                  载入场景样例
                </button>
              </div>

              <p className="voice-tip">{voiceMessage}</p>
            </motion.div>

            <motion.div
              className="chat-bubble chat-bubble--ai"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="chat-bubble__label">AI Agent 建议</p>
              <p>{scenario.agentReply}</p>
              <p className="citation-tag">引用：{scenario.citation}</p>
              <button type="button" className="ghost-btn">
                播放 2 分钟缓解视频
              </button>
            </motion.div>
          </div>

          <div className="extract-result">
            <p className="extract-result__title">PainEntry JSON（规则解析 + 人工确认）</p>
            <div className="extract-result__list">
              {extractionFields.map((field, index) => (
                <motion.div
                  className="extract-row"
                  key={field.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </motion.div>
              ))}
            </div>

            <div className="redaction-flow">
              <p className="extract-result__title">脱敏检索流程（可替换 ima 接口）</p>
              <div className="redaction-box">
                <span>脱敏前 Query</span>
                <strong>{scenario.redactionQuery}</strong>
              </div>
              <div className="redaction-box redaction-box--safe">
                <span>脱敏后 Query</span>
                <strong>{redacted}</strong>
              </div>
            </div>

            <div className="extract-result__actions">
              <button type="button" className="ghost-btn">
                改一处
              </button>
              <button type="button" className="primary-btn">
                确认入库
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
