import { useState } from 'react'
import { CashEvent } from '../types'
import { formatPercent, formatSignedMillions } from '../utils/calculations'

type CashEventsListProps = {
  events: CashEvent[]
  title?: string
  initialVisible?: number
}

const DEFAULT_VISIBLE = 3

const formatEventLabel = (event: CashEvent): string => {
  if (event.percent === null || event.percent === undefined) {
    return event.label
  }

  // Parameters store percentages as whole numbers (0.2 = 0.2%, 1.85 = 1.85%, 20 = 20%)
  // Determine decimal places based on the original percentage value
  let decimalPlaces = 1
  if (event.percent < 1) {
    // For values < 1%, use 1 decimal place (0.2 → 0.2%)
    decimalPlaces = 1
  } else if (event.percent < 10) {
    // For values 1-10%, use 2 decimal places (1.85 → 1.85%)
    decimalPlaces = 2
  } else {
    // For values >= 10%, use 1 decimal place (20 → 20%)
    decimalPlaces = 1
  }

  const percentAsDecimal = event.percent / 100
  const formattedPercent = formatPercent(percentAsDecimal, decimalPlaces)
  return `${event.label} — ${formattedPercent}`
}

export default function CashEventsList({
  events,
  title = 'Cash activity',
  initialVisible = DEFAULT_VISIBLE,
}: CashEventsListProps) {
  const [expanded, setExpanded] = useState(false)

  if (!events.length) {
    return null
  }

  const visibleEvents = expanded ? events : events.slice(0, initialVisible)
  const hasMore = events.length > initialVisible
  const remainingCount = events.length - initialVisible

  return (
    <div className="cash-events">
      <p className="cash-events__title">{title}</p>
      <ul>
        {visibleEvents.map((event, index) => (
          <li key={`${event.label}-${index}-${event.year ?? 'na'}`}>
            <span>{formatEventLabel(event)}</span>
            <span className={`cash-amount ${event.amount >= 0 ? 'positive' : 'negative'}`}>
              {formatSignedMillions(event.amount)}
            </span>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button className="cash-events__toggle" type="button" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? 'Show less' : `Show ${remainingCount} more`}
        </button>
      )}
    </div>
  )
}

