import { useEffect, useRef } from 'react';

export function usePerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  return {
    renderCount: renderCount.current,
    measureRender: (callback: () => void) => {
      const start = performance.now();
      callback();
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} operation: ${(end - start).toFixed(2)}ms`);
      }
    }
  };
}
