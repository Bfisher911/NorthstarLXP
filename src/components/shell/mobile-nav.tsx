"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { NorthstarLogo } from "@/components/brand/logo";
import { Sidebar, type NavGroup } from "@/components/shell/sidebar";
import { Button } from "@/components/ui/button";

/**
 * Mobile navigation trigger — renders a hamburger that slides the full
 * sidebar in from the left on small screens. Desktop renders the sidebar
 * normally; this component is hidden above `md`.
 */
export function MobileNav({
  groups,
  sidebarFooter,
}: {
  groups: NavGroup[];
  sidebarFooter?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-background/80 backdrop-blur data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out md:hidden" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-[80] flex w-72 flex-col bg-card shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left md:hidden"
          onClick={(e) => {
            // Close when a nav link was tapped.
            const target = e.target as HTMLElement;
            if (target.closest("a")) setOpen(false);
          }}
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <NorthstarLogo />
            <Dialog.Close className="rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Close">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-hidden">
            <Sidebar groups={groups} header={null} footer={sidebarFooter} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
