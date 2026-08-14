type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PersonIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.6-3.6 4.6-5.5 7.5-5.5s5.9 1.9 7.5 5.5" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 6 8.5 6.5L20.5 6" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5.5 4.5h3l1.5 4-2 1.7a11 11 0 0 0 5.8 5.8l1.7-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 4 6.1a1.5 1.5 0 0 1 1.5-1.6Z" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21s7-6.3 7-11.5a7 7 0 1 0-14 0C5 14.7 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20c1.2-3.2 3.6-5 6.5-5s5.3 1.8 6.5 5" />
      <circle cx="17" cy="8.5" r="2.3" />
      <path d="M15.8 12.2c2.2.4 3.8 1.9 4.7 4.3" />
    </svg>
  );
}

export function KeyIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12 20 3M17 6l2 2M14 9l2 2" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-1.8h7L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Z" />
      <circle cx="12" cy="12.5" r="3.3" />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10" />
      <path d="M10 20.5V14h4v6.5" />
    </svg>
  );
}

export function ChurchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3v3M10.5 4.5h3" />
      <path d="M12 6.5 5 11v9.5h14V11Z" />
      <path d="M9.5 20.5V15a2.5 2.5 0 0 1 5 0v5.5" />
      <path d="M5 15h3.5M15.5 15H19" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 17v-5a6 6 0 1 1 12 0v5l1.5 2.5h-15Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function GearIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4M17.7 17.7l-1.4-1.4M7.7 7.7 6.3 6.3" />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6.5A2 2 0 0 0 13.5 4.5h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 12.5 9 17l10.5-10.5" />
    </svg>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.7-5.4M19.5 12a7.5 7.5 0 0 1-12.7 5.4" />
      <path d="M16.5 4.5v3.5H13M7.5 19.5V16H11" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4H9" />
      <path d="M15.5 16.5 20 12l-4.5-4.5M20 12H9" />
    </svg>
  );
}

export function CakeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 20.5v-6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v6" />
      <path d="M4.5 20.5h14" />
      <path d="M8 12.5V9a1.5 1.5 0 0 1 3 0v3.5M13 12.5V9a1.5 1.5 0 0 1 3 0v3.5" />
      <path d="M9.5 5.5V3M14.5 5.5V3" />
      <path d="M4.5 16.5c1 .8 2 .8 3 0s2-.8 3 0 2 .8 3 0 2-.8 3 0 2 .8 3 0" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.8-4.8" />
    </svg>
  );
}

export function FilterIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5h16" />
      <path d="M7 12h10" />
      <path d="M10.5 19h3" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 17H7a5 5 0 0 1 0-10h2" />
      <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
