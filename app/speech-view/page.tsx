'use client'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const SPEECH_URL = 'https://sanggyepaik-rehab.vercel.app/speech-view'

export default function SpeechPage() {
  const [showQR, setShowQR] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-teal-700 rounded-2xl p-4 mb-6 text-white">
          <p className="text-xs opacity-70">상계백병원 재활치료실</p>
          <h1 className="text-lg font-bold">언어치료실</h1>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">콘텐츠 구성</h2>
          {[
            { emoji: '🫁', name: '호흡연습', desc: '들이쉬기 → 참기 → 내쉬기' },
            { emoji: '👄', name: '구강운동', desc: '입술/혀 운동' },
            { emoji: '🗣️', name: '조음교대운동', desc: '퍼/터/커/라/리' },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl mb-2">
              <span className="text-2xl">{c.emoji}</span>
              <div>
                <div className="font-medium text-gray-800 text-sm">{c.name}</div>
                <div className="text-xs text-gray-400">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowQR(true)}
          className="w-full bg-teal-600 text-white rounded-xl p-4 font-medium">
          QR 코드 표시
        </button>
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">언어치료실 QR</h2>
          <p className="text-sm text-gray-500 mb-6">환자 폰으로 찍어주세요</p>
          <QRCodeSVG value={SPEECH_URL} size={220} className="mb-6" />
          <p className="text-xs text-gray-400 mb-8">
            호흡연습 → 구강운동 → 조음교대운동
          </p>
          <button
            onClick={() => setShowQR(false)}
            className="w-full max-w-xs border border-gray-200 rounded-xl p-3 text-sm text-gray-600">
            닫기
          </button>
        </div>
      )}
    </div>
  )
}