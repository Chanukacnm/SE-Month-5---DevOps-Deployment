/** Joins truthy class names. Small enough that pulling in clsx isn't worth it. */
export function cn(...classes: Array<string | number | boolean | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
