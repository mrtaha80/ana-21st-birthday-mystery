// کلید API اختصاصی گوگل جیمینای
const GEMINI_API_KEY = 'AQ.Ab8RN6LvkfZAsRqy4dfpDsjdpgvumMO6cP_GVNBM0Ginnvd9Nw';

/**
 * متصل به هوش مصنوعی اختصاصی رابطه طاها و آنا
 */
export async function generateAICoupleContent(promptType, currentUser, extraContext = '') {
  const isAna = currentUser === 'ana';

  const systemInstruction = `
شما مغز متفکر هوش مصنوعی، روان‌شناس عشق و کارگردان چالش‌های صمیمانه و سکسی یک رابطه پرشور دونفره هستید:
- طاها: نماد کروکودیل 🐊، مرد مقتدر، عمیقاً عاشق، حامی و پرشور.
- آنا: نماد پرنسس گورخر 🦓 و جوجو 🐥، باهوش، فوق‌العاده جذاب، لوند، ظریف و شیرین‌زبان.
این زوج از ۸ آگوست ۲۰۲۶ در رابطه‌اند و حس شوخ‌طبعی، جذابیت، رمانتیک بودن و فانتزی‌های جسورانه میان آن‌ها جاری است.
پاسخ‌ها ۱۰۰٪ فارسی، بدون کلیشه، بدون سانسورهای خشک، با لحنی بسیار صمیمی، پرانرژی و جذاب باشد. فقط متن نهایی را بدون مقدمه و توضیح اضافه تحویل بده.
  `;

  let prompt = '';

  if (promptType === 'sexy_dare') {
    if (isAna) {
      prompt = `
کاربر فعلی "آنا" است که در بازی کمین کروکودیل به دام افتاده است!
یک جریمه/چالش فوق‌العاده جذاب، سکسی، دلبری و هیجان‌انگیز تولید کن که آنا باید برای طاها انجام دهد.
این چالش می‌تواند شامل سلفی با پوز و زاویه هوس‌انگیز 📸، بوسه‌های طولانی روی خط گردن و ترقوه طاها، نوازش‌های لمسی، یا اجرای یک فانتزی شبانه باشد.
فقط یک چالش خلاقانه در ۲ خط بنویس.
      `;
    } else {
      prompt = `
کاربر فعلی "طاها" (کروکودیل) است که در بازی باخته است!
یک چالش/جریمه فرمانبرداری عاشقانه، ماساژ عمیق و ریلکسیشن، بوسیدن پاها یا دست‌های آنا، یا یک کار هات و فانتزی که طاها باید برای پرنسس آنا انجام دهد تولید کن.
فقط یک چالش خلاقانه در ۲ خط بنویس.
      `;
    }
  } else if (promptType === 'love_whisper') {
    prompt = `یک نجوا و جمله عاشقانه عمیق، تکان‌دهنده و پر از کشش برای ${isAna ? 'آنا از طرف طاها 🐊' : 'طاها از طرف آنا 🦓'} تولید کن. حداکثر ۲ خط.`;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemInstruction },
                { text: prompt + (extraContext ? `\nاطلاعات تکمیلی: ${extraContext}` : '') }
              ]
            }
          ]
        })
      }
    );

    const data = await res.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    return isAna
      ? 'سلفی با چشم‌های خمار و یقه باز بگیر و برای طاها بفرست 📸🔥'
      : 'طاها موظفه ۵ دقیقه شانه و گردن آنا رو با لوسیون ماساژ عمیق بده 💆‍♂️🔥';
  } catch (err) {
    console.error('AI Service Error:', err);
    return isAna
      ? 'باید ۳۰ ثانیه گردن و لاله گوش طاها رو غرق بوسه کنی 💋'
      : 'طاها باید دست‌های آنا رو ببوسه و مطیع کامل پرنسس بشه 👸🏼';
  }
}