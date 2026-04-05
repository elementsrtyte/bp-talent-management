import { ChevronDown, KeyRound, LogOut, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Props = {
  email: string;
  onSignOut: () => void;
};

export function AccountMenu({ email, onSignOut }: Props) {
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border gap-1.5"
            aria-label="Account menu"
          >
            <User className="size-4" aria-hidden />
            <span>Account</span>
            <ChevronDown className="size-3.5 opacity-70" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Signed in as
            </span>
            <span
              className="mt-1 block truncate text-sm font-medium text-foreground"
              title={email}
              style={{ fontFamily: "var(--font-saans-semimono)" }}
            >
              {email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              window.setTimeout(() => setPasswordOpen(true), 0);
            }}
          >
            <KeyRound className="size-4" aria-hidden />
            Change password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              void onSignOut();
            }}
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={passwordOpen} onOpenChange={setPasswordOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Change password</SheetTitle>
            <SheetDescription>
              Your session stays active after updating.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-2 px-4 pb-4">
            <ChangePasswordForm onSuccess={() => setPasswordOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
