"use client";

import * as React from "react";
import { CheckCircle2, PenLine, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AttestForm({
  statements,
  signaturePrompt = "Type your full name to sign",
}: {
  statements: string[];
  signaturePrompt?: string;
}) {
  const [checks, setChecks] = React.useState<boolean[]>(statements.map(() => false));
  const [signature, setSignature] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const allChecked = checks.every(Boolean);
  const canSubmit = allChecked && signature.trim().length >= 2;

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold">Attestation recorded</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed as <strong className="text-foreground">{signature.trim()}</strong> on{" "}
              {new Date().toLocaleString()}. A timestamped record has been added to the audit log.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-4 rounded-xl border bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitted(true);
      }}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Attestation statements
      </div>
      <ul className="space-y-2">
        {statements.map((s, i) => (
          <li key={i}>
            <label className={cn("flex cursor-pointer items-start gap-3 rounded-md border p-3 transition", checks[i] ? "border-primary/50 bg-primary/5" : "hover:bg-muted/40")}>
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-primary"
                checked={checks[i]}
                onChange={(e) => {
                  const next = [...checks];
                  next[i] = e.target.checked;
                  setChecks(next);
                }}
              />
              <span className="text-sm leading-snug">{s}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 pt-2 text-sm font-medium">
        <PenLine className="h-4 w-4 text-primary" />
        Signature
      </div>
      <Input
        placeholder={signaturePrompt}
        value={signature}
        onChange={(e) => setSignature(e.target.value)}
        disabled={!allChecked}
      />
      <Button type="submit" disabled={!canSubmit} className="w-full">
        Submit attestation
      </Button>
      {!allChecked && (
        <p className="text-center text-xs text-muted-foreground">
          Review every statement above before signing.
        </p>
      )}
    </form>
  );
}
