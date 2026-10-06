export function ProgressRing({ value, goal = 50 }: { value: number; goal?: number }) {
  const percentage = Math.min(100, (value / goal) * 100);
  return <div className="campus-ring" style={{ background: `conic-gradient(var(--blue) ${percentage}%, var(--line) 0)` }} role="img" aria-label={`${value} of ${goal} campus goal`}><div><strong>{value}</strong><span> / {goal}</span></div></div>;
}
