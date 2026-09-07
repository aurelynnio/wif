import { Spinner } from '@/components/ui/spinner';

const LoadingSpinner = ({
  fullScreen = false,
  size = 'md',
  className = '',
  text = '',
}) => {
  const sizeMap = {
    xs: 'sm',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'lg',
  };

  const spinnerContent = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size={sizeMap[size]} className="text-muted-foreground" />
      {text && (
        <p className="text-muted-foreground text-sm font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;