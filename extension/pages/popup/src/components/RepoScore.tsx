import RepoScoreError from './RepoScoreError';
import RepoScoreSkeleton from './RepoScoreSkeleton';
import { getRepoData } from '../lib/github-api';
import { calculateRepoScore } from '../lib/scoring';
import { useEffect, useState } from 'react';
import type { RepoInfo, RepoScore as RepoScoreType } from '@extension/shared';

interface RepoScoreProps {
  repo: RepoInfo;
}

interface RepoScoreError {
  code: number;
  message: string;
}

const RepoScore = ({ repo }: RepoScoreProps) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [score, setScore] = useState<RepoScoreType | null>(null);
  const [error, setError] = useState<RepoScoreError | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchScore = async () => {
      setStatus('loading');
      setProgress(0);

      try {
        const data = await getRepoData(repo.owner, repo.repo);
        if (!mounted) return;

        const result = calculateRepoScore(data);
        setScore(result);
        setStatus('success');
      } catch (err: unknown) {
        if (!mounted) return;
        const errorObj = err as RepoScoreError;
        setError({ code: errorObj.code || 0, message: errorObj.message || 'Failed to load repo score' });
        setStatus('error');
      }
    };

    fetchScore();

    return () => {
      mounted = false;
    };
  }, [repo.owner, repo.repo]);

  useEffect(() => {
    if (status === 'success' && score) {
      const target = score.total;
      const duration = 600;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const ratio = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - ratio, 3);
        const current = Math.round(eased * target);
        setProgress(current);

        if (ratio < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  }, [status, score]);

  if (status === 'loading') {
    return <RepoScoreSkeleton />;
  }

  if (status === 'error' || !score) {
    return <RepoScoreError error={error} />;
  }

  return (
    <div className="repo-score-card">
      <div className="repo-score-header">
        <span className="repo-score-number" style={{ color: score.color }}>
          {progress}
        </span>
        <span className="repo-score-divider">/100</span>
        <span className="repo-score-label" style={{ color: score.color }}>
          {score.label}
        </span>
      </div>

      <div className="repo-score-bar-track">
        <div className="repo-score-bar-fill" style={{ width: `${progress}%`, background: score.color }} />
      </div>

      <div className="repo-score-bullets">
        {score.bullets.map((bullet, i) => (
          <div key={i} className="repo-score-bullet">
            <span className="repo-score-bullet-dot">•</span>
            <span>{bullet}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepoScore;
