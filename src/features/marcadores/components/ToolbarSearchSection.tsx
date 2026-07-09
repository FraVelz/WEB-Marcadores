"use client"

import { MarcadoresSearchField } from "./MarcadoresSearchField"

type Props = {
  searchValue: string
  setSearchValue: (v: string) => void
  searchRef: React.RefObject<HTMLInputElement | null>
  searchInSubfolders: boolean
  setSearchInSubfolders: (v: boolean) => void
  searchInDescription: boolean
  setSearchInDescription: (v: boolean) => void
  onEnter?: () => void
}

export default function ToolbarSearchSection(props: Props) {
  return <MarcadoresSearchField {...props} variant="compact" />
}
