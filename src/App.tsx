import * as React from "react"
import {
  AppShell,
  SidebarRail,
  Header,
  PageShell
} from "@/components/layout"
import { TabsNav } from "@/components/navigation"
import { navigationConfig } from "@/config/navigation"
import {
  TooltipProvider,
} from "@/components/ui/tooltip"
import { UbitsToaster } from "@/components/feedback"
import { SurveyAnalyticsDashboard } from "@/screens/SurveyAnalyticsDashboard"

function App() {
  const [activeNavId, setActiveNavId] = React.useState(navigationConfig[1].id) // Default to Learning
  const [selectedTabId, setSelectedTabId] = React.useState<string | null>(null)

  const activeNav = navigationConfig.find(n => n.id === activeNavId) || navigationConfig[0]

  // Compute activeTabId: use selected tab if valid, otherwise use first tab of active nav
  const activeTabId = selectedTabId && activeNav.tabs?.some(t => t.id === selectedTabId)
    ? selectedTabId
    : (activeNav.tabs?.[0]?.id ?? "")

  return (
    <TooltipProvider>
      <UbitsToaster />
      <AppShell
        sidebar={
          <SidebarRail 
            activeId={activeNavId} 
            onItemSelect={(id) => setActiveNavId(id)} 
          />
        }
      header={
        <Header 
          title={activeNav.label} 
          description={activeNav.description}
          breadcrumbs={activeNav.breadcrumbs}
        />
      }
    >
      <div className="flex flex-col h-full">
        {/* Navigation Tabs (Only if present) */}
        {activeNav.tabs && activeNav.tabs.length > 0 && (
          <TabsNav
            tabs={activeNav.tabs}
            activeTabId={activeTabId}
            onTabChange={(id) => setSelectedTabId(id)}
          />
        )}

        <PageShell>
          {/* Phase 8.4: Survey Analytics Dashboard - Technical Demo */}
          <SurveyAnalyticsDashboard />
        </PageShell>
      </div>
      </AppShell>
    </TooltipProvider>
  )
}

export default App
