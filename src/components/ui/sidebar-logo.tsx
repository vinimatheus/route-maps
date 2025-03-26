"use client";

import { FaRoad } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  className?: string;
  title?: string;
}

export function LogoComponent({ className, title = "Route Planner" }: SidebarLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <FaRoad className="!size-6" />
      <span className="text-lg font-semibold">{title}</span>
    </div>
  );
}