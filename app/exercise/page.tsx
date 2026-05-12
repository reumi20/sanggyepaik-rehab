'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { QRCodeSVG } from 'qrcode.react'

const CONDITIONS = [
  { id: 'hemiplegia', name: '편마비' },
  { id: 'deconditioning', name: '디컨디셔닝' },
]

const PHASES = [
  { id: '1단계', name: '1단계' },
  { id: '2단계', name: '2단계' },
  { id: '3단계', name: '3단계' },
]

type Patient = { id: string; name: string }
type Therapist = { id: string; name: string }
type Exercise = {
  id: string
  name_kr: string
  category: string
  default_sets: string
  default_reps: string
  caution: string
}

export default function ExercisePage() {
  const [step, setStep] = useState<'search' | 'prescribe'>('search')
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [selectedTherapist, setSelectedTherapist] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [selectedPhase, setSelectedPhase] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [qrToken, setQrToken] = useState('')

  useEffect(() => {
    supabase.from('therapists').select('*')
      .eq('room_tag', 'exercise').eq('is_active', true)
      .then(({ data }) => setTherapists((data as Therapist[]) || []))
  }, [])

  useEffect(() => {
    if (search.length < 1) { setPatients([]); return }
    supabase.from('patients').select('*')
      .eq('room_tag', 'exercise')
      .ilike('name', `%${search}%`)
      .then(({ data }) => setPatients((data as Patient[]) || []))
  }, [search])

  useEffect(() => {
    if (!selectedCondition || !selectedPhase) { setExercises([]); return }
    supabase.from('exercises').select('*')
      .eq('room_tag', 'exercise')
      .eq('condition', selectedCondition)
      .eq('phase', selectedPhase)
      .eq('is_active', true)
      .then(({ data }) => setExercises((data as Exercise[]) || []))
  }, [selectedCondition, selectedPhase])

  const addPatient = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const { data } = await supabase.from('patients')
      .insert({ name: newName.trim(), room_tag: 'exercise' })
      .select().single()
    if (data) { setSelectedPatient(data as Patient); setStep('prescribe') }
    setNewName('')
    setLoading(false)
  }

  const handleSave = async () => {
    if (!selectedPatient || !selectedTherapist) {
      alert('치료사를 선택해주세요'); return
    }
    if (exercises.length === 0) {
      alert('운동을 먼저 선택해주세요'); return
    }
    setSaving(true)

    const { data: program } = await supabase.from('programs')
      .insert({
        patient_id: selectedPatient.id,
        therapist_id: selectedTherapist,
        room_tag: 'exercise',
        phase: selectedPhase,
        condition: selectedCondition,
      })
      .select().single()

    if (!program) { setSaving(false); return }

    await supabase.from('program_exercises').insert(
      exercises.slice(0, 6).map((e, i) => ({
        program_id: program.id,
        exercise_id: e.id,
        sets: e.default_sets || '3',
        reps: e.default_reps || '10회',
        caution: e.caution || '',
        sort_order: i + 1,
      }))
    )

    const token = Math.random().toString(36).substring(2, 15)
    const expires = new Date()
    expires.setMonth(expires.getMonth() + 1)

    await supabase.from('assignments').insert({
      patient_id: selectedPatient.id,
      program_id: program.id,
      token,
      expires_at: expires.toISOString(),
    })

    setQrToken(token)
    setSaving(false)
  }

  const resetAll = () => {
    setQrToken('')
    setSelectedCondition('')
    setSelectedPhase('')
    setSelectedTherapist('')
    setSelectedPatient(null)
    setStep('search')
  }

  if (step === 'search') return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-green-800 rounded-2xl p-4 mb-4 text-white">
          <p className="text-xs opacity-70">상계백병원 재활치료실</p>
          <h1 className="text-lg font-bold">운동치료실</h1>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">환자 검색</h2>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="환자 이름 입력"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          {patients.map(p => (
            <button key={p.id}
              onClick={() => { setSelectedPatient(p); setStep('prescribe') }}
              className="w-full text-left mt-2 p-3 border border-gray-100 rounded-xl hover:bg-green-50 text-sm">
              {p.name}
            </button>
          ))}
          {search.length > 0 && patients.length === 0 && (
            <p className="text-sm text-gray-400 mt-2 text-center">검색 결과 없음</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">신규 환자 등록</h2>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPatient()}
            placeholder="환자 이름 입력"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-3" />
          <button onClick={addPatient} disabled={loading}
            className="w-full bg-green-600 text-white rounded-xl p-3 text-sm font-medium">
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-green-800 rounded-2xl p-4 mb-4 text-white">
          <p className="text-xs opacity-70">운동치료실</p>
          <h1 className="text-lg font-bold">{selectedPatient?.name} 님</h1>
        </div>

        {/* 치료사 */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">담당 치료사</h2>
          <div className="flex gap-2 flex-wrap">
            {therapists.map(t => (
              <button key={t.id} onClick={() => setSelectedTherapist(t.id)}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  selectedTherapist === t.id
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* 질환 선택 */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">질환 선택</h2>
          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map(c => (
              <button key={c.id} onClick={() => setSelectedCondition(c.id)}
                className={`p-3 rounded-xl text-sm border transition font-bold ${
                  selectedCondition === c.id
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* 단계 선택 */}
        {selectedCondition && (
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">단계 선택</h2>
            <div className="grid grid-cols-3 gap-2">
              {PHASES.map(p => (
                <button key={p.id} onClick={() => setSelectedPhase(p.id)}
                  className={`p-3 rounded-xl text-sm border transition font-bold ${
                    selectedPhase === p.id
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 운동 목록 */}
        {exercises.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-1">
              운동 목록 ({Math.min(exercises.length, 6)}개)
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              해당 단계 운동이 자동으로 처방됩니다
            </p>
            {exercises.slice(0, 6).map(e => (
              <div key={e.id}
                className="p-3 border border-green-100 bg-green-50 rounded-xl mb-2 text-sm">
                <div className="font-medium text-gray-800">{e.name_kr}</div>
                <div className="text-gray-400 text-xs mt-1">
                  {e.default_sets}세트 · {e.default_reps}
                </div>
              </div>
            ))}
            <button onClick={handleSave} disabled={saving}
              className="w-full bg-green-600 text-white rounded-xl p-3 text-sm font-medium mt-2">
              {saving ? '저장 중...' : '처방 완료 → QR 생성'}
            </button>
          </div>
        )}

        <button onClick={resetAll}
          className="w-full mt-4 p-3 text-sm text-gray-400">
          ← 환자 다시 선택
        </button>
      </div>

      {qrToken && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">QR 생성 완료!</h2>
          <p className="text-sm text-gray-500 mb-6">환자 폰으로 찍어주세요</p>
          <QRCodeSVG
            value={`https://sanggyepaik-rehab.vercel.app/p/${qrToken}`}
            size={200}
            className="mb-6"
          />
          <p className="text-sm text-gray-600 mb-1">{selectedPatient?.name} 님</p>
          <p className="text-xs text-gray-400 mb-8">유효기간 1개월</p>
          <button onClick={resetAll}
            className="w-full max-w-xs bg-green-600 text-white rounded-xl p-3 text-sm font-medium">
            완료 → 새 환자
          </button>
        </div>
      )}
    </div>
  )
}