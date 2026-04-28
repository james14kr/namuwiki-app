import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import React, { useState } from 'react'

type InputProps = TextInputProps & {
  label?: string
  isPw?: boolean
  containerStyle?: ViewStyle
}

const Input = ({ label, isPw = false, containerStyle, style, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.wrap}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.focused,
            isPw && styles.inputWithEye,
            style,
          ]}
          secureTextEntry={isPw && !showPw}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9DB09D"
          {...props}
        />
        {isPw && (
          <Pressable
            onPress={() => setShowPw((prev) => !prev)}
            style={styles.eyeBtn}
          >
            <Text style={styles.eyeText}>{showPw ? '숨김' : '표시'}</Text>
          </Pressable>
        )}
      </View>
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
  wrap: {
    position: 'relative',
  },
  input: {
    fontSize: 15,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#C4D9C4',
    borderRadius: 12,
    backgroundColor: '#FAFCFA',
    paddingHorizontal: 14,
    color: '#2C3E2C',
  },
  inputWithEye: {
    paddingRight: 58,
  },
  focused: {
    borderColor: '#6A9469',
    backgroundColor: '#FFFFFF',
    shadowColor: '#6A9469',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 2,
  },
  eyeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A9A7A',
  },
})
