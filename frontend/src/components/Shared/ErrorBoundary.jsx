import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card text-center py-12">
          <p className="text-red-400 font-medium">Something went wrong</p>
          <p className="text-gray-500 text-sm mt-1">{this.state.error?.message}</p>
          <button className="btn-secondary mt-4" onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
