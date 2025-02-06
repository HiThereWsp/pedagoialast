
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { YoutubeContentGenerator } from '@/components/youtube-content/YoutubeContentGenerator'

export default function YoutubeContentPage() {
  return (
    <ProtectedLayout>
      <YoutubeContentGenerator />
    </ProtectedLayout>
  )
}
