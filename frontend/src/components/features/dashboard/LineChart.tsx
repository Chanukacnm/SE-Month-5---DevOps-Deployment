import { useMemo, useState } from 'react';
import { formatCompact } from '@/utils/format';

export interface Series {
  key: string;
  label: string;
  /** Tailwind stroke/fill classes so the colour follows the theme. */
  colorClass: string;
  values: number[];
}

interface LineChartProps {
  labels: string[];
  series: Series[];
  /** Accessible summary read before the data table. */
  summary: string;
  formatValue?: (v: number) => string;
  height?: number;
}

const W = 640;
const PAD = { top: 16, right: 16, bottom: 28, left: 48 };

/**
 * Dependency-free SVG line chart (a charting library would add ~100 kB to the
 * dashboard chunk). Hover/focus shows a tooltip; the same data is exposed as a
 * visually hidden table so screen reader users get the numbers, not a picture.
 */
export function LineChart({ labels, series, summary, formatValue = formatCompact, height = 260 }: LineChartProps) {
  const [active, setActive] = useState<number | null>(null);

  const { max, x, y, ticks } = useMemo(() => {
    const all = series.flatMap((s) => s.values);
    const rawMax = Math.max(...all, 1);
    const step = 10 ** Math.floor(Math.log10(rawMax));
    const niceMax = Math.ceil(rawMax / step) * step;
    const innerW = W - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;
    return {
      max: niceMax,
      x: (i: number) => PAD.left + (labels.length <= 1 ? 0 : (i / (labels.length - 1)) * innerW),
      y: (v: number) => PAD.top + innerH - (v / niceMax) * innerH,
      ticks: [0, 0.25, 0.5, 0.75, 1].map((t) => t * niceMax),
    };
  }, [series, labels.length, height]);

  const path = (values: number[]) => values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  return (
    <figure className="m-0">
      <div className="mb-3 flex flex-wrap gap-4 text-sm" aria-hidden="true">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className={`h-0.5 w-5 rounded ${s.colorClass} bg-current`} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${height}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={summary}
          onMouseLeave={() => setActive(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-slate-200 dark:stroke-slate-700" strokeDasharray={t === 0 ? undefined : '3 4'} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-600 text-[11px] dark:fill-slate-400">
                {formatValue(t)}
              </text>
            </g>
          ))}
          {labels.map((label, i) => (
            <text key={label} x={x(i)} y={height - 8} textAnchor="middle" className="fill-slate-600 text-[11px] dark:fill-slate-400">
              {label}
            </text>
          ))}
          {series.map((s) => (
            <path key={s.key} d={path(s.values)} fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" className={`stroke-current ${s.colorClass}`} />
          ))}
          {active !== null && <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={height - PAD.bottom} className="stroke-slate-400" />}
          {series.map((s) =>
            s.values.map((v, i) => (
              <circle
                key={`${s.key}-${i}`}
                cx={x(i)}
                cy={y(v)}
                r={active === i ? 5 : 3}
                className={`fill-white stroke-current dark:fill-slate-900 ${s.colorClass}`}
                strokeWidth={2}
              />
            )),
          )}
          {/* Invisible hover columns */}
          {labels.map((label, i) => (
            <rect
              key={`hit-${label}`}
              x={x(i) - (W - PAD.left - PAD.right) / (labels.length - 1) / 2}
              y={PAD.top}
              width={(W - PAD.left - PAD.right) / Math.max(labels.length - 1, 1)}
              height={height - PAD.top - PAD.bottom}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
            />
          ))}
        </svg>
        {active !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-700 dark:bg-slate-800"
            style={{ left: `${(x(active) / W) * 100}%`, transform: `translateX(${active > labels.length / 2 ? '-105%' : '5%'})` }}
          >
            <p className="font-semibold">{labels[active]}</p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full bg-current ${s.colorClass}`} />
                {s.label}: {formatValue(s.values[active])}
              </p>
            ))}
          </div>
        )}
      </div>
      <figcaption className="sr-only">
        <table>
          <caption>{summary}</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              {series.map((s) => (
                <th key={s.key} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, i) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {series.map((s) => (
                  <td key={s.key}>{formatValue(s.values[i])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
      <span className="sr-only">Maximum value on the axis is {formatValue(max)}.</span>
    </figure>
  );
}
