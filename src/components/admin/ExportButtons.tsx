'use client';

export default function ExportButtons() {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => window.open('/api/export/participation', '_blank')}
        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        Export Participation
      </button>
      <button
        onClick={() => window.open('/api/export/winners', '_blank')}
        className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
      >
        Export Winners
      </button>
      <button
        onClick={() => window.open('/api/export/teams-print', '_blank')}
        className="px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700"
      >
        Print Teams List
      </button>
    </div>
  );
}
