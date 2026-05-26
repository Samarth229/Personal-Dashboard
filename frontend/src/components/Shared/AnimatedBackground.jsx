const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
    <div className="blob blob-green" />
    <div className="blob blob-amber" />
    <div className="blob blob-rust" />
    <div className="blob blob-teal" />
  </div>
);

export default AnimatedBackground;
