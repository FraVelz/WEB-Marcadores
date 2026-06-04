import type { Metadata } from "next"
import { headers } from "next/headers"

import { buildHomeMetadata, buildRouteMetadata, resolveSiteUrl } from "@/lib/metadata"

export async function generateHomeMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const siteUrl = resolveSiteUrl(headersList)
  return buildHomeMetadata(siteUrl)
}

export async function generateRouteMetadata(opts: {
  title: string
  description: string
  path: string
}): Promise<Metadata> {
  const headersList = await headers()
  const siteUrl = resolveSiteUrl(headersList)
  return buildRouteMetadata({ ...opts, siteUrl })
}
