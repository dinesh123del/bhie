import Logo from '../Logo';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <Logo
        size="sm"
        showSubtitle={false}
        glow
        className="border-white/5 bg-transparent px-0 py-0 shadow-none"
      />
    </div>
  );
};

export default LoadingSpinner;
