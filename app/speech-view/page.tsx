'use client'
import { useState } from 'react'

const CONTENTS = [
  {
    id: 'breathing',
    emoji: '🫁',
    name: '호흡연습',
    steps: ['코로 천천히 들이쉬기 (4초)', '잠깐 참기 (2초)', '입으로 천천히 내쉬기 (6초)'],
    repeat: '5회 반복',
    caution: '어지러우면 즉시 중단',
  },
  {
    id: 'oral_motor',
    emoji: '👄',
    name: '구강운동',
    steps: ['입술 오므리기 → 펴기', '혀 앞으로 내밀기 → 넣기', '혀 좌우로 움직이기', '볼 부풀리기 → 내보내기'],
    repeat: '각 10회 반복',
    caution: '천천히 정확하게',
  },
  {
    id: 'articulation',
    emoji: '🗣️',
    name: '조음교대운동',
    steps: ['퍼퍼퍼퍼퍼', '터터터터터', '커커커커커', '라라라라라', '퍼터커 퍼터커'],
    repeat: '각 5회 반복',
    caution: '천천히 정확하게 발음',
  },
]

export default function SpeechViewPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const content = CONTENTS[currentStep]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-700 p-4 text-white">
        <p className="text-xs opacity-70">상백이와 홈런! ⚾</p>
        <p className="font-bold">언어치료실 홈 프로그램</p>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* 진행 표시 */}
        <div className="flex gap-2 mb-6">
          {CONTENTS.map((c, i) => (
            <button key={c.id}
              onClick={() => setCurrentStep(i)}
              className={`flex-1 p-2 rounded-xl text-center text-xs border-2 transition ${
                currentStep === i
                  ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold'
                  : i < currentStep
                  ? 'border-gray-200 bg-gray-100 text-gray-400'
                  : 'border-gray-200 text-gray-400'
              }`}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        {/* 카드 */}
        <div className="bg-teal-700 rounded-2xl p-6 text-white mb-4">
          <p className="text-xs opacity-60 mb-2">
            {currentStep + 1} / {CONTENTS.length}
          </p>
          <div className="text-5xl mb-3">{content.emoji}</div>
          <h2 className="text-2xl font-bold mb-4">{content.name}</h2>
          <div className="space-y-2 mb-4">
            {content.steps.map((s, i) => (
              <div key={i} className="bg-white bg-opacity-20 rounded-lg p-3 text-sm">
                {i + 1}. {s}
              </div>
            ))}
          </div>
          <div className="bg-white bg-opacity-30 rounded-lg p-2 text-sm text-center font-bold">
            {content.repeat}
          </div>
        </div>

        {/* 주의사항 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-yellow-700">⚠️ {content.caution}</p>
        </div>

        {/* 네비게이션 */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep(i => Math.max(0, i - 1))}
            disabled={currentStep === 0}
            className="flex-1 p-3 border border-gray-200 rounded-xl text-sm text-gray-600 disabled:opacity-30">
            ← 이전
          </button>
          <button
            onClick={() => setCurrentStep(i => Math.min(CONTENTS.length - 1, i + 1))}
            disabled={currentStep === CONTENTS.length - 1}
            className="flex-1 p-3 bg-teal-600 text-white rounded-xl text-sm font-medium disabled:opacity-30">
            다음 →
          </button>
        </div>
      </div>
    </div>
  )
}