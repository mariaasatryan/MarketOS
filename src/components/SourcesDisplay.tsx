import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface SourcesDisplayProps {
  sources?: string[];
  confidence?: number;
}

export function SourcesDisplay({ sources, confidence }: SourcesDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const getConfidenceColor = (conf?: number) => {
    if (!conf) return 'text-slate-500';
    if (conf >= 0.8) return 'text-green-600 dark:text-green-400';
    if (conf >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceText = (conf?: number) => {
    if (!conf) return '';
    if (conf >= 0.8) return 'Высокая точность';
    if (conf >= 0.6) return 'Средняя точность';
    return 'Низкая точность';
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <span>Источники ({sources.length})</span>
        {confidence && (
          <span className={`text-xs ${getConfidenceColor(confidence)}`}>
            • {getConfidenceText(confidence)}
          </span>
        )}
        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1">
          {sources.map((source, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
            >
              <ExternalLink size={12} />
              <span>{source}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
