import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import SexyGame from './SexyGame.jsx';

const SUPABASE_URL = 'https://ivfksnobyapzizntmgcf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DWH7XNd9-kG0943xm4AVaA_9b5zIem0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  // سیستم ورود و سشن کاربر
  const [currentUser, setCurrentUser] = useState(null); // 'taha' یا 'ana'
  const [targetLogin, setTargetLogin] = useState('taha'); // انتخاب هویت برای لاگین
  const [enteredPass, setEnteredPass] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState('hub');

  // تغییر رمز اختصاصی
  const [newPassInput, setNewPassInput] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState(false);

  // سیستم صوت و آهنگ
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // تم‌ها
  const [currentTheme, setCurrentTheme] = useState('pink');

  // داده‌های دیتابیس Supabase
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [photos, setPhotos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [bucketList, setBucketList] = useState([]);
  const [newWish, setNewWish] = useState('');

  // استیت‌های انیمیشن
  const [particles, setParticles] = useState([]);
  const [sparkleQuote, setSparkleQuote] = useState('به دنیای شخصی‌مون خوش اومدی! روی کاراکترها بزن تا انیمیشنشون فعال بشه ✨');

  // زمان‌شمار عاشقی (از ۸ آگوست ۲۰۲۶)
  const [timeTogether, setTimeTogether] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const startDate = new Date('2026-08-08T00:00:00');
    const updateTime = () => {
      const now = new Date();
      const diff = Math.max(0, now - startDate);
      setTimeTogether({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // دریافت داده‌ها پس از ورود
  useEffect(() => {
    if (currentUser) {
      fetchNotes();
      fetchPhotos();
      fetchBucket();
    }
  }, [currentUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(false);
    try {
      const { data, error } = await supabase
        .from('user_auth')
        .select('*')
        .eq('username', targetLogin)
        .single();

      if (data && data.passcode === enteredPass.trim()) {
        setCurrentUser(targetLogin);
        setEnteredPass('');
        spawnParticles(targetLogin === 'taha' ? '🐊' : '🦓');
      } else {
        // فال‌بک پیش‌فرض اولیه در صورت نبود اتصال
        if ((targetLogin === 'taha' && enteredPass === '1405') || (targetLogin === 'ana' && enteredPass === '0808')) {
          setCurrentUser(targetLogin);
          setEnteredPass('');
          spawnParticles('💖');
        } else {
          setAuthError(true);
          setTimeout(() => setAuthError(false), 2200);
        }
      }
    } catch {
      setAuthError(true);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassInput.trim()) return;
    try {
      await supabase
        .from('user_auth')
        .update({ passcode: newPassInput.trim(), updated_at: new Date().toISOString() })
        .eq('username', currentUser);
      
      setPassChangeSuccess(true);
      setNewPassInput('');
      spawnParticles('🔒');
      setTimeout(() => setPassChangeSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotes = async () => {
    const { data } = await supabase.from('shared_notes').select('*').order('id', { ascending: false }).limit(25);
    if (data) setNotes(data);
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const authorTag = currentUser === 'taha' ? 'طاها 🐊 (کروکودیل)' : 'آنا 🦓 (گورخر نانازی)';
    const { data } = await supabase.from('shared_notes').insert([{ sender: authorTag, message: newNote }]).select();
    if (data) {
      setNotes([data[0], ...notes]);
      setNewNote('');
      spawnParticles('💌');
    }
  };

  const fetchPhotos = async () => {
    const { data } = await supabase.from('shared_photos').select('*').order('id', { ascending: false });
    if (data) setPhotos(data);
  };

  const addPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    const { data } = await supabase.from('shared_photos').insert([{ title: photoCaption, image_url: newPhotoUrl }]).select();
    if (data) {
      setPhotos([data[0], ...photos]);
      setNewPhotoUrl('');
      setPhotoCaption('');
      spawnParticles('📸');
    }
  };

  const fetchBucket = async () => {
    const { data } = await supabase.from('bucket_list').select('*').order('id', { ascending: true });
    if (data) setBucketList(data);
  };

  const addBucketItem = async (e) => {
    e.preventDefault();
    if (!newWish.trim()) return;
    const { data } = await supabase.from('bucket_list').insert([{ task: newWish }]).select();
    if (data) {
      setBucketList([...bucketList, data[0]]);
      setNewWish('');
      spawnParticles('🌟');
    }
  };

  const toggleBucket = async (id, currentStatus) => {
    await supabase.from('bucket_list').update({ completed: !currentStatus }).eq('id', id);
    setBucketList(bucketList.map(item => item.id === id ? { ...item, completed: !currentStatus } : item));
    spawnParticles('🎉');
  };

  const togglePlayMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const spawnParticles = (emoji = '💖') => {
    const id = Date.now();
    const batch = Array.from({ length: 14 }).map((_, i) => ({
      id: id + i,
      emoji,
      left: Math.random() * 88 + 6,
      size: Math.random() * 1.5 + 1.2,
      duration: Math.random() * 1.2 + 1.5
    }));
    setParticles(prev => [...prev, ...batch]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !batch.some(b => b.id === p.id)));
    }, 2800);
  };

  const themes = {
    pink: {
      id: 'pink',
      bg: 'linear-gradient(135deg, #fff0f5 0%, #ffccd5 100%)',
      cardBg: 'rgba(255, 255, 255, 0.92)',
      primary: '#ff1493',
      accent: '#ff69b4',
      border: '#ffb6c1'
    },
    zebra: {
      id: 'zebra',
      bg: 'repeating-linear-gradient(45deg, #0d0d0f, #0d0d0f 25px, #1a1a24 25px, #1a1a24 50px)',
      cardBg: 'rgba(20, 20, 28, 0.95)',
      primary: '#ff007f',
      accent: '#00f0ff',
      border: '#ff007f'
    },
    croc: {
      id: 'croc',
      bg: 'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)',
      cardBg: 'rgba(255, 255, 255, 0.94)',
      primary: '#1b5e20',
      accent: '#4caf50',
      border: '#81c784'
    },
    chick: {
      id: 'chick',
      bg: 'linear-gradient(135deg, #fffde7 0%, #ffe082 100%)',
      cardBg: 'rgba(255, 255, 255, 0.94)',
      primary: '#e65100',
      accent: '#fbc02d',
      border: '#ffd54f'
    }
  };

  const t = themes[currentTheme];
  const isDark = t.id === 'zebra';

  // ۱. صفحه ورود تفکیک‌شده دو‌کاربره
  if (!currentUser) {
    return (
      <div style={styles.gateWrapper}>
        <div style={styles.gateCard}>
          <div style={{ fontSize: '3.6rem', animation: 'bounce 1.5s infinite', marginBottom: '8px' }}>
            {targetLogin === 'taha' ? '🐊👑' : '🦓🎀'}
          </div>
          <h1 style={{ color: targetLogin === 'taha' ? '#10b981' : '#ff007f', fontSize: '1.75rem', fontWeight: 900, marginBottom: '6px' }}>
            ورود به قلمرو {targetLogin === 'taha' ? 'کروکودیل مقتدر (طاها)' : 'گورخر پرنسس (آنا)'}
          </h1>
          <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: '20px' }}>
            برای حفظ حریم خصوصی، پین‌کد اختصاصی خودت رو وارد کن:
          </p>

          {/* سوییچ هویت برای ورود */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <button
              onClick={() => { setTargetLogin('taha'); setAuthError(false); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '16px',
                border: 'none',
                fontWeight: 900,
                cursor: 'pointer',
                background: targetLogin === 'taha' ? 'linear-gradient(135deg, #059669, #10b981)' : '#eee',
                color: targetLogin === 'taha' ? '#fff' : '#555',
                transition: 'all 0.2s'
              }}
            >
              ورود طاها 🐊
            </button>
            <button
              onClick={() => { setTargetLogin('ana'); setAuthError(false); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '16px',
                border: 'none',
                fontWeight: 900,
                cursor: 'pointer',
                background: targetLogin === 'ana' ? 'linear-gradient(135deg, #ff007f, #ff758c)' : '#eee',
                color: targetLogin === 'ana' ? '#fff' : '#555',
                transition: 'all 0.2s'
              }}
            >
              ورود آنا 🦓
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder={`رمز ورود ${targetLogin === 'taha' ? 'طاها (پیش‌فرض 1405)' : 'آنا (پیش‌فرض 0808)'}`}
              value={enteredPass}
              onChange={(e) => setEnteredPass(e.target.value)}
              style={styles.gateInput}
            />
            <button
              type="submit"
              style={{
                ...styles.gateBtn,
                background: targetLogin === 'taha' ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #ff007f, #ff758c)'
              }}
            >
              باز کردن دروازه خصوصی ✨
            </button>
          </form>

          {authError && (
            <p style={{ color: '#ef4444', marginTop: '12px', fontWeight: 800, fontSize: '0.9rem' }}>
              رمز عبور اشتباه است! اگر رمز را تغییر دادی همان را بزن.
            </p>
          )}
        </div>
      </div>
    );
  }

  // آخرین عکس آپلود شده برای پس‌زمینه زنده و معلق در هدر
  const latestHeroPhoto = photos.length > 0 ? photos[0].image_url : null;

  return (
    <div style={{ ...styles.appContainer, background: t.bg }}>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="https://cdn.pixabay.com/download/audio/2022/11/06/audio_c35f2991cf.mp3?filename=waltz-of-the-flowers-romantic-piano-126231.mp3"
      />

      {/* ذرات شناور بارانی */}
      {particles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.left}%`,
            bottom: '0px',
            fontSize: `${p.size}rem`,
            animation: `floatUp ${p.duration}s linear forwards`,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* موزیک پلیر شناور */}
      <div style={{ ...styles.floatingAudioPlayer, borderColor: t.primary }}>
        <button onClick={togglePlayMusic} style={{ ...styles.playCircle, background: t.primary }}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#fff' : t.primary }}>
          {isPlaying ? 'در حال پخش والس عاشقی 🎶' : 'رو من بزن آهنگ پخش شه 🎵'}
        </span>
      </div>

      {/* هدر پیشرفته و تفکیک شده با تصویر شاخص زنده */}
      <header style={{
        ...styles.navbar,
        borderColor: t.border,
        background: isDark ? 'rgba(10,10,15,0.92)' : 'rgba(255,255,255,0.92)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {latestHeroPhoto && (
            <img
              src={latestHeroPhoto}
              alt="Hero Avatar"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${t.primary}`,
                boxShadow: `0 0 10px ${t.primary}`,
                animation: 'pulse 2s infinite'
              }}
            />
          )}
          <div>
            <div style={{ fontWeight: 900, color: t.primary, fontSize: '1.15rem' }}>
              خوش اومدی {currentUser === 'taha' ? 'کروکودیل من (طاها 🐊)' : 'گورخر نازم (آنا 🦓)'}
            </div>
            <div style={{ fontSize: '0.75rem', color: isDark ? '#aaa' : '#666' }}>
              پرتال دو‌نفره امن و اختصاصی
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => spawnParticles(currentUser === 'taha' ? '🐊' : '🦓')} style={styles.badgeBtn}>
            {currentUser === 'taha' ? '🐊 باران تمساح' : '🦓 باران گورخر'}
          </button>
          <button
            onClick={() => setCurrentUser(null)}
            style={{ ...styles.badgeBtn, background: '#ef4444', color: '#fff', border: 'none' }}
          >
            خروج از حساب 🚪
          </button>
        </div>
      </header>

      {/* نوار انتخاب تم‌های زنده */}
      <div style={styles.themeSelectorBar}>
        <span style={{ fontWeight: 800, color: isDark ? '#fff' : '#333', fontSize: '0.85rem' }}>تغییر اتمسفر:</span>
        <button onClick={() => setCurrentTheme('pink')} style={{ ...styles.themeBtn, background: '#ffccd5', border: currentTheme === 'pink' ? '3px solid #ff1493' : 'none' }}>🌸 صورتی توت‌فرنگی</button>
        <button onClick={() => setCurrentTheme('zebra')} style={{ ...styles.themeBtn, background: '#111', color: '#fff', border: currentTheme === 'zebra' ? '3px solid #00f0ff' : '1px solid #fff' }}>🦓 گورخر نئونی</button>
        <button onClick={() => setCurrentTheme('croc')} style={{ ...styles.themeBtn, background: '#c8e6c9', border: currentTheme === 'croc' ? '3px solid #1b5e20' : 'none' }}>🐊 مرداب کروکودیل</button>
        <button onClick={() => setCurrentTheme('chick')} style={{ ...styles.themeBtn, background: '#fff9c4', border: currentTheme === 'chick' ? '3px solid #e65100' : 'none' }}>🐥 مزرعه جوجو</button>
      </div>

      {/* تب‌های جابه‌جایی صفحات */}
      <nav style={styles.navTabs}>
        {[
          { id: 'hub', label: 'داشبورد و شمارنده ⏳' },
          { id: 'sexy', label: 'بازی کمین و سلفی 🔥' },
          { id: 'gallery', label: 'گالری تعاملی عکس‌ها 📸' },
          { id: 'notes', label: 'صندوقچه پچ‌پچ‌ها 💌' },
          { id: 'bucket', label: 'دفترچه آرزوها 🌟' },
          { id: 'vault', label: 'تنظیمات رمز خصوصی 🔒' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              ...styles.tabButton,
              background: activeTab === item.id ? `linear-gradient(135deg, ${t.primary}, ${t.accent})` : (isDark ? '#222' : '#fff'),
              color: activeTab === item.id ? '#fff' : (isDark ? '#00f0ff' : t.primary),
              border: `2px solid ${t.border}`,
              transform: activeTab === item.id ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* محتوای صفحات */}
      <main style={styles.mainContent}>
        {/* ۱. تب اصلی: شمارنده با ارقام درشت + آلبوم متحرک پس‌زمینه */}
        {activeTab === 'hub' && (
          <div style={{ ...styles.card, background: t.cardBg, borderColor: t.border }}>
            <h2 style={{ ...styles.cardTitle, color: t.primary }}>
              ثانیه‌‌شمار دنیای بی‌پایان طاها و آنا 💕
            </h2>

            <div style={styles.counterGrid}>
              <div style={{ ...styles.counterBox, background: isDark ? '#000' : '#fff', borderColor: t.primary }}>
                <span style={{ ...styles.counterNum, color: isDark ? '#00f0ff' : '#d81b60' }}>
                  {timeTogether.days}
                </span>
                <label style={{ ...styles.counterLabel, color: isDark ? '#fff' : '#666' }}>روز باهم</label>
              </div>

              <div style={{ ...styles.counterBox, background: isDark ? '#000' : '#fff', borderColor: t.primary }}>
                <span style={{ ...styles.counterNum, color: isDark ? '#00f0ff' : '#d81b60' }}>
                  {timeTogether.hours}
                </span>
                <label style={{ ...styles.counterLabel, color: isDark ? '#fff' : '#666' }}>ساعت</label>
              </div>

              <div style={{ ...styles.counterBox, background: isDark ? '#000' : '#fff', borderColor: t.primary }}>
                <span style={{ ...styles.counterNum, color: isDark ? '#00f0ff' : '#d81b60' }}>
                  {timeTogether.minutes}
                </span>
                <label style={{ ...styles.counterLabel, color: isDark ? '#fff' : '#666' }}>دقیقه</label>
              </div>

              <div style={{ ...styles.counterBox, background: isDark ? '#000' : '#fff', borderColor: t.primary }}>
                <span style={{ ...styles.counterNum, color: isDark ? '#ff007f' : '#ff1493' }}>
                  {timeTogether.seconds}
                </span>
                <label style={{ ...styles.counterLabel, color: isDark ? '#fff' : '#666' }}>ثانیه</label>
              </div>
            </div>

            {/* بخش انیمیشنی کلیک روی کاراکترها */}
            <div style={{ textAlign: 'center', margin: '30px 0 10px' }}>
              <div style={{ fontSize: '3.6rem', display: 'flex', justifyContent: 'center', gap: '25px' }}>
                <span className="interactive-animal" onClick={() => spawnParticles('🐊')}>🐊</span>
                <span className="interactive-animal" onClick={() => spawnParticles('💖')}>💖</span>
                <span className="interactive-animal" onClick={() => spawnParticles('🦓')}>🦓</span>
                <span className="interactive-animal" onClick={() => spawnParticles('🐥')}>🐥</span>
              </div>
              <p style={{ color: isDark ? '#00f0ff' : t.primary, fontWeight: 800, marginTop: '10px' }}>
                روی هر کدوم بزنی بارون همون کاراکتر می‌‌باره! 🌟
              </p>
            </div>

            {/* ویجت زنده آخرین خاطره ثبت شده */}
            {photos.length > 0 && (
              <div style={{
                position: 'relative',
                borderRadius: '22px',
                overflow: 'hidden',
                margin: '20px 0',
                border: `2px solid ${t.primary}`,
                maxHeight: '220px'
              }}>
                <img
                  src={photos[0].image_url}
                  alt="Last Memory"
                  style={{ width: '100%', height: '220px', objectFit: 'cover', filter: 'brightness(0.75)' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '16px',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                }}>
                  ✨ آخرین لحظه ثبت‌شده: {photos[0].title || 'عاشقانه بدون مرز'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ۲. بازی تعاملی کمین کروکودیل و مجازات سلفی */}
        {activeTab === 'sexy' && (
          <SexyGame theme={t} onParticleTrigger={spawnParticles} />
        )}

        {/* ۳. گالری پولاروید سه‌بعدی متحرک */}
        {activeTab === 'gallery' && (
          <div style={{ ...styles.card, background: t.cardBg, borderColor: t.border }}>
            <h2 style={{ ...styles.cardTitle, color: t.primary }}>آلبوم پولاروید سه‌بعدی ما 📸🎀</h2>
            <form onSubmit={addPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              <input
                type="text"
                placeholder="لینک مستقیم عکس دونفره‌‌مون..."
                value={newPhotoUrl}
                onChange={e => setNewPhotoUrl(e.target.value)}
                style={styles.inputField}
              />
              <input
                type="text"
                placeholder="خاطره یا تاریخ این عکس قشنگ..."
                value={photoCaption}
                onChange={e => setPhotoCaption(e.target.value)}
                style={styles.inputField}
              />
              <button type="submit" style={{ ...styles.actionBtn, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}>
                سنجاق به تخته پولاروید 📷✨
              </button>
            </form>

            <div style={styles.polaroidContainer}>
              {photos.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', gridColumn: '1/-1', padding: '30px' }}>
                  عکسی هنوز نیست! اولین عکس سفر یا یادگاری‌هامون رو اضافه کن 🍓
                </p>
              ) : (
                photos.map((p, i) => (
                  <div
                    key={p.id}
                    className="polaroid-frame"
                    style={{
                      transform: `rotate(${i % 2 === 0 ? '-3deg' : '4deg'})`,
                      background: '#fff',
                      padding: '12px 12px 20px',
                      borderRadius: '10px',
                      boxShadow: '0 14px 28px rgba(0,0,0,0.25)'
                    }}
                  >
                    <div style={styles.tape} />
                    <img src={p.image_url} alt={p.title} style={styles.polaroidImg} />
                    <p style={{ textAlign: 'center', fontWeight: 800, marginTop: '10px', color: '#333' }}>
                      {p.title || 'خاطره ناب'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ۴. یادداشت‌های آنلاین Supabase */}
        {activeTab === 'notes' && (
          <div style={{ ...styles.card, background: t.cardBg, borderColor: t.border }}>
            <h2 style={{ ...styles.cardTitle, color: t.primary }}>صندوق پچ‌پچ‌ها و نامه‌های زنده 💌</h2>
            <form onSubmit={addNote} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder={`پیام از طرف ${currentUser === 'taha' ? 'طاها 🐊' : 'آنا 🦓'}...`}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  style={{ ...styles.inputField, flex: 1 }}
                />
                <button type="submit" style={{ ...styles.actionBtn, width: 'auto', padding: '12px 24px', background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}>
                  ارسال 🚀
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
              {notes.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '18px',
                    maxWidth: '82%',
                    alignSelf: (n.sender.includes('آنا') || n.sender.includes('گورخر')) ? 'flex-end' : 'flex-start',
                    background: (n.sender.includes('آنا') || n.sender.includes('گورخر')) ? '#fff0f6' : '#f0f9ff',
                    border: `2px solid ${(n.sender.includes('آنا') || n.sender.includes('گورخر')) ? '#ffccd5' : '#bae6fd'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: t.primary }}>{n.sender}: </span>
                  <p style={{ marginTop: '4px', color: '#333' }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۵. دفترچه آرزوها */}
        {activeTab === 'bucket' && (
          <div style={{ ...styles.card, background: t.cardBg, borderColor: t.border }}>
            <h2 style={{ ...styles.cardTitle, color: t.primary }}>دفترچه ماجراجویی‌ها و آرزوها 🌟</h2>
            <form onSubmit={addBucketItem} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="یه قرار جدید تو اصفهان یا یه سفر باحال بنویس..."
                value={newWish}
                onChange={e => setNewWish(e.target.value)}
                style={{ ...styles.inputField, flex: 1 }}
              />
              <button type="submit" style={{ ...styles.actionBtn, width: 'auto', padding: '12px 24px', background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}>
                ثبت نقشه 🗺️
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bucketList.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleBucket(item.id, item.completed)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    background: item.completed ? '#e8f5e9' : (isDark ? '#111' : '#fff'),
                    border: `2px solid ${item.completed ? '#81c784' : t.border}`
                  }}
                >
                  <span style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#2e7d32' : (isDark ? '#fff' : '#333'), fontWeight: 700 }}>
                    {item.completed ? '✅' : '🤍'} {item.task}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    {item.completed ? 'انجام شد!' : 'کلیک برای انجام'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۶. تب تنظیمات امنیتی: تغییر رمز بدون مطلع شدن طرف مقابل */}
        {activeTab === 'vault' && (
          <div style={{ ...styles.card, background: t.cardBg, borderColor: t.border }}>
            <h2 style={{ ...styles.cardTitle, color: t.primary }}>
              مدیریت رمز خصوصی حساب شما ({currentUser === 'taha' ? 'طاها 🐊' : 'آنا 🦓'}) 🔒
            </h2>
            <p style={{ color: isDark ? '#ccc' : '#666', fontSize: '0.9rem', textAlign: 'center', marginBottom: '20px' }}>
              شما می‌توانید رمز ورود اختصاصی خود را در دیتابیس تغییر دهید تا فقط خودتان به پنل ورودتان دسترسی داشته باشید.
            </p>

            <form onSubmit={handleChangePassword} style={{ maxWidth: '400px', margin: '0 auto' }}>
              <input
                type="password"
                placeholder="رمز عبور جدید را وارد کنید..."
                value={newPassInput}
                onChange={e => setNewPassInput(e.target.value)}
                style={styles.inputField}
              />
              <button
                type="submit"
                style={{ ...styles.actionBtn, marginTop: '12px', background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}
              >
                به‌روزرسانی رمز شخصی 🗝️
              </button>
            </form>

            {passChangeSuccess && (
              <p style={{ color: '#10b981', textAlign: 'center', fontWeight: 800, marginTop: '14px' }}>
                ✅ رمز عبور اختصاصی شما با موفقیت در دیتابیس امن ذخیره شد!
              </p>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          100% { transform: translateY(-100vh) scale(1.4); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .interactive-animal {
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .interactive-animal:hover {
          transform: scale(1.35) rotate(8deg);
        }
        .polaroid-frame {
          transition: transform 0.3s ease, z-index 0.3s ease;
        }
        .polaroid-frame:hover {
          transform: rotate(0deg) scale(1.08) !important;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}

const styles = {
  gateWrapper: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle, #ffe6f0 0%, #ffafcc 100%)',
    direction: 'rtl',
    padding: '16px'
  },
  gateCard: {
    background: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(20px)',
    border: '3px solid #ffccd5',
    borderRadius: '32px',
    padding: '36px 26px',
    textAlign: 'center',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 20px 45px rgba(255, 75, 130, 0.3)'
  },
  gateInput: {
    width: '100%',
    padding: '14px',
    borderRadius: '16px',
    border: '2px solid #ff809b',
    outline: 'none',
    textAlign: 'center',
    fontSize: '1rem',
    color: '#ff1493',
    boxSizing: 'border-box'
  },
  gateBtn: {
    width: '100%',
    marginTop: '14px',
    padding: '14px',
    borderRadius: '16px',
    border: 'none',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.05rem',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
  },
  appContainer: {
    minHeight: '100vh',
    direction: 'rtl',
    paddingBottom: '80px',
    transition: 'background 0.5s ease'
  },
  floatingAudioPlayer: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    padding: '8px 16px',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 9998,
    border: '2px solid'
  },
  playCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    color: '#fff',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderBottom: '2px solid',
    backdropFilter: 'blur(10px)'
  },
  badgeBtn: {
    background: '#fff',
    border: '1px solid #ffd1dc',
    borderRadius: '18px',
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
  },
  themeSelectorBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: 'rgba(0, 0, 0, 0.08)',
    flexWrap: 'wrap'
  },
  themeBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 800,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  navTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px 10px',
    flexWrap: 'wrap'
  },
  tabButton: {
    padding: '10px 18px',
    borderRadius: '25px',
    fontWeight: 800,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  mainContent: {
    maxWidth: '780px',
    margin: '10px auto',
    padding: '0 16px'
  },
  card: {
    borderRadius: '30px',
    padding: '28px',
    border: '3px solid',
    boxShadow: '0 20px 45px rgba(0,0,0,0.2)'
  },
  cardTitle: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: '1.4rem',
    marginBottom: '22px'
  },
  counterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  counterBox: {
    border: '3px solid',
    borderRadius: '22px',
    padding: '16px 4px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 6px 15px rgba(0,0,0,0.1)'
  },
  counterNum: {
    fontSize: '2.4rem',
    fontWeight: 900,
    lineHeight: 1.1
  },
  counterLabel: {
    fontSize: '0.9rem',
    fontWeight: 800,
    marginTop: '6px'
  },
  inputField: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '16px',
    border: '2px solid #ffccd5',
    outline: 'none',
    fontSize: '0.95rem',
    boxSizing: 'border-box'
  },
  actionBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '18px',
    border: 'none',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(0,0,0,0.15)'
  },
  polaroidContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '24px',
    padding: '15px'
  },
  tape: {
    width: '60px',
    height: '18px',
    background: 'rgba(255, 235, 179, 0.7)',
    margin: '-16px auto 10px',
    borderRadius: '2px'
  },
  polaroidImg: {
    width: '100%',
    height: '170px',
    objectFit: 'cover',
    borderRadius: '4px'
  }
};