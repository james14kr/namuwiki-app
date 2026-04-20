import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'

const Login = () => {

  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  //임시 로그인 - 나중에 실제 API로 교체 예정
  const handleFarmerLogin = () => {
    router.replace('/(farmer-tabs)/home' as any)
  }

  const handleUserLogin = () => {
    router.replace('/(user-tabs)/home'as any)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>나무위키 로그인</Text>

      <TextInput
        style={styles.input}
        placeholder='이메일'
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
      />

      <TextInput
        style={styles.input}
        placeholder='비밀번호'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* 임시 테스트 버튼 - 나중에 하나로 합칠 예정 */}
      <TouchableOpacity style={styles.button} onPress={handleFarmerLogin}>
        <Text style={styles.buttonText}>농장주 로그인 (테스트)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.userButton]} onPress={handleUserLogin}>
        <Text style={styles.buttonText}>일반 사용 로그인 (테스트)</Text>
      </TouchableOpacity>

    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center'
  },
  userButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
})