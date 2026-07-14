export const ROLE_ROUTES = {
  admin: "/admin",
  instructor: "/instructor",
  student: "/student",
};

export const FALLBACK_ROUTE = "/unauthorized";

export function resolveRole(user) {
  return user?.publicMetadata?.role ?? null;
}

/** For students — returns a single courseId string. */
export function resolveCourseId(user) {
  return user?.publicMetadata?.courseId ?? null;
}

/** For instructors — returns an array of courseId strings. */
export function resolveCourseIds(user) {
  return user?.publicMetadata?.courseIds ?? [];
}
