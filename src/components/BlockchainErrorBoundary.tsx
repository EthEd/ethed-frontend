"use client";

import React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { getBlockchainErrorInfo } from "@/lib/blockchain-errors";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class BlockchainErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    const info = getBlockchainErrorInfo(error);
    toast.error(info.title, {
      description: info.description,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900/90 backdrop-blur-xl border border-red-400/20 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-white text-xl">Blockchain Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-400">
              Something went wrong while interacting with the blockchain. Please try again.
            </p>
            <Button
              onClick={this.handleReset}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
