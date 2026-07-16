/**
 * Contract mirroring Supabase RLS:
 *   auth.uid() = user_id  for SELECT / INSERT / UPDATE / DELETE
 * on `folders` and `bookmarks`.
 *
 * Applied policies live in `supabase/rls-policies.sql`.
 */

export type OwnedRow = {
  id: string
  user_id: string
}

/** SELECT: only rows owned by the authenticated user. */
export function rlsSelectOwnedRows<T extends OwnedRow>(rows: T[], authUid: string | null): T[] {
  if (!authUid) return []
  return rows.filter((row) => row.user_id === authUid)
}

/** INSERT: reject when payload.user_id ≠ auth.uid(). */
export function rlsAllowInsert(authUid: string | null, payloadUserId: string): boolean {
  return Boolean(authUid) && authUid === payloadUserId
}

/** UPDATE / DELETE: target row must belong to auth.uid(). */
export function rlsAllowMutation(authUid: string | null, row: OwnedRow | null | undefined): boolean {
  if (!authUid || !row) return false
  return row.user_id === authUid
}
