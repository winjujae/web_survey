/**
 * 보안 관련 유틸리티 함수들
 */

/**
 * SQL injection을 방지하기 위한 문자열 이스케이프
 */
export function escapeSqlLike(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/\\/g, '\\\\') // 백슬래시 이스케이프
    .replace(/%/g, '\\%')   // 퍼센트 이스케이프
    .replace(/_/g, '\\_')   // 언더스코어 이스케이프
    .trim();
}

/**
 * XSS 방지를 위한 HTML 특수문자 이스케이프
 */
export function escapeHtml(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const htmlEscapes: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return value.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char]);
}

/**
 * UUID 형식 검증
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * 안전한 정수 변환
 */
export function safeParseInt(value: any, defaultValue: number = 0): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : Math.max(0, parsed);
}

/**
 * 안전한 문자열 길이 제한
 */
export function safeSubstring(value: string, maxLength: number): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value.length > maxLength ? value.substring(0, maxLength) : value;
}

/**
 * 금지된 단어 필터링
 */
export function filterForbiddenWords(value: string, forbiddenWords: string[]): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  let filteredValue = value;

  forbiddenWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredValue = filteredValue.replace(regex, '*'.repeat(word.length));
  });

  return filteredValue;
}

/**
 * IP 주소 검증
 */
export function isValidIP(value: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(value)) {
    return value.split('.').every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  return ipv6Regex.test(value);
}

/**
 * 파일 확장자 검증
 */
export function isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
  if (!filename || typeof filename !== 'string') {
    return false;
  }

  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * MIME 타입 검증
 */
export function isValidMimeType(mimeType: string, allowedTypes: string[]): boolean {
  if (!mimeType || typeof mimeType !== 'string') {
    return false;
  }

  return allowedTypes.some(allowedType => {
    if (allowedType.includes('*')) {
      const [type] = allowedType.split('/');
      return mimeType.startsWith(`${type}/`);
    }
    return mimeType === allowedType;
  });
}
