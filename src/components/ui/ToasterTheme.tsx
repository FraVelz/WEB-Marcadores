"use client"

import { Toaster, type ToasterProperties } from "@pheralb/toast"

import { useAppAppearance } from "@/contexts/AppAppearanceContext"

export function ToasterTheme(props: ToasterProperties) {
  const { appearance } = useAppAppearance()

  return <Toaster theme={appearance.theme} position="bottom-right" maxToasts={4} {...props} />
}
