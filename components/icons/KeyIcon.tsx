export default function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="36" cy="30" r="15" stroke="currentColor" strokeWidth="7" />
      <line
        x1="36"
        y1="45"
        x2="36"
        y2="86"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="70"
        x2="52"
        y2="70"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
