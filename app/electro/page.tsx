'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { QRCodeSVG } from 'qrcode.react'

const PHASES = [
  { id: 'early', name: '초기' },
  { id: 'mid', name: '중기' },
  { id: 'late', name: '말기' },
]

type Patient = { id: string; name: string }
type Therapist = { id: string; name: string }
type Exercise = {
  id: string
  name_kr: string
  category: string
  difficulty: number
  default_sets: string
  default_reps: string
  default_freq: string
  caution: string
}
type Selected = Exercise & {
  sets: string
  reps: string
  freq: string
  side: string
  caution: string
}

export default function ElectroPage() {
  const [step, setStep] = useState<'search' | 'prescribe'>('search')
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [selectedTherapist, setSelectedTherapist] = useState('')
  const [selectedPhase, setSelectedPhase] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedExercises, setSelectedExercises] = useState<Selected[]>([])
  const [popupExercise, setPopupExercise] = useState<Exercise | null>(null)
  const [popupSets, setPopupSets] = useState('')
  const [popupReps, setPopupReps] = useState('')
  const [popupFreq, setPopupFreq] = useState('')
  const [popupSide, setPopupSide] = useState('양측')
  const [popupCaution, setPopupCaution] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [qrToken, setQrToken] = useState('')

  useEffect(() => {
    supabase
      .from('therapists')
      .select('*')
      .eq('room_tag', 'electro')
      .eq('is_active', true)
      .then(({ data }) => setTherapists((data as Therapist[]) || []))
  }, [])

  useEffect(() => {
    if (search.length < 1) { setPatients([]); return }
    supabase
      .from('patients')
      .select('*')
      .eq('room_tag', 'electro')
      .ilike('name', `%${search}%`)
      .then(({ data }) => setPatients((data as Patient[]) || []))
  }, [search])

  useEffect(() => {
    if (!selectedPhase) { setExercises([]); return }
    supabase
      .from('exercises')
      .select('*')
      .eq('room_tag', 'electro')
      .eq('phase', selectedPhase)
      .eq('is_active', true)
      .then(({ data }) => setExercises((data as Exercise[]) || []))
  }, [selectedPhase])

  const addPatient = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const { data } = await supabase
      .from('patients')
      .insert({ name: newName.trim(), room_tag: 'electro' })
      .select()
      .single()
    if (data) { setSelectedPatient(data as Patient); setStep('prescribe') }
    setNewName('')
    setLoading(false)
  }

  const openPopup = (e: Exercise) => {
    if (selectedExercises.find(s => s.id === e.id)) return
    if (selectedExercises.length >= 5) { alert('최대 5개까지 선택 가능합니다'); return }
    setPopupExercise(e)
    setPopupSets(e.default_sets || '3')
    setPopupReps(e.default_reps || '10회')
    setPopupFreq(e.default_freq || '1일2회')
    setPopupSide('양측')
    setPopupCaution(e.caution || '')
  }

  const confirmPopup = () => {
    if (!popupExercise) return
    setSelectedExercises(prev => [...prev, {
      ...popupExercise,
      sets: popupSets,
      reps: popupReps,
      freq: popupFreq,
      side: popupSide,
      caution: popupCaution,
    }])
    setPopupExercise(null)
  }

  const handleSave = async () => {
    if (!selectedPatient || !selectedTherapist) {
      alert('치료사를 선택해주세요')
      return
    }
    setSaving(true)
    const { data: program } = await supabase
      .from('programs')
      .insert({
        patient_id: selectedPatient.id,
        therapist_id: selectedTherapist,
        room_tag: 'electro',
        body_part: 'shoulder',
        phase: selectedPhase,
      })
      .select()
      .single()

    if (!program) { setSaving(false); return }

    await supabase.from('program_exercises').insert(
      selectedExercises.map((e, i) => ({
        program_id: program.id,
        exercise_id: e.id,
        sets: e.sets,
        reps: e.reps,
        freq: e.freq,
        side: e.side,
        caution: e.caution,
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
    setSelectedExercises([])
    setSelectedPhase('')
    setSelectedTherapist('')
    setSelectedPatient(null)
    setStep('search')
  }

  if (step === 'search') return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-blue-800 rounded-2xl p-4 mb-4 text-white">
          <p className="text-xs opacity-70">상계백병원 재활치료실</p>
          <h1 className="text-lg font-bold">열전기치료실</h1>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">환자 검색</h2>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="환자 이름 입력"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {patients.map(p => (
            <button key={p.id}
              onClick={() => { setSelectedPatient(p); setStep('prescribe') }}
              className="w-full text-left mt-2 p-3 border border-gray-100 rounded-xl hover:bg-blue-50 text-sm">
              {p.name}
            </button>
          ))}
          {search.length > 0 && patients.length === 0 && (
            <p className="text-sm text-gray-400 mt-2 text-center">검색 결과 없음</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">신규 환자 등록</h2>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPatient()}
            placeholder="환자 이름 입력"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          <button onClick={addPatient} disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl p-3 text-sm font-medium">
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-blue-800 rounded-2xl p-4 mb-4 text-white">
          <p className="text-xs opacity-70">열전기치료실</p>
          <h1 className="text-lg font-bold">{selectedPatient?.name} 님</h1>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">담당 치료사</h2>
          <div className="flex gap-2 flex-wrap">
            {therapists.map(t => (
              <button key={t.id}
                onClick={() => setSelectedTherapist(t.id)}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  selectedTherapist === t.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">단계 선택</h2>
          <div className="grid grid-cols-3 gap-2">
            {PHASES.map(p => (
              <button key={p.id}
                onClick={() => setSelectedPhase(p.id)}
                className={`p-3 rounded-xl text-sm border transition text-center font-bold ${
                  selectedPhase === p.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {exercises.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-1">운동 목록 ({exercises.length}개)</h2>
            <p className="text-xs text-gray-400 mb-3">탭하면 처방 입력 · 최대 5개</p>
            {exercises.map(e => {
              const isSelected = !!selectedExercises.find(s => s.id === e.id)
              return (
                <button key={e.id} onClick={() => openPopup(e)}
                  className={`w-full text-left p-3 border rounded-xl mb-2 text-sm transition ${
                    isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-blue-300'
                  }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">{e.name_kr}</div>
                      <div className="text-gray-400 text-xs mt-1">{e.category} · 난이도 {e.difficulty}</div>
                    </div>
                    {isSelected && <span className="text-blue-500 text-xs font-bold">✓</span>}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {selectedExercises.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">처방 목록 ({selectedExercises.length}/5)</h2>
            {selectedExercises.map((e, i) => (
              <div key={e.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl mb-2">
                <div>
                  <div className="text-sm font-medium text-gray-800">{e.name_kr}</div>
                  <div className="text-xs text-gray-400">{e.sets}세트 · {e.reps} · {e.freq} · {e.side}</div>
                </div>
                <button onClick={() => setSelectedExercises(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-red-400 text-xs">삭제</button>
              </div>
            ))}
            <button onClick={handleSave} disabled={saving}
              className="w-full bg-blue-600 text-white rounded-xl p-3 text-sm font-medium mt-2">
              {saving ? '저장 중...' : '처방 완료 → QR 생성'}
            </button>
          </div>
        )}

        <button onClick={resetAll}
          className="w-full mt-4 p-3 text-sm text-gray-400">
          ← 환자 다시 선택
        </button>
      </div>

      {popupExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-end z-50">
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-md mx-auto">
            <h3 className="font-bold text-gray-800 mb-1">{popupExercise.name_kr}</h3>
            <p className="text-xs text-gray-400 mb-4">{popupExercise.category}</p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: '세트', value: popupSets, set: setPopupSets },
                { label: '횟수', value: popupReps, set: setPopupReps },
                { label: '빈도', value: popupFreq, set: setPopupFreq },
              ].map(item => (
                <div key={item.label}>
                  <label className="text-xs text-gray-500 mb-1 block">{item.label}</label>
                  <input value={item.value} onChange={e => item.set(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm text-center focus:outline-none" />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">좌 / 우</label>
              <div className="flex gap-2">
                {['양측', '좌측', '우측'].map(s => (
                  <button key={s} onClick={() => setPopupSide(s)}
                    className={`flex-1 p-2 rounded-lg text-sm border transition ${
                      popupSide === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">주의사항</label>
              <input value={popupCaution} onChange={e => setPopupCaution(e.target.value)}
                placeholder="주의사항 입력"
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setPopupExercise(null)}
                className="flex-1 p-3 border border-gray-200 rounded-xl text-sm text-gray-600">
                취소
              </button>
              <button onClick={confirmPopup}
                className="flex-grow p-3 bg-blue-600 text-white rounded-xl text-sm font-medium">
                확인 → 추가
              </button>
            </div>
          </div>
        </div>
      )}

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
            className="w-full max-w-xs bg-blue-600 text-white rounded-xl p-3 text-sm font-medium">
            완료 → 새 환자
          </button>
        </div>
      )}
    </div>
  )
}