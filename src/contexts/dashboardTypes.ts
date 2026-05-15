/** Tipos compartidos del dashboard (hooks / árbol sin import circular). */

export type Folder = {
  id: string
  parent_id: string | null
  name: string
  sort_order: number
  children?: Folder[]
}
