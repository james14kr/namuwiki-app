/**
 * @description <p>문자열이 null 또는 빈값, undefined인지 확인합니다.</p>
 *
 * @example validate.isNullOrEmpty(undefined) = true
 * @example validate.isNullOrEmpty(null)      = true
 * @example validate.isNullOrEmpty("")        = true
 * @example validate.isNullOrEmpty(" ")       = false
 * @example validate.isNullOrEmpty("테")      = false
 * @example validate.isNullOrEmpty("  테스트  ") = false
 *
 * @param value {String} 확인할 문자열
 * @return {boolean} <code>true</code> 만약 문자열이 null 또는 빈값, undefined이면.
 */
export const isNullOrEmpty = (
  value: string | undefined | null
): value is null | undefined | "" => {
  if (!value) return true;
  return value === "" || value === null;
};

/**
 * @description 문자열이 단순 공백(스페이스)인지 확인합니다.
 *
 * @example validate.isWhitespace(" ") = true
 * @example validate.isWhitespace("     ")      = true
 * @example validate.isWhitespace("")        = false
 * @example validate.isWhitespace("테")      = false
 * @example validate.isWhitespace("  테스트  ") = false
 * @example validate.isWhitespace("  테스  트  ") = false
 *
 * @param value {String} 확인할 문자열
 * @return {boolean} <code>true</code> 만약 문자열이 단순 공백이면.
 */
export const isWhitespace = (value: string): boolean => {
  if (value.length === 0) return false;
  return value.trim() === "";
};

/**
 * @description 문자열의 공백을 제거합니다.
 * 만약 값이 undefined 또는 null 이어도 Error 없이 해당 값을 그대로 반환 합니다.
 *
 * @example validate.trim(undefined) = undefined
 * @example validate.trim(null)      = null
 * @example validate.trim("")        = ""
 * @example validate.trim("테")      = "테"
 * @example validate.trim("  테스트  ") = "테스트"
 * @example validate.trim("  테스  트  ") = "테스  트"
 *
 * @param value {String} 확인할 문자열
 * @return {string | undefined | null} 공백을 제거한 결과.
 */
export const trim = (
  value: string | undefined | null
): string | undefined | null => {
  if (!value) return value;
  return value.trim();
};

/**
 * @description 이메일의 형식을 확인합니다.
 * 
 * 사용되는 정규식 : /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/
 * 
 *영문자,숫자로 시작하고 끝나며 중간에 ._%+- 를 포함할 수 있는 로컬파트와, 점으로 구분된 도메인과 2자 이상 영문 TLD를 갖는 일반적인 이메일 형식만 허용하는 정규식.

 * @example validate.checkEmailRegex("user.name+tag123@gmail.com'") = true
 * @example validate.checkEmailRegex("a_b.c-d%9@sub.domain.co")      = true
 * @example validate.checkEmailRegex(".username@gmail.com")        = false
 * @example validate.checkEmailRegex("username@domain")      = false
 * @example validate.checkEmailRegex("user..name@gmail.com") = false
 * @example validate.checkEmailRegex("") = false
 * @example validate.checkEmailRegex(null) = false
 * @example validate.checkEmailRegex(undefined) = false
 *
 * @param value {String} 확인할 문자열
 * @return {boolean} <code>true</code> 정규식 테스트 통과.
 */
export const checkEmailRegex = (value?: string): boolean => {
  if (isNullOrEmpty(value)) return false;
  return /^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/.test(
    value
  );
};

// 핸드폰번호: /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/
/**
 * @description 휴대폰 번호 형식을 확인합니다.
 * 
 * 사용되는 정규식 : /^01([0|1|6|7|8|9])-?([0-9]{4})-?([0-9]{4})$/
 * 
 * 010, 011, 016, 017, 018, 019 로 시작하며 가운데 4자리, 마지막 4자리 숫자로 구성된 한국 휴대폰 번호 형식을 허용합니다. 하이픈(-)은 생략 가능합니다.
 *
 * @example validate.checkMobilePhoneRegex("010-1234-5678") = true
 * @example validate.checkMobilePhoneRegex("01112345678")   = true
 * @example validate.checkMobilePhoneRegex("019-123-4567")  = true
 * @example validate.checkMobilePhoneRegex("012-1234-5678") = false
 * @example validate.checkMobilePhoneRegex("") = false
 *
 * @param value {String} 확인할 문자열
 * @return {boolean} <code>true</code> 정규식 테스트 통과.
 */
export const checkMobilePhoneRegex = (value: string): boolean => {
  if (isNullOrEmpty(value)) return false;
  return /^01([0|1|6|7|8|9])-?([0-9]{4})-?([0-9]{4})$/.test(value);
};

// 일반 전화번호: /^\d{2,3}-\d{3,4}-\d{4}$/
/**
 * @description 일반 전화번호 형식을 확인합니다.
 * 
 * 사용되는 정규식 : /^\d{2,3}-\d{3,4}-\d{4}$/
 * 
 * 지역번호 2~3자리, 가운데 3~4자리, 마지막 4자리 숫자로 구성된 한국 일반 전화번호 형식을 허용합니다.
 * 
 * 일반 휴대폰 정규식처럼 사용해도 괜찮습니다.
 * 
 * @example validate.checkHomePhoneRegex("02-123-4567")   = true
 * @example validate.checkHomePhoneRegex("031-1234-5678") = true
 * @example validate.checkHomePhoneRegex("010-1234-5678") = true
 * @example validate.checkHomePhoneRegex("02-12-4567")    = false
 * @example validate.checkHomePhoneRegex("") = false
 *
 * @param value {String} 확인할 문자열
 * @return {boolean} <code>true</code> 정규식 테스트 통과.
 */
