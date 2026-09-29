export function Bar({ value, max, tone = 'accent' }: { value: number; max: number; tone?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <span className="bar" role="presentation">
      <i style={{ width: `${pct}%` }} data-tone={tone} />
    </span>
  );
}
