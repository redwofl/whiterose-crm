"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

export function Icon({ icon: IconComponent, className }: { icon: LucideIcon; className?: string }) {
  const element = <IconComponent className={className} />;
  return React.cloneElement(element as React.ReactElement<Record<string, unknown>>, {
    suppressHydrationWarning: true,
  });
}
