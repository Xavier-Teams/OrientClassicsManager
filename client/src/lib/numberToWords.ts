/**
 * Chuyển đổi số thành chữ tiếng Việt
 */

import { formatVietnameseNumber } from "./utils";

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
];

const tens = [
  "",
  "mười",
  "hai mươi",
  "ba mươi",
  "bốn mươi",
  "năm mươi",
  "sáu mươi",
  "bảy mươi",
  "tám mươi",
  "chín mươi",
];

const hundreds = [
  "",
  "một trăm",
  "hai trăm",
  "ba trăm",
  "bốn trăm",
  "năm trăm",
  "sáu trăm",
  "bảy trăm",
  "tám trăm",
  "chín trăm",
];

function convertGroupOfThree(num: number): string {
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  const ten = Math.floor(remainder / 10);
  const one = remainder % 10;

  let result = "";

  if (hundred > 0) {
    result += hundreds[hundred] + " ";
  }

  if (ten > 0) {
    if (ten === 1 && one > 0) {
      result += "mười " + ones[one];
    } else {
      result += tens[ten];
      if (one > 0) {
        if (one === 5) {
          result += " lăm";
        } else if (one === 1 && ten > 1) {
          result += " mốt";
        } else {
          result += " " + ones[one];
        }
      }
    }
  } else if (one > 0) {
    result += ones[one];
  }

  return result.trim();
}

export function numberToWords(num: number): string {
  if (num === 0) return "không";

  const billions = Math.floor(num / 1000000000);
  const millions = Math.floor((num % 1000000000) / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;

  let result = "";

  if (billions > 0) {
    result += convertGroupOfThree(billions) + " tỷ ";
  }

  if (millions > 0) {
    result += convertGroupOfThree(millions) + " triệu ";
  }

  if (thousands > 0) {
    result += convertGroupOfThree(thousands) + " nghìn ";
  }

  if (remainder > 0) {
    result += convertGroupOfThree(remainder);
  }

  return result.trim() + " đồng chẵn";
}

export function formatCurrency(num: number): string {
  return formatVietnameseNumber(num);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `ngày ${day} tháng ${month} năm ${year}`;
}

