import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './ui/Button';

interface Props {
  children: React.ReactNode;
  label?: string;
}
interface State {
  error: Error | null;
}

/**
 * Per Phase 6 ("Error boundaries per major navigator stack so one screen
 * crashing doesn't kill the app"). Wrap around the navigation tree (and
 * optionally per-tab) in App.tsx.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(`[ErrorBoundary${this.props.label ? `:${this.props.label}` : ''}]`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center gap-4 bg-white px-8">
          <Text className="text-center text-lg font-bold text-ink-900">Something went wrong</Text>
          <Text className="text-center text-sm text-ink-500">
            {this.props.label ? `${this.props.label} ` : ''}hit an unexpected error. Try again.
          </Text>
          <Button onPress={() => this.setState({ error: null })}>Try again</Button>
        </View>
      );
    }
    return this.props.children;
  }
}
