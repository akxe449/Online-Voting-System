import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

export const colors = {
  navy: '#10233F',
  blue: '#315F9E',
  blueSoft: '#EDF3FA',
  ink: '#17243A',
  muted: '#6B778C',
  line: '#E3E8EF',
  surface: '#FFFFFF',
  background: '#F5F7FA',
  success: '#237A57',
  successSoft: '#EAF6F0',
  warning: '#A76516',
  warningSoft: '#FFF5E8',
  danger: '#B54747',
  dangerSoft: '#FDEEEE',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },

  header: {
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  backArrow: {
    fontSize: 30,
    lineHeight: 31,
    color: colors.ink,
    marginTop: -2,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    marginTop: 7,
  },

  stepBadge: {
    minWidth: 45,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.blue,
  },

  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E9EF',
    marginTop: 17,
    overflow: 'hidden',
  },

  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.blue,
  },

  primaryButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C9D1DC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  secondaryText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },

  disabled: {
    opacity: 0.48,
  },

  pressed: {
    opacity: 0.78,
  },

  blueNotice: {
    backgroundColor: colors.blueSoft,
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D8E4F2',
  },

  successNotice: {
    backgroundColor: colors.successSoft,
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CDE8DA',
  },

  warningNotice: {
    backgroundColor: colors.warningSoft,
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F2D8B2',
  },

  dangerNotice: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3CACA',
  },

  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    gap: 10,
  },

  loadingText: {
    color: colors.muted,
    fontSize: 13,
  },
});

export const ui = styles;

export function Screen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}) {
  return (
    <SafeAreaView style={styles.container}>
      {scroll ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scroll, contentStyle]}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          scrollEnabled
          nestedScrollEnabled={false}
          removeClippedSubviews={false}
          overScrollMode="auto"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, contentStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

export function PageHeader({
  title,
  subtitle,
  step,
  total = 6,
  onBack,
}: {
  title: string;
  subtitle?: string;
  step?: number;
  total?: number;
  onBack?: () => void;
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          hitSlop={8}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
      ) : null}

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>

          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
        </View>

        {step ? (
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>
              {step}/{total}
            </Text>
          </View>
        ) : null}
      </View>

      {step ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  100,
                  (step / total) * 100,
                )}%`,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

export function StepHeader(props: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  step?: number;
  total?: number;
}) {
  const { eyebrow: _eyebrow, ...headerProps } = props;

  return <PageHeader {...headerProps} />;
}

export function InfoCard({
  title,
  children,
  tone = 'blue',
}: {
  title: string;
  children: React.ReactNode;
  tone?: 'blue' | 'success' | 'warning';
}) {
  return (
    <Notice tone={tone}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '800',
          color: colors.ink,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 12,
          lineHeight: 18,
          color: '#475467',
          marginTop: 3,
        }}
      >
        {children}
      </Text>
    </Notice>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryButton,
        (disabled || loading) && styles.disabled,
        pressed &&
          !disabled &&
          !loading &&
          styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryText}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  style,
}: {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.secondaryText}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Notice({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode;
  tone?: 'blue' | 'success' | 'warning' | 'danger';
}) {
  const box =
    tone === 'success'
      ? styles.successNotice
      : tone === 'warning'
        ? styles.warningNotice
        : tone === 'danger'
          ? styles.dangerNotice
          : styles.blueNotice;

  return <View style={box}>{children}</View>;
}

export function LoadingState({
  label = 'Loading…',
}: {
  label?: string;
}) {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator
        size="small"
        color={colors.blue}
      />

      <Text style={styles.loadingText}>
        {label}
      </Text>
    </View>
  );
}