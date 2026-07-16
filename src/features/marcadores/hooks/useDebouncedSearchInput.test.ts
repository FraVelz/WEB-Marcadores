import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createDebouncedScheduler } from "./debouncedScheduler"

describe("createDebouncedScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("debounces within 200–300ms and cancels stale schedules", () => {
    const onFire = vi.fn()
    const scheduler = createDebouncedScheduler(250, onFire)

    scheduler.schedule("a")
    scheduler.schedule("ab")
    scheduler.schedule("abc")

    expect(onFire).not.toHaveBeenCalled()

    vi.advanceTimersByTime(249)
    expect(onFire).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onFire).toHaveBeenCalledTimes(1)
    expect(onFire).toHaveBeenCalledWith("abc")
  })

  it("flush cancels pending timer and fires immediately", () => {
    const onFire = vi.fn()
    const scheduler = createDebouncedScheduler(250, onFire)

    scheduler.schedule("stale")
    scheduler.flush("now")

    expect(onFire).toHaveBeenCalledTimes(1)
    expect(onFire).toHaveBeenCalledWith("now")

    vi.advanceTimersByTime(250)
    expect(onFire).toHaveBeenCalledTimes(1)
  })
})
