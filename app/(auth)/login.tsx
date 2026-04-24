import Input from "@/components/ui/Input";
import { usePostLogin } from "@/queries/member.queries";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface CustomJwtPayload {
  exp: number;
  iat: number;
  memNickname: string;
  role: string;
  sub: string;
}

const Login = () => {
  const router = useRouter();
  const usePostLoginMutate = usePostLogin();

  const [loginData, setLoginData] = useState({
    memEmail: "",
    memPw: "",
  });

  // === 애니메이션 ===
  const logoFloat = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const btnPulse = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // 스태거 등장 (타이틀, 폼, 버튼, 링크)
  const anim = useRef(
    [0, 1, 2, 3].map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(28),
    }))
  ).current;

  // 웨이브 interpolation
  const waveDrift1 = useRef(
    waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] })
  ).current;
  const waveDrift2 = useRef(
    waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -13] })
  ).current;
  const waveDrift3 = useRef(
    waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 11] })
  ).current;

  const logoLoop = useRef<Animated.CompositeAnimation | null>(null);
  const waveLoop = useRef<Animated.CompositeAnimation | null>(null);
  const btnLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startLoops = useCallback(() => {
    logoLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: -8, duration: 2000, useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    waveLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 4500, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 4500, useNativeDriver: true }),
      ])
    );
    btnLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(btnPulse, { toValue: 1.04, duration: 1400, useNativeDriver: true }),
        Animated.timing(btnPulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    );
    logoLoop.current.start();
    waveLoop.current.start();
    btnLoop.current.start();
  }, [btnPulse, logoFloat, waveAnim]);

  const stopLoops = useCallback(() => {
    logoLoop.current?.stop();
    waveLoop.current?.stop();
    btnLoop.current?.stop();
  }, []);

  useEffect(() => {
    startLoops();

    // 스태거 등장
    anim.forEach(({ fade, slide }, i) => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 600, delay: 120 + i * 160, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 600, delay: 120 + i * 160, useNativeDriver: true }),
      ]).start();
    });

    // 키보드 열릴 때 루프 중단, 닫힐 때 재개 (Android 버벅임 방지)
    const kbShow = Keyboard.addListener("keyboardDidShow", stopLoops);
    const kbHide = Keyboard.addListener("keyboardDidHide", startLoops);

    return () => {
      kbShow.remove();
      kbHide.remove();
      stopLoops();
    };
  }, [anim, startLoops, stopLoops]);

  const handleLoginData = (name: string, value: string) => {
    setLoginData({ ...loginData, [name]: value });
  };

  // 로그인 실패 시 폼 흔들기
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 13, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -13, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 9, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -9, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const login = async () => {
    try {
      await usePostLoginMutate.mutateAsync(loginData).then((response) => {
        console.log("response.status:", response.status);
        console.log("response.headers:", response.headers);
        if (response.status === 200) {
          SecureStore.setItemAsync(
            "accessToken",
            response.headers.authorization,
          ).then(() => {
            console.log(111);
            const payload = jwtDecode<CustomJwtPayload>(
              response.headers.authorization.split(" ")[1]
            );
            console.log(222);
            console.log(payload);
            console.log("payload:", payload);
            console.log("payload:", payload.role);
            const role = payload.role;
            if (role === "FARMER") {
              router.replace("/(farmer-tabs)");
            } else {
              router.replace("/(user-tabs)");
            }
          });
          console.log("로그인 성공!");
          Toast.show({ type: "success", text1: "로그인에 성공했습니다." });
        }
      });
    } catch (error) {
      console.log(error);
      console.log("로그인 실패ㅜㅜ");
      triggerShake();
      Toast.show({
        type: "error",
        text1: "입력하신 이메일과 비밀번호가 일치하지 않습니다.",
      });
    }
  };

  console.log("loginData : ", loginData);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 — 흰 배경 + 웨이브 블롭 */}
          <View style={styles.header}>
            <Animated.View
              style={[styles.blob1, { transform: [{ translateX: waveDrift1 }] }]}
            />
            <Animated.View
              style={[styles.blob2, { transform: [{ translateX: waveDrift2 }] }]}
            />
            <Animated.View
              style={[styles.blob3, { transform: [{ translateX: waveDrift3 }] }]}
            />

            {/* 둥둥 떠다니는 로고 */}
            <Animated.View
              style={[styles.logoWrap, { transform: [{ translateY: logoFloat }] }]}
            >
              <View style={styles.leafCircle}>
                <Text style={styles.leafEmoji}>🌿</Text>
              </View>
              <Text style={styles.appName}>NamuWiki</Text>
            </Animated.View>
          </View>

          {/* 콘텐츠 */}
          <View style={styles.content}>
            {/* 타이틀 */}
            <Animated.View
              style={{
                opacity: anim[0].fade,
                transform: [{ translateY: anim[0].slide }],
              }}
            >
              <Text style={styles.pageTitle}>Sign in</Text>
              <Text style={styles.pageSubtitle}>나무위키에 오신 것을 환영합니다 🌱</Text>
            </Animated.View>

            {/* 폼 카드 */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  opacity: anim[1].fade,
                  transform: [
                    { translateY: anim[1].slide },
                    { translateX: shakeAnim },
                  ],
                },
              ]}
            >
              <View style={styles.fieldWrap}>
                <Input
                  label="이메일"
                  isPw={false}
                  value={loginData.memEmail}
                  placeholder="이메일을 입력하세요"
                  onChangeText={(value) => handleLoginData("memEmail", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.fieldWrap}>
                <Input
                  label="비밀번호"
                  isPw={true}
                  value={loginData.memPw}
                  placeholder="비밀번호를 입력하세요"
                  onChangeText={(value) => handleLoginData("memPw", value)}
                />
              </View>
              {/* <TouchableOpacity style={styles.forgotWrap}>
                <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
              </TouchableOpacity> */}
            </Animated.View>

            {/* Login 버튼 — 펄스 애니메이션 */}
            <Animated.View
              style={[
                styles.loginBtnWrap,
                {
                  opacity: anim[2].fade,
                  transform: [
                    { translateY: anim[2].slide },
                    { scale: btnPulse },
                  ],
                },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.loginBtn,
                  pressed && styles.loginBtnPressed,
                ]}
                onPress={login}
              >
                <Text style={styles.loginBtnText}>Login</Text>
              </Pressable>
            </Animated.View>

            {/* Sign Up 링크 */}
            <Animated.View
              style={[
                styles.signUpRow,
                {
                  opacity: anim[3].fade,
                  transform: [{ translateY: anim[3].slide }],
                },
              ]}
            >
              <Text style={styles.signUpText}>{"Don't have an Account? "}</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // 헤더
  header: {
    height: 240,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },

  // 웨이브 블롭
  blob1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#CCDECB",
    top: -140,
    right: -100,
    opacity: 0.72,
  },
  blob2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#BDD5BC",
    top: -65,
    right: 15,
    opacity: 0.50,
  },
  blob3: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#E2F0E2",
    bottom: -55,
    left: -35,
    opacity: 0.65,
  },

  // 로고
  logoWrap: {
    alignItems: "center",
    zIndex: 10,
  },
  leafCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#6A9469",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  leafEmoji: { fontSize: 30 },
  appName: {
    fontSize: 27,
    fontWeight: "800",
    color: "#2C4A2C",
    letterSpacing: 0.5,
  },

  // 콘텐츠
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1A2E1A",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#8A9E8A",
    marginBottom: 26,
  },

  // 폼 카드
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#2C3E2C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#EDF5ED",
  },
  fieldWrap: {
    marginBottom: 16,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: 2,
  },
  forgotText: {
    fontSize: 13,
    color: "#6A9469",
    fontWeight: "600",
  },

  // Login 버튼
  loginBtnWrap: {
    marginBottom: 22,
  },
  loginBtn: {
    backgroundColor: "#6A9469",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6A9469",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.42,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnPressed: {
    backgroundColor: "#587A57",
    shadowOpacity: 0.2,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  // Sign Up 링크
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: "#8A9E8A",
  },
  signUpLink: {
    fontSize: 14,
    color: "#6A9469",
    fontWeight: "800",
  },
});
