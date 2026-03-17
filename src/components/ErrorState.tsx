export function ErrorState() {
  return (
    <div className="error-state">
      <div className="error-state-inner">
        <p className="error-state-title">Unable to load ship data</p>
        <p className="error-state-body">
          Could not reach the server. This may be temporary — the page will
          retry automatically.
        </p>
      </div>
    </div>
  );
}
