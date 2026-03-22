import { FILTER_OPTIONS } from "../utils/shipTypes";

interface Props {
  active: string;
  onChange: (value: string) => void;
  movingOnly: boolean;
  onMovingOnlyChange: (v: boolean) => void;
}

export function FilterBar({ active, onChange, movingOnly, onMovingOnlyChange }: Props) {
  return (
    <div className="filter-bar-wrap">
    <div className="filter-bar">
      {FILTER_OPTIONS.slice(0, 1).map((opt) => (
        <button
          key={opt.value}
          className={`filter-pill${active === opt.value ? ` filter-pill-active${opt.emoji ? `-${opt.value}` : ""}` : ""}`}
          onClick={() => onChange(active === opt.value ? "all" : opt.value)}
        >
          {opt.emoji ? `${opt.emoji} ${opt.label}` : opt.label}
        </button>
      ))}
      <button
        className={`filter-pill${movingOnly ? " filter-pill-active" : ""}`}
        onClick={() => onMovingOnlyChange(!movingOnly)}
      >
        🌊 Moving
      </button>
      {FILTER_OPTIONS.slice(1).map((opt) => (
        <button
          key={opt.value}
          className={`filter-pill${active === opt.value ? ` filter-pill-active${opt.emoji ? `-${opt.value}` : ""}` : ""}`}
          onClick={() => onChange(active === opt.value ? "all" : opt.value)}
        >
          {opt.emoji ? `${opt.emoji} ${opt.label}` : opt.label}
        </button>
      ))}
    </div>
    </div>
  );
}
