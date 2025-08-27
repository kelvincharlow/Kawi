import { ReactNode } from 'react';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'dashboard' | 'form' | 'table';
}

/**
 * Responsive layout component that provides optimal mobile experience
 */
export function ResponsiveLayout({ 
  children, 
  className = '', 
  variant = 'default' 
}: ResponsiveLayoutProps) {
  const baseClasses = 'w-full';
  
  const variantClasses = {
    default: 'min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50',
    dashboard: 'min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-2 sm:p-4 md:p-6',
    form: 'min-h-screen bg-gray-50 p-3 sm:p-6 md:p-8',
    table: 'w-full overflow-x-auto'
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Responsive container component
 */
export function ResponsiveContainer({ 
  children, 
  className = '',
  size = 'full'
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-sm mx-auto',
    md: 'max-w-2xl mx-auto',
    lg: 'max-w-4xl mx-auto',
    xl: 'max-w-6xl mx-auto',
    full: 'w-full'
  };

  return (
    <div className={cn('px-2 sm:px-4 md:px-6', sizeClasses[size], className)}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * Responsive grid component
 */
export function ResponsiveGrid({ 
  children, 
  className = '',
  cols = 3,
  gap = 'md'
}: ResponsiveGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 md:gap-6',
    lg: 'gap-4 sm:gap-6 md:gap-8'
  };

  return (
    <div className={cn('grid', gridClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Responsive card component
 */
export function ResponsiveCard({ 
  children, 
  className = '',
  padding = 'md'
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border border-gray-200',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * Responsive table wrapper
 */
export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full">
        <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
          {children}
        </div>
      </div>
    </div>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Mobile menu component
 */
export function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}

// Utility function for cn (class names)
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
