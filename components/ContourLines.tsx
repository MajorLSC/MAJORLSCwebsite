export default function ContourLines() {
  return (
    <svg
      className="hero__contours"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="#2F3B2B" strokeWidth="1" opacity="0.16" fill="none">
        <path d="M-50 480 C 200 380, 380 420, 560 320 S 900 260, 1250 340" />
        <path d="M-50 520 C 220 430, 400 470, 580 380 S 920 320, 1250 400" />
        <path d="M-50 560 C 240 480, 420 520, 600 440 S 940 380, 1250 460" />
        <path d="M-50 400 C 180 320, 340 360, 520 260 S 880 200, 1250 280" />
        <path d="M-50 340 C 160 260, 300 300, 480 200 S 840 140, 1250 220" />
      </g>
      <g stroke="#A6812E" strokeWidth="1.2" opacity="0.35" fill="none">
        <path d="M-50 300 C 150 210, 300 250, 470 150 S 820 90, 1250 170" />
      </g>
    </svg>
  );
}
