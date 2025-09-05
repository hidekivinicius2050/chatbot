import { Shell } from "@/components/layout/shell"
import { CampaignDetails } from "@/components/campaigns/campaign-details"

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Shell>
      <CampaignDetails campaignId={params.id} />
    </Shell>
  )
}
