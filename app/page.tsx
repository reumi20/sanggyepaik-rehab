'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const ROOMS = [
  { id: 'electro',   name: '열전기치료실',   password: '1234' },
  { id: 'exercise',  name: '운동치료실',     password: '1234' },
  { id: 'pediatric', name: '소아운동치료실', password: '1234' },
  { id: 'ot',        name: '작업치료실',     password: '1234' },
  { id: 'speech',    name: '언어치료실',     password: '1234' },
]

export default function Home() {
  const router = useRouter()
  const [selectedRoom, setSelectedRoom] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    const room = ROOMS.find(r => r.id === selectedRoom)
    if (!room) { setError('치료실을 선택해주세요'); return }
    if (password !== room.password) { setError('비밀번호가 틀렸습니다'); return }
    localStorage.setItem('room', selectedRoom)
    router.push('/' + selectedRoom)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">

        <div className="text-center mb-8">
          <Image
            src="/sangbaek.png"
            alt="상백이"
            width={100}
            height={100}
            className="mx-auto mb-2"
          />
          <h1 className="text-xl font-bold text-gray-800">상계백병원 재활치료실</h1>
          <p className="text-sm text-gray-500">상백이와 홈런해요! ⚾</p>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">치료실 선택</label>
          <select
            value={selectedRoom}
            onChange={e => setSelectedRoom(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">치료실을 선택하세요</option>
            {ROOMS.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호를 입력하세요"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white rounded-xl p-3 font-medium hover:bg-blue-700 transition"
        >
          입장하기
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">
          상백이와 홈런해요! ⚾
        </p>
      </div>
    </div>
  )
}