import type { FlatFolder } from "./types"
import { isFolderDescendant } from "./utils"

export const CYCLIC_FOLDER_MOVE_MESSAGE =
  "No se puede mover una carpeta dentro de sí misma o de sus subcarpetas"

export class CyclicFolderMoveError extends Error {
  constructor(message = CYCLIC_FOLDER_MOVE_MESSAGE) {
    super(message)
    this.name = "CyclicFolderMoveError"
  }
}

/** Throws if moving `folderId` under `destParentId` would create a cycle in the folder tree. */
export function assertAcyclicFolderMove(
  folders: FlatFolder[],
  folderId: string,
  destParentId: string | null
): void {
  if (destParentId === folderId) {
    throw new CyclicFolderMoveError()
  }
  if (destParentId && isFolderDescendant(folders, destParentId, folderId)) {
    throw new CyclicFolderMoveError()
  }
}
