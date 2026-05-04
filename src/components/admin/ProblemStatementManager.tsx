'use client';

import { useState, useEffect } from 'react';

interface ProblemStatement {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export default function ProblemStatementManager() {
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch('/api/problem-statements')
      .then(res => res.json())
      .then(data => setProblems(data));
  }, []);

  const addProblem = async () => {
    const res = await fetch('/api/problem-statements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    const newProblem = await res.json();
    setProblems([newProblem, ...problems]);
    setTitle('');
    setDescription('');
  };

  const deleteProblem = async (id: number) => {
    await fetch(`/api/problem-statements?id=${id}`, { method: 'DELETE' });
    setProblems(problems.filter(p => p.id !== id));
  };

  return (
    <div>
      <div>
        <input
          placeholder="Problem title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          placeholder="Problem description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button onClick={addProblem}>Add Problem</button>
      </div>
      <ul>
        {problems.map(p => (
          <li key={p.id}>
            {p.title}
            <button onClick={() => deleteProblem(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
