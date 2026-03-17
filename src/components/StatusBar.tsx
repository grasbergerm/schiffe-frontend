import type { ApiMeta } from "../types";
import { formatNow } from "../utils/format";

interface Props {
  meta: ApiMeta | null;
  error: string | null;
  shipCount: number;
}

export function StatusBar({ meta, error, shipCount }: Props) {
  let dotClass = "dot dot-green";
  let statusText = "Live";

  if (error) {
    dotClass = "dot dot-red";
    statusText = "Server unreachable";
  } else if (meta && !meta.connected) {
    dotClass = "dot dot-yellow";
    statusText = "AIS disconnected";
  }

  return (
    <div className="status-bar">
      <span className="status-left">
        <span className={dotClass} />
        {statusText}
      </span>
      <span className="status-right">
        {shipCount} ships · {formatNow()}
      </span>
    </div>
  );
}
