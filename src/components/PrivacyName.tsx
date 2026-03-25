import { SCREENGRAB_PRIVACY, splitNameAtFirstSpace } from "@/lib/screengrabPrivacy";

export function PrivacyName({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  if (!SCREENGRAB_PRIVACY) {
    return <span className={className}>{name}</span>;
  }
  const { first, rest } = splitNameAtFirstSpace(name);
  if (rest == null) {
    return <span className={className}>{first}</span>;
  }
  return (
    <span className={className}>
      {first}
      <span
        className="inline-block blur-md select-none opacity-90"
        aria-hidden
      >
        {"\u00A0"}
        {rest}
      </span>
    </span>
  );
}
