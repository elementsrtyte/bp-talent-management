/** When true (README screenshots only), surname is blurred after the first space. */
export const SCREENGRAB_PRIVACY =
  import.meta.env.VITE_SCREENGRAB_PRIVACY === "true";

export function splitNameAtFirstSpace(name: string): {
  first: string;
  rest: string | null;
} {
  const t = name.trim();
  const i = t.indexOf(" ");
  if (i === -1) return { first: t, rest: null };
  return { first: t.slice(0, i), rest: t.slice(i + 1) };
}
