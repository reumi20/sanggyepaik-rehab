'use client'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const OT_VIDEOS = {
  adult: https://www.youtube.com/watch?v=upTVy8xOZWY,
  pediatric: 'https://www.youtube.com/watch?v=pediatric_video_url',
}

export default function OTPage() {
  const [selected, setSelected] = useState<'adult' | 'pediatric' | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-orange-700 rounded-2xl p-4 mb-6 text-white">
          <p className="text-xs opacity-70">상계백병원 재활치료실</p>
          <h1 className="text-lg font-bold">작업치료실</h1>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">대상 선택</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelected('adult')}
              className={`p-6 rounded-xl border-2 text-center transition ${
                selected === 'adult'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}>
              <div className="text-3xl mb-2">🧑</div>
              <div className="font-bold text-gray-800">성인</div>
            </button>
            <button
              onClick={() => setSelected('pediatric')}
              className={`p-6 rounded-xl border-2 text-center transition ${
                selected === 'pediatric'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}>
              <div className="text-3xl mb-2">👶</div>
              <div className="font-bold text-gray-800">소아</div>
            </button>
          </div>
        </div>

        {selected && (
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <h2 className="font-bold text-gray-700 mb-2">
              {selected === 'adult' ? '성인' : '소아'} QR 코드
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              환자 폰으로 찍어주세요
            </p>
            <QRCodeSVG
              value={OT_VIDEOS[selected]}
              size={200}
              className="mb-4"
            />
            <p className="text-xs text-gray-400">
              영상 URL 입력 후 사용 가능
            </p>
          </div>
        )}
      </div>
    </div>
  )
}