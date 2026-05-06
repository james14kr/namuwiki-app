import { dmApi } from "@/api/dm.api";
import { getCheckFollow, postFollow, deleteFollow } from "@/api/follow.api";
import { postApi } from "@/api/post.api";
import type { PostResponse } from "@/types/postType";
import { getCurrentUserEmail } from "@/utils/auth1";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

// content JSON에서 첫 번째 이미지 URL 추출
const getFirstImageUrl = (content: string): string | null => {
  try {
    const parsed = JSON.parse(content);
    const imageNode = parsed.content?.find(
      (node: any) => node.type === "image",
    );
    return imageNode?.attrs?.src ?? null;
  } catch {
    return null;
  }
};

// content JSON에서 텍스트만 추출
const getTextContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    return (
      parsed.content
        ?.flatMap(
          (node: any) => node.content?.map((c: any) => c.text ?? "") ?? [],
        )
        .join(" ") ?? ""
    );
  } catch {
    return content;
  }
};

// 날짜 포맷
const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

interface Props {
  post: PostResponse;
}

const PostFeedCard = ({ post }: Props) => {
  const router = useRouter();
  const imageUrl = getFirstImageUrl(post.content);
  const textContent = getTextContent(post.content);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false)
  const queryClient = useQueryClient();

  // 자신이 쓴 게시물말 수정 삭제 권한
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        // 이메일 가져오기
        const email = await getCurrentUserEmail();
        setCurrentEmail(email);
        // 실제 좋아요 상태 API 조회
        const likeData = await postApi.getLikeStatus(post.id, email ?? "");
        setLiked(likeData.liked);
        setLikeCount(likeData.likeCount);
        if(email && email !== post.memEmail){
          const result = await getCheckFollow({followerEmail: email, farmerEmail: post.memEmail})
          setIsFollowing(result > 0)
        };
      } catch {
        // 실패해도 0 유지
      }
    };
    loadLikeStatus();
    
  }, [post.id]);

  // 좋아요 토글
  const handleLike = async () => {
    try {
      await postApi.toggleLike(post.id, currentEmail ?? "");
      const newLiked = !liked;
      setLiked(newLiked);
      setLikeCount((prev) => prev + (newLiked ? 1 : -1));
    } catch (e) {
      console.error("좋아요 오류", e);
    }
  };

  // 이미지 클릭 상세 이동
  const handleImagePress = () => {
    router.push(`/post/${post.id}` as any);
  };

  const handleFollow = async () => {
    if(!currentEmail) return;
    try{
      if(isFollowing){
        await deleteFollow({followerEmail: currentEmail, farmerEmail: post.memEmail})
        setIsFollowing(false)
        Toast.show({type: 'success', text1: `${post.memNickname}님을 언팔로우했습니다.`})
      }else{
        await postFollow({followerEmail: currentEmail, farmerEmail: post.memEmail})
        setIsFollowing(true)
        Toast.show({type: 'success', text1: `${post.memNickname}님을 팔로우헀습니다.`})
      }
      queryClient.invalidateQueries({queryKey: ['followList']})
    }catch(e){
      console.error('팔로우 오류', e)
    }
  }

  return (
    <View style={styles.card}>

      {/* 이미지 있을 때만 imageWrapper 렌더링 */}
      {imageUrl ? (
        <Pressable onPress={handleImagePress}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* 프사 + 닉네임 - 이미지 좌상단 겹침 */}
            <Pressable
              style={styles.profileRow}
              onPress={() => { /* 기존 DM 이동 로직 */ }}
            >
              <Image
                source={
                  post.memProfileImg
                    ? { uri: post.memProfileImg }
                    : require("@/assets/images/default-profile.png")
                }
                style={styles.profileImg}
              />
              <Text style={styles.nickname}>{post.memNickname ?? '알 수 없음'}</Text>
            </Pressable>
          </View>
        </Pressable>
      ) : (
        // 이미지 없을 때 프로필 행만 별도 표시
        <View style={styles.profileRowNoImage}>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            onPress={() => {
              if (currentEmail === post.memEmail) return;
              dmApi.getOrCreateRoom({ senderEmail: currentEmail!, receiverEmail: post.memEmail })
                .then((room) => { router.push(`/dm/${room.id}` as any); });
            }}
          >
            <Image
              source={post.memProfileImg ? { uri: post.memProfileImg } : require("@/assets/images/default-profile.png")}
              style={styles.profileImgNoImage}
            />
            <Text style={styles.nicknameNoImage}>{post.memNickname ?? '알 수 없음'}</Text>
          </Pressable>

          {currentEmail && currentEmail !== post.memEmail && (
            <Pressable onPress={handleFollow} style={[styles.followBtn, isFollowing && styles.followingBtn]}>
              <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                {isFollowing ? '팔로잉' : '팔로우'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* 제목만 */}
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>
          {post.title}
        </Text>
      </View>

      {/* 본문 */}
      <Text style={styles.content} numberOfLines={expanded ? undefined : 2}>
        {textContent}
      </Text>

      {/* 더보기 버튼 - 본문 아래 */}
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.moreBtnWrap}
      >
        <Text style={styles.moreBtn}>{expanded ? "접기" : "더보기"}</Text>
      </Pressable>

      {/* 해시태그 */}
      {post.hashtags && (
        <View style={styles.hashtagRow}>
          {post.hashtags.split(' ').map((tag) => (
            <Text key={tag} style={styles.hashtagChip}>{tag}</Text>
          ))}
        </View>
      )}

      {/* 업로드 날짜 */}
      <Text style={styles.date}>{formatDate(post.createdAt)}</Text>

      {/* 좋아요 + 댓글수 */}
      <View style={styles.footerRow}>
        <Pressable style={styles.footerItem} onPress={handleLike}>
          <Entypo
            name={liked ? "heart" : "heart-outlined"}
            size={24}
            color={liked ? "#e74c3c" : "#888"}
          />
          <Text style={styles.footerCount}>{likeCount}</Text>
        </Pressable>

        <Pressable style={styles.footerItem} onPress={handleImagePress}>
          <Ionicons name="chatbubble-outline" size={20} color="#888" />
          <Text style={styles.footerCount}>{post.commentCount ?? 0}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default PostFeedCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,           // 40 → 16
    borderBottomWidth: 4,       // 추가
    borderBottomColor: '#6A9469', // 추가
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 220,
  },
  noImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    color: "#aaa",
    fontSize: 13,
  },
  profileRow: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profileImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  nickname: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginRight: 8,
  },
  moreBtn: {
    fontSize: 12,
    color: "#6A9469",
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 6,
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },
  date: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 11,
    color: "#aaa",
  },
  footerRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerCount: {
    fontSize: 13,
    color: "#888",
  },
  profileRowNoImage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: 12,
    paddingBottom: 4,
  },
  profileImgNoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
  },
  nicknameNoImage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  moreBtnWrap: {
    paddingHorizontal: 12,
    paddingTop: 4,
    alignItems: 'flex-end',
  },
    hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  hashtagChip: {
    fontSize: 12,
    color: '#6A9469',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6A9469',
  },
  followingBtn: {
    backgroundColor: '#6A9469',
  },
  followBtnText: {
    fontSize: 12,
    color: '#6A9469',
    fontWeight: '600',
  },
  followingBtnText: {
    color: '#fff',
  },
});
