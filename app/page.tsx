'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ROOMS = [
  { id: 'electro',   name: '열전기치료실',    password: '1234' },
  { id: 'exercise',  name: '운동치료실',      password: '1234' },
  { id: 'pediatric', name: '소아운동치료실',  password: '1234' },
  { id: 'ot',        name: '작업치료실',      password: '1234' },
  { id: 'speech',    name: '언어치료실',      password: '1234' },
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
    router.push(`/${selectedRoom}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">

        {/* 상백이 로고 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-xl font-bold text-gray-800">상계백병원</h1>
          <p className="text-sm text-gray-500">재활의학과 물리치료실</p>
        </div>

        {/* 치료실 선택 */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            치료실 선택
          </label>
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

        {/* 비밀번호 */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호를 입력하세요"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* 로그인 버튼 */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white rounded-xl p-3 font-medium hover:bg-blue-700 transition"
        >
          입장하기
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">
          상백이와 홈런! 🏠
        </p>
      </div>
    </div>
  )
}