'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useParams } from 'next/navigation'
import Image from 'next/image'

type Exercise = {
  id: string
  name_kr: string
  sets: string
  reps: string
  freq: string
  side: string
  caution: string
  video_url: string
  sort_order: number
}

export default function PatientPage() {
  const { token } = useParams()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [patientName, setPatientName] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('assignments')
        .select(`
          *,
          patients (name),
          programs (
            program_exercises (
              sort_order, sets, reps, freq, side, caution,
              exercises (name_kr, video_url)
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
          sort_order: pe.sort_order,
        })) || []

      setExercises(exList)
      setLoading(false)
    }
    fetch()
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

  return (
    <div className="min-h-screen bg-gray-50">

     {/* 헤더 */}
     <div className="bg-blue-800 p-4 text-white">
      <div className="flex items-center gap-3 mb-3">
        <Image src="/sangbaek.png" alt="상백이" width={60} height={60} />
        <div>
          <p className="text-xs opacity-70">상백이와 홈런해요! ⚾</p>
          <p className="font-bold text-lg">{patientName} 님의 운동</p>
          <p className="text-xs opacity-60">인제대학교 상계백병원</p>
       </div>
      </div>
     <div className="bg-yellow-400 text-yellow-900 rounded-lg p-2 text-xs">
      ⚠️ 통증이 심해지면 즉시 중단하고 담당 치료사에게 문의하세요
      </div>
     </div>

      {/* 카드 */}
      <div className="p-4">
        <p className="text-xs text-gray-400 text-right mb-2">
          {currentIndex + 1} / {exercises.length}
        </p>

        <div className="bg-blue-700 rounded-2xl p-6 text-white mb-4 min-h-48">
          <p className="text-xs opacity-60 mb-2">운동 {String(currentIndex + 1).padStart(2, '0')}</p>
          <h2 className="text-xl font-bold mb-3">{ex?.name_kr}</h2>
          <p className="text-sm opacity-80 mb-1">
            {ex?.sets}세트 · {ex?.reps} · {ex?.freq}
          </p>
          <p className="text-sm opacity-80 mb-4">{ex?.side}</p>
          {ex?.caution && (
            <div className="bg-white bg-opacity-20 rounded-lg p-2 text-xs">
              ⚠️ {ex.caution}
            </div>
          )}
        </div>

        {/* 영상 버튼 */}
        {ex?.video_url && (
          <a href={ex.video_url} target="_blank" rel="noreferrer"
            className="block w-full bg-white border border-blue-200 text-blue-600 rounded-xl p-3 text-sm font-medium text-center mb-4">
            ▶ 영상 보기
          </a>
        )}

        {/* 네비게이션 */}
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

        {/* 점 인디케이터 */}
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