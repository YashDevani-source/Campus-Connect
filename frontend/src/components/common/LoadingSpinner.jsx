const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="loading-screen">
    <div className="spinner" />
    <p>{text}</p>
  </div>
);

export default LoadingSpinner;
