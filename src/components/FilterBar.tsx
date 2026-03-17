import { FILTER_OPTIONS } from "../utils/shipTypes";

interface Props {
  active: string;
  onChange: (value: string) => void;
}

export function FilterBar({ active, onChange }: Props) {
  return (
    <div className="filter-bar">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`filter-pill${active === opt.value ? " filter-pill-active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
