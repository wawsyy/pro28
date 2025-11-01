"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Only log non-critical errors
    if (
      !error.message.includes("Base Account SDK") &&
      !error.message.includes("Cross-Origin-Opener-Policy") &&
      !error.message.includes("Failed to fetch") &&
      !error.message.includes("ERR_BLOCKED_BY_RESPONSE")
    ) {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.children;
    }

    return this.props.children;
  }
}

