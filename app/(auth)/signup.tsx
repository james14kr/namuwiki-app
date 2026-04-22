import Input from "@/components/ui/Input";
import {
  usePostEmail,
  usePostJoinData,
  usePostNickname,
} from "@/queries/member.queries";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DaumPostcode from "react-native-daum-postcode";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";

// zod + react hook 사용해서 실시간 유효성검사 실행
interface SignUpStoreStateType {
  memEmail: string;
  memPw: string;
  confirmData: string;
  memNickname: string;
  memName: string;
  memTel: string;
  memAdd: string;
  addDetail: string;
  memRole: string;
  farmerName: string;
  authCode: string;
}

const Signup = () => {
  const router = useRouter();
  const usePostJoinDataMutate = usePostJoinData();
  const usePostEmailMutate = usePostEmail();
  const usePostNicknameMutate = usePostNickname();

  // 페이지 이동
  const [step, setStep] = useState(1);
  // 회원가입 데이터 저장할 state 변수
  const [joinData, setJoinData] = useState({
    memRole: "",
    memEmail: "",
    memPw: "",
    memNickname: "",
    memName: "",
    memTel: "",
    memAdd: "",
    addDetail: "",
    farmerName: "", // 농장명
    authCode: "",
  });

  // 헤더 타이틀 애니메이션
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(16)).current;
  const lineScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(lineScale, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [titleFade, titleSlide, lineScale]);

  // 뒤로 가기
  const nextStep = () => setStep((prev) => prev + 1);
  // 앞으로 가기
  const prevStep = () => setStep((prev) => prev - 1);

  //비밀번호 보이기 / 숨김 저장할 state 변수
  const [showPw, setShowPw] = useState(false);

  //비밀번호 확인 보이기 / 숨김 저장할 state 변수
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  //비밀번호 확인 데이터 담을 state 변수 - 비밀번호 확인은 서버로 전송하지 않으므로 별로도 관리
  const [confirmData, setConFirmData] = useState("");

  //에러 메시지 저장할 state 변수
  const [errorMsg, setErrorMsg] = useState<Partial<SignUpStoreStateType>>({});

  //권한 타입 저장 할 state 변수
  const [userType, setUserType] = useState<"FARMER" | "USER">("USER");

  // 다음 주소 저장할 state 변수
  const [showPostcode, setShowPostcode] = useState(false);

  // 각 단계별 검사할 필드 정의
  const stepFields = {
    1: ["memEmail", "memPw", "confirmData", "memNickname"],
    2: ["memName", "memTel", "memAdd"],
    3: ["authCode", "farmerName"],
  };

  // 다음 버튼 클릭 시 해당 단계 필드만 검사
  const handleNextStep = () => {
    const currentFields = stepFields[step as keyof typeof stepFields];
    const hasError = currentFields.some(
      (field) => errorMsg[field as keyof SignUpStoreStateType],
    );
    const isEmpty = currentFields.some((field) => {
      if (field === "confirmData") return !confirmData;
      if (field === "farmerName" && userType !== "FARMER") return false;
      return !joinData[field as keyof typeof joinData];
    });

    if (hasError || isEmpty) {
      Toast.show({ type: "error", text1: "빠진 문항을 입력해주세요." });
      return;
    }
    nextStep();
  };

  //유효성 검사 실시할 함수
  const validateForm = (data: typeof joinData) => {
    //업데이트된 전체 데이터로 유효성 검사
    const res = signUpSchema.safeParse(data);

    // 만약 유효성검사 결과가 실패라면
    if (!res.success && res.error) {
      // 에러난 필드만 담은 객체 생성
      const fieldErrors: Partial<SignUpStoreStateType> = {};
      // issue : 에러 상세내용 조회
      res.error.issues.forEach((issue) => {
        //fiedlName변수에 배열로 저장된 에러 상세내용을 저장
        const fieldName = issue.path[0] as keyof SignUpStoreStateType;
        //만약
        if (!fieldErrors[fieldName]) {
          // 첫번째 에러만 표시
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrorMsg(fieldErrors);
    } else {
      setErrorMsg({});
    }
  };

  // zod 유효성 검사 스키마
  const signUpSchema = z.object({
    //1. 이메일
    memEmail: z
      .string()
      .min(1, "이메일을 입력해주세요.")
      .max(30, "이메일 길이는 30자 이하입니다.")
      .regex(
        /^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        "이메일 형식이 올바르지 않습니다.",
      ),

    //2. 비밀번호
    memPw: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .max(16, "비밀번호는 16자 이하이어야 합니다.")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/,
        "비밀번호 형식이 올바르지 않습니다.",
      ),

    //3. 비밀번호 확인
    confirmData: z
      .string()
      .min(1, "비밀번호 확인을 입력하세요.")
      .refine((confirmData) => joinData.memPw === confirmData, {
        message: "비밀번호가 일치하지 않습니다.",
      }),

    //4. 이름
    memName: z.string().min(2, "이름은 1자 이상이어야 합니다."),

    //5. 닉네임
    memNickname: z
      .string()
      .min(1, "닉네임을 입력해주세요.")
      .max(10, "닉네임은 10자 이하이어야 합니다."),

    //6. 전화번호
    memTel: z
      .string()
      .min(1, "전화번호를 입력해주세요.")
      .regex(/^010-[0-9]{4}-[0-9]{4}$/, "전화번호 형식이 올바르지 않습니다."),

    //7. 주소
    memAdd: z.string().min(1, "주소를 입력해주세요."),

    //8. 권한이 농장주 일 경우 실행할 유효성 검사 - 농장명 유효성 검사
    farmerName:
      userType === "FARMER"
        ? z.string().min(1, "농장명을 입력해주세요.")
        : z.string().optional(), //undefined가 되어도 통과, null만 통과 X => 타입이 user일 때도 사용하기 위해서

    //9. 권한이 농장주 일 경우 실행할 유효성 검사 - 인증번호 유효성 검사
    authCode:
      userType === "FARMER"
        ? z
            .string()
            .min(1, "인증번호를 입력해주세요.")
            .length(6, "인증번호는 6자이어야 합니다.")
        : z.string().optional(),
  });

  const isDisable = signUpSchema.safeParse({ ...joinData, confirmData });

  // input 값 입력때마다 유효성 검사 실시
  const handleChange = (name: string, value: string) => {
    //1. 입력값 먼저 업데이트
    const updateData = { ...joinData, [name]: value, confirmData };
    setJoinData(updateData);
    //2. 유효성검사 함수 호출
    validateForm(updateData);
  };

  // 비밀번호 확인 유효성 검사실행 함수
  const handleConfirmChange = (value: string) => {
    setConFirmData(value);

    // joinData의 비밀번호랑 비교
    const isMatch = joinData.memPw === value;
    setErrorMsg((prev) => ({
      ...prev,
      confirmData:
        value === ""
          ? "비밀번호 확인을 입력하세요."
          : !isMatch
            ? "비밀번호가 일치하지 않습니다."
            : undefined,
    }));
  };

  // 버튼 누르면 joinData 전체 유효성 검사 실행 + 회원가입 등록
  const validate = async () => {
    try {
      setErrorMsg({});
      await usePostJoinDataMutate.mutateAsync(joinData);
      console.log("성공!");
      Toast.show({ type: "success", text1: "회원이 되신 것을 축하합니다." });
      router.replace("/(auth)/login");
    } catch (error) {
      console.log("실패!");
      Toast.show({ type: "error", text1: "어이쿠 실패입니다ㅜ.ㅜ" });
    }
  };

  // 이메일 중복 체크 함수
  const checkEmail = async () => {
    if (!joinData.memEmail) {
      Toast.show({ type: "error", text1: "이메일을 입력하세요." });
      return;
    }

    usePostEmailMutate.mutate(joinData.memEmail, {
      onSuccess: (data) => {
        if (data) {
          Toast.show({ type: "error", text1: "사용이 불가능합니다." });
        } else {
          Toast.show({ type: "success", text1: "사용가능한 이메일입니다." });
        }
      },
    });
  };

  // 닉네임 중복 체크 함수
  const checkNickname = async () => {
    if (!joinData.memNickname) {
      Toast.show({ type: "error", text1: "닉네임을 입력하세요." });
      return;
    }

    usePostNicknameMutate.mutate(joinData.memNickname, {
      onSuccess: (data) => {
        if (data) {
          Toast.show({ type: "error", text1: "사용이 불가능합니다." });
        } else {
          Toast.show({ type: "success", text1: "사용가능한 닉네임입니다." });
        }
      },
    });
  };

  const totalSteps = userType === "FARMER" ? 3 : 2;

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
          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerDecor1} />
            <View style={styles.headerDecor2} />
            <View style={styles.headerDecor3} />
            <Animated.View
              style={{
                alignItems: "center",
                opacity: titleFade,
                transform: [{ translateY: titleSlide }],
              }}
            >
              <Text style={styles.appName}>NamuWiki</Text>
              <Animated.View
                style={[
                  styles.titleUnderline,
                  { transform: [{ scaleX: lineScale }] },
                ]}
              />
              <Text style={styles.pageTitle}>Sign Up</Text>
            </Animated.View>
          </View>

          {/* 바디 (크림색 라운드 시작) */}
          <View style={styles.body}>
            {/* 진행 표시 */}
            <View style={styles.stepRow}>
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(
                (s, idx) => (
                  <React.Fragment key={s}>
                    {idx > 0 && (
                      <View
                        style={[
                          styles.stepLine,
                          step >= s && styles.stepLineDone,
                        ]}
                      />
                    )}
                    <View
                      style={[
                        styles.stepDot,
                        step === s && styles.stepDotActive,
                        step > s && styles.stepDotDone,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepNum,
                          step === s && styles.stepNumActive,
                          step > s && styles.stepNumDone,
                        ]}
                      >
                        {s}
                      </Text>
                    </View>
                  </React.Fragment>
                ),
              )}
            </View>

            {/* 폼 카드 */}
            <View style={styles.formCard}>
              {/* 권한 선택 */}
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    userType === "USER" && styles.roleBtnActive,
                  ]}
                  onPress={() => {
                    setUserType("USER");
                    setJoinData({
                      ...joinData,
                      memRole: "USER",
                    });
                  }}
                >
                  <Text
                    style={[
                      styles.roleBtnText,
                      userType === "USER" && styles.roleBtnTextActive,
                    ]}
                  >
                    일반 유저
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    userType === "FARMER" && styles.roleBtnActive,
                  ]}
                  onPress={() => {
                    setUserType("FARMER");
                    setJoinData({
                      ...joinData,
                      memRole: "FARMER",
                    });
                  }}
                >
                  <Text
                    style={[
                      styles.roleBtnText,
                      userType === "FARMER" && styles.roleBtnTextActive,
                    ]}
                  >
                    농업인
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 단계별 화면 */}
              {/* 1단계 */}
              {step === 1 && (
                <View>
                  <Text style={styles.sectionTitle}>계정 정보</Text>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>이메일</Text>
                    <View style={styles.inlineRow}>
                      <View style={styles.inlineFlex}>
                        <Input
                          isPw={false}
                          value={joinData.memEmail}
                          placeholder="이메일을 입력하세요"
                          onChangeText={(value) =>
                            handleChange("memEmail", value)
                          }
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.inlineBtn}
                        onPress={checkEmail}
                      >
                        <Text style={styles.inlineBtnText}>중복확인</Text>
                      </TouchableOpacity>
                    </View>
                    {errorMsg.memEmail && (
                      <Text style={styles.errorMsg}>{errorMsg.memEmail}</Text>
                    )}
                  </View>

                  <View style={styles.fieldWrap}>
                    <Input
                      label="비밀번호"
                      isPw={true}
                      value={joinData.memPw}
                      placeholder="8~16자, 영문·숫자·특수문자 포함"
                      onChangeText={(value) => handleChange("memPw", value)}
                    />
                    {errorMsg.memPw && (
                      <Text style={styles.errorMsg}>{errorMsg.memPw}</Text>
                    )}
                  </View>

                  <View style={styles.fieldWrap}>
                    <Input
                      label="비밀번호 확인"
                      isPw={true}
                      value={confirmData}
                      placeholder="비밀번호를 다시 입력하세요"
                      onChangeText={handleConfirmChange}
                    />
                    {errorMsg.confirmData && (
                      <Text style={styles.errorMsg}>
                        {errorMsg.confirmData}
                      </Text>
                    )}
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>닉네임</Text>
                    <View style={styles.inlineRow}>
                      <View style={styles.inlineFlex}>
                        <Input
                          isPw={false}
                          value={joinData.memNickname}
                          placeholder="닉네임을 입력하세요"
                          onChangeText={(value) =>
                            handleChange("memNickname", value)
                          }
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.inlineBtn}
                        onPress={checkNickname}
                      >
                        <Text style={styles.inlineBtnText}>중복확인</Text>
                      </TouchableOpacity>
                    </View>
                    {errorMsg.memNickname && (
                      <Text style={styles.errorMsg}>
                        {errorMsg.memNickname}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleNextStep}
                  >
                    <Text style={styles.primaryBtnText}>다음</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 2단계 */}
              {step === 2 && (
                <View>
                  <Text style={styles.sectionTitle}>개인 정보</Text>

                  <View style={styles.fieldWrap}>
                    <Input
                      label="이름"
                      isPw={false}
                      value={joinData.memName}
                      placeholder="이름을 입력하세요"
                      onChangeText={(value) => handleChange("memName", value)}
                    />
                    {errorMsg.memName && (
                      <Text style={styles.errorMsg}>{errorMsg.memName}</Text>
                    )}
                  </View>

                  <View style={styles.fieldWrap}>
                    <Input
                      label="전화번호"
                      isPw={false}
                      value={joinData.memTel}
                      placeholder="010-0000-0000"
                      onChangeText={(value) => handleChange("memTel", value)}
                    />
                    {errorMsg.memTel && (
                      <Text style={styles.errorMsg}>{errorMsg.memTel}</Text>
                    )}
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>주소</Text>
                    <View style={styles.inlineRow}>
                      <View style={styles.inlineFlex}>
                        <Input
                          isPw={false}
                          value={joinData.memAdd}
                          placeholder="주소를 검색하세요"
                          onChangeText={(value) =>
                            handleChange("memAdd", value)
                          }
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.inlineBtn}
                        onPress={() => setShowPostcode(true)}
                      >
                        <Text style={styles.inlineBtnText}>주소찾기</Text>
                      </TouchableOpacity>
                    </View>
                    {errorMsg.memAdd && (
                      <Text style={styles.errorMsg}>{errorMsg.memAdd}</Text>
                    )}
                    {
                      <Modal visible={showPostcode} animationType="slide">
                        <DaumPostcode
                          onSelected={(data) => {
                            const updateData = {
                              ...joinData,
                              memAdd: data.address,
                            };
                            setJoinData(updateData);
                            validateForm(updateData);
                            setShowPostcode(false);
                          }}
                          onError={() => setShowPostcode(false)}
                        />
                        <TouchableOpacity
                          style={styles.modalCloseBtn}
                          onPress={() => setShowPostcode(false)}
                        >
                          <Text style={styles.modalCloseBtnText}>닫기</Text>
                        </TouchableOpacity>
                      </Modal>
                    }
                  </View>

                  <View style={styles.fieldWrap}>
                    <Input
                      label="상세주소"
                      isPw={false}
                      value={joinData.addDetail}
                      placeholder="상세주소를 입력하세요"
                      onChangeText={(value) =>
                        handleChange("addDetail", value)
                      }
                    />
                  </View>

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={prevStep}
                    >
                      <Text style={styles.secondaryBtnText}>이전</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.primaryBtn, styles.btnFlex]}
                      onPress={
                        userType === "FARMER" ? handleNextStep : validate
                      }
                    >
                      <Text style={styles.primaryBtnText}>
                        {userType === "FARMER" ? "다음" : "Sign Up"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 3단계 */}
              {step === 3 && userType === "FARMER" && (
                <View>
                  <Text style={styles.sectionTitle}>인증 / 추가 정보</Text>

                  <View style={styles.fieldWrap}>
                    <Input
                      label="인증번호"
                      isPw={false}
                      value={joinData.authCode}
                      onChangeText={(value) =>
                        handleChange("authCode", value)
                      }
                      placeholder="인증번호 6자리를 입력하세요"
                    />
                    {errorMsg.authCode && (
                      <Text style={styles.errorMsg}>{errorMsg.authCode}</Text>
                    )}
                  </View>

                  <View style={styles.fieldWrap}>
                    <Input
                      label="농장명"
                      isPw={false}
                      value={joinData.farmerName}
                      onChangeText={(value) =>
                        handleChange("farmerName", value)
                      }
                      placeholder="농장명을 입력하세요"
                    />
                    {errorMsg.farmerName && (
                      <Text style={styles.errorMsg}>
                        {errorMsg.farmerName}
                      </Text>
                    )}
                  </View>

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={prevStep}
                    >
                      <Text style={styles.secondaryBtnText}>이전</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.primaryBtn, styles.btnFlex]}
                      onPress={validate}
                    >
                      <Text style={styles.primaryBtnText}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* 로그인 링크 */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an Account? </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#6A9469",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#6A9469",
  },
  scrollContent: {
    flexGrow: 1,
  },

  // 헤더 (그린 아치)
  header: {
    backgroundColor: "#6A9469",
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 44,
    overflow: "hidden",
    position: "relative",
  },
  headerDecor1: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.09)",
    top: -80,
    right: -60,
  },
  headerDecor2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: 20,
    left: -50,
  },
  headerDecor3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.07)",
    bottom: -20,
    right: 60,
  },
  appName: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  titleUnderline: {
    height: 2.5,
    width: 80,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 2,
    marginTop: 8,
    alignSelf: "center",
  },
  pageTitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.85)",
    marginTop: 10,
    letterSpacing: 2.5,
    fontWeight: "300",
  },

  // 바디 (크림색, 라운드 상단)
  body: {
    flex: 1,
    backgroundColor: "#F7F4EF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingBottom: 32,
  },

  // 진행 표시 (스텝 도트)
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#C4D9C4",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: "#6A9469",
    borderColor: "#6A9469",
  },
  stepDotDone: {
    backgroundColor: "#EAF3EA",
    borderColor: "#6A9469",
  },
  stepNum: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B8CBB8",
  },
  stepNumActive: {
    color: "#FFFFFF",
  },
  stepNumDone: {
    color: "#6A9469",
  },
  stepLine: {
    width: 36,
    height: 2,
    backgroundColor: "#C4D9C4",
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: "#6A9469",
  },

  // 폼 카드
  formCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#2C3E2C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },

  // 권한 선택
  roleRow: {
    flexDirection: "row",
    backgroundColor: "#EDF5ED",
    borderRadius: 12,
    padding: 4,
    marginBottom: 22,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
  },
  roleBtnActive: {
    backgroundColor: "#6A9469",
    shadowColor: "#6A9469",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7A9A7A",
  },
  roleBtnTextActive: {
    color: "#FFFFFF",
  },

  // 섹션 타이틀
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3E2C",
    marginBottom: 18,
    letterSpacing: 0.2,
  },

  // 필드
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E2C",
    marginBottom: 6,
  },

  // 인라인 행 (인풋 + 버튼)
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inlineFlex: {
    flex: 1,
    marginRight: 8,
  },
  inlineBtn: {
    backgroundColor: "#6A9469",
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // 주 버튼
  primaryBtn: {
    backgroundColor: "#6A9469",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#6A9469",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // 보조 버튼 (이전)
  secondaryBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    borderWidth: 1.5,
    borderColor: "#C4D9C4",
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  secondaryBtnText: {
    color: "#6A9469",
    fontSize: 15,
    fontWeight: "600",
  },

  // 버튼 행 (이전 + 다음)
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
  },
  btnFlex: {
    flex: 1,
    marginLeft: 10,
  },

  // 에러 메시지
  errorMsg: {
    color: "#C0392B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },

  // 모달 닫기 버튼
  modalCloseBtn: {
    backgroundColor: "#6A9469",
    margin: 16,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  // 로그인 링크
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    paddingBottom: 8,
  },
  loginText: {
    color: "#8A9E8A",
    fontSize: 14,
  },
  loginLink: {
    color: "#6A9469",
    fontSize: 14,
    fontWeight: "700",
  },
});
