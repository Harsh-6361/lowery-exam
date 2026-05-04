'use client';

import { useEffect, useState } from 'react';

interface ProblemStatement {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export default function ProblemStatementsPage() {
  const [problems, setProblems] = useState<ProblemStatement[]>([]);

  useEffect(() => {
    fetch('/api/problem-statements')
      .then(res => res.json())
      .then(data => setProblems(data));
  }, []);

  return (
    <div>
      <h1>Problem Statements</h1>
      <ul>
        {problems.map(p => (
          <li key={p.id}>
            <h2>{p.title}</h2>
            <p>{p.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
