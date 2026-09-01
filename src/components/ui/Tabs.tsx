import React, { createContext, useContext, useState } from 'react';
import { View, Text, Pressable } from 'react-native';

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}
export const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = '',
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '');
  const value = controlledValue ?? uncontrolled;
  const setValue = onValueChange ?? setUncontrolled;
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <View className={className}>{children}</View>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`flex-row rounded-xl bg-ink-50 p-1 ${className}`}>{children}</View>;
}

export function TabsTrigger({
  value,
  children,
  className = '',
  activeClassName = '',
  inactiveClassName = '',
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within <Tabs>');
  const active = ctx.value === value;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={() => ctx.setValue(value)}
      className={`flex-1 items-center justify-center rounded-lg py-2.5 ${className} ${active ? activeClassName || 'bg-white shadow-sm' : inactiveClassName}`}>
      {typeof children === 'string' ? (
        <Text className={`text-sm font-semibold ${active ? 'text-ink-900' : 'text-ink-500'}`}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function TabsContent({
  value,
  children,
  className = 'mt-4',
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used within <Tabs>');
  if (ctx.value !== value) return null;
  return <View className={className}>{children}</View>;
}
