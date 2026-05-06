import React from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

// 구독 농장 타입
interface FollowItem {
  farmerEmail: string
  farmerNickname: string
  farmerProfileImg: string | null
}

// 부모(index.tsx)에서 받는 props 타입
interface Props {
  followList: FollowItem[]          // 구독 농장 목록
  selectedFarmer: string | null     // 현재 선택된 농장 이메일
  onSelect: (email: string | null) => void  // 농장 선택 콜백
}

const FarmerBar = ({ followList, selectedFarmer, onSelect }: Props) => {
  return (
    // 가로 스크롤 가능한 농장 바
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.farmerBar}
      contentContainerStyle={styles.farmerBarContent}
    >
      {/* 전체 보기 버튼 - 눌리면 selectedFarmer가 null이 되어 전체 게시글 표시 */}
      <Pressable style={styles.farmerItem} onPress={() => onSelect(null)}>
        <View style={[
          styles.farmerCircle,
          // 전체가 선택됐을 때 초록 테두리
          selectedFarmer === null && styles.farmerCircleSelected
        ]}>
          <Text style={styles.farmerCircleText}>전체</Text>
        </View>
      </Pressable>

      {/* 구독 농장 목록 - 각 농장을 원형 아이콘으로 표시 */}
      {followList.map((farmer) => (
        <Pressable
          key={farmer.farmerEmail}
          style={styles.farmerItem}
          onPress={() => onSelect(farmer.farmerEmail)}
        >
          <View style={[
            styles.farmerCircle,
            // 해당 농장이 선택됐을 때 초록 테두리
            selectedFarmer === farmer.farmerEmail && styles.farmerCircleSelected
          ]}>
            {/* 프로필 이미지가 있으면 이미지, 없으면 닉네임 첫 글자 */}
            {farmer.farmerProfileImg ? (
              <Image
                source={{ uri: farmer.farmerProfileImg }}
                style={styles.farmerImg}
              />
            ) : (
              <Text style={styles.farmerCircleText}>
                {farmer.farmerNickname?.[0] ?? '?'}
              </Text>
            )}
          </View>
          {/* 농장 닉네임 - 길면 말줄임표 */}
          <Text style={styles.farmerLabel} numberOfLines={1}>
            {farmer.farmerNickname}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

export default FarmerBar

const styles = StyleSheet.create({
  // 농장 바 전체 컨테이너
  farmerBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    height: 120,
  },
  // 농장 아이콘들을 가로로 나열
  farmerBarContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
    flexDirection: 'row',
  },
  // 원형 아이콘 + 닉네임 묶음
  farmerItem: {
    alignItems: 'center',
    width: 64,
  },
  // 원형 아이콘
  farmerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  // 선택된 농장 - 초록 테두리
  farmerCircleSelected: {
    borderColor: '#6A9469',
  },
  // 프로필 이미지 없을 때 표시되는 텍스트
  farmerCircleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },
  // 프로필 이미지
  farmerImg: {
    width: '100%',
    height: '100%',
  },
  // 농장 닉네임 텍스트
  farmerLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
    width: 60,
  },
})