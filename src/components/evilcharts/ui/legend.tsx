import { getPayloadConfigFromPayload, getColorsCount, useChart } from "@/components/evilcharts/ui/chart"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"
import * as React from "react"

type ChartLegendVariant =
  | "square"
  | "circle"
  | "circle-outline"
  | "rounded-square"
  | "rounded-square-outline"
  | "vertical-bar"
  | "horizontal-bar"

function ChartLegendContent({
  className,
  hideIcon = false,
  nameKey,
  payload,
  verticalAlign,
  align = "right",
  selected,
  onSelectChange,
  isClickable,
  variant = "rounded-square",
}: React.ComponentProps<"div"> & {
  hideIcon?: boolean
  nameKey?: string
  selected?: string | null
  isClickable?: boolean
  onSelectChange?: (selected: string | null) => void
  variant?: ChartLegendVariant
} & RechartsPrimitive.DefaultLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 px-1 select-none",
        align === "left" && "justify-start",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
        verticalAlign === "top" ? "pb-4" : "pt-4",
        className
      )}
    >
      {(() => {
        const rows: React.ReactNode[] = []
        for (const item of payload) {
          if (item.type === "none") continue

          const payloadName = nameKey && item.payload ? (item.payload as Record<string, unknown>)[nameKey] : undefined
          const key = `${payloadName ?? item.value ?? item.dataKey ?? "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const isSelected = selected === null || selected === key
          const colorsCount = itemConfig ? getColorsCount(itemConfig) : 1

          rows.push(
            <button
              key={key}
              type="button"
              disabled={!isClickable}
              className={cn(
                "[&>svg]:text-muted-foreground flex max-w-full min-w-0 items-center gap-1.5 border-0 bg-transparent p-0 text-left transition-opacity [&>svg]:h-3 [&>svg]:w-3",
                !isSelected && "opacity-30",
                isClickable && "cursor-pointer"
              )}
              onClick={() => {
                if (!isClickable) return

                onSelectChange?.(selected === key ? null : key)
              }}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <LegendIndicator variant={variant} dataKey={key} colorsCount={colorsCount} />
              )}
              <span
                className="text-muted-foreground max-w-[9.5rem] text-xs leading-tight break-words"
                title={typeof itemConfig?.label === "string" ? itemConfig.label : undefined}
              >
                {itemConfig?.label}
              </span>
            </button>
          )
        }
        return rows
      })()}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Legend indicator — each variant gets its own branch so future variants
// can diverge freely in markup & style.
// ---------------------------------------------------------------------------

function LegendIndicator({
  variant,
  dataKey,
  colorsCount,
}: {
  variant: ChartLegendVariant
  dataKey: string
  colorsCount: number
}) {
  const fillStyle = getLegendFillStyle(dataKey, colorsCount)
  const outlineStyle = getLegendOutlineStyle(dataKey, colorsCount)

  switch (variant) {
    case "square":
      return <div className="size-2 shrink-0" style={fillStyle} />

    case "circle":
      return <div className="size-2 shrink-0 rounded-full" style={fillStyle} />

    case "circle-outline":
      return <div className="size-2.5 shrink-0 rounded-full p-[1.5px]" style={outlineStyle} />

    case "vertical-bar":
      return <div className="h-3 w-1 shrink-0 rounded-[2px]" style={fillStyle} />

    case "horizontal-bar":
      return <div className="h-1 w-3 shrink-0 rounded-[2px]" style={fillStyle} />

    case "rounded-square-outline":
      return <div className="size-2.5 shrink-0 rounded-[3px] p-[1.5px]" style={outlineStyle} />

    case "rounded-square":
    default:
      return <div className="size-2 shrink-0 rounded-[2px]" style={fillStyle} />
  }
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

/** Solid fill / gradient background for filled variants. */
function getLegendFillStyle(dataKey: string, colorsCount: number): React.CSSProperties {
  if (colorsCount <= 1) {
    return { backgroundColor: `var(--color-${dataKey}-0)` }
  }

  const stops = Array.from({ length: colorsCount }, (_, i) => {
    const offset = (i / (colorsCount - 1)) * 100
    return `var(--color-${dataKey}-${i}) ${offset}%`
  }).join(", ")

  return { background: `linear-gradient(to right, ${stops})` }
}

/**
 * Outline style for stroke variants.
 * Uses background + mask-composite to punch out the center, leaving only the
 * "border" visible. Works with both solid colors and gradients, and respects
 * border-radius — unlike plain `border-color`.
 */
function getLegendOutlineStyle(dataKey: string, colorsCount: number): React.CSSProperties {
  const maskStyle: React.CSSProperties = {
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    maskComposite: "exclude",
  }

  if (colorsCount <= 1) {
    return {
      backgroundColor: `var(--color-${dataKey}-0)`,
      ...maskStyle,
    }
  }

  const stops = Array.from({ length: colorsCount }, (_, i) => {
    const offset = (i / (colorsCount - 1)) * 100
    return `var(--color-${dataKey}-${i}) ${offset}%`
  }).join(", ")

  return {
    background: `linear-gradient(to right, ${stops})`,
    ...maskStyle,
  }
}

const ChartLegend = RechartsPrimitive.Legend

export { ChartLegend, ChartLegendContent, type ChartLegendVariant }
