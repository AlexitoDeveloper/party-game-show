import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#0c0c14]/95 border-2 border-red-500/50 rounded-2xl p-6 text-center shadow-deco-gold backdrop-blur-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-broadway uppercase tracking-wider text-red-300">
              {this.props.fallbackTitle || 'Incidencia al cargar esta sección'}
            </h3>
            <p className="text-xs text-amber-200/70 font-vintage mt-1">
              {this.props.fallbackMessage ||
                'Ocurrió un error inesperado al renderizar los controles. Puedes reintentar sin perder tu partida.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-gradient text-slate-950 font-broadway text-xs font-bold shadow-deco-gold hover:brightness-110 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