export const checkHomePhoneRegex = (value: string): boolean => {
  if (isNullOrEmpty(value)) return false;
  return /^\d{2,3}-\d{3,4}-\d{4}$/.test(value);
};

// 숫자만: /^-?\d+$/
/**
 * @description 숫자 형식(정수)을 확인합니다.
 * 
 * 사용되는 정규식 : /^-?\d+$/
 * 
 * 0을 포함한 양의 정수와 음의 정수를 허용하며 공백 문자열은 허용하지 않습니다.
 *
 * @example validate.checkNumberRegex("10")  = true
 * @example validate.checkNumberRegex("-10") = true
 * @example validate.checkNumberRegex("0")   = true
 * @example validate.checkNumberRegex("10.5") = false
 * @example validate.checkNumberRegex("+10") = false
 * @example validate.checkNumberRegex("") = false
 *
 * @param value {unknown} 확인할 값
 * @return {boolean} <code>true</code> 정규식 테스트 통과.
 */
export const checkNumberRegex = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;

  const str = String(value);
  if (str.trim() === "") return false;

  return /^-?\d+$/.test(str);
};

// 영문만: /^[a-zA-Z]+$/
/**
 * @description 영문 문자열 형식을 확인합니다.
 * 
 * 사용되는 정규식 : /^[a-zA-Z]+$/
 * 
 * 영문 대소문자로만 구성된 문자열을 허용하며 숫자, 공백, 특수문자, 한글은 허용하지 않습니다.
 *
 * @example validate.checkEnglishRegex("Hello") = true
 * @example validate.checkEnglishRegex("abcDEF") = true
 * @example validate.checkEnglishRegex("abc123") = false
 * @example validate.checkEnglishRegex("테스트") = false
 * @example validate.checkEnglishRegex("") = false
 *
 * @param value {String} 확인할 문자열
 * @return {boolean} <code>true</code> 정규식 테스트 통과.
 */
export const checkEnglishRegex = (value: string): boolean => {
  if (isNullOrEmpty(value)) return false;
  return /^[a-zA-Z]+$/.test(value);
};

// 한글만: /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]+$/
/**
 * @description 한글 문자열 형식을 확인합니다.
 * 
 * 사용되는 정규식 : /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]+$/
 * 
 * 한글 자음, 모음, 완성형 한글로만 구성된 문자열을 허용하며 영문, 숫자, 공백, 특수문자는 허용하지 않습니다.
 *
 * @example validate.checkKoreanRegex("테스트") = true
 * @example validate.checkKoreanRegex("가나다") = true
 * @example validate.checkKoreanRegex("abc") = false
 * @example validate.checkKoreanRegex("가 나") = false
 * @example validate.checkKoreanRegex("") = false
 *
 * @param value {String} 확인할 문자열
 * @return {boolean} <code>true</code> 정규식 테스트 통과.
 */
export const checkKoreanRegex = (value: string): boolean => {
  if (isNullOrEmpty(value)) return false;
  return /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]+$/.test(value);
};

// 영문+숫자만: /^[a-zA-Z0-9]+$/
/**
 * @description 영문과 숫자 조합 문자열 형식을 확인합니다.
 * 
 * 사용되는 정규식 : /^[a-zA-Z0-9]+$/
 * 
 * 영문 대소문자와 숫자로만 구성된 문자열을 허용하며 공백, 특수문자, 한글은 허용하지 않습니다.
 *
 * @example validate.checkEnglishAndNumberRegex("abc123") = true
 * @example validate.checkEnglishAndNumberRegex("A1B2C3") = true
 * @example validate.checkEnglishAndNumberRegex("abc-123") = false
 * @example validate.checkEnglishAndNumberRegex("테스트123") = false
 * @example validate.checkEnglishAndNumberRegex("") = false
 *
 * @param value {String} 확인할 문자열
 * @return {boolean} <code>true</code> 정규식 테스트 통과.
 */
export const checkEnglishAndNumberRegex = (value: string): boolean => {
  if (isNullOrEmpty(value)) return false;
  return /^[a-zA-Z0-9]+$/.test(value);
};

// 주민등록번호: /^\d{6}-[1-4]\d{6}$/
/**
 * @description 주민등록번호 형식을 확인합니다.
 * 
 * 사용되는 정규식 : /^\d{6}-[1-4]\d{6}$/
 * 
 * 앞 6자리 생년월일과 하이픈(-) 뒤 7자리 숫자로 구성되며 성별코드(1~4)만 허용합니다. 실제 존재 여부나 검증식은 확인하지 않습니다.
 *
 * @example validate.checkResidentNumberRegex("900101-1234567") = true
 * @example validate.checkResidentNumberRegex("000101-4234567") = true
 * @example validate.checkResidentNumberRegex("9001011234567")  = false
 * @example validate.checkResidentNumberRegex("900101-5234567") = false
 * @example validate.checkResidentNumberRegex("") = false
 *
 * @param value {String} 확인할 문자열
 * @return {boolean} <code>true</code> 정규식 테스트 통과.
 */
export const checkResidentNumberRegex = (value: string): boolean => {
  if (isNullOrEmpty(value)) return false;
  return /^\d{6}-[1-4]\d{6}$/.test(value);
};
