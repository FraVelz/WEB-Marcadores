import { getPayloadConfigFromPayload, getColorsCount, useChart } from "@/components/evilcharts/ui/chart"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"
import * as React from "react"

type TooltipRoundness = "sm" | "md" | "lg" | "xl"
type TooltipVariant = "default" | "frosted-glass"

const roundnessMap: Record<TooltipRoundness, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
}

const variantMap: Record<TooltipVariant, string> = {
  default: "border-app-border bg-app-raised text-app-fg shadow-xl",
  "frosted-glass": "border-app-border bg-app-raised/90 text-app-fg backdrop-blur-sm",
}

type TooltipPayload = NonNullable<React.ComponentProps<typeof RechartsPrimitive.DefaultTooltipContent>["payload"]>

type TooltipLabelProps = {
  hideLabel: boolean
  payload: TooltipPayload
  label?: React.ReactNode
  labelFormatter?: RechartsPrimitive.DefaultTooltipContentProps<ValueType, NameType>["labelFormatter"]
  labelClassName?: string
  labelKey?: string
}

function TooltipLabel({ hideLabel, payload, label, labelFormatter, labelClassName, labelKey }: TooltipLabelProps) {
  const { config } = useChart()

  if (hideLabel || !payload.length) {
    return null
  }

  const [item] = payload
  const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
  const itemConfig = getPayloadConfigFromPayload(config, item, key)
  const value = !labelKey && typeof label === "string" ? (config[label]?.label ?? label) : itemConfig?.label

  if (labelFormatter) {
    return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
  }

  if (!value) {
    return null
  }

  return <div className={cn("font-medium", labelClassName)}>{value}</div>
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  nameKey,
  labelKey,
  selected,
  roundness = "lg",
  variant = "default",
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
    selected?: string | null
    roundness?: TooltipRoundness
    variant?: TooltipVariant
  } & Omit<RechartsPrimitive.DefaultTooltipContentProps<ValueType, NameType>, "accessibilityLayer">) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 border px-2.5 py-1.5 text-xs",
        roundnessMap[roundness],
        variantMap[variant],
        className
      )}
    >
      {!nestLabel ? (
        <TooltipLabel
          hideLabel={hideLabel}
          payload={payload}
          label={label}
          labelFormatter={labelFormatter}
          labelClassName={labelClassName}
          labelKey={labelKey}
        />
      ) : null}
      <div className="grid gap-1.5">
        {(() => {
          const rows: React.ReactNode[] = []
          for (const item of payload) {
            if (item.type === "none") continue

            const payloadName = nameKey && item.payload ? (item.payload as Record<string, unknown>)[nameKey] : undefined
            const key = `${payloadName ?? item.name ?? item.dataKey ?? "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const colorsCount = itemConfig ? getColorsCount(itemConfig) : 1

            rows.push(
              <div
                key={key}
                className={cn(
                  "[&>svg]:text-app-fg-muted flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                  indicator === "dot" && "items-center",
                  selected != null && selected !== key && "opacity-30"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, 0, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn("shrink-0 rounded-[2px]", {
                            "size-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          })}
                          style={
                            indicator === "dashed"
                              ? { borderColor: `var(--color-${key}-0)` }
                              : colorsCount <= 1
                                ? { backgroundColor: `var(--color-${key}-0)` }
                                : {
                                    backgroundImage: `linear-gradient(to bottom, var(--color-${key}-0), var(--color-${key}-${colorsCount - 1}))`,
                                  }
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? (
                          <TooltipLabel
                            hideLabel={hideLabel}
                            payload={payload}
                            label={label}
                            labelFormatter={labelFormatter}
                            labelClassName={labelClassName}
                            labelKey={labelKey}
                          />
                        ) : null}
                        <span className="text-app-fg-muted">{itemConfig?.label ?? item.name}</span>
                      </div>
                      {item.value != null && (
                        <span className="text-app-fg font-mono font-medium tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          }
          return rows
        })()}
      </div>
    </div>
  )
}

function ChartTooltip(props: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return <RechartsPrimitive.Tooltip cursor={false} {...props} />
}

export { ChartTooltip, ChartTooltipContent, type TooltipRoundness, type TooltipVariant }
