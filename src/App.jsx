import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ivfksnobyapzizntmgcf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DWH7XNd9-kG0943xm4AVaA_9b5zIem0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);
  const [activeTab, setActiveTab] = useState('hub');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('pink'); // pink, zebra, croc, chick

  // داده‌های دیتابیس آنلاین
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [author, setAuthor] = useState('طاها');
  const [photos, setPhotos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [bucketList, setBucketList] = useState([]);
  const [newWish, setNewWish] = useState('');

  // استیت‌های انیمیشن و فان
  const [floatingItems, setFloatingItems] = useState([]);
  const [gameScore, setGameScore] = useState(0);
  const [spinResult, setSpinResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [sparkleQuote, setSparkleQuote] = useState('روی جوجو کلیک کن تا یه جمله شاد بشنوی! 🐥✨');

  // شمارنده عشق از ۸ آگوست ۲۰۲۶
  const [timeTogether, setTimeTogether] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const startDate = new Date('2026-08-08T00:00:00');
    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, now - startDate);
      setTimeTogether({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // واکشی داده‌ها از Supabase
  useEffect(() => {
    if (unlocked) {
      fetchNotes();
      fetchPhotos();
      fetchBucket();
    }
  }, [unlocked]);

  const fetchNotes = async () => {
    const { data } = await supabase.from('shared_notes').select('*').order('id', { ascending: false }).limit(20);
    if (data) setNotes(data);
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const { data } = await supabase.from('shared_notes').insert([{ sender: author, message: newNote }]).select();
    if (data) {
      setNotes([data[0], ...notes]);
      setNewNote('');
      spawnFloating('💌');
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
      spawnFloating('📸');
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
      spawnFloating('🌟');
    }
  };

  const toggleBucket = async (id, currentStatus) => {
    await supabase.from('bucket_list').update({ completed: !currentStatus }).eq('id', id);
    setBucketList(bucketList.map(item => item.id === id ? { ...item, completed: !currentStatus } : item));
    spawnFloating('🎉');
  };

  // بارش آیکون‌های تعاملی
  const spawnFloating = (emoji) => {
    const id = Date.now();
    const newItems = Array.from({ length: 14 }).map((_, i) => ({
      id: id + i,
      emoji: emoji || '💖',
      left: Math.random() * 90 + 5,
      duration: Math.random() * 1.5 + 1.2,
      size: Math.random() * 1.2 + 1.3
    }));
    setFloatingItems(prev => [...prev, ...newItems]);
    setTimeout(() => {
      setFloatingItems(prev => prev.filter(item => !newItems.some(ni => ni.id === item.id)));
    }, 2500);
  };

  const quotes = [
    "آنا قشنگم، لبخندت حتی کروکودیل‌ها رو هم عاشق و مهربون می‌کنه! 🐊💖",
    "گورخر صورتی قصه‌مون میگه راه‌راه‌های زندگیم فقط با خنده‌هات قشنگه 🦓🌸",
    "جوجو طلایی میگه: تو قشنگ‌ترین پروانه تو کل اصفهان و جهانی! 🐥✨",
    "هر ثانیه که باهمیم یه رنگین‌کمون از خاطرات شیرینه 🍓🍭",
    "یادت نره امروز یه دوش آب گرم بگیری و بدونی چقدر عزیزی 🤍🎀"
  ];

  const adventures = [
    "قدم زدن دوتایی روی سی‌وسه‌پل و عکس سلفی با فیلتر کروکودیل! 🌉🐊",
    "خوردن شیرینی دانمارکی و وافل نوتلایی با آبمیوه توت‌فرنگی 🍓🧇",
    "کشف کردن یه کافه با دکور چوبی و دنج تو جلفا ☕🌿",
    "مسابقه ساختن خنده‌دارترین میم‌های گورخری با همدیگه 🦓😂",
    "شب‌نشینی و دیدن انیمیشن درحالی که پتوی پشمی رومونه 🎬🍿"
  ];

  const spinAdventures = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setSpinResult(adventures[Math.floor(Math.random() * adventures.length)]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 70);
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (['0808', 'ana', 'taha', '1405'].includes(passcode.trim().toLowerCase())) {
      setUnlocked(true);
      spawnFloating('🌸');
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  const toggleMusic = () => {
    const audio = document.getElementById('bg-music');
    if (audio) {
      if (isPlaying) audio.pause();
      else audio.play().catch(() => {});
      setIsPlaying(!isPlaying);
    }
  };

  // تم‌های پویا
  const themeStyles = {
    pink: {
      bg: 'linear-gradient(180deg, #fff0f5 0%, #ffe0ea 100%)',
      primary: '#ff2a70',
      accent: '#ff758c',
      cardBg: 'rgba(255, 255, 255, 0.94)',
      border: '#ffccd5',
      badge: '🌸 دنیای صورتی نانازی'
    },
    zebra: {
      bg: 'radial-gradient(circle, #fff 20%, #ffeef5 40%, #ffc2d1 100%)',
      primary: '#d81b60',
      accent: '#4a154b',
      cardBg: 'rgba(255, 255, 255, 0.96)',
      border: '#f06292',
      badge: '🦓 گورخر صورتی فانتزی'
    },
    croc: {
      bg: 'linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 100%)',
      primary: '#2e7d32',
      accent: '#66bb6a',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      border: '#a5d6a7',
      badge: '🐊 مرداب کروکودیل عاشق'
    },
    chick: {
      bg: 'linear-gradient(180deg, #fffde7 0%, #fff9c4 100%)',
      primary: '#f57f17',
      accent: '#fbc02d',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      border: '#ffe082',
      badge: '🐥 مزرعه جوجو کوچولو'
    }
  }[currentTheme];

  if (!unlocked) {
    return (
      <div style={ui.gateContainer}>
        <div style={ui.gateCard}>
          <div style={{ fontSize: '3.8rem', animation: 'bounce 1.5s infinite' }}>🦓🐊🐥💖</div>
          <h1 style={{ color: '#ff2a70', fontSize: '1.9rem', fontWeight: 900, margin: '14px 0 6px' }}>
            سرزمین اختصاصی طاها و آنا
          </h1>
          <p style={{ color: '#ff7597', fontSize: '0.95rem', marginBottom: '22px' }}>
            کلید کهکشان حیوانات نانازی و رمانتیک رو بزن پرنسس ✨
          </p>
          <form onSubmit={handleUnlock}>
            <input
              type="password"
              placeholder="رمز عبور (مثلاً 0808)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={ui.gateInput}
            />
            <button type="submit" style={ui.gateBtn}>ورود به سرزمین شگفتی‌ها 🗝️🎀</button>
          </form>
          {passError && <p style={{ color: '#ff0055', marginTop: '12px', fontWeight: 'bold' }}>رمز اشتباهه خوشگلم! دوباره بزن 🥺</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...ui.wrapper, background: themeStyles.bg }}>
      <audio
        id="bg-music"
        loop
        src="https://cdn.pixabay.com/download/audio/2022/11/06/audio_c35f2991cf.mp3?filename=waltz-of-the-flowers-romantic-piano-126231.mp3"
      />

      {/* باران انیمیشنی معلق */}
      {floatingItems.map(item => (
        <span
          key={item.id}
          style={{
            position: 'fixed',
            left: `${item.left}%`,
            bottom: '0px',
            fontSize: `${item.size}rem`,
            animation: `floatUp ${item.duration}s linear forwards`,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          {item.emoji}
        </span>
      ))}

      {/* هدر بالایی و سلکتور تم‌های جذاب */}
      <header style={{ ...ui.navbar, borderColor: themeStyles.border }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.8rem', animation: 'wiggle 2s infinite' }}>🦓💖🐊🐥</span>
          <span style={{ fontWeight: 900, color: themeStyles.primary, fontSize: '1.2rem' }}>Taha & Ana Land</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={() => spawnFloating('🦓')} style={ui.miniActionBtn}>🦓 گورخر</button>
          <button onClick={() => spawnFloating('🐊')} style={ui.miniActionBtn}>🐊 کروکودیل</button>
          <button onClick={() => spawnFloating('🐥')} style={ui.miniActionBtn}>🐥 جوجو</button>
          <button onClick={toggleMusic} style={{ ...ui.musicBtn, borderColor: themeStyles.accent, color: themeStyles.primary }}>
            {isPlaying ? '⏸ قطع پیانو' : '🎶 والس فرانسوی'}
          </button>
        </div>
      </header>

      {/* نوار انتخاب تم جادویی */}
      <div style={ui.themeSelectorBar}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: themeStyles.primary }}>تغییر حال و هوای تم:</span>
        <button onClick={() => setCurrentTheme('pink')} style={{ ...ui.themeBtn, background: '#ffccd5' }}>🌸 صورتی</button>
        <button onClick={() => setCurrentTheme('zebra')} style={{ ...ui.themeBtn, background: '#f8bbd0' }}>🦓 گورخر</button>
        <button onClick={() => setCurrentTheme('croc')} style={{ ...ui.themeBtn, background: '#c8e6c9' }}>🐊 کروکودیل</button>
        <button onClick={() => setCurrentTheme('chick')} style={{ ...ui.themeBtn, background: '#fff9c4' }}>🐥 جوجو</button>
      </div>

      {/* منوی تب‌های کاربری */}
      <nav style={ui.tabContainer}>
        {[
          { id: 'hub', label: 'شمارنده عشق و حیوانات ⏳' },
          { id: 'gallery', label: 'گالری پولاروید سه‌بعدی 📸' },
          { id: 'notes', label: 'یادداشت‌های مخفی زنده 💬' },
          { id: 'bucket', label: 'دفترچه آرزوهای دوتایی 🌟' },
          { id: 'fun', label: 'گردونه قرارها و مینی‌گیم 🎡' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              ...ui.tabItem,
              background: activeTab === t.id ? `linear-gradient(135deg, ${themeStyles.primary}, ${themeStyles.accent})` : '#fff',
              color: activeTab === t.id ? '#fff' : themeStyles.primary,
              border: `2px solid ${themeStyles.border}`
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* بدنه و صفحات */}
      <main style={ui.main}>
        {/* ۱. تب اصلی، شمارنده و مینی آواتارهای دونفره */}
        {activeTab === 'hub' && (
          <div style={{ ...ui.card, background: themeStyles.cardBg }}>
            <h2 style={{ ...ui.titleText, color: themeStyles.primary }}>ثانیه‌شمار دنیای مشترک طاها و آنا 💕</h2>
            <div style={ui.counterGrid}>
              <div style={ui.counterBox}><span>{timeTogether.days}</span><label>روز عاشقی</label></div>
              <div style={ui.counterBox}><span>{timeTogether.hours}</span><label>ساعت</label></div>
              <div style={ui.counterBox}><span>{timeTogether.minutes}</span><label>دقیقه</label></div>
              <div style={ui.counterBox}><span>{timeTogether.seconds}</span><label>ثانیه</label></div>
            </div>

            <div style={{ textAlign: 'center', margin: '25px 0 10px' }}>
              <div style={{ fontSize: '3.2rem', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <span className="mascot-hover" onClick={() => spawnFloating('🐊')}>🐊</span>
                <span className="mascot-hover" onClick={() => spawnFloating('💖')}>💖</span>
                <span className="mascot-hover" onClick={() => spawnFloating('🐥')}>🐥</span>
                <span className="mascot-hover" onClick={() => spawnFloating('🦓')}>🦓</span>
              </div>
              <p style={{ color: themeStyles.primary, fontWeight: 800, marginTop: '8px' }}>
                روی هر کدوم از حیوونا بزنی، یه بارون خوشگل از آسمون می‌باره! 🌈
              </p>
            </div>

            <div style={{ background: '#fff', padding: '18px', borderRadius: '20px', border: `2px dashed ${themeStyles.border}`, textAlign: 'center', marginTop: '16px' }}>
              <p style={{ fontSize: '1.05rem', color: themeStyles.primary, fontWeight: 700 }}>{sparkleQuote}</p>
              <button
                onClick={() => setSparkleQuote(quotes[Math.floor(Math.random() * quotes.length)])}
                style={{ ...ui.primaryBtn, background: `linear-gradient(135deg, ${themeStyles.primary}, ${themeStyles.accent})`, marginTop: '10px' }}
              >
                جمله‌ قشنگ بعدی برای آنا 🍬
              </button>
            </div>
          </div>
        )}

        {/* ۲. گالری عکس‌های تعاملی شبیه عکس‌های پولاروید چاپ شده با چرخش و سایه */}
        {activeTab === 'gallery' && (
          <div style={{ ...ui.card, background: themeStyles.cardBg }}>
            <h2 style={{ ...ui.titleText, color: themeStyles.primary }}>آلبوم پولاروید خاطرات ما 📸🎀</h2>
            <p style={{ textAlign: 'center', color: '#777', fontSize: '0.9rem', marginBottom: '16px' }}>
              لینک مستقیم عکس‌های قشنگمون رو بذار تا به شکل عکس‌های پولاروید نوستالژیک اضافه بشن:
            </p>

            <form onSubmit={addPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              <input
                type="text"
                placeholder="لینک مستقیم تصویر (مثلاً از سایت‌های آپلود مثل imgur یا postimages)"
                value={newPhotoUrl}
                onChange={e => setNewPhotoUrl(e.target.value)}
                style={ui.inputField}
              />
              <input
                type="text"
                placeholder="کپشن یا تاریخ این خاطره قشنگ..."
                value={photoCaption}
                onChange={e => setPhotoCaption(e.target.value)}
                style={ui.inputField}
              />
              <button type="submit" style={{ ...ui.primaryBtn, background: `linear-gradient(135deg, ${themeStyles.primary}, ${themeStyles.accent})` }}>
                چسباندن عکس به آلبوم پولاروید 📷✨
              </button>
            </form>

            <div style={ui.polaroidGrid}>
              {photos.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#aaa', padding: '30px' }}>
                  هنوز عکسی اضافه نشده! اولین عکس سفر یا یادگاری‌هامون رو اضافه کن 🌸
                </div>
              ) : (
                photos.map((p, idx) => (
                  <div
                    key={p.id}
                    className="polaroid-card"
                    style={{
                      transform: `rotate(${idx % 2 === 0 ? '-3deg' : '3deg'})`,
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => spawnFloating('💖')}
                  >
                    <div style={ui.tapeEffect}></div>
                    <img src={p.image_url} alt={p.title} style={ui.polaroidImg} />
                    <div style={ui.polaroidCaption}>
                      <span>{p.title || 'لحظه عاشقانه ما 🤍'}</span>
                      <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>❤️</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ۳. یادداشت‌های آنلاین مخفی دوطرفه با Supabase */}
        {activeTab === 'notes' && (
          <div style={{ ...ui.card, background: themeStyles.cardBg }}>
            <h2 style={{ ...ui.titleText, color: themeStyles.primary }}>صندوقچه نامه‌ها و پچ‌پچ‌های دو نفره 💌</h2>
            <form onSubmit={addNote} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <select value={author} onChange={e => setAuthor(e.target.value)} style={ui.selectField}>
                  <option value="طاها 🤴🏻 (کروکودیل مهربون)">طاها 🤴🏻</option>
                  <option value="آنا 👸🏼 (جوجوی قشنگم)">آنا 👸🏼</option>
                </select>
                <input
                  type="text"
                  placeholder="حرف دلتو بنویس تا آنلاین ثبت بشه..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  style={{ ...ui.inputField, flex: 1 }}
                />
              </div>
              <button type="submit" style={{ ...ui.primaryBtn, background: `linear-gradient(135deg, ${themeStyles.primary}, ${themeStyles.accent})` }}>
                فرستادن پروانه عشق 💬💕
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
              {notes.map(n => (
                <div
                  key={n.id}
                  style={{
                    ...ui.bubbleMessage,
                    alignSelf: n.sender.includes('آنا') ? 'flex-end' : 'flex-start',
                    background: n.sender.includes('آنا') ? '#fff0f6' : '#f0f9ff',
                    border: `2px solid ${n.sender.includes('آنا') ? '#ffccd5' : '#bae6fd'}`
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: themeStyles.primary }}>{n.sender}:</div>
                  <div style={{ marginTop: '4px', fontSize: '0.95rem', color: '#333' }}>{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۴. چک‌لیست آرزوها و ماجراجویی‌ها */}
        {activeTab === 'bucket' && (
          <div style={{ ...ui.card, background: themeStyles.cardBg }}>
            <h2 style={{ ...ui.titleText, color: themeStyles.primary }}>دفترچه آرزوها و نقشه‌های دونفره 🌟</h2>
            <form onSubmit={addBucketItem} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="یه نقشه باحال یا جای قشنگ بنویس که بریم..."
                value={newWish}
                onChange={e => setNewWish(e.target.value)}
                style={{ ...ui.inputField, flex: 1 }}
              />
              <button type="submit" style={{ ...ui.primaryBtn, background: `linear-gradient(135deg, ${themeStyles.primary}, ${themeStyles.accent})` }}>
                ثبت نقشه 🗺️
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bucketList.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleBucket(item.id, item.completed)}
                  style={{
                    ...ui.bucketCard,
                    background: item.completed ? '#e8f5e9' : '#fff',
                    borderColor: item.completed ? '#81c784' : themeStyles.border
                  }}
                >
                  <span style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#2e7d32' : '#444' }}>
                    {item.completed ? '🎉' : '🤍'} {item.task}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    {item.completed ? 'تیک خورد!' : 'کلیک برای انجام'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۵. مینی‌گیم و گردونه قرارها */}
        {activeTab === 'fun' && (
          <div style={{ ...ui.card, background: themeStyles.cardBg }}>
            <h2 style={{ ...ui.titleText, color: themeStyles.primary }}>گردونه ماجراجویی و مینی‌گیم سریع 🎡🎮</h2>

            {/* گردونه قرارهای عاشقانه */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ ...ui.spinResultBox, borderColor: themeStyles.primary }}>
                {spinResult ? spinResult : 'گردونه منتظر دستور توئه! 🎲'}
              </div>
              <button
                onClick={spinAdventures}
                disabled={isSpinning}
                style={{ ...ui.primaryBtn, background: `linear-gradient(135deg, ${themeStyles.primary}, ${themeStyles.accent})` }}
              >
                {isSpinning ? 'داره تند تند می‌چرخه... 🌀' : 'بچرخون ببینیم کجا بریم! 🍓'}
              </button>
            </div>

            {/* مینی‌گیم شکار جوجو و کروکودیل برای سرگرمی فوری */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', border: `2px solid ${themeStyles.border}`, textAlign: 'center' }}>
              <h3 style={{ color: themeStyles.primary, fontSize: '1.1rem', marginBottom: '8px' }}>بازی بازتاب سریع: جوجو رو بگیر! 🐥</h3>
              <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: '14px' }}>
                امتیاز شادی شما: <strong>{gameScore}</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button
                  onClick={() => { setGameScore(s => s + 1); spawnFloating('🐥'); }}
                  style={{ fontSize: '2.5rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}
                  className="game-target"
                >
                  🐥
                </button>
                <button
                  onClick={() => { setGameScore(s => s + 2); spawnFloating('🐊'); }}
                  style={{ fontSize: '2.5rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}
                  className="game-target"
                >
                  🐊
                </button>
                <button
                  onClick={() => { setGameScore(s => s + 3); spawnFloating('🦓'); }}
                  style={{ fontSize: '2.5rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}
                  className="game-target"
                >
                  🦓
                </button>
              </div>
            </div>
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
        .polaroid-card:hover {
          transform: rotate(0deg) scale(1.06) !important;
          z-index: 10;
        }
        .mascot-hover:hover {
          transform: scale(1.3);
          cursor: pointer;
        }
        .game-target:active {
          transform: scale(0.85);
        }
      `}</style>
    </div>
  );
}

const ui = {
  gateContainer: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle, #ffe6f0 0%, #ffafcc 100%)',
    direction: 'rtl',
    padding: '16px'
  },
  gateCard: {
    background: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(20px)',
    border: '3px solid #ffccd5',
    borderRadius: '32px',
    padding: '40px 28px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 45px rgba(255, 75, 130, 0.28)'
  },
  gateInput: {
    width: '100%',
    padding: '14px',
    borderRadius: '16px',
    border: '2px solid #ff809b',
    outline: 'none',
    textAlign: 'center',
    fontSize: '1.05rem',
    color: '#ff2a70',
    boxSizing: 'border-box'
  },
  gateBtn: {
    width: '100%',
    marginTop: '14px',
    padding: '14px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #ff2a70, #ff758c)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.05rem',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(255, 42, 112, 0.35)'
  },
  wrapper: {
    minHeight: '100vh',
    direction: 'rtl',
    paddingBottom: '70px',
    transition: 'background 0.5s ease'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    background: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(12px)',
    borderBottom: '2px solid'
  },
  miniActionBtn: {
    background: '#fff',
    border: '1px solid #ffd1dc',
    borderRadius: '16px',
    padding: '4px 10px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  musicBtn: {
    background: '#fff',
    border: '2px solid',
    padding: '6px 14px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  themeSelectorBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: 'rgba(255, 255, 255, 0.65)',
    flexWrap: 'wrap'
  },
  themeBtn: {
    border: 'none',
    padding: '6px 14px',
    borderRadius: '18px',
    fontWeight: 800,
    fontSize: '0.8rem',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 10px',
    flexWrap: 'wrap'
  },
  tabItem: {
    padding: '10px 16px',
    borderRadius: '25px',
    fontWeight: 800,
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'all 0.2s'
  },
  main: {
    maxWidth: '740px',
    margin: '10px auto',
    padding: '0 16px'
  },
  card: {
    borderRadius: '28px',
    padding: '28px',
    boxShadow: '0 18px 45px rgba(255, 143, 163, 0.25)',
    border: '2px solid #fff'
  },
  titleText: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: '1.35rem',
    marginBottom: '20px'
  },
  counterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  counterBox: {
    background: '#fff',
    border: '2px solid #ffccd5',
    borderRadius: '18px',
    padding: '14px 4px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
  },
  polaroidGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '24px',
    padding: '20px 10px'
  },
  tapeEffect: {
    width: '60px',
    height: '18px',
    background: 'rgba(255, 230, 180, 0.6)',
    margin: '-8px auto 8px',
    borderRadius: '2px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  polaroidImg: {
    width: '100%',
    height: '170px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  polaroidCaption: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
    fontWeight: 700,
    fontSize: '0.85rem',
    color: '#444'
  },
  inputField: {
    padding: '12px 16px',
    borderRadius: '16px',
    border: '2px solid #ffccd5',
    outline: 'none',
    fontSize: '0.95rem'
  },
  selectField: {
    padding: '12px',
    borderRadius: '16px',
    border: '2px solid #ffccd5',
    outline: 'none',
    fontWeight: 'bold',
    background: '#fff'
  },
  primaryBtn: {
    width: '100%',
    padding: '13px',
    borderRadius: '16px',
    border: 'none',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
  },
  bubbleMessage: {
    borderRadius: '20px',
    padding: '12px 18px',
    maxWidth: '82%',
    boxShadow: '0 3px 10px rgba(0,0,0,0.03)'
  },
  bucketCard: {
    padding: '14px 18px',
    borderRadius: '16px',
    border: '2px solid',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
  },
  spinResultBox: {
    padding: '24px',
    background: '#fff',
    border: '3px dashed',
    borderRadius: '22px',
    fontSize: '1.2rem',
    fontWeight: 900,
    color: '#ff2a70',
    marginBottom: '15px'
  }
};