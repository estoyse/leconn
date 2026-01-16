import Sidebar from '@/components/sidebar/sidebar'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_sidebarWrapper')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Sidebar />
}
