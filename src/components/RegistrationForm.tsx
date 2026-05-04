'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegistrationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    rollNumber: '',
    course: '',
    semesterYear: '',
    email: '',
    contactNumber: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/waiting/${data.userId}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-6">Exam Registration</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {['name', 'branch', 'rollNumber', 'course', 'semesterYear', 'email', 'contactNumber'].map((field) => (
          <div key={field}>
            <label className="block mb-1 capitalize">
              {field.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              value={formData[field as keyof typeof formData]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        ))}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  )
}
