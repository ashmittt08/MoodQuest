import { useMemo } from "react";

export function TwilightScene() {
  const stars = useMemo(() => {
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    return Array.from({ length: 90 }, () => ({ x: rand() * 1200, y: rand() * 420, r: rand() * 1.4 + 0.3, o: rand() * 0.7 + 0.3 }));
  }, []);

  return (
    <svg
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="tw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0a2b" />
          <stop offset="0.35" stopColor="#2e1065" />
          <stop offset="0.6" stopColor="#7e22ce" />
          <stop offset="0.75" stopColor="#db2777" />
          <stop offset="0.82" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient id="tw-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#be185d" stopOpacity="0.7" />
          <stop offset="0.4" stopColor="#4c1d95" />
          <stop offset="1" stopColor="#0b0a2b" />
        </linearGradient>
        <radialGradient id="tw-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fbcfe8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fbcfe8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tw-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070b1d" stopOpacity="0" />
          <stop offset="1" stopColor="#070b1d" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      <rect width="1200" height="900" fill="url(#tw-sky)" />
      <g fill="#fff">
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
        ))}
      </g>
      <circle cx="730" cy="190" r="120" fill="url(#tw-glow)" opacity="0.5" />
      <circle cx="730" cy="190" r="30" fill="#fdf2f8" opacity="0.92" />

      <path d="M0 560 L140 430 L260 520 L400 380 L540 500 L660 410 L800 520 L940 400 L1080 500 L1200 440 V600 H0Z" fill="#6b21a8" opacity="0.75" />
      <path d="M0 600 L180 490 L320 570 L470 470 L620 570 L760 480 L900 575 L1050 495 L1200 560 V620 H0Z" fill="#4c1d95" />
      <path d="M0 625 L220 560 L420 615 L640 555 L860 618 L1060 565 L1200 600 V640 H0Z" fill="#2e1065" />

      <rect y="630" width="1200" height="270" fill="url(#tw-lake)" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={690 - i * 6} y={650 + i * 16} width={100 + i * 12} height="3" rx="1.5" fill="#fbcfe8" opacity={0.45 - i * 0.045} />
      ))}

      <path d="M0 760 C220 715 420 730 600 770 C690 790 730 830 770 900 H0Z" fill="#12082e" />
      <ellipse cx="480" cy="742" rx="120" ry="26" fill="#0d0624" />
      <g fill="#0a0420" transform="translate(150 0)">
        <circle cx="330" cy="618" r="20" />
        <path d="M300 640 Q330 628 360 640 L372 700 Q330 712 288 700Z" />
        <path d="M288 700 Q260 712 268 728 Q330 742 392 728 Q400 712 372 700 Q330 716 288 700Z" />
        <path d="M300 650 Q276 680 292 700" stroke="#0a0420" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M360 650 Q384 680 368 700" stroke="#0a0420" strokeWidth="12" fill="none" strokeLinecap="round" />
      </g>
      <g fill="#12082e">
        <path d="M70 760 L92 690 L114 760Z" />
        <path d="M110 752 L128 700 L146 752Z" />
        <path d="M520 785 L540 730 L560 785Z" />
      </g>

      <rect width="1200" height="900" fill="url(#tw-fade)" />
    </svg>
  );
}
