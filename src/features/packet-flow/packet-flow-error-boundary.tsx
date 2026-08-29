"use client";

import { Component, type ErrorInfo, type PropsWithChildren } from "react";

export const packetFlowFallbackMessage = "The interactive packet journey is unavailable. Use the static diagram and explanation above.";

export function PacketFlowFallback() {
  return <aside className="lesson-notice" role="note">{packetFlowFallbackMessage}</aside>;
}

export class PacketFlowErrorBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    console.error("Packet-flow player failed", error);
  }

  render() {
    if (this.state.failed) return <PacketFlowFallback />;

    return this.props.children;
  }
}
