import ArchiveList from '@/components/ArchiveList'
import { getAvailableArchives } from '@/lib/archive'

export const dynamic = "force-dynamic"

export default async function ArchivesPage() {
  const archives = await getAvailableArchives()
  
  return <ArchiveList archives={archives} />
}
