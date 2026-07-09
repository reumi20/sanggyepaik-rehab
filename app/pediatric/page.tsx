'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { QRCodeSVG } from 'qrcode.react'

type Patient = { id: string; name: string }
type Therapist = { id: string; name: string }
type Exercise = {
  id: string
  name_kr: string
  default_sets: string
  default_reps: string
  default_freq: string
  caution: string
}

export default function PediatricPage() {
  const [step, setStep] = useState<'search' | 'prescribe'>('search')
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [selectedTherapist, setSelectedTherapist] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [qrToken, setQrToken] = useState('')

  useEffect(() => {
    supabase.from('therapists').select('*')
      .eq('room_tag', 'pediatric').eq('is_active', true)
      .then(({ data }) => setTherapists((data as Therapist[]) || []))

    supabase.from('exercises').select('*')
      .eq('room_tag', 'pediatric').eq('is_active', true)
      .then(({ data }) => setExercises((data as Exercise[]) || []))
  }, [])

  useEffect(() => {
    if (search.length < 1) { setPatients([]); return }
    supabase.from('patients').select('*')
      .eq('room_tag', 'pediatric')
      .ilike('name', `%${search}%`)
      .then(({ data }) => setPatients((data as Patient[]) || []))
  }, [search])

  const addPatient = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const { data } = await supabase.from('patients')
      .insert({ name: newName.trim(), room_tag: 'pediatric' })
      .select().single()
    if (data) { setSelectedPatient(data as Patient); setStep('prescribe') }
    setNewName('')
    setLoading(false)
  }

  const toggleExercise = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(e => e !== id))
    } else {
      setSelectedIds(prev => [...prev, id])
    }
  }

  const handleSave = async () => {
    if (!selectedPatient || !selectedTherapist) {
      alert('치료사를 선택해주세요'); return
    }
    if (selectedIds.length === 0) {
      alert('운동을 선택해주세요'); return
    }
    setSaving(true)

    const { data: program } = await supabase.from('programs')
      .insert({
        patient_id: selectedPatient.id,
        therapist_id: selectedTherapist,
        room_tag: 'pediatric',
      })
      .select().single()

    if (!program) { setSaving(false); return }

    // 선택한 순서대로 저장
    const selected = selectedIds.map(id => exercises.find(e => e.id === id)!)
    await supabase.from('program_exercises').insert(
      selected.map((e, i) => ({
        program_id: program.id,
        exercise_id: e.id,
        sets: e.default_sets || '-',
        reps: e.default_reps || '-',
        freq: e.default_freq || '-',
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
    setSelectedIds([])
    setSelectedTherapist('')
    setSelectedPatient(null)
    setStep('search')
  }

  if (step === 'search') return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-purple-800 rounded-2xl p-4 mb-4 text-white">
          <p className="text-xs opacity-70">상계백병원 재활치료실</p>
          <h1 className="text-lg font-bold">소아운동치료실</h1>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">환자 검색</h2>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="환자 이름 입력"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          {patients.map(p => (
            <button key={p.id}
              onClick={() => { setSelectedPatient(p); setStep('prescribe') }}
              className="w-full text-left mt-2 p-3 border border-gray-100 rounded-xl hover:bg-purple-50 text-sm">
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
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" />
          <button onClick={addPatient} disabled={loading}
            className="w-full bg-purple-600 text-white rounded-xl p-3 text-sm font-medium">
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-purple-800 rounded-2xl p-4 mb-4 text-white">
          <p className="text-xs opacity-70">소아운동치료실</p>
          <h1 className="text-lg font-bold">{selectedPatient?.name} 님</h1>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">담당 치료사</h2>
          <div className="flex gap-2 flex-wrap">
            {therapists.map(t => (
              <button key={t.id} onClick={() => setSelectedTherapist(t.id)}
                className={`px-4 py-2 rounded-full text-sm border transition ${
                  selectedTherapist === t.id
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-1">
            운동 선택 ({selectedIds.length}개)
          </h2>
          <p className="text-xs text-gray-400 mb-3">선택한 순서대로 QR에 표시돼요</p>
          {exercises.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">운동 데이터 준비 중...</p>
          )}
          {exercises.map((e, idx) => {
            const selectedOrder = selectedIds.indexOf(e.id)
            const isSelected = selectedOrder !== -1
            return (
              <button key={e.id} onClick={() => toggleExercise(e.id)}
                className={`w-full text-left p-3 border rounded-xl mb-2 text-sm transition ${
                  isSelected ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-purple-300'
                }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800">{e.name_kr}</div>
                    <div className="text-gray-400 text-xs mt-1">{e.default_reps}</div>
                  </div>
                  {isSelected && (
                    <span className="text-purple-500 text-xs font-bold">
                      {selectedOrder + 1}번째
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {selectedIds.length > 0 && (
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-purple-600 text-white rounded-xl p-3 text-sm font-medium mb-4">
            {saving ? '저장 중...' : `처방 완료 → QR 생성 (${selectedIds.length}개)`}
          </button>
        )}

        <button onClick={resetAll} className="w-full p-3 text-sm text-gray-400">
          ← 환자 다시 선택
        </button>
      </div>

      {qrToken && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">QR 생성 완료!</h2>
          <p className="text-sm text-gray-500 mb-6">환자 폰으로 찍어주세요</p>
          <QRCodeSVG
            value={`https://sanggyepaik-rehab.vercel.app/p/${qrToken}`}
            size={200} className="mb-6" />
          <p className="text-sm text-gray-600 mb-1">{selectedPatient?.name} 님</p>
          <p className="text-xs text-gray-400 mb-8">유효기간 1개월</p>
          <button onClick={resetAll}
            className="w-full max-w-xs bg-purple-600 text-white rounded-xl p-3 text-sm font-medium">
            완료 → 새 환자
          </button>
        </div>
      )}
    </div>
  )
}