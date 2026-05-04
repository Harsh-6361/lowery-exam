import TeamGenerator from '@/components/admin/TeamGenerator'
import TeamsList from '@/components/TeamsList'

export default function TeamsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Team Management</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate Teams</h2>
        <TeamGenerator />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">All Teams</h2>
        <TeamsList />
      </div>
    </div>
  )
}
