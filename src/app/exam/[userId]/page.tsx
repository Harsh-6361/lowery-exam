import ExamInterface from '@/components/ExamInterface'

export default function ExamPage({ params }: { params: { userId: string } }) {
  return <ExamInterface userId={parseInt(params.userId)} />
}
