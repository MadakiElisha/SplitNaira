"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled app error", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main className="shell-page">
          <div className="glass-panel border-rose-500/30 bg-rose-500/10 p-6 text-rose-950 dark:text-rose-100">
            <h1 className="font-display text-2xl">Something went wrong.</h1>
            <p className="mt-2 text-sm text-current/80">
              Please refresh the page. If the issue persists, reconnect your wallet and try again.
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
