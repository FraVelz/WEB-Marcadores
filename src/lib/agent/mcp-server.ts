import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import type { AgentAuthContext } from "@/lib/agent/auth"
import { requireScope } from "@/lib/agent/auth"
import { writeAudit } from "@/lib/agent/audit"
import { getBookmark, getStats, listAliveFolders, listTags, listTrash, searchBookmarks } from "@/lib/agent/queries"
import { createBookmark, createFolder, updateBookmark } from "@/lib/agent/mutations"
import {
  emptyTrash,
  purgeTrashItem,
  restoreBatch,
  restoreTrashItem,
  softDeleteBookmark,
  softDeleteFolder,
} from "@/lib/agent/trash"
import { assertConfirm } from "@/lib/agent/validate"
import { buildMarcadoresBackupJson } from "@/features/marcadores/utils/marcadoresBackup"
import { listAliveBookmarks } from "@/lib/agent/queries"

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
}

function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return { content: [{ type: "text" as const, text: message }], isError: true as const }
}

export function createMarcadoresMcpServer(ctx: AgentAuthContext, req: Request): McpServer {
  const server = new McpServer({ name: "web-marcadores", version: "1.0.0" })

  const audited = async (action: string, fn: () => Promise<unknown>, extra?: Record<string, unknown>) => {
    try {
      const result = await fn()
      await writeAudit({ ctx, action, req, payload: extra })
      return text(result)
    } catch (error) {
      return toolError(error)
    }
  }

  server.registerTool(
    "search_bookmarks",
    {
      description: "Search alive bookmarks by query, tag, or folder",
      inputSchema: {
        q: z.string().optional(),
        tag: z.string().optional(),
        folder_id: z.string().nullable().optional(),
        limit: z.number().int().min(1).max(200).optional(),
      },
    },
    async (args) => {
      requireScope(ctx, "bookmarks:read")
      return audited("mcp_search_bookmarks", () =>
        searchBookmarks(ctx.userId, {
          q: args.q,
          tag: args.tag,
          folderId: args.folder_id,
          limit: args.limit,
        })
      )
    }
  )

  server.registerTool("list_folders", { description: "List alive folders", inputSchema: {} }, async () => {
    requireScope(ctx, "bookmarks:read")
    return audited("mcp_list_folders", () => listAliveFolders(ctx.userId))
  })

  server.registerTool("list_tags", { description: "List tags with counts", inputSchema: {} }, async () => {
    requireScope(ctx, "bookmarks:read")
    return audited("mcp_list_tags", () => listTags(ctx.userId))
  })

  server.registerTool("get_stats", { description: "Library statistics (alive only)", inputSchema: {} }, async () => {
    requireScope(ctx, "bookmarks:read")
    return audited("mcp_get_stats", () => getStats(ctx.userId))
  })

  server.registerTool(
    "get_bookmark",
    {
      description: "Get a single alive bookmark by id",
      inputSchema: { id: z.string() },
    },
    async (args) => {
      requireScope(ctx, "bookmarks:read")
      return audited("mcp_get_bookmark", () => getBookmark(ctx.userId, args.id), { id: args.id })
    }
  )

  server.registerTool(
    "create_bookmark",
    {
      description: "Create a bookmark",
      inputSchema: {
        url: z.string().url(),
        title: z.string().optional(),
        description: z.string().nullable().optional(),
        folder_id: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.unknown()).optional(),
        is_favorite: z.boolean().optional(),
      },
    },
    async (args) => {
      requireScope(ctx, "bookmarks:write")
      return audited("mcp_create_bookmark", () =>
        createBookmark(ctx.userId, {
          url: args.url,
          title: args.title,
          description: args.description,
          folder_id: args.folder_id,
          tags: args.tags,
          metadata: args.metadata,
          is_favorite: args.is_favorite,
        })
      )
    }
  )

  server.registerTool(
    "update_bookmark",
    {
      description: "Update a bookmark (metadata merge by default)",
      inputSchema: {
        id: z.string(),
        title: z.string().optional(),
        url: z.string().url().optional(),
        description: z.string().nullable().optional(),
        folder_id: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.unknown()).optional(),
        metadata_mode: z.enum(["merge", "replace"]).optional(),
        is_favorite: z.boolean().optional(),
      },
    },
    async (args) => {
      requireScope(ctx, "bookmarks:write")
      const { id, ...patch } = args
      return audited("mcp_update_bookmark", () => updateBookmark(ctx.userId, id, patch), { id })
    }
  )

  server.registerTool(
    "create_folder",
    {
      description: "Create a folder",
      inputSchema: {
        name: z.string(),
        parent_id: z.string().nullable().optional(),
      },
    },
    async (args) => {
      requireScope(ctx, "bookmarks:write")
      return audited("mcp_create_folder", () =>
        createFolder(ctx.userId, { name: args.name, parent_id: args.parent_id })
      )
    }
  )

  server.registerTool(
    "delete_bookmark",
    {
      description: "Soft-delete a bookmark (moves to trash for 30 days)",
      inputSchema: { id: z.string() },
    },
    async (args) => {
      requireScope(ctx, "bookmarks:write")
      return audited("mcp_soft_delete_bookmark", () => softDeleteBookmark(ctx.userId, args.id), {
        id: args.id,
      })
    }
  )

  server.registerTool(
    "delete_folder",
    {
      description: "Soft-delete a folder and its subtree (trash, 30 days)",
      inputSchema: { id: z.string() },
    },
    async (args) => {
      requireScope(ctx, "bookmarks:write")
      return audited("mcp_soft_delete_folder", () => softDeleteFolder(ctx.userId, args.id), {
        id: args.id,
      })
    }
  )

  server.registerTool("list_trash", { description: "List items in the recycle bin", inputSchema: {} }, async () => {
    requireScope(ctx, "trash:read")
    return audited("mcp_list_trash", () => listTrash(ctx.userId))
  })

  server.registerTool(
    "restore_from_trash",
    {
      description: "Restore a trash item or an entire deleted_batch_id",
      inputSchema: {
        type: z.enum(["bookmark", "folder"]).optional(),
        id: z.string().optional(),
        batch_id: z.string().optional(),
      },
    },
    async (args) => {
      requireScope(ctx, "trash:write")
      return audited("mcp_restore_trash", async () => {
        if (args.batch_id) return restoreBatch(ctx.userId, args.batch_id)
        if (!args.type || !args.id) throw new Error("type+id or batch_id required")
        await restoreTrashItem(ctx.userId, args.type, args.id)
        return { ok: true }
      })
    }
  )

  server.registerTool(
    "purge_from_trash",
    {
      description: "Permanently delete a trash item (requires confirm: true)",
      inputSchema: {
        type: z.enum(["bookmark", "folder"]),
        id: z.string(),
        confirm: z.boolean(),
      },
    },
    async (args) => {
      requireScope(ctx, "trash:write")
      return audited("mcp_purge_trash", async () => {
        assertConfirm(args.confirm, "purge")
        await purgeTrashItem(ctx.userId, args.type, args.id)
        return { ok: true }
      })
    }
  )

  server.registerTool(
    "empty_trash",
    {
      description: "Permanently empty the recycle bin (requires confirm: true)",
      inputSchema: { confirm: z.boolean() },
    },
    async (args) => {
      requireScope(ctx, "trash:write")
      return audited("mcp_empty_trash", async () => {
        assertConfirm(args.confirm, "empty trash")
        return emptyTrash(ctx.userId)
      })
    }
  )

  server.registerTool(
    "export_library",
    {
      description: "Export alive library as backup JSON v2",
      inputSchema: {},
    },
    async () => {
      requireScope(ctx, "library:export")
      return audited("mcp_export", async () => {
        const [folders, bookmarks] = await Promise.all([listAliveFolders(ctx.userId), listAliveBookmarks(ctx.userId)])
        return buildMarcadoresBackupJson(folders, bookmarks)
      })
    }
  )

  server.resource("trash", "marcadores://trash", async () => {
    requireScope(ctx, "trash:read")
    const items = await listTrash(ctx.userId)
    return {
      contents: [{ uri: "marcadores://trash", text: JSON.stringify(items, null, 2), mimeType: "application/json" }],
    }
  })

  server.resource("summary", "marcadores://summary", async () => {
    requireScope(ctx, "bookmarks:read")
    const stats = await getStats(ctx.userId)
    return {
      contents: [{ uri: "marcadores://summary", text: JSON.stringify(stats, null, 2), mimeType: "application/json" }],
    }
  })

  server.resource("folders", "marcadores://folders", async () => {
    requireScope(ctx, "bookmarks:read")
    const folders = await listAliveFolders(ctx.userId)
    return {
      contents: [{ uri: "marcadores://folders", text: JSON.stringify(folders, null, 2), mimeType: "application/json" }],
    }
  })

  server.resource("tags", "marcadores://tags", async () => {
    requireScope(ctx, "bookmarks:read")
    const tags = await listTags(ctx.userId)
    return {
      contents: [{ uri: "marcadores://tags", text: JSON.stringify(tags, null, 2), mimeType: "application/json" }],
    }
  })

  server.registerPrompt(
    "organize_inbox",
    {
      description: "Suggest folder organization for unsorted bookmarks",
      argsSchema: {},
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Review unsorted bookmarks (folder_id null) and propose a folder structure. Use search_bookmarks and list_folders.",
          },
        },
      ],
    })
  )

  server.registerPrompt("find_duplicates", { description: "Find duplicate URLs", argsSchema: {} }, async () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Find duplicate bookmark URLs using export_library or search, and propose which to keep or soft-delete.",
        },
      },
    ],
  }))

  server.registerPrompt(
    "enrich_metadata",
    { description: "Enrich bookmark metadata JSON", argsSchema: {} },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Pick bookmarks missing useful metadata and update them with update_bookmark (metadata merge).",
          },
        },
      ],
    })
  )

  server.registerPrompt(
    "review_trash",
    { description: "Review recycle bin before purge", argsSchema: {} },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "List trash with list_trash, restore anything still needed, and only purge with confirm:true when sure.",
          },
        },
      ],
    })
  )

  return server
}
