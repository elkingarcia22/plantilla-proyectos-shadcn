import { useEffect, useState, useCallback } from 'react'
import { PageHeader } from '@/components/utility/PageHeader'
import { DateFilterBar } from '@/components/date/DateFilterBar'
import { SurveyMetricCard } from '@/components/survey-analytics/SurveyMetricCard'
import { FavorabilityDistributionCard } from '@/components/survey-analytics/FavorabilityDistributionCard'
import { ResponseStackedBarGroup } from '@/components/survey-analytics/ResponseStackedBarGroup'
import { ParticipationTrendCard } from '@/components/survey-analytics/ParticipationTrendCard'
import { TrendMetricLineChart } from '@/components/survey-analytics/TrendMetricLineChart'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { getMockSurveyDashboardData } from '@/mocks'
import type { DashboardData, FilterCriteria } from '@/mocks/types'

export function SurveyAnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterMode, setFilterMode] = useState<'period' | 'date' | 'range'>('period')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedRange, setSelectedRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  // Parse URL and fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Parse filters from URL
        const searchParams = new URLSearchParams(window.location.search)
        const fromParam = searchParams.get('from')
        const toParam = searchParams.get('to')
        const modeParam = searchParams.get('mode') as 'period' | 'date' | 'range' | null
        const periodParam = searchParams.get('period')

        let criteria: FilterCriteria = {}

        // Determine which mode is active and set state
        if (modeParam === 'date' && searchParams.get('date')) {
          setFilterMode('date')
          setSelectedDate(new Date(searchParams.get('date')!))
          criteria = {
            dateRange: {
              start: new Date(searchParams.get('date')!),
              end: new Date(searchParams.get('date')!),
            },
          }
        } else if (modeParam === 'range' && fromParam && toParam) {
          setFilterMode('range')
          const fromDate = new Date(fromParam)
          const toDate = new Date(toParam)
          setSelectedRange({ from: fromDate, to: toDate })
          criteria = {
            dateRange: {
              start: fromDate,
              end: toDate,
            },
          }
        } else {
          // Default to period mode
          setFilterMode('period')
          if (periodParam) {
            setSelectedPeriod(periodParam)
          }
          // Calculate date range from period
          const now = new Date()
          let startDate = new Date(now)
          const days = parseInt(selectedPeriod) || 30
          startDate.setDate(now.getDate() - days)
          criteria = {
            dateRange: {
              start: startDate,
              end: now,
            },
          }
        }

        const dashboardData = await getMockSurveyDashboardData(criteria)
        setData(dashboardData)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', fetchData)
    return () => window.removeEventListener('popstate', fetchData)
  }, [])

  // Update URL when filters change
  const updateURL = useCallback(
    (mode: 'period' | 'date' | 'range', value?: string | Date | { from?: Date; to?: Date }) => {
      const params = new URLSearchParams()
      params.set('mode', mode)

      if (mode === 'period' && typeof value === 'string') {
        params.set('period', value)
      } else if (mode === 'date' && value instanceof Date) {
        params.set('date', value.toISOString().split('T')[0])
      } else if (
        mode === 'range' &&
        value &&
        typeof value === 'object' &&
        'from' in value &&
        'to' in value
      ) {
        if (value.from) {
          params.set('from', value.from.toISOString().split('T')[0])
        }
        if (value.to) {
          params.set('to', value.to.toISOString().split('T')[0])
        }
      }

      window.history.replaceState({}, '', `?${params.toString()}`)
    },
    []
  )

  // Handle date filter changes
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    updateURL('period', period)
  }

  const handleDateChange = (date?: Date) => {
    setSelectedDate(date)
    if (date) {
      updateURL('date', date)
    }
  }

  const handleRangeChange = (range?: { from?: Date; to?: Date }) => {
    if (range) {
      setSelectedRange(range)
      updateURL('range', range)
    }
  }

  const handleModeChange = (mode: 'period' | 'date' | 'range') => {
    setFilterMode(mode)
    // Trigger appropriate update
    if (mode === 'period') {
      updateURL('period', selectedPeriod)
    } else if (mode === 'date') {
      if (selectedDate) {
        updateURL('date', selectedDate)
      }
    } else if (mode === 'range') {
      updateURL('range', selectedRange)
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <PageHeader
          title="Survey Analytics Dashboard"
          description="Real-time sentiment tracking and response analysis"
        />

        <div className="flex flex-col gap-6 lg:gap-8">
          {/* Filters skeleton */}
          <Skeleton className="h-12 w-full rounded" />

          {/* KPI Row skeleton */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded" />
            ))}
          </div>

          {/* Favorability skeleton */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-48 rounded" />
            <Skeleton className="h-48 rounded" />
          </div>

          {/* Participation skeleton */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 rounded" />
            <Skeleton className="h-64 rounded" />
          </div>

          {/* Timeline skeleton */}
          <Skeleton className="h-96 rounded" />
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <PageHeader
          title="Survey Analytics Dashboard"
          description="Real-time sentiment tracking and response analysis"
        />

        <Alert variant="destructive">
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check if we have data
  const isEmpty = !data || (data.metrics.length === 0 && data.timeSeries.length === 0)

  // Render empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <PageHeader
          title="Survey Analytics Dashboard"
          description="Real-time sentiment tracking and response analysis"
        />

        <DateFilterBar
          mode={filterMode}
          onModeChange={handleModeChange}
          period={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          date={selectedDate}
          onDateChange={handleDateChange}
          range={selectedRange}
          onRangeChange={handleRangeChange}
        />

        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground">No data available for the selected date range</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting the filters</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render loaded state
  const filteredTimeSeries = data?.timeSeries || []
  const participationSeries = filteredTimeSeries.filter((s) => s.id === 'participation')
  const metricTrends = filteredTimeSeries.filter((s) => s.id !== 'participation')

  // Prepare segment breakdown items (using distribution segments as a placeholder)
  const segmentBreakdownItems =
    data?.distribution.segments.map((segment, index) => ({
      id: `segment-${index}`,
      label: segment.label,
      segments: [segment],
      total: segment.value,
      metadata: `N=${segment.value}`,
    })) || []

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Section */}
      <PageHeader
        title="Survey Analytics Dashboard"
        description="Real-time sentiment tracking and response analysis"
      />

      {/* Filter Section */}
      <section className="flex flex-col gap-4">
        <DateFilterBar
          mode={filterMode}
          onModeChange={handleModeChange}
          period={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          date={selectedDate}
          onDateChange={handleDateChange}
          range={selectedRange}
          onRangeChange={handleRangeChange}
        />
      </section>

      {/* KPI Row Section */}
      <section className="flex flex-col gap-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Key Metrics</h2>
          <p className="text-sm text-muted-foreground">Survey performance overview</p>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {data?.metrics.map((metric) => (
            <SurveyMetricCard
              key={metric.id}
              title={metric.label}
              value={metric.value}
              subtitle={metric.unit}
              delta={metric.delta}
              deltaLabel={`${metric.deltaPercentage.toFixed(1)}%`}
              deltaTone={metric.delta > 0 ? 'positive' : 'negative'}
              trendDirection={metric.trend === 'up' ? 'up' : metric.trend === 'down' ? 'down' : 'flat'}
              description={metric.description}
            />
          ))}
        </div>
      </section>

      {/* Favorability Section */}
      <section className="flex flex-col gap-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Response Distribution</h2>
          <p className="text-sm text-muted-foreground">Sentiment breakdown across respondents</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <FavorabilityDistributionCard
            title="Overall Sentiment"
            segments={data?.distribution.segments || []}
            total={data?.distribution.total}
            showLegend={true}
          />

          {segmentBreakdownItems.length > 0 && (
            <ResponseStackedBarGroup
              title="By Response Type"
              items={segmentBreakdownItems}
              showLegend={true}
              showPercentages={true}
              size="md"
            />
          )}
        </div>
      </section>

      {/* Participation Section */}
      <section className="flex flex-col gap-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Participation</h2>
          <p className="text-sm text-muted-foreground">Response rate and engagement trends</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ParticipationTrendCard
            title="Response Rate Trend"
            series={participationSeries}
            value={participationSeries[0]?.data[participationSeries[0].data.length - 1]?.value}
            subtitle="%"
            showComparison={true}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Secondary Metrics</CardTitle>
              <CardDescription>Additional engagement indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/40">
                <span className="text-sm text-muted-foreground">Total Responses</span>
                <span className="font-semibold">{data?.distribution.total || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/40">
                <span className="text-sm text-muted-foreground">Response Types</span>
                <span className="font-semibold">{data?.distribution.segments.length || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Metrics Tracked</span>
                <span className="font-semibold">{data?.metrics.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Timeline Section */}
      {metricTrends.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Metric Trends</h2>
            <p className="text-sm text-muted-foreground">NPS, CSAT, and Effort Score evolution</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Metric Comparison Over Time</CardTitle>
              <CardDescription>Multi-metric trend analysis for selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendMetricLineChart
                series={metricTrends}
                height={350}
                showLegend={true}
                showComparison={true}
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Insights Placeholder Section */}
      <section className="flex flex-col gap-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Insights (Phase 8.5)</h2>
          <p className="text-sm text-muted-foreground">AI-powered insights coming soon</p>
        </div>
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground">Advanced insights will be available in Phase 8.5</p>
            <p className="text-sm text-muted-foreground mt-2">Placeholder for future AI analysis features</p>
          </CardContent>
        </Card>
      </section>

      {/* Footer / Metadata Section */}
      <section className="flex flex-col gap-4 mt-6 pt-6 border-t border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
          <div>
            <span>Last updated: </span>
            <time dateTime={data?.metadata.lastUpdated.toISOString()}>
              {new Date(data?.metadata.lastUpdated || new Date()).toLocaleString()}
            </time>
          </div>
          <div>
            <span>Data source: </span>
            <span>{data?.metadata.source || 'Survey Analytics'}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
