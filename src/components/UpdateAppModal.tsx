import React from 'react';
import { Modal, Platform, Text, View } from 'react-native';
import { ArrowRight, Download, Sparkles } from 'lucide-react-native';
import { Button } from './ui';
import { colors } from '../theme/tokens';

interface Props {
  visible: boolean;
  installedVersion: string;
  latestVersion: string;
  /** Forced updates cannot be dismissed (no "Maybe later", Android back button disabled). */
  force: boolean;
  onUpdate: () => void;
  onLater: () => void;
}

/** "A new version is available" popup shown at app launch — see AppUpdateGate. */
export function UpdateAppModal({ visible, installedVersion, latestVersion, force, onUpdate, onLater }: Props) {
  const storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={force ? undefined : onLater}>
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-sm items-center rounded-3xl bg-white px-6 pb-6 pt-8 dark:bg-surface-1">
          <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-brand-500/10">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-600">
              <Download size={26} color="#ffffff" />
            </View>
            <View className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-gold-400">
              <Sparkles size={13} color={colors.ink[900]} />
            </View>
          </View>

          <Text className="text-center text-xl font-display font-extrabold text-ink-900 dark:text-white">
            {force ? 'Update required' : 'Update available'}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-ink-500 dark:text-ink-400">
            {force
              ? `This version of Trustified is no longer supported. Please update from the ${storeName} to keep using the app.`
              : `A newer version of Trustified is ready on the ${storeName} with the latest improvements and fixes.`}
          </Text>

          <View className="mt-4 flex-row items-center gap-2 rounded-full bg-ink-50 px-4 py-1.5 dark:bg-surface-2">
            <Text className="text-xs font-semibold text-ink-500 dark:text-ink-400">v{installedVersion}</Text>
            <ArrowRight size={12} color={colors.ink[400]} />
            <Text className="text-xs font-bold text-brand-600">v{latestVersion}</Text>
          </View>

          <View className="mt-6 w-full gap-2">
            <Button size="lg" onPress={onUpdate} accessibilityLabel={`Update on ${storeName}`}>
              Update now
            </Button>
            {force ? null : (
              <Button size="md" variant="ghost" onPress={onLater}>
                Maybe later
              </Button>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
