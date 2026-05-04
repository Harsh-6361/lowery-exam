import ExamControls from '@/components/admin/ExamControls';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="mb-8">
        <ExamControls />
      </div>

      <nav className="grid grid-cols-2 gap-4">
        <Link href="/admin/dashboard/questions" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
          Manage Questions
        </Link>
        <Link href="/admin/dashboard/problems" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
          Manage Problem Statements
        </Link>
      </nav>
    </div>
  );
}
