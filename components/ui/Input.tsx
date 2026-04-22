import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'
import React, { useState } from 'react'


type InputProps = TextInputProps & {
  label?: string
  isPw?: boolean
}

const Input = ({label, isPw=false, ...props}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, isFocused && styles.focused]}
        secureTextEntry={isPw}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {setIsFocused(false)}}
        placeholderTextColor="#9DB09D"
        {...props}
      />
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    color: '#2C3E2C',
    letterSpacing: 0.1,
  },
  input: {
    fontSize: 15,
    height: 46,
    borderWidth: 1.5,
    borderColor: '#C4D9C4',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: '#2C3E2C',
  },
  focused: {
    borderColor: '#6A9469',
    shadowColor: '#6A9469',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  }
})
