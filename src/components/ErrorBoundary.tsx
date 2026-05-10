import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
        <div className="max-w-md w-full bg-bg-secondary border border-[rgba(255,77,109,0.3)] rounded-3xl p-8 text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-display font-bold mb-2">Algo salió mal</h2>
          <p className="text-text-secondary text-sm mb-4">
            Disculpa, hubo un error inesperado. Puedes recargar e intentar otra vez.
          </p>
          {this.state.error && (
            <pre className="text-xs text-text-muted bg-bg-tertiary p-3 rounded-xl mb-4 overflow-auto max-h-32 text-left">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.reset}
            className="px-6 py-3 rounded-xl bg-gradient-gold text-bg-primary font-display font-semibold shadow-btn-gold hover:brightness-110 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
}
