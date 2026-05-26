const Loading = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <div className="w-7 h-7 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
    <p className="text-sm" style={{ color: '#707070' }}>{text}</p>
  </div>
);

export const CardSkeleton = () => (
  <div className="card animate-pulse space-y-4">
    <div className="h-4 rounded-xl w-1/3" style={{ background: '#e5e5ea' }} />
    <div className="h-24 rounded-xl" style={{ background: '#e5e5ea' }} />
    <div className="h-4 rounded-xl w-2/3" style={{ background: '#e5e5ea' }} />
  </div>
);

export default Loading;
