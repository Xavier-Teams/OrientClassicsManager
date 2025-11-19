import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Vietnamese accounting format (300000 -> 300.000)
 */
export function formatVietnameseNumber(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") return "0";
  const num =
    typeof value === "string"
      ? parseFloat(value.replace(/\./g, "").replace(/,/g, ""))
      : value;
  if (isNaN(num) || num === 0) return "0";

  // Format with dot as thousand separator
  const parts = Math.abs(num).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (num < 0 ? "-" : "") + parts.join(",");
}

/**
 * Parse Vietnamese formatted number string to number (300.000 -> 300000)
 */
export function parseVietnameseNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/\./g, "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Convert number to Vietnamese words
 */
export function numberToVietnameseWords(num: number): string {
  if (num === 0) return "không";

  const ones = [
    "",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
    "mười",
    "mười một",
    "mười hai",
    "mười ba",
    "mười bốn",
    "mười lăm",
    "mười sáu",
    "mười bảy",
    "mười tám",
    "mười chín",
  ];

  const tens = [
    "",
    "",
    "hai mươi",
    "ba mươi",
    "bốn mươi",
    "năm mươi",
    "sáu mươi",
    "bảy mươi",
    "tám mươi",
    "chín mươi",
  ];

  const scales = ["", "nghìn", "triệu", "tỷ"];

  function convertHundreds(n: number): string {
    if (n === 0) return "";
    let result = "";

    const hundred = Math.floor(n / 100);
    const remainder = n % 100;

    if (hundred > 0) {
      result += ones[hundred] + " trăm ";
    }

    if (remainder > 0) {
      if (remainder < 20) {
        result += ones[remainder];
      } else {
        const ten = Math.floor(remainder / 10);
        const one = remainder % 10;
        result += tens[ten];
        if (one > 0) {
          result += " " + (one === 5 ? "lăm" : one === 1 ? "mốt" : ones[one]);
        }
      }
    }

    return result.trim();
  }

  if (num < 1000) {
    return convertHundreds(num);
  }

  const parts: string[] = [];
  let scaleIndex = 0;
  let remaining = num;

  while (remaining > 0) {
    const part = remaining % 1000;
    if (part > 0) {
      const partWords = convertHundreds(part);
      if (scaleIndex > 0) {
        parts.unshift(partWords + " " + scales[scaleIndex]);
      } else {
        parts.unshift(partWords);
      }
    }
    remaining = Math.floor(remaining / 1000);
    scaleIndex++;
  }

  return parts.join(" ").trim();
}

/**
 * Format currency to Vietnamese words
 */
export function formatCurrencyToWords(amount: number): string {
  if (amount === 0) return "không đồng";

  const words = numberToVietnameseWords(Math.floor(amount));
  const decimal = Math.round((amount % 1) * 100);

  let result = words + " đồng";

  if (decimal > 0) {
    result += " " + numberToVietnameseWords(decimal) + " xu";
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY (Vietnamese format)
 */
export function formatDateToVietnamese(
  dateString: string | null | undefined
): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
}

/**
 * Parse date from DD/MM/YYYY to YYYY-MM-DD (for HTML date input)
 */
export function parseVietnameseDate(dateString: string): string {
  if (!dateString) return "";

  // Remove all non-digit characters except slash
  const cleaned = dateString.replace(/[^\d\/]/g, "");

  // Try DD/MM/YYYY format first
  const ddmmyyyy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Validate date
    if (
      dayNum >= 1 &&
      dayNum <= 31 &&
      monthNum >= 1 &&
      monthNum <= 12 &&
      yearNum >= 1900 &&
      yearNum <= 2100
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    }
  }

  // Try partial format DD/MM/YYYY while typing (e.g., "29/12" or "29/12/202")
  const partial = cleaned.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{0,4}))?$/);
  if (partial) {
    const [, day, month, year] = partial;
    if (year && year.length === 4) {
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      if (
        dayNum >= 1 &&
        dayNum <= 31 &&
        monthNum >= 1 &&
        monthNum <= 12 &&
        yearNum >= 1900 &&
        yearNum <= 2100
      ) {
        return `${year}-${String(month).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
      }
    }
  }

  // If already in YYYY-MM-DD format, return as is
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }

  return "";
}
