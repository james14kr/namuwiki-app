import React, { useState } from 'react'
import {
  View, Text, TextInput, FlatList,
  Pressable, StyleSheet, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { postApi } from '@/api/post.api'
import type { PostResponse } from '@/types/postType'
import PostFeedCard from '@/components/PostFeedCard'

const SearchScreen = () => {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<PostResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!keyword.trim()) return
    setIsLoading(true)
    setSearched(true)
    try {
      const data = await postApi.search(keyword.trim())
      setResults(data)
    } catch (e) {
      console.error('검색 오류', e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#2C4A2C" />
        </Pressable>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="제목, 내용, 해시태그 검색"
            placeholderTextColor="#aaa"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {keyword.length > 0 && (
            <Pressable onPress={() => { setKeyword(''); setResults([]); setSearched(false) }}>
              <Ionicons name="close-circle" size={18} color="#aaa" />
            </Pressable>
          )}
        </View>
        <Pressable onPress={handleSearch} style={styles.searchBtn}>
          <Ionicons name="search" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* 결과 */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#6A9469" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => <PostFeedCard post={item} />}
          ListEmptyComponent={
            searched ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  '{keyword}'에 대한 검색 결과가 없습니다
                </Text>
              </View>
            ) : (
              <View style={styles.emptyWrap}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>검색어를 입력해주세요</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  )
}

export default SearchScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  backBtn: { padding: 4 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f6f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  input: { flex: 1, fontSize: 15, color: '#2C4A2C' },
  searchBtn: {
    backgroundColor: '#6A9469',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: '#aaa' },
})