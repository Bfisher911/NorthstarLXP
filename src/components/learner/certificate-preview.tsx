"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Award, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

/**
 * Diploma-style certificate preview. Pure SVG so it renders crisp at any size
 * and avoids bringing in a PDF renderer. The "download" button is a stub in
 * the demo but the visible artifact is real.
 */
export function CertificatePreview({
  trigger,
  recipient,
  courseTitle,
  credentialCode,
  issuedAt,
  expiresAt,
  orgName = "Northstar LXP",
  signedBy = "Director of Learning & Development",
}: {
  trigger: React.ReactNode;
  recipient: string;
  courseTitle: string;
  credentialCode: string;
  issuedAt: string;
  expiresAt?: string;
  orgName?: string;
  signedBy?: string;
}) {
  const { toast } = useToast();
  const [downloading, setDownloading] = React.useState(false);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();

      // Outer border
      doc.setDrawColor("#f59e0b");
      doc.setLineWidth(2);
      doc.roundedRect(28, 28, w - 56, h - 56, 12, 12);

      // Inner hairline
      doc.setDrawColor("#e5b8a3");
      doc.setLineWidth(0.6);
      doc.roundedRect(38, 38, w - 76, h - 76, 8, 8);

      // Header label
      doc.setTextColor("#b45309");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("CERTIFICATE OF COMPLETION", w / 2, 88, { align: "center" });

      // Award ribbon dot
      doc.setDrawColor("#f59e0b");
      doc.setFillColor("#f59e0b");
      doc.circle(w / 2, 118, 14, "F");
      doc.setTextColor("#ffffff");
      doc.setFontSize(14);
      doc.text("★", w / 2, 123, { align: "center" });

      // "This certifies that"
      doc.setTextColor("#475569");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("This certifies that", w / 2, 170, { align: "center" });

      // Recipient
      doc.setTextColor("#0f172a");
      doc.setFont("times", "bold");
      doc.setFontSize(32);
      doc.text(recipient, w / 2, 210, { align: "center" });

      // Divider
      doc.setDrawColor("#f59e0b");
      doc.setLineWidth(1);
      doc.line(w / 2 - 60, 228, w / 2 + 60, 228);

      // has completed
      doc.setTextColor("#475569");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("has successfully completed", w / 2, 256, { align: "center" });

      // Course title
      doc.setTextColor("#0f172a");
      doc.setFont("times", "bold");
      doc.setFontSize(22);
      doc.text(courseTitle, w / 2, 290, { align: "center", maxWidth: w - 200 });

      // Trio of facts
      doc.setTextColor("#475569");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const rowY = 360;
      const cellW = (w - 160) / 3;
      const rowX = 80;
      doc.text("ISSUED", rowX + cellW * 0 + cellW / 2, rowY, { align: "center" });
      doc.text("CREDENTIAL", rowX + cellW * 1 + cellW / 2, rowY, { align: "center" });
      doc.text("VALID THROUGH", rowX + cellW * 2 + cellW / 2, rowY, { align: "center" });
      doc.setTextColor("#0f172a");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(formatDate(issuedAt), rowX + cellW * 0 + cellW / 2, rowY + 18, { align: "center" });
      doc.text(credentialCode, rowX + cellW * 1 + cellW / 2, rowY + 18, { align: "center" });
      doc.text(expiresAt ? formatDate(expiresAt) : "—", rowX + cellW * 2 + cellW / 2, rowY + 18, {
        align: "center",
      });

      // Signature + issuer
      doc.setFont("times", "italic");
      doc.setFontSize(18);
      doc.setTextColor("#0f172a");
      doc.text(signedBy.split(",")[0], 100, h - 90);
      doc.setDrawColor("#94a3b8");
      doc.line(100, h - 80, 260, h - 80);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor("#475569");
      doc.text(signedBy, 100, h - 68);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor("#0f172a");
      doc.text(orgName, w - 100, h - 80, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor("#475569");
      doc.text("Issuing authority", w - 100, h - 68, { align: "right" });

      doc.save(`${recipient.replace(/\s+/g, "-").toLowerCase()}-${credentialCode}.pdf`);
      toast({
        title: "Certificate downloaded",
        description: `${credentialCode}.pdf is in your downloads folder.`,
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Download failed", description: String(err), variant: "error" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-background/70 backdrop-blur data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-background shadow-2xl data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out">
          <div className="flex items-center justify-between border-b p-3">
            <Dialog.Title className="text-sm font-semibold">Certificate preview</Dialog.Title>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={downloadPdf} disabled={downloading}>
                <Download className="h-3.5 w-3.5" /> {downloading ? "Rendering…" : "Download PDF"}
              </Button>
              <Dialog.Close className="rounded p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#fffaf0] via-[#fff8e6] to-[#fff3d1] p-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <div className="relative overflow-hidden rounded-xl border-2 border-amber-300/70 bg-white p-10 shadow-xl ring-1 ring-amber-500/10 dark:border-amber-400/40 dark:bg-slate-950">
              {/* constellation flourish */}
              <svg
                aria-hidden
                viewBox="0 0 400 100"
                className="absolute inset-x-0 top-0 -translate-y-6 opacity-60"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="cert-top" x1="0" x2="1">
                    <stop offset="0%" stopColor="#f6c768" />
                    <stop offset="50%" stopColor="#3d66ff" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <path d="M 0 80 Q 200 0 400 80" stroke="url(#cert-top)" strokeWidth={3} fill="none" />
                {Array.from({ length: 9 }).map((_, i) => {
                  const x = 40 + i * 42;
                  const y = 80 - Math.sin((i / 9) * Math.PI) * 70;
                  return <circle key={i} cx={x} cy={y} r={3} fill="#f6c768" />;
                })}
              </svg>

              <div className="relative text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30">
                  <Award className="h-7 w-7" />
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-amber-700 dark:text-amber-300">
                  Certificate of completion
                </div>
                <div className="mt-3 font-display text-sm uppercase tracking-widest text-muted-foreground">
                  This certifies that
                </div>
                <div className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground">
                  {recipient}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  has successfully completed
                </div>
                <div className="mt-3 font-display text-2xl font-semibold text-foreground">
                  {courseTitle}
                </div>
                <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                <div className="mt-6 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-muted-foreground">Issued</div>
                    <div className="mt-0.5 font-semibold">{formatDate(issuedAt)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Credential</div>
                    <div className="mt-0.5 font-mono font-semibold">{credentialCode}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Valid through</div>
                    <div className="mt-0.5 font-semibold">
                      {expiresAt ? formatDate(expiresAt) : "—"}
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4 text-left">
                  <div className="flex-1">
                    <div className="font-display text-xl italic text-foreground">
                      {signedBy.split(" ").slice(0, 2).join(" ")}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {signedBy}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-sm font-semibold tracking-tight">
                      {orgName}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      Issuing authority
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
