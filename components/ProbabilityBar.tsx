interface Props {
  label: string;
  value: number;
  color?: string;
}

export function ProbabilityBar({ label, value, color = "bg-accent" }: Props) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="prob-bar">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
