// Optimization utilities for the Fleet Management System
// Includes performance monitoring, code cleanup helpers, and mobile responsiveness utilities

/**
 * Environment-aware console logging
 * Only logs in development mode to reduce production noise
 */
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    console.warn(...args); // Always show warnings
  },
  error: (...args: any[]) => {
    console.error(...args); // Always show errors
  }
};

/**
 * Performance monitoring utilities
 */
export const performance = {
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
    }
  },
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.measure(name, startMark, endMark);
        const measures = window.performance.getEntriesByName(name);
        const lastMeasure = measures[measures.length - 1];
        logger.log(`Performance ${name}: ${lastMeasure.duration.toFixed(2)}ms`);
        return lastMeasure.duration;
      } catch (error) {
        logger.warn('Performance measurement failed:', error);
      }
    }
    return 0;
  }
};

/**
 * Mobile responsiveness breakpoints
 */
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

/**
 * Mobile detection utility
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Touch device detection
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Responsive class generator
 */
export const responsive = {
  // Grid classes for different screen sizes
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 sm:grid-cols-2',
    cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    cols5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    cols6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
  },
  
  // Padding classes
  padding: {
    sm: 'p-2 sm:p-3 md:p-4',
    md: 'p-3 sm:p-4 md:p-6',
    lg: 'p-4 sm:p-6 md:p-8',
    xl: 'p-6 sm:p-8 md:p-12'
  },
  
  // Text sizes
  text: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-sm sm:text-base md:text-lg',
    lg: 'text-base sm:text-lg md:text-xl',
    xl: 'text-lg sm:text-xl md:text-2xl',
    '2xl': 'text-xl sm:text-2xl md:text-3xl',
    '3xl': 'text-2xl sm:text-3xl md:text-4xl'
  },
  
  // Gap classes
  gap: {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 md:gap-6',
    lg: 'gap-4 sm:gap-6 md:gap-8'
  },
  
  // Button sizes
  button: {
    sm: 'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm',
    md: 'px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base',
    lg: 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base'
  }
};

/**
 * Data processing utilities
 */
export const dataUtils = {
  // Debounce function for search inputs
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  
  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Deep clone utility
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => dataUtils.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = dataUtils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  }
};

/**
 * Form validation utilities
 */
export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },
  
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    return value !== null && value !== undefined;
  }
};

/**
 * Loading state management
 */
export const loadingStates = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error'
} as const;

export type LoadingState = typeof loadingStates[keyof typeof loadingStates];

/**
 * Error boundary utilities
 */
export const errorUtils = {
  getErrorMessage: (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unexpected error occurred';
  },
  
  logError: (error: unknown, context?: string) => {
    const message = errorUtils.getErrorMessage(error);
    logger.error(context ? `${context}: ${message}` : message, error);
  }
};
