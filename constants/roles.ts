export type UserRole = "student" | "parent" | "administrator" | "superAdmin"; // not actually used, for readability

export const isStudent = (role?: string) => role === "student";
export const isParent = (role?: string) => role === "parent";
export const isNonAdmin = (role?: string) =>
  role === "parent" || role === "student";
export const isAdmin = (role?: string) =>
  role === "administrator" || role === "superAdmin";
export const isHeadAdmin = (role?: string) => role === "superAdmin";
export const hasAdminAccess = (role?: string) => isAdmin(role);
