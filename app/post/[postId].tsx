import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { postApi } from '@/api/post.api'
import type { PostResponse } from '@/types/postType'
import { SafeAreaView } from 'react-native-safe-area-context'
import { commentApi } from '@/api/comment.api'
import type { CommentResponse } from '@/types/commentType'
import AntDesign from '@expo/vector-icons/AntDesign';
import { getCurrentUserEmail } from '@/utils/auth1'




// 날짜 포맷
const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// content JSON 파싱해서 렌더링 가능한 배열로 변환
const parseContent = (content: string): { type: 'text' | 'image'; value: string }[] => {
  try {
    const parsed = JSON.parse(content)
    const result: { type: 'text' | 'image'; value: string }[] = []

    const traverse = (nodes: any[]) => {
      if (!nodes) return
      for (const node of nodes) {
        if (node.type === 'image') {
          result.push({ type: 'image', value: node.attrs?.src ?? '' })
        } else if (node.type === 'text') {
          result.push({ type: 'text', value: node.text ?? '' })
        } else if (node.content) {
          traverse(node.content)
          // 문단 사이 줄바꿈
          if (['paragraph', 'heading', 'blockquote'].includes(node.type)) {
            result.push({ type: 'text', value: '\n' })
          }
        }
      }
    }

    traverse(parsed.content)
    return result
  } catch {
    return [{ type: 'text', value: content }]
  }
}


