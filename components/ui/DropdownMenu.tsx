"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

/* -----------------------------
   ROOT
------------------------------*/

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

/* -----------------------------
   CONTENT
------------------------------*/

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 10, ...props }, ref) => (
  <DropdownMenuPortal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // base shell
        "min-w-[220px] z-50 rounded-xl",
        "border border-white/10",
        "bg-[#0A0C12]/90 backdrop-blur-xl",
        "shadow-[0_10px_40px_rgba(0,0,0,0.45)]",
        "text-white/80",
        "p-1",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        "origin-top-right",
        className
      )}
      {...props}
    />
  </DropdownMenuPortal>
));

DropdownMenuContent.displayName = "DropdownMenuContent";

/* -----------------------------
   ITEM
------------------------------*/

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2",
      "rounded-lg px-3 py-2 text-sm",
      "text-white/80 outline-none",
      "transition-colors",
      "hover:bg-white/5 hover:text-white",
      "focus:bg-white/10",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
      className
    )}
    {...props}
  />
));

DropdownMenuItem.displayName = "DropdownMenuItem";

/* -----------------------------
   LABEL
------------------------------*/

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-2 text-xs uppercase tracking-wider text-white/40",
      className
    )}
    {...props}
  />
));

DropdownMenuLabel.displayName = "DropdownMenuLabel";

/* -----------------------------
   SEPARATOR
------------------------------*/

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-white/10", className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

/* -----------------------------
   SUB MENU (future scaling)
------------------------------*/

const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-pointer items-center justify-between",
      "rounded-lg px-3 py-2 text-sm text-white/80",
      "hover:bg-white/5 hover:text-white",
      className
    )}
    {...props}
  />
));

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "min-w-[200px] rounded-xl border border-white/10",
      "bg-[#0A0C12]/95 backdrop-blur-xl p-1",
      "shadow-xl",
      className
    )}
    {...props}
  />
));

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

/* -----------------------------
   EXPORTS
------------------------------*/

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};