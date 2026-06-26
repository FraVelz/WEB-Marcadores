import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

import "./login-screenshot-worm.css"

type LoginScreenshotLinkProps = {
  href: string
  label: string
  alt: string
  publicPath: string
}

export function LoginScreenshotLink({ href, label, alt, publicPath }: LoginScreenshotLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative isolate block overflow-hidden rounded-lg shadow-md",
        "focus-visible:ring-app-focus focus-visible:ring-2 focus-visible:outline-none"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "border-app-login-border pointer-events-none absolute inset-0 z-0 rounded-lg border",
          "transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0"
        )}
      />

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-lg opacity-0",
          "transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        )}
      >
        <span className="login-screenshot-worm-ring absolute top-1/2 left-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2" />
      </span>

      <span
        className={cn(
          "bg-app-login-card relative z-[1] block overflow-hidden rounded-lg",
          "transition-[margin,border-radius] duration-300",
          "group-hover:m-[2px] group-hover:rounded-[calc(0.5rem-2px)]",
          "group-focus-visible:m-[2px] group-focus-visible:rounded-[calc(0.5rem-2px)]"
        )}
      >
        <Image
          src={publicPath}
          alt={alt}
          width={1830}
          height={1076}
          sizes="(max-width: 640px) 100vw, 320px"
          className="aspect-[1830/1076] w-full object-cover object-top transition-opacity group-hover:opacity-95"
        />
        <p className="text-app-fg border-app-border-muted border-t px-3 py-2 text-sm font-medium">{label}</p>
      </span>
    </Link>
  )
}