export default function PostDetail() {
  const { postId } = useLocalSearchParams<{ postId: string }>()
  const router = useRouter()

  const [post, setPost] = useState<PostResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentInput, setCommentInput] = useState('')
  const [editCommentId, setEditCommentId] = useState<number | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')
  // 댓글
  const [comments, setComments] = useState<CommentResponse[]>([])

  // 자신이 쓴 게시물말 수정 삭제 권한
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUserEmail().then(setCurrentEmail)
  }, [])


  // 게시글 로드
  useEffect(() => {
    const load = async () => {
      try {
        const data = await postApi.getOne(postId)
        setPost(data)
        // 좋아요 상태
        const likeData = await postApi.getLikeStatus(Number(postId), currentEmail ?? '')
        setLiked(likeData.liked)
        setLikeCount(likeData.likeCount)
        // 댓글
        const commentData = await commentApi.selectComment(Number(postId))
        setComments(commentData)
      } catch (e) {
        console.error('게시글 로드 오류', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [postId, currentEmail])

  // 좋아요 토글
  const handleLike = async () => {
    try {
      await postApi.toggleLike(Number(postId), currentEmail ?? '')
      const newLiked = !liked
      setLiked(newLiked)
      setLikeCount((prev) => prev + (newLiked ? 1 : -1))
    } catch (e) {
      console.error('좋아요 오류', e)
    }
  }

  // 게시글 삭제
  const handleDelete = () => {
    Alert.alert('게시글 삭제', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await postApi.deleteDetail1(Number(postId))
            router.back()
          } catch (e) {
            Alert.alert('오류', '삭제에 실패했습니다.')
          }
        },
      },
    ])
  }

  // 게시글 수정
  const handleUpdate = ()=>{
    router.push(`/post/postEdit?postId=${postId}` as any)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>게시글을 찾을 수 없습니다.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>돌아가기</Text>
        </Pressable>
      </View>
    )
  }

  const contentNodes = parseContent(post.content)


  // 댓글 등록
  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return
    try {
      await commentApi.insertComment({
        postId: Number(postId),
        memEmail: currentEmail,
        content: commentInput,
      })
      setCommentInput('')
      // 댓글 목록 새로고침
      const commentData = await commentApi.selectComment(Number(postId))
      setComments(commentData)
    } catch (e) {
      Alert.alert('오류', '댓글 등록에 실패했습니다.')
    }
  }

  // 댓글 삭제
  const handleCommentDelete = async (commentId: number) => {
    Alert.alert('댓글 삭제', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await commentApi.deleteComment(commentId)
            const commentData = await commentApi.selectComment(Number(postId))
            setComments(commentData)
          } catch (e) {
            Alert.alert('오류', '댓글 삭제에 실패했습니다.')
          }
        },
      },
    ])
  }

  // 댓글 수정
  // const handleCommentUpdate = async (commentId: number) => {
  //   if (!editCommentContent.trim()) return
  //   try {
  //     await commentApi.updateComment({
  //       id: commentId,
  //       postId: Number(postId),
  //       memEmail: TEMP_EMAIL,
  //       content: editCommentContent,
  //     })
  //     setEditCommentId(null)
  //     const commentData = await commentApi.selectComment(Number(postId))
  //     setComments(commentData)
  //   } catch (e) {
  //     Alert.alert('오류', '댓글 수정에 실패했습니다.')
  //   }
  // }










  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      
        {/* 뒤로가기 */}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#555" />
          <Text style={styles.backBtnText}>목록으로</Text>
        </Pressable>

        {/* 제목 */}
        <Text style={styles.title}>{post.title}</Text>

        {/* 작성자 정보 */}
        <View style={styles.authorRow}>
          <Image
            source={
              post.memProfileImg
                ? { uri: post.memProfileImg }
                : require('@/assets/images/default-profile.png')
            }
            style={styles.profileImg}
          />
          <View>
            <Text style={styles.nickname}>{post.memNickname ?? '알 수 없음'}</Text>
            <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
          </View>

          {/* 본인 게시글이면 수정,삭제 버튼 */}
          {post.memEmail === currentEmail && (
            <View style={styles.editDelete}>
              <Pressable style={styles.updateBtn} onPress={handleUpdate}>
                <AntDesign name="edit" size={18} color="#346739" />
                <Text style={styles.updateBtnText}>수정</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                <Text style={styles.deleteBtnText}>삭제</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* 본문 - content JSON 파싱해서 렌더링 */}
        <View style={styles.contentBody}>
          {contentNodes.map((node, idx) =>
            node.type === 'image' && node.value ? (
              <Image
                key={idx}
                source={{ uri: node.value }}
                style={styles.contentImage}
                resizeMode="contain"
              />
            ) : (
              <Text key={idx} style={styles.contentText}>{node.value}</Text>
            )
          )}
        </View>

        <View style={styles.divider} />

        {/* 좋아요 */}
        <Pressable style={styles.likeRow} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? '#e74c3c' : '#888'}
          />
          <Text style={styles.likeText}>{likeCount}명이 좋아합니다</Text>
        </Pressable>

        <View style={styles.divider} />

        {/* 댓글 목록 */}
        <Text style={styles.commentTitle}>댓글 {comments.length}개</Text>

        {comments.length === 0 ? (
          <Text style={styles.noComment}>첫 댓글을 작성해보세요!</Text>
        ) : (
          comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Image
                source={
                  comment.memProfileImg
                    ? { uri: comment.memProfileImg }
                    : require('@/assets/images/default-profile.png')
                }
                style={styles.commentProfileImg}
              />
              <View style={styles.commentBody}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentNickname}>{comment.memNickname}</Text>
                  <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                </View>

                {/* 수정 중이면 input */}
                {editCommentId === comment.id ? (
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.editInput}
                      value={editCommentContent}
                      onChangeText={setEditCommentContent}
                    />
                    <Pressable onPress={() => setEditCommentId(null)}>
                      <Text style={styles.cancelBtn}>취소</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.commentContent}>{comment.content}</Text>
                )}

                {/* 본인 댓글이면 수정/삭제 */}
                {comment.memEmail === currentEmail && editCommentId !== comment.id && (
                  <View style={styles.commentActions}>
                    {/* <Pressable onPress={() => {
                      setEditCommentId(comment.id)
                      setEditCommentContent(comment.content)
                    }}>
                      <Text style={styles.actionBtn}>수정</Text>
                    </Pressable> */}
                    <Pressable
                      onPress={()=>handleCommentDelete(comment.id)}
                    >
                      <Text style={[styles.actionBtn, { color: '#e74c3c' }]}>삭제</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        {/* 댓글 입력 */}
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="댓글을 입력하세요"
            value={commentInput}
            onChangeText={setCommentInput}
            multiline
          />
          <Pressable 
            style={styles.commentSubmitBtn}
            onPress={handleCommentSubmit}
          >
            <Text style={styles.commentSubmitText}>등록</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  backLink: {
    color: '#4CAF50',
    fontSize: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 14,
    color: '#555',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  nickname: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
  editDelete:{
    flex : 1,
    flexDirection : 'row'
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft : 20
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft : 'auto'
  },
  updateBtnText:{
    fontSize:13,
    color:'#346739'
  },
  deleteBtnText: {
    fontSize: 13,
    color: '#e74c3c',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  contentBody: {
    gap: 4,
  },
  contentImage: {
    width: '100%',
    height: 250,
    marginVertical: 8,
    borderRadius: 8,
  },
  contentText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likeText: {
    fontSize: 14,
    color: '#555',
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  noComment: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 13,
    paddingVertical: 16,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  commentProfileImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentNickname: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  commentDate: {
    fontSize: 11,
    color: '#aaa',
  },
  commentContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    fontSize: 12,
    color: '#888',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
  },
  cancelBtn: {
    fontSize: 12,
    color: '#888',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  commentSubmitBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  commentSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})
