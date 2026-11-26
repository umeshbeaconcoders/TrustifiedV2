import React from 'react';
import type { ScrollView as RNScrollView, ScrollViewProps } from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';

/**
 * Module-level RNGH ScrollView adapter for FlashList `renderScrollComponent`.
 * Kept at module scope so FlashList never unmounts/remounts its scroll container on re-render.
 */
export const RNGHScrollView = React.forwardRef<RNScrollView, ScrollViewProps>((props, ref) => (
  <GHScrollView ref={ref} {...props} />
));

RNGHScrollView.displayName = 'RNGHScrollView';
