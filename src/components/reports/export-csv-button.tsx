"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { downloadCsv, toCsv } from "@/lib/csv";

export function ExportCsvButton<T extends Record<string, unknown>>({
  filename,
  rows,
  columns,
  label = "Export CSV",
  variant = "outline",
  size = "default",
}: {
  filename: string;
  rows: T[];
  columns?: Array<keyof T | { key: keyof T; label: string }>;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default";
}) {
  const { toast } = useToast();
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => {
        if (rows.length === 0) {
          toast({ title: "Nothing to export", variant: "default" });
          return;
        }
        const csv = toCsv(rows, columns);
        downloadCsv(filename, csv);
        toast({
          title: "CSV downloaded",
          description: `${rows.length} rows exported to ${filename}.csv`,
          variant: "success",
        });
      }}
    >
      <Download className="h-4 w-4" /> {label}
    </Button>
  );
}
