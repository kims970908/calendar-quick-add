function isValidDateParts(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day;
}

function buildDate(year, month, day) {
  if (!isValidDateParts(year, month, day)) return null;
  return new Date(year, month - 1, day);
}

function normalizeYear(year) {
  if (year < 100) {
    const currentYear = new Date().getFullYear();
    const century = Math.floor(currentYear / 100) * 100;
    return century + year;
  }
  return year;
}

function parseWithPattern(text, pattern, yearIndex, monthIndex, dayIndex) {
  const match = text.match(pattern);
  if (!match) return null;
  const year = normalizeYear(Number(match[yearIndex]));
  const month = Number(match[monthIndex]);
  const day = Number(match[dayIndex]);
  const date = buildDate(year, month, day);
  if (!date) return null;
  return { date, matchedText: match[0] };
}

function parseMonthDay(text) {
  const match = text.match(/(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})/);
  if (!match) return null;
  const year = new Date().getFullYear();
  const month = Number(match[1]);
  const day = Number(match[2]);
  const date = buildDate(year, month, day);
  if (!date) return null;
  return { date, matchedText: match[0] };
}

function parseKorean(text) {
  const match = text.match(/(\d{2,4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (!match) return null;
  const year = normalizeYear(Number(match[1]));
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = buildDate(year, month, day);
  if (!date) return null;
  return { date, matchedText: match[0] };
}

function parseDate(text, allowMmdd = true) {
  const trimmed = (text || "").trim();
  if (!trimmed) return null;

  // Korean format: yyyy년 mm월 dd일 or yy년 mm월 dd일
  const korean = parseKorean(trimmed);
  if (korean) return korean;

  // ISO-ish: yyyy-mm-dd / yyyy.mm.dd / yyyy/mm/dd
  const fullDate = parseWithPattern(trimmed, /(\d{4})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})/, 1, 2, 3);
  if (fullDate) return fullDate;

  // Short year: yy-mm-dd / yy.mm.dd / yy/mm/dd
  const shortDate = parseWithPattern(trimmed, /(\d{2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})/, 1, 2, 3);
  if (shortDate) return shortDate;

  if (allowMmdd) {
    const md = parseMonthDay(trimmed);
    if (md) return md;
  }

  return null;
}

window.gcalParseDate = parseDate;
