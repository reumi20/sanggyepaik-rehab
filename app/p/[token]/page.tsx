'use client'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const OT_VIDEOS = {
  adult: 'https://www.youtube.com/watch?v=upTVy8xOZWY',
  pediatric: 'https://youtube.com/shorts/evVx6hvprDU',
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
          </div>
        )}
      </div>
    </div>
  )
}

저장하고 git push 해줘! 😄

git push 하자

터미널에서:

git add .
git commit -m "add ot pediatric video"
git push

😄

열전기도 영상 다 올렸는데. 주의사항은 글씨로 나오는데 설명은 흰바탕에 글씩가 안보이네

app/p/[token]/page.tsx에서 description_kr 부분 찾아서:

tsx
{ex?.description_kr && (
  <div className="bg-white bg-opacity-15 rounded-lg p-2 text-xs">
    {ex.description_kr}
  </div>
)}

이렇게 바꿔줘:

tsx
{ex?.description_kr && (
  <div className="bg-white rounded-lg p-2 text-xs text-gray-700">
    {ex.description_kr}
  </div>
)}

저장하고 git push 해줘! 😄

아니 전체 다 줘

좋아! app/p/[token]/page.tsx 전체 교체해줘:

tsx
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useParams } from 'next/navigation'
import Image from 'next/image'

export default function PatientPage() {
  const { token } = useParams()
  const [exercises, setExercises] = useState<any[]>([])
  const [patientName, setPatientName] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('assignments')
        .select(`
          *,
          patients (name),
          programs (
            program_exercises (
              sort_order, sets, reps, freq, side, caution,
              exercises (name_kr, video_url, image_url, description_kr)
            )
          )
        `)
        .eq('token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (!data) {
        setError('만료되었거나 유효하지 않은 QR입니다')
        setLoading(false)
        return
      }

      setPatientName((data.patients as any)?.name || '')

      const exList = (data.programs as any)
        ?.program_exercises
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        ?.map((pe: any) => ({
          id: pe.sort_order,
          name_kr: pe.exercises?.name_kr,
          sets: pe.sets,
          reps: pe.reps,
          freq: pe.freq,
          side: pe.side,
          caution: pe.caution,
          video_url: pe.exercises?.video_url,
          image_url: pe.exercises?.image_url,
          description_kr: pe.exercises?.description_kr,
          sort_order: pe.sort_order,
        })) || []

      setExercises(exList)
      setLoading(false)
    }
    fetchData()
  }, [token])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  )

  const ex = exercises[currentIndex]

  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('/shorts/')) {
      const id = url.split('/shorts/')[1].split('?')[0]
      return `https://www.youtube.com/embed/${id}?loop=1&playlist=${id}`
    }
    return url
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'www.youtube.com/embed/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-800 p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Image src="/sangbaek.png" alt="상백이" width={60} height={60} />
          <div>
            <p className="text-xs opacity-70">상백이와 홈런(Home-learn)!</p>
            <p className="font-bold text-lg">{patientName} 님의 운동</p>
            <p className="text-xs opacity-60">인제대학교 상계백병원</p>
          </div>
        </div>
        <div className="bg-yellow-400 text-yellow-900 rounded-lg p-2 text-xs">
          ⚠️ 통증이 심해지면 즉시 중단하고 담당 치료사에게 문의하세요
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-400 text-right mb-2">
          {currentIndex + 1} / {exercises.length}
        </p>

        <div className="bg-blue-700 rounded-2xl p-6 text-white mb-4">
          <p className="text-xs opacity-60 mb-2">
            운동 {String(currentIndex + 1).padStart(2, '0')}
          </p>
          <h2 className="text-xl font-bold mb-3">{ex?.name_kr}</h2>

          {ex?.sets && ex?.sets !== '-' && (
            <p className="text-sm opacity-80 mb-1">
              {ex.sets}세트 · {ex.reps} · {ex.freq}
            </p>
          )}

          {ex?.side && ex?.side !== '-' && (
            <p className="text-sm opacity-80 mb-2">{ex.side}</p>
          )}

          {ex?.caution && (
            <div className="bg-yellow-400 text-yellow-900 rounded-lg p-2 text-xs mb-2">
              ⚠️ {ex.caution}
            </div>
          )}

          {ex?.description_kr && (
            <div className="bg-white rounded-lg p-2 text-xs text-gray-700">
              {ex.description_kr}
            </div>
          )}
        </div>

        {ex?.video_url && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <iframe
              src={getEmbedUrl(ex.video_url)}
              className="w-full aspect-[9/16]"
              allowFullScreen
            />
          </div>
        )}

        {ex?.image_url && (
          <div className="mb-4 rounded-xl overflow-hidden bg-white border border-gray-200">
            <img src={ex.image_url} alt={ex?.name_kr} className="w-full" />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex-1 p-3 border border-gray-200 rounded-xl text-sm text-gray-600 disabled:opacity-30">
            ← 이전
          </button>
          <button
            onClick={() => setCurrentIndex(i => Math.min(exercises.length - 1, i + 1))}
            disabled={currentIndex === exercises.length - 1}
            className="flex-1 p-3 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-30">
            다음 →
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {exercises.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all ${
                i === currentIndex ? 'w-4 h-2 bg-blue-600' : 'w-2 h-2 bg-gray-300'
              }`} />
          ))}
        </div>
      </div>
    </div>
  )
}