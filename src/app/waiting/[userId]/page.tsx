import WaitingRoom from '@/components/WaitingRoom'

export default function WaitingPage({ params }: { params: { userId: string } }) {
  return <WaitingRoom userId={params.userId} />
}
