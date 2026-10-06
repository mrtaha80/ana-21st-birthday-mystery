import React, { useState } from 'react';

export default function SexyGame({ theme, onParticleTrigger }) {
  const [activeMode, setActiveMode] = useState('hunt'); // hunt, dares, coupons
  
  // ۱. حالت شکار کروکودیل و طعمه (Croc Love Hunt)
  const [crocCharge, setCrocCharge] = useState(0);
  const [huntResult, setHuntResult] = useState('');
  
  // ۲. چالش‌های آتشین و اعترافات
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isRevealing, setIsRevealing] = useState(false);

  // ۳. کوپن‌های شبانه
  const [unlockedCoupons, setUnlockedCoupons] = useState({});

  const daresAndTruths = [
    { type: 'اعتراف 🤫', text: 'آنا باید اعتراف کنه: کدوم حرکت یا رفتار طاها کروکودیل بیشترین دلبری رو براش داره و قلبش رو تندتر می‌کنه؟' },
    { type: 'حمله تمساح 🐊', text: 'طاها کروکودیل حق داره ۳۰ ثانیه گردن و لاله گوش آنا رو غرق بوسه‌های ریز و خمار کنه!' },
    { type: 'اسارت گورخر 🦓', text: 'دست‌های آنا به مدت ۱ دقیقه باید قفل دست‌های طاها بمونه؛ هرکی نگاهشو اول بدزده باید لب طرف مقابل رو گاز ملایم بگیره!' },
    { type: 'ماساژ تمساحی 💆‍♂️', text: 'طاها باید با دست‌های گرم و قویش، عضلات شانه و کمر آنا رو به مدت ۲ دقیقه آروم و عمیق ماساژ بده.' },
    { type: 'نجوای شبانه 🌙', text: 'آنا باید تو فاصله دو سانتی‌متری لب‌های طاها، بدون این‌که ببوسه، هات‌ترین فانتزی که باهاش داره رو با صدای آروم زمزمه کنه.' },
    { type: 'قلمرو بوسه 💋', text: 'طاها مسیر ترقوه تا گوش آنا رو آروم خط‌کشی و بوسه‌بارون می‌کنه!' }
  ];

  const crocCoupons = [
    { id: 1, title: 'فرار از آرواره کروکودیل 🐊', desc: 'حق رد کردن یک دستور یا چالش طاها با اهدای یک بوسه فرانسوی طولانی!' },
    { id: 2, title: 'شکار ویژه نیمه‌شب 🌙', desc: '۱۰ دقیقه ماساژ تمام‌قد ریلکسیشن با نور تاریک و شمع برای آنا پرنسس.' },
    { id: 3, title: 'دستور مطلق گورخر 🦓', desc: 'آنا می‌تونه هر فرمانی داد، طاها موظفه مثل کروکودیل رام‌شده بگه چشم!' },
    { id: 4, title: 'بستنی و نوتلا در تخت‌خواب 🍫', desc: 'سرو دسر توسط طاها در حالی که آنا فقط استراحت می‌کنه و لم میده.' }
  ];

  const handleCrocBite = () => {
    onParticleTrigger('🐊');
    setCrocCharge(prev => {
      const next = prev + 20;
      if (next >= 100) {
        onParticleTrigger('💋');
        setHuntResult('🐊 شکار شدی! کروکودیل طعمه‌شو گرفت... همین الان باید ۵ تا بوسه آبدار بهش بدی!');
        return 0;
      }
      setHuntResult(`داره نزدیک‌تر میشه... انرژی کمین: ${next}% 🔥`);
      return next;
    });
  };

  const drawCard = () => {
    setIsRevealing(true);
    onParticleTrigger('🔥');
    setTimeout(() => {
      const randomItem = daresAndTruths[Math.floor(Math.random() * daresAndTruths.length)];
      setCurrentPrompt(randomItem);
      setIsRevealing(false);
    }, 350);
  };

  const isDark = theme.id === 'zebra';

  return (
    <div style={{
      background: isDark ? 'rgba(15, 15, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderRadius: '28px',
      padding: '24px',
      border: `2px solid ${theme.primary}`,
      boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
      direction: 'rtl'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <span style={{ fontSize: '3rem', animation: 'wiggle 2s infinite' }}>🐊💋🦓</span>
        <h2 style={{ color: theme.primary, fontSize: '1.4rem', fontWeight: 900, margin: '8px 0' }}>
          قلمرو شکار تمساح عاشق 🐊🔥
        </h2>
        <p style={{ color: isDark ? '#bbb' : '#666', fontSize: '0.88rem' }}>
          بازی اختصاصی طاها (کروکودیل) و پرنسس آنا (گورخر نانازی)
        </p>
      </div>

      {/* منوی حالت‌ها */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '22px' }}>
        {[
          { id: 'hunt', label: 'کمین کروکودیل 🐊' },
          { id: 'dares', label: 'چالش‌های آتشین 🔥' },
          { id: 'coupons', label: 'کوپن‌های شبانه 🎟️' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setActiveMode(m.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeMode === m.id ? theme.primary : (isDark ? '#2a2a2a' : '#f0f0f0'),
              color: activeMode === m.id ? '#fff' : (isDark ? '#ccc' : '#444')
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ۱. مینی‌گیم کمین تمساح */}
      {activeMode === 'hunt' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: isDark ? '#ddd' : '#444', fontSize: '0.92rem', marginBottom: '14px' }}>
            آنا باید فرار کنه و طاها تپ کنه تا آرواره‌های کروکودیل بسته بشن و طعمه شکار بشه!
          </p>

          <div style={{
            height: '22px',
            background: isDark ? '#333' : '#eee',
            borderRadius: '12px',
            overflow: 'hidden',
            margin: '0 auto 16px',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              width: `${crocCharge}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4caf50 0%, #ff0055 100%)',
              transition: 'width 0.2s ease'
            }} />
          </div>

          {huntResult && (
            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: theme.primary,
              marginBottom: '18px',
              padding: '10px',
              background: isDark ? '#222' : '#fff0f5',
              borderRadius: '14px'
            }}>
              {huntResult}
            </div>
          )}

          <button
            onClick={handleCrocBite}
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              border: `4px solid ${theme.primary}`,
              background: 'radial-gradient(circle, #2e7d32 0%, #1b5e20 100%)',
              color: '#fff',
              fontSize: '2.4rem',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(46, 125, 50, 0.6)',
              animation: 'pulse 1.3s infinite'
            }}
          >
            🐊
          </button>
          <div style={{ marginTop: '10px', color: '#888', fontSize: '0.8rem' }}>رو کروکودیل بزن تا حمله کنه!</div>
        </div>
      )}

      {/* ۲. چالش‌های آتشین */}
      {activeMode === 'dares' && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={drawCard}
            style={{
              padding: '12px 24px',
              borderRadius: '18px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff0055, #ff5e3a)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(255, 0, 85, 0.4)',
              marginBottom: '20px'
            }}
          >
            بیرون کشیدن چالش مخفی 🎴🔥
          </button>

          <div style={{
            minHeight: '110px',
            background: isDark ? '#111' : '#fff5f8',
            border: `2px dashed ${theme.primary}`,
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontSize: '1.05rem',
            fontWeight: 700,
            lineHeight: 1.8,
            color: isDark ? '#fff' : '#222',
            opacity: isRevealing ? 0.3 : 1,
            transition: 'opacity 0.2s'
          }}>
            {currentPrompt ? (
              <>
                <span style={{ color: theme.primary, fontSize: '0.9rem', marginBottom: '6px' }}>{currentPrompt.type}</span>
                <span>{currentPrompt.text}</span>
              </>
            ) : (
              'دکمه بالا رو بزن تا چالش این راند مشخص بشه...'
            )}
          </div>
        </div>
      )}

      {/* ۳. کوپن‌های شبانه */}
      {activeMode === 'coupons' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {crocCoupons.map(c => {
            const isOpened = unlockedCoupons[c.id];
            return (
              <div
                key={c.id}
                onClick={() => {
                  setUnlockedCoupons(prev => ({ ...prev, [c.id]: true }));
                  onParticleTrigger('🐊');
                }}
                style={{
                  background: isOpened ? (isDark ? '#222' : '#fff') : 'linear-gradient(135deg, #1b5e20, #000)',
                  border: `2px solid ${isOpened ? theme.primary : '#4caf50'}`,
                  borderRadius: '18px',
                  padding: '16px',
                  cursor: isOpened ? 'default' : 'pointer',
                  textAlign: 'center',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                }}
              >
                {!isOpened ? (
                  <div>
                    <span style={{ fontSize: '1.8rem' }}>🐊🔒</span>
                    <div style={{ color: '#81c784', fontWeight: 800, fontSize: '0.85rem', marginTop: '6px' }}>
                      کوپن مهر و موم تمساح (کلیک کن)
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: theme.primary, fontWeight: 900, fontSize: '1rem', marginBottom: '6px' }}>
                      {c.title}
                    </div>
                    <div style={{ color: isDark ? '#eee' : '#444', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      {c.desc}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}