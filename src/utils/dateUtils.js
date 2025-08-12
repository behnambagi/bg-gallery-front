import { Calendar } from 'react-modern-calendar-datepicker';

export const convertPersianToGregorian = (persianDate) => {
  if (!persianDate) return null;
  
  const { year, month, day } = persianDate;
  
  const persianCalendar = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const gregorianDate = new Date(`${year}/${month}/${day}`);
  
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(gregorianDate);
  
  const yearPart = parts.find(part => part.type === 'year');
  const monthPart = parts.find(part => part.type === 'month');
  const dayPart = parts.find(part => part.type === 'day');
  
  return `${yearPart.value}-${monthPart.value}-${dayPart.value}`;
};

export const convertGregorianToPersian = (gregorianDateString) => {
  if (!gregorianDateString) return null;
  
  try {
    const date = new Date(gregorianDateString);
    
    const persianFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const parts = persianFormatter.formatToParts(date);
    const year = parseInt(parts.find(p => p.type === 'year').value);
    const month = parseInt(parts.find(p => p.type === 'month').value);
    const day = parseInt(parts.find(p => p.type === 'day').value);
    
    return { year, month, day };
  } catch (error) {
    console.error('Error converting date:', error);
    return null;
  }
};

export const formatPersianDate = (persianDate) => {
  if (!persianDate) return '';
  
  const { year, month, day } = persianDate;
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  return `${day} ${monthNames[month - 1]} ${year}`;
};

export const getTodayPersian = () => {
  const today = new Date();
  return convertGregorianToPersian(today.toISOString().split('T')[0]);
};