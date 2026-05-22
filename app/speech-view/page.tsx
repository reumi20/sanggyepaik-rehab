'use client'
import { useState, useEffect } from 'react'

const CONTENTS = [
  {
    id: 'breathing',
    emoji: '🫁',
    name: '호흡연습',
    steps: [
      { text: '코로 천천히 들이쉬기', duration: 5 },
      { text: '잠깐 참기', duration: 3 },
      { text: '입으로 천천히 내쉬기', duration: 6 },
    ],
    repeat: '5회 반복',
    caution: '어지러우면 즉시 중단',
  },
  {
    id: 'oral_motor',
    emoji: '👄',
    name: '구강운동',
    steps: [
      { text: '입술 오므리기 → 펴기', duration: 10 },
      { text: '혀 앞으로 내밀기 → 넣기', duration: 10 },
      { text: '혀 좌우로 움직이기', duration: 10 },
      { text: '볼 부풀리기 → 내보내기', duration: 10 },
    ],
    repeat: '각 10회 반복',
    caution: '천천히 정확하게',
  },
  {
    id: 'articulation',
    emoji: '🗣️',
    name: '조음교대운동',
    steps: [
      { text: '퍼퍼퍼퍼퍼', duration: 10 },
      { text: '터터터터터', duration: 10 },
      { text: '커커커커커', duration: 10 },
      { text: '라라라라라', duration: 10 },
      { text: '퍼터커  퍼터커', duration: 10 },
    ],
    repeat: '각 5회 반복',
    caution: '천천히 정확하게 발음',
  },
]

export default function SpeechViewPage() {
  const [currentContent, setCurrentContent] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [timer, setTimer] = useState<number | null>(null)
  const [running, setRunning] = useState(false)

  const content = CONTENTS[currentContent]
  const step = content.steps[currentStep]

  // 타이머
  useEffect(() => {
    if (!running) return
    if (timer === null) return
    if (timer === 0) {
      // 다음 스텝으로
      if (currentStep < content.steps.length - 1) {
        setCurrentStep(i => i + 1)
        setTimer(content.steps[currentStep + 1].duration)
      } else {
        setRunning(false)
        setTimer(null)
      }
      return
    }
    const id = setTimeout(() => setTimer(t => (t !== null ? t - 1 : null)), 1000)
    return () => clearTimeout(id)
  }, [running, timer, currentStep, content.steps])

  const startTimer = () => {
    setCurrentStep(0)
    setTimer(content.steps[0].duration)
    setRunning(true)
  }

  const stopTimer = () => {
    setRunning(false)
    setTimer(null)
    setCurrentStep(0)
  }

  const changeContent = (i: number) => {
    setCurrentContent(i)
    setCurrentStep(0)
    setTimer(null)
    setRunning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-teal-700 p-4 text-white">
        <p className="text-xs opacity-70">상백이와 홈런! ⚾</p>
        <p className="font-bold">언어치료실 홈 프로그램</p>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          {CONTENTS.map((c, i) => (
            <button key={c.id} onClick={() => changeContent(i)}
              className={`flex-1 p-2 rounded-xl text-center text-xs border-2 transition ${
                currentContent === i
                  ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold'
                  : 'border-gray-200 text-gray-400'
              }`}>
              {c.emoji}<br />{c.name}
            </button>
          ))}
        </div>

        {/* 카드 */}
        <div className="bg-teal-700 rounded-2xl p-6 text-white mb-4">
          <div className="text-5xl mb-3 text-center">{content.emoji}</div>
          <h2 className="text-xl font-bold mb-4 text-center">{content.name}</h2>

          {/* 현재 스텝 */}
          <div className={`rounded-xl p-4 mb-3 text-center ${
            running ? 'bg-white' : 'bg-white bg-opacity-20'
          }`}>
            <p className={`font-bold text-lg mb-2 ${running ? 'text-teal-800' : 'text-white'}`}>
              {step.text}
            </p>
            {running && timer !== null && (
              <div className="text-5xl font-bold text-teal-600">{timer}</div>
            )}
          </div>

          {/* 전체 스텝 */}
          {!running && (
            <div className="space-y-2 mb-4">
              {content.steps.map((s, i) => (
                <div key={i} className="bg-white rounded-lg p-3 text-sm text-teal-800">
                  {i + 1}. {s.text} ({s.duration}초)
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-lg p-2 text-sm text-center font-bold text-teal-700">
            {content.repeat}
          </div>
        </div>

        {/* 주의사항 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-yellow-700">⚠️ {content.caution}</p>
        </div>

        {/* 버튼 */}
        {!running ? (
          <button onClick={startTimer}
            className="w-full bg-teal-600 text-white rounded-xl p-4 font-bold text-lg mb-3">
            ▶ 시작
          </button>
        ) : (
          <button onClick={stopTimer}
            className="w-full bg-red-500 text-white rounded-xl p-4 font-bold text-lg mb-3">
            ■ 중단
          </button>
        )}

        {/* 네비게이션 */}
        <div className="flex gap-3">
          <button onClick={() => changeContent(Math.max(0, currentContent - 1))}
            disabled={currentContent === 0}
            className="flex-1 p-3 border border-gray-200 rounded-xl text-sm text-gray-600 disabled:opacity-30">
            ← 이전
          </button>
          <button onClick={() => changeContent(Math.min(CONTENTS.length - 1, currentContent + 1))}
            disabled={currentContent === CONTENTS.length - 1}
            className="flex-1 p-3 bg-teal-600 text-white rounded-xl text-sm font-medium disabled:opacity-30">
            다음 →
          </button>
        </div>
      </div>
    </div>
  )
}