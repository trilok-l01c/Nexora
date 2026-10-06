"use client";



// Small shared primitives for the admin workspace. Icons are inline SVG
// because the project has no icon library dependency; they inherit `currentColor`
// so they pick up the active-nav and button colours automatically.

type IconProps = { size?: number };

function svgProps(size: number) {
    return {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.7,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        "aria-hidden": true,
    };
}

export function GridIcon({ size = 17 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
    );
}

export function LeadsIcon({ size = 17 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
        </svg>
    );
}

export function SupportIcon({ size = 17 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
        </svg>
    );
}

export function ProjectsIcon({ size = 17 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M3 11h18" />
        </svg>
    );
}

export function PortfolioIcon({ size = 17 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="m4.5 18 4.7-4.7a2 2 0 0 1 2.8 0L20 21" />
        </svg>
    );
}

export function ContentIcon({ size = 17 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M4 5h16M4 10h16M4 15h10M4 20h7" />
        </svg>
    );
}

export function CompaniesIcon({ size = 17 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 21v-4h6v4" />
            <path d="M9 10h.01M15 10h.01" />
        </svg>
    );
}

export function SettingsIcon({ size = 17 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.7 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.7h.08A1.7 1.7 0 0 0 10 3.15V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.3 9v.08a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
        </svg>
    );
}

export function SearchIcon({ size = 15 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
        </svg>
    );
}

export function MenuIcon({ size = 18 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
    );
}

export function CloseIcon({ size = 18 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}

export function AlertIcon({ size = 17 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        </svg>
    );
}

export function CheckIcon({ size = 16 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="m5 13 4 4L19 7" />
        </svg>
    );
}

export function TrashIcon({ size = 15 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6M14 11v6" />
        </svg>
    );
}

export function PlusIcon({ size = 15 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

export function InboxIcon({ size = 20 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M3 12h5l1.5 3h5L16 12h5" />
            <path d="M5.5 5h13l2.5 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
        </svg>
    );
}

export function ArrowRightIcon({ size = 14 }: IconProps) {
    return (
        <svg {...svgProps(size)}>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    );
}