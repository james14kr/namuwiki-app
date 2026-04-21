import Input from "@/components/ui/Input";
import { usePostEmail, usePostJoinData, usePostNickname } from "@/queries/member.queries";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";
import DaumPostcode from 'react-native-daum-postcode'

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

interface JoinFormProps {
  successJoin: (isSuccess: boolean) => void;
}

const Signup = ({ successJoin }: JoinFormProps) => {
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
    const isEmpty = currentFields.some(
      (field) => {
        if(field === "confirmData") return !confirmData
        if(field === "farmerName" && userType !== "FARMER") return false;
        return !joinData[field as keyof typeof joinData]}
    );

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
      Toast.show({ type: "success", text1: "회원이 되신 것을 축하합니다." });
      successJoin(true);
    } catch (error) {
      Toast.show({ type: "error", text1: "어이쿠 실패입니다ㅜ.ㅜ" });
    }
  };

  // 이메일 중복 체크 함수
  const checkEmail = async () => {
    if (!joinData.memEmail) {
      Toast.show({type: "error", text1: "이메일을 입력하세요."});
      return;
    }

    usePostEmailMutate.mutate(joinData.memEmail, {
      onSuccess: (data) => {
        if (!data) {
          Toast.show({type: "error", text1: "사용이 불가능합니다."});
        } else {
          Toast.show({type: "success", text1: "사용가능합니다"});
        }
      },
    });
  };

  // 닉네임 중복 체크 함수
  const checkNickname = async () => {
    if (!joinData.memNickname) {
      Toast.show({type: "error", text1: "닉네임을 입력하세요."});
      return;
    }

    usePostNicknameMutate.mutate(joinData.memNickname, {
      onSuccess: (data) => {
        if (!data) {
          Toast.show({type: "error", text1: "사용이 불가능합니다."});
        } else {
          Toast.show({type: "success", text1: "사용가능합니다"});
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>Sign Up</Text>
      </View>

      {/* 진행 표시 */}
      <Text>Step {step} / {userType === "FARMER" ? 3 : 2}</Text>

      {/* 권한 선택 */}
      <View>
        <TouchableOpacity onPress={() => setUserType("FARMER")}>
          <Text>농업인</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setUserType("USER")}>
          <Text>일반 유저</Text>
        </TouchableOpacity>
      </View>

      {/* 단계별 화면 */}
      {/* 1단계 */}
      {step === 1 && (
        <View>
          <Text>계정 정보</Text>
          <View>
            <Input 
              label="이메일" 
              isPw={false} 
              value={joinData.memEmail}
              onChangeText={(value) => handleChange("memEmail", value)}
            />
            {errorMsg.memEmail && (
              <Text style={styles.errorMsg}>
                {errorMsg.memEmail}
              </Text>
            )}
            <TouchableOpacity onPress={checkEmail}>
              <Text>중복확인</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Input 
              label="비밀번호" 
              isPw={true} 
              value={joinData.memPw}
              onChangeText={(value) => handleChange("memPw", value)}
            />
            {errorMsg.memPw && (
              <Text style={styles.errorMsg}>
                {errorMsg.memPw}
              </Text>
            )}
          </View>
          <View>
            <Input 
              label="비밀번호 확인" 
              isPw={true} 
              value={confirmData}
              onChangeText={handleConfirmChange}
            />
            {errorMsg.confirmData && (
              <Text style={styles.errorMsg}>
                {errorMsg.confirmData}
              </Text>
            )}
          </View>
          <View>
            <Input 
              label="닉네임" 
              isPw={false} 
              value={joinData.memNickname}
              onChangeText={(value) => handleChange("memNickname", value)}
            />
            {errorMsg.memNickname && (
              <Text style={styles.errorMsg}>
                {errorMsg.memNickname}
              </Text>
            )}
            <TouchableOpacity onPress={checkNickname}>
              <Text>중복확인</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleNextStep}>
            <Text>다음</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2단계 */}
      {step === 2 && (
        <View>
          <Text>개인 정보</Text>
          <View>
            <Input
              label="이름"
              isPw={false}
              value={joinData.memName}
              onChangeText={(value) => handleChange("memName", value)}
            />
            {errorMsg.memName && (
              <Text style={styles.errorMsg}>
                {errorMsg.memName}
              </Text>
            )}
          </View>
          <View>
            <Input 
              label="전화번호" 
              isPw={false} 
              value={joinData.memTel}
              onChangeText={(value) => handleChange("memTel", value)}
            />
            {errorMsg.memTel && (
              <Text style={styles.errorMsg}>
                {errorMsg.memTel}
              </Text>
            )}
          </View>
          <View>
            <Input 
              label="주소" 
              isPw={false} 
              value={joinData.memAdd}
              onChangeText={(value) => handleChange("memAdd", value)}
            />
            {errorMsg.memAdd && (
              <Text style={styles.errorMsg}>
                {errorMsg.memAdd}
              </Text>
            )}
            {
              <Modal visible={showPostcode} animationType="slide">
                <DaumPostcode onSelected={(data) => {
                    const updateData = {...joinData, memAdd: data.address}
                    setJoinData(updateData);
                    validateForm(updateData);
                    setShowPostcode(false);
                  }}
                  onError={() => setShowPostcode(false)} 
                />
                <TouchableOpacity onPress={() => setShowPostcode(false)}>
                  <Text>닫기</Text>
                </TouchableOpacity>
              </Modal>
            }
            <TouchableOpacity onPress={() => setShowPostcode(true)}>
              <Text>주소 찾기</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Input 
              label="상세주소" 
              isPw={false} 
              value={joinData.addDetail}
              onChangeText={(value) => handleChange("addDetail", value)}
            />
          </View>
          <TouchableOpacity onPress={prevStep}>
            <Text>이전</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={userType === "FARMER" ? handleNextStep : validate}>
            <Text>{userType === "FARMER" ? "다음" : "Sign Up"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3단계 */}
      {step === 3 && userType === "FARMER" && (
          <View>
            <Text>인증 / 추가 정보</Text>
          <View>
            <Input 
              label="인증번호" 
              isPw={false} 
              value={joinData.authCode}
              onChangeText={(value) => handleChange("authCode", value)}
            />
            {errorMsg.authCode && (
              <Text style={styles.errorMsg}>
                {errorMsg.authCode}
              </Text>
            )}
            <Input 
              label="농장명" 
              isPw={false} 
              value={joinData.farmerName}
              onChangeText={(value) => handleChange("farmerName", value)}
            />
            {errorMsg.farmerName && (
              <Text style={styles.errorMsg}>
                {errorMsg.farmerName}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={prevStep}>
            <Text>이전</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={validate}>
            <Text>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderColor: "black",
    borderWidth: 1,
  },
  errorMsg: {
    color: 'red', fontSize: 12, marginTop: 4 
  }
});
