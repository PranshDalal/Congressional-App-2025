import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { OLDThemedText } from '@/components/default/OLDThemedText';
import { ThemedView } from '@/components/default/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <OLDThemedText type="title">This screen does not exist.</OLDThemedText>
        <Link href="/" style={styles.link}>
          <OLDThemedText type="link">Go to home screen!</OLDThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
