"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArchivedMonth } from '@/lib/archive'

interface ArchiveListProps {
  archives: ArchivedMonth[]
}

export default function ArchiveList({ archives }: ArchiveListProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Archives</h1>

      {archives.length === 0 ? (
        <Card className="gradient-card">
          <CardContent className="p-6 text-center text-muted-foreground">
            No archived data available. Archives are kept for 5 days after the end of each month.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {archives.map((archive) => (
            <Card 
              key={`${archive.year}-${archive.month}`} 
              className={`gradient-card cursor-pointer transition-all ${!archive.available ? 'opacity-50' : 'hover:shadow-lg'}`}
              onClick={() => archive.available && router.push(`/archives/${archive.year}/${archive.month}` as any)}
            >
              <CardHeader>
                <CardTitle>{archive.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {archive.available 
                      ? 'Available'
                      : 'No longer available'}
                  </span>
                  {archive.available && (
                    <span className="text-sm font-medium text-green-500">View</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
