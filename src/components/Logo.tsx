"use client";

interface LogoProps {
  size?: number;
  variant?: "light" | "dark" | "auto";
}

export function Logo({ size = 32, variant = "auto" }: LogoProps) {
  const isDark = variant === "dark";
  const bg = isDark ? "#0A0B0E" : "#F0F2F5";
  const stroke = isDark ? "#00E584" : "#111318";
  const fill = isDark ? "#0A0B0E" : "#FFFFFF";

  if (variant === "auto") {
    return (
      <>
        <span className="dark:hidden">
          <Logo size={size} variant="light" />
        </span>
        <span className="hidden dark:inline">
          <Logo size={size} variant="dark" />
        </span>
      </>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
    >
      <rect width="100" height="100" fill={bg} rx="12" />
      <polygon
        points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
      />
      <polygon
        points="50,20 75,34.5 75,65.5 50,80 25,65.5 25,34.5"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
      />
      <polygon
        points="50,25 70,36.5 70,63.5 50,75 30,63.5 30,36.5"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.5"
      />
      <polyline
        points="35,65 50,35 65,65"
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="square"
      />
      <circle cx="80" cy="32.5" r="4" fill={stroke} />
    </svg>
  );
}
