/**
 * Role-based access control.
 *
 * Roles are stored in the database (see prisma/schema.prisma -> Role,
 * Permission) so new roles/permissions can be added later from Settings
 * without a code change. This file defines the *default* permission set
 * used to seed the database and the helper used across the app to check
 * access in Server Components, Route Handlers, and Server Actions.
 */

export type RoleName = "SUPER_ADMIN" | "ADMIN" | "SALES_EXECUTIVE" | "DEVELOPER";

export const ROLE_LABELS: Record<RoleName, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES_EXECUTIVE: "Sales Executive",
  DEVELOPER: "Developer / Project Team",
};

// Permission keys follow "<module>.<action>" convention.
export const PERMISSIONS = [
  "leads.view", "leads.viewAll", "leads.create", "leads.update", "leads.delete", "leads.assign", "leads.convert",
  "followups.view", "followups.create", "followups.update",
  "tasks.view", "tasks.create", "tasks.update",
  "meetings.view", "meetings.create", "meetings.update",
  "proposals.view", "proposals.create", "proposals.update", "proposals.send",
  "clients.view", "clients.viewAll", "clients.update",
  "projects.view", "projects.viewAssigned", "projects.update",
  "payments.view", "payments.create", "payments.markPaid",
  "reports.view",
  "team.manage",
  "settings.manage",
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number];

// Default permission grants per role, used by the seed script.
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, PermissionKey[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ADMIN: [
    "leads.view", "leads.viewAll", "leads.create", "leads.update", "leads.delete", "leads.assign", "leads.convert",
    "followups.view", "followups.create", "followups.update",
    "tasks.view", "tasks.create", "tasks.update",
    "meetings.view", "meetings.create", "meetings.update",
    "proposals.view", "proposals.create", "proposals.update", "proposals.send",
    "clients.view", "clients.viewAll", "clients.update",
    "projects.view", "projects.viewAssigned", "projects.update",
    "payments.view", "payments.create", "payments.markPaid",
    "reports.view",
    "team.manage",
  ],
  SALES_EXECUTIVE: [
    "leads.view", "leads.create", "leads.update", "leads.convert",
    "followups.view", "followups.create", "followups.update",
    "tasks.view", "tasks.create", "tasks.update",
    "meetings.view", "meetings.create", "meetings.update",
    "proposals.view", "proposals.create", "proposals.update", "proposals.send",
    "clients.view",
    "reports.view",
  ],
  DEVELOPER: [
    "projects.view", "projects.viewAssigned", "projects.update",
    "tasks.view", "tasks.update",
    "clients.view",
  ],
};

export function hasPermission(
  userPermissions: string[] | undefined,
  key: PermissionKey
): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(key);
}

/** Whether a role can see all leads/clients vs only the ones assigned to them. */
export function canViewAll(role: RoleName | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}
