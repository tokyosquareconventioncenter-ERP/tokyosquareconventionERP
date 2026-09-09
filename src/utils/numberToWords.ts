/**
 * Number to Words Converter for Bangladeshi Taka (Bangla & English)
 * S.M. Khalilur Rahman Properties Ltd. Construction ERP
 */

// Full map of 1 to 99 in Bengali
const bangla1To99: string[] = [
  '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'উনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'উনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'উনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চৌহাত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'উননব্বই',
  'নব্বই', 'একানব্বই', 'বানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];

export function convertNumberToWordsBn(num: number): string {
  if (num === 0) return 'শূন্য টাকা মাত্র';
  if (num < 0) return 'মাইনাস ' + convertNumberToWordsBn(Math.abs(num));

  const integerPart = Math.floor(num);
  const paisa = Math.round((num - integerPart) * 100);

  function convertLessThanThousand(n: number): string {
    let result = '';
    if (n >= 100) {
      const hundreds = Math.floor(n / 100);
      result += (hundreds > 1 ? bangla1To99[hundreds] + ' শত ' : 'এক শত ');
      n %= 100;
    }
    if (n > 0 && n < 100) {
      result += bangla1To99[n] + ' ';
    }
    return result.trim();
  }

  let words = '';
  let n = integerPart;

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + ' কোটি ';
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + ' লাখ ';
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + ' হাজার ';
  }
  if (n > 0) {
    words += convertLessThanThousand(n) + ' ';
  }

  words = words.trim();
  if (!words) {
    words = 'শূন্য';
  }
  words += ' টাকা';
  if (paisa > 0) {
    words += ' ' + convertLessThanThousand(paisa) + ' পয়সা';
  }
  words += ' মাত্র';

  return words;
}

const englishUnits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const englishTens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function convertNumberToWordsEn(num: number): string {
  if (num === 0) return 'Zero Taka Only';
  if (num < 0) return 'Minus ' + convertNumberToWordsEn(Math.abs(num));

  const integerPart = Math.floor(num);
  const paisa = Math.round((num - integerPart) * 100);

  function convertLessThanThousand(n: number): string {
    let result = '';
    if (n >= 100) {
      result += englishUnits[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += englishTens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      result += englishUnits[n] + ' ';
    }
    return result.trim();
  }

  let words = '';
  let n = integerPart;

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + ' Thousand ';
  }
  if (n > 0) {
    words += convertLessThanThousand(n) + ' ';
  }

  words = words.trim() + ' Taka';
  if (paisa > 0) {
    words += ' and ' + convertLessThanThousand(paisa) + ' Paisa';
  }
  words += ' Only';

  return words;
}
