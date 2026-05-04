'use client';

import { useState, useEffect } from 'react';

interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  createdAt: string;
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState('');

  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, []);

  const addQuestion = async () => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText,
        options: options.split(',').map(o => o.trim()),
        correctOptionIndex: parseInt(correctOptionIndex),
      }),
    });
    const newQuestion = await res.json();
    setQuestions([newQuestion, ...questions]);
    setQuestionText('');
    setOptions('');
    setCorrectOptionIndex('');
  };

  const deleteQuestion = async (id: number) => {
    await fetch(`/api/questions?id=${id}`, { method: 'DELETE' });
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div>
      <div>
        <input
          placeholder="Question text"
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
        />
        <input
          placeholder="Options (comma-separated)"
          value={options}
          onChange={e => setOptions(e.target.value)}
        />
        <input
          placeholder="Correct option index"
          type="number"
          value={correctOptionIndex}
          onChange={e => setCorrectOptionIndex(e.target.value)}
        />
        <button onClick={addQuestion}>Add Question</button>
      </div>
      <ul>
        {questions.map(q => (
          <li key={q.id}>
            {q.questionText}
            <button onClick={() => deleteQuestion(q.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
