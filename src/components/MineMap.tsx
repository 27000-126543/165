import type { DangerZone } from '@/types';

interface MinerPos {
  x: number;
  y: number;
  name: string;
  zone: string;
}

interface VehiclePos {
  x: number;
  y: number;
  id: string;
  plateNumber: string;
}

interface MineMapProps {
  miners?: MinerPos[];
  dangerZones?: DangerZone[];
  vehicles?: VehiclePos[];
}

const tunnels = [
  { x: 40, y: 60, w: 300, h: 30 },
  { x: 40, y: 160, w: 300, h: 30 },
  { x: 40, y: 260, w: 300, h: 30 },
  { x: 130, y: 30, w: 30, h: 280 },
  { x: 240, y: 30, w: 30, h: 280 },
  { x: 380, y: 100, w: 200, h: 30 },
  { x: 380, y: 200, w: 200, h: 30 },
  { x: 450, y: 60, w: 30, h: 200 },
];

const chambers = [
  { x: 60, y: 80, w: 50, h: 40, label: '主井' },
  { x: 260, y: 80, w: 50, h: 40, label: '通风站' },
  { x: 60, y: 210, w: 50, h: 40, label: '排水站' },
  { x: 400, y: 110, w: 60, h: 50, label: '采煤面A' },
  { x: 400, y: 210, w: 60, h: 50, label: '采煤面B' },
  { x: 260, y: 210, w: 50, h: 40, label: '变电所' },
];

export default function MineMap({
  miners = [],
  dangerZones = [],
  vehicles = [],
}: MineMapProps) {
  return (
    <div className="mine-card w-full overflow-hidden">
      <svg
        viewBox="0 0 620 340"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="620" height="340" fill="#0A1628" rx="8" />

        <defs>
          <filter id="minerGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="vehicleGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="dangerPattern" width="8" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="8" x2="8" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          </pattern>
        </defs>

        {tunnels.map((t, i) => (
          <rect
            key={`t-${i}`}
            x={t.x}
            y={t.y}
            width={t.w}
            height={t.h}
            fill="#1A2A42"
            stroke="#2A4A6A"
            strokeWidth="1"
            rx="2"
          />
        ))}

        {chambers.map((c, i) => (
          <g key={`c-${i}`}>
            <rect
              x={c.x}
              y={c.y}
              width={c.w}
              height={c.h}
              fill="#1E3450"
              stroke="#3A5A7A"
              strokeWidth="1.5"
              rx="4"
            />
            <text
              x={c.x + c.w / 2}
              y={c.y + c.h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#7A8BA0"
              fontSize="9"
            >
              {c.label}
            </text>
          </g>
        ))}

        {dangerZones.map((zone) => {
          const fillColor =
            zone.level === 'critical'
              ? 'rgba(255,59,59,0.15)'
              : zone.level === 'restricted'
              ? 'rgba(255,59,59,0.1)'
              : 'rgba(255,184,0,0.12)';
          const strokeColor =
            zone.level === 'critical'
              ? '#FF3B3B'
              : zone.level === 'restricted'
              ? '#FF6B6B'
              : '#FFB800';
          return (
            <g key={zone.id}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeDasharray="6 3"
                rx="4"
              />
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                fill={`url(#dangerPattern)`}
                color={strokeColor}
                rx="4"
              />
              <text
                x={zone.x + zone.width / 2}
                y={zone.y + zone.height / 2 - 6}
                textAnchor="middle"
                dominantBaseline="central"
                fill={strokeColor}
                fontSize="9"
                fontWeight="bold"
              >
                ⚠ {zone.name}
              </text>
              <text
                x={zone.x + zone.width / 2}
                y={zone.y + zone.height / 2 + 6}
                textAnchor="middle"
                dominantBaseline="central"
                fill={strokeColor}
                fontSize="7"
                opacity="0.8"
              >
                {zone.level === 'critical' ? '危险区' : zone.level === 'restricted' ? '限制区' : '警告区'}
              </text>
            </g>
          );
        })}

        {vehicles.map((v) => (
          <g key={v.id} filter="url(#vehicleGlow)">
            <g transform={`translate(${v.x - 10}, ${v.y - 6})`}>
              <rect x="0" y="2" width="14" height="9" rx="2" fill="#00D68F" />
              <rect x="14" y="4" width="6" height="7" rx="1" fill="#00D68F" opacity="0.7" />
              <circle cx="3" cy="13" r="2" fill="#0A1628" stroke="#00D68F" strokeWidth="0.8" />
              <circle cx="11" cy="13" r="2" fill="#0A1628" stroke="#00D68F" strokeWidth="0.8" />
              <circle cx="17" cy="13" r="1.5" fill="#0A1628" stroke="#00D68F" strokeWidth="0.8" />
            </g>
            <text
              x={v.x}
              y={v.y - 12}
              textAnchor="middle"
              fill="#00D68F"
              fontSize="8"
            >
              {v.plateNumber}
            </text>
          </g>
        ))}

        {miners.map((m, i) => (
          <g key={`miner-${i}`} filter="url(#minerGlow)">
            <circle cx={m.x} cy={m.y} r="6" fill="#00F0FF" opacity="0.3">
              <animate
                attributeName="r"
                values="6;10;6"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0.1;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={m.x} cy={m.y} r="4" fill="#00F0FF" />
            <text
              x={m.x}
              y={m.y - 10}
              textAnchor="middle"
              fill="#00F0FF"
              fontSize="8"
              fontWeight="bold"
            >
              {m.name}
            </text>
          </g>
        ))}

        <g transform="translate(500, 10)">
          <rect width="110" height="100" fill="#0A1628" stroke="#243352" strokeWidth="1" rx="4" opacity="0.9" />
          <text x="55" y="16" textAnchor="middle" fill="#E0E8F0" fontSize="9" fontWeight="bold">图例</text>
          <circle cx="16" cy="32" r="4" fill="#00F0FF" />
          <text x="28" y="35" fill="#7A8BA0" fontSize="8">人员</text>
          <rect x="10" y="44" width="10" height="6" rx="1" fill="#00D68F" />
          <text x="28" y="51" fill="#7A8BA0" fontSize="8">车辆</text>
          <rect x="10" y="60" width="12" height="8" rx="2" fill="rgba(255,59,59,0.2)" stroke="#FF3B3B" strokeWidth="0.8" strokeDasharray="3 1" />
          <text x="28" y="67" fill="#7A8BA0" fontSize="8">危险区</text>
          <rect x="10" y="76" width="12" height="8" rx="2" fill="rgba(255,184,0,0.15)" stroke="#FFB800" strokeWidth="0.8" strokeDasharray="3 1" />
          <text x="28" y="83" fill="#7A8BA0" fontSize="8">警告区</text>
        </g>
      </svg>
    </div>
  );
}
