import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert } from './Alert';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  /** Changing this value resets the boundary (e.g. pass location.pathname). */
  resetKey?: unknown;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook point for Sentry / logging.
    console.error('Unhandled UI error', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.reset();
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return (
      <div className="mx-auto max-w-xl p-6">
        <Alert variant="error" title="Something went wrong">
          <p>{error.message || 'An unexpected error occurred while rendering this page.'}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={this.reset}>
              Try again
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.location.assign('/')}>
              Go to dashboard
            </Button>
          </div>
        </Alert>
      </div>
    );
  }
}
