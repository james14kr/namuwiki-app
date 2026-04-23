import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const dm = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>dm</Text>
    </SafeAreaView>
  )
}

export default dm

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})