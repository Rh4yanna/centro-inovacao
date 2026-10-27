export function ActionFeedback({ action }) {
  return <>{action.error && <p role="alert" className="error">{action.error}</p>}{action.success && <p role="status">{action.success}</p>}</>;
}
