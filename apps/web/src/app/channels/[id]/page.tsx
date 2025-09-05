import { Shell } from "@/components/layout/shell"
import { ChannelDetails } from "@/components/channels/channel-details-real"

export default function ChannelDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Shell>
      <ChannelDetails channelId={params.id} />
    </Shell>
  )
}
