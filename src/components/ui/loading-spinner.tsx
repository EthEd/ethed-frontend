'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

/**
 * Reusable loading spinner component
 * Use for button loading states, page transitions, and async content
 */
export function LoadingSpinner({
  size = 'md',
  className,
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2
        className={cn(
          sizeClasses[size],
          'animate-spin text-cyan-400'
        )}
      />
      {message && (
        <p className="text-sm text-slate-400 animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Inline loading dots for text content
 */
export function LoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex gap-1', className)}>
      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
    </span>
  );
}

/**
 * Card skeleton for loading states
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-slate-900/50 border border-slate-700 rounded-xl p-6 animate-pulse',
        className
      )}
    >
      <div className="h-4 w-3/4 bg-slate-700 rounded mb-3" />
      <div className="h-3 w-full bg-slate-700/50 rounded mb-2" />
      <div className="h-3 w-5/6 bg-slate-700/50 rounded" />
    </div>
  );
}

/**
 * Table row skeleton for loading states
 */
export function TableRowSkeleton({
  columns = 5,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 p-4 border-b border-slate-800 animate-pulse', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-800 rounded" />
      ))}
    </div>
  );
}

export default LoadingSpinner;
