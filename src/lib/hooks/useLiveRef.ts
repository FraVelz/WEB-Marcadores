import { useLayoutEffect, useRef } from "react"

/** Keeps a ref aligned with the latest value without reading/writing `.current` during render. */
export function useLiveRef<T>(value: T) {
  const ref = useRef(value)

  useLayoutEffect(() => {
    ref.current = value
  })

  return ref
}
