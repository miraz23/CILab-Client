export const APP_ROLES = ["USER", "ADMIN"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const DEFAULT_APP_ROLE: AppRole = "USER";

export function isAppRole(value: unknown): value is AppRole {
    return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}

export function isAdminRole(value: unknown): boolean {
    return isAppRole(value) && value === "ADMIN";
}
