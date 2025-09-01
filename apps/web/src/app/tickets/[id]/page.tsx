import { Shell } from "@/components/layout/shell"
import { TicketChat } from "@/components/tickets/ticket-chat"

interface TicketPageProps {
  params: {
    id: string
  }
}

export default function TicketPage({ params }: TicketPageProps) {
  return (
    <Shell>
      <TicketChat ticketId={params.id} />
    </Shell>
  )
}
