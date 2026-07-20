interface RepoScoreErrorProps {
  error: { code: number; message: string } | null;
}

const RepoScoreError = ({ error }: RepoScoreErrorProps) => (
  <div className="repo-score-error">
    <div className="repo-score-error-icon">○</div>
    <div className="repo-score-error-text">{error?.message || 'Score unavailable'}</div>
      <div className="repo-score-error-hint">Scan button below still works &mdash; full analysis does not need this score</div>
  </div>
);

export default RepoScoreError;
