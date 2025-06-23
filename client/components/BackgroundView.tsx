import theme from '@/styles/theme'
import { View, ViewProps, StyleSheet } from 'react-native'

export default function BackgroundView({ children }: ViewProps) {
  return (
    <View style={[styles.background]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    // backgroundColor: theme.colors.bgDark,
  },
})