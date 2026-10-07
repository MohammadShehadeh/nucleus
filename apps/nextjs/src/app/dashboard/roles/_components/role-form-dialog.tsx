"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { RouterOutputs } from "@nucleus/api";
import {
  PERMISSION_GROUPS,
  type PermissionKey,
  WILDCARD_PERMISSION,
} from "@nucleus/db/rbac/permissions";
import { Button } from "@nucleus/ui/components/button";
import { Checkbox } from "@nucleus/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nucleus/ui/components/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@nucleus/ui/components/field";
import { Input } from "@nucleus/ui/components/input";
import { Textarea } from "@nucleus/ui/components/textarea";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import { getErrorMessage } from "@/lib/error-messages";
import { useTRPC } from "@/trpc/react";

type Role = RouterOutputs["roles"]["list"]["data"][number];

const roleFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(200),
  permissions: z.array(z.string()),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSaved: () => void;
}

export const RoleFormDialog = ({ open, onOpenChange, role, onSaved }: RoleFormDialogProps) => {
  const trpc = useTRPC();
  const isEdit = !!role;
  const isWildcard = role?.permissions.includes(WILDCARD_PERMISSION) ?? false;

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    mode: "onTouched",
    defaultValues: { name: "", description: "", permissions: [] },
    values: {
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissions: role?.permissions ?? [],
    },
  });

  const createMutation = useMutation(
    trpc.roles.create.mutationOptions({
      onSuccess: () => {
        toast.success("Role created");
        onSaved();
        onOpenChange(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  );

  const updateMutation = useMutation(
    trpc.roles.update.mutationOptions({
      onSuccess: () => {
        toast.success("Role updated");
        onSaved();
        onOpenChange(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: RoleFormData) => {
    const permissions = data.permissions as PermissionKey[];
    if (isEdit && role) {
      updateMutation.mutate({
        id: role.id,
        name: data.name,
        description: data.description || null,
        permissions,
      });
      return;
    }

    createMutation.mutate({
      name: data.name,
      description: data.description || undefined,
      permissions,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit role" : "New role"}</DialogTitle>
          <DialogDescription>Choose the permissions this role grants.</DialogDescription>
        </DialogHeader>

        {isWildcard ? (
          <p className="text-muted-foreground text-sm">
            This role has full access and cannot be edited.
          </p>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} data-disabled={role?.isSystem}>
                    <FieldLabel htmlFor="role-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="role-name"
                      disabled={role?.isSystem}
                      placeholder="e.g. Editor"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="role-description">Description</FieldLabel>
                    <Textarea
                      {...field}
                      id="role-description"
                      placeholder="What is this role for?"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="permissions"
                render={({ field, fieldState }) => (
                  <FieldSet data-invalid={fieldState.invalid} className="gap-3">
                    <FieldLegend variant="label" className="mb-0">
                      Permissions
                    </FieldLegend>
                    {PERMISSION_GROUPS.map((group) => (
                      <FieldSet key={group.resource} className="gap-2 rounded-md border p-3">
                        <FieldLegend variant="label" className="mb-0 px-1 capitalize">
                          {group.resource}
                        </FieldLegend>
                        <div className="grid grid-cols-2 gap-2">
                          {group.permissions.map((permission) => {
                            const action = permission.split(":")[1];
                            const fieldId = `perm-${permission.replace(":", "-")}`;
                            return (
                              <Field key={permission} orientation="horizontal">
                                <Checkbox
                                  id={fieldId}
                                  checked={field.value.includes(permission)}
                                  onCheckedChange={(checked) =>
                                    field.onChange(
                                      checked === true
                                        ? [...field.value, permission]
                                        : field.value.filter((p) => p !== permission)
                                    )
                                  }
                                />
                                <FieldLabel htmlFor={fieldId} className="font-normal capitalize">
                                  {action}
                                </FieldLabel>
                              </Field>
                            );
                          })}
                        </div>
                      </FieldSet>
                    ))}
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldSet>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : isEdit ? "Save changes" : "Create role"}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        )}

        {isWildcard && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
