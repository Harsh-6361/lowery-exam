'use client'

import { useState, useEffect } from 'react'

interface Question {
  id: number
  questionText: string
  options: string[]
  correctOptionIndex: number
}

export default function ExamInterface({ userId }: { userId: number }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<{ score: number; total: number } | null>(null)

  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => setQuestions(data))
  }, [])

  const handleSelect = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleSubmit = async () => {
    const res = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId.toString(), answers }),
    })
    const data = await res.json()
    setScore(data)
    setSubmitted(true)
  }

  if (questions.length === 0) return <div>Loading...</div>

  if (submitted && score) {
    return <div>Score: {score.score}/{score.total}</div>
  }

  const current = questions[currentIndex]

  if (!current) return <div>Loading...</div>

  return (
    <div>
      <h2>{current.questionText}</h2>
      {current.options.map((opt, i) => (
        <div key={i}>
          <input
            type="radio"
            id={`option-${i}`}
            name={`question-${current.id}`}
            value={i}
            checked={answers[current.id] === i}
            onChange={() => handleSelect(current.id, i)}
          />
          <label htmlFor={`option-${i}`}>{opt}</label>
        </div>
      ))}
      <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}>Previous</button>
      <button onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}>Next</button>
      <button onClick={handleSubmit}>Submit Exam</button>
    </div>
  )
}
