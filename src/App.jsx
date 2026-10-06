import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// اتصال به پروژه سوپابیس اختصاصی شما
const SUPABASE_URL = 'https://ivfksnobyapzizntmgcf.supabase.co';
// کلید عمومی پروژه (anon public key را از تب Project Settings > API بردار یا کلید پیش‌فرض را بذار)
const SUPABASE_ANON_KEY = 'sb_publishable_DWH7XNd9-kG0943xm4AVaA_9b5zIem0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);
  const [activeTab, setActiveTab] = useState('hub');
  const [isPlaying, setIsPlaying] = useState(false);

  // استیت‌های دیتابیس آنلاین
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [author, setAuthor] = useState('طاها');
  const [photos, setPhotos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [bucketList, setBucketList] = useState([]);
  const [newWish, setNewWish] = useState('');
  const [mood, setMood] = useState({ ana: '🌸 پرانرژی و درخشان', taha: '💖 غرق در عشق تو' });

  // تعاملی و پرانرژی
  const [hearts, setHearts] = useState([]);
  const [dopaminePoints, setDopaminePoints] = useState(0);
  const [currentCompliment, setCurrentCompliment] = useState('دکمه زیر رو بزن تا راز خوشگلیتو بهت بگم 🍓');
  const [spinResult, setSpinResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // تایمر رابطه از ۸ آگوست ۲۰۲۶
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

  // بارگذاری داده‌ها از دیتابیس
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
      triggerHearts();
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
      triggerHearts();
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
    }
  };

  const toggleBucket = async (id, currentStatus) => {
    await supabase.from('bucket_list').update({ completed: !currentStatus }).eq('id', id);
    setBucketList(bucketList.map(item => item.id === id ? { ...item, completed: !currentStatus } : item));
    triggerHearts();
  };

  // باران قلب
  const triggerHearts = () => {
    setDopaminePoints(prev => prev + 1);
    const id = Date.now();
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: id + i,
      left: Math.random() * 90 + 5,
      duration: Math.random() * 1.5 + 1.2
    }));
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
    }, 2600);
  };

  const compliments = [
    "آنا، درخشش چشم‌هات قشنگ‌ترین موج نور کائنات برای منه! ✨💖",
    "این که فکرت با سرعت نور پرواز می‌کنه همون جادوییه که دیوونشم 🌸",
    "تو شیرین‌ترین و نازترین توت‌فرنگی این دنیایی 🍓🎀",
    "یادت باشه تو هر ثانیه از شبانه‌روز، یکی هست که با تمام وجود حواسش بهته 🤍",
    "صدای خنده‌‌هات جذاب‌ترین قطعه موسیقیه که شنیدم 🎶💕"
  ];

  const dateIdeas = [
    "شام شبانه و قدم زدن زیر نورهای پل خواجو 🌉",
    "سفارش پیتزا قارچ و گوشت و مسابقه تو ویدیوگیم 🍕🎮",
    "خوردن وافل توت‌فرنگی با نوتلای اضافه تو کافه صورتی 🍓☕",
    "درست کردن اسموتی میوه‌ای دوتایی با خنده‌های بی‌وقفه 🥤",
    "دیدن یه فیلم هیجان‌انگیز و بغل کردن بالش‌ها 🍿"
  ];

  const spinDate = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setSpinResult(dateIdeas[Math.floor(Math.random() * dateIdeas.length)]);
      count++;
      if (count > 16) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 70);
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (['0808', 'ana', 'taha', '1405'].includes(passcode.trim().toLowerCase())) {
      setUnlocked(true);
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

  if (!unlocked) {
    return (
      <div style={styles.gate}>
        <div style={styles.gateBox}>
          <div style={{ fontSize: '3.6rem', marginBottom: '10px' }}>🎀🍓💖</div>
          <h1 style={{ color: '#ff2a70', fontSize: '1.9rem', fontWeight: 900, marginBottom: '8px' }}>
            قلمرو عشق طاها و آنا
          </h1>
          <p style={{ color: '#ff7096', fontSize: '0.95rem', marginBottom: '22px' }}>
            کلید ورود به امن‌ترین و زیباترین کهکشان دو نفره‌مون رو وارد کن ✨
          </p>
          <form onSubmit={handleUnlock}>
            <input
              type="password"
              placeholder="رمز ورود (0808 یا ana)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={styles.gateInput}
            />
            <button type="submit" style={styles.gateSubmit}>
              ورود به دنیای ما 🗝️🌸
            </button>
          </form>
          {passError && <p style={{ color: '#ff0055', marginTop: '12px', fontWeight: 'bold' }}>رمز اشتباهه خوشگلم! دوباره بزن 🥺</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* موزیک بی‌‌نظیر و لطیف پیانو والز فرانسوی */}
      <audio
        id="bg-music"
        loop
        src="https://cdn.pixabay.com/download/audio/2022/11/06/audio_c35f2991cf.mp3?filename=waltz-of-the-flowers-romantic-piano-126231.mp3"
      />

      {/* باران انیمیشنی قلب */}
      {hearts.map(h => (
        <span
          key={h.id}
          style={{
            position: 'fixed',
            left: `${h.left}%`,
            bottom: '0px',
            fontSize: '2rem',
            animation: `floatUp ${h.duration}s linear forwards`,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          💖
        </span>
      ))}

      {/* نوار بالایی */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>🍓</span>
          <span style={{ fontWeight: 900, color: '#ff2a70', fontSize: '1.25rem' }}>Taha & Ana's Pink Universe</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={triggerHearts} style={styles.heartRainBtn}>
            باران قلب! ⚡ ({dopaminePoints})
          </button>
          <button onClick={toggleMusic} style={styles.soundBtn}>
            {isPlaying ? '⏸ نوای پیانو' : '🎶 پخش والس پیانو'}
          </button>
        </div>
      </header>

      {/* منوی دسترسی به صفحات مختلف */}
      <nav style={styles.tabsNav}>
        {[
          { id: 'hub', label: 'شمارنده و مدار ما 🌸' },
          { id: 'chat', label: 'یادداشت‌های مخفی (Live) 💬' },
          { id: 'gallery', label: 'آلبوم عکس‌های ابری 📸' },
          { id: 'bucket', label: 'چک‌‌لیست آرزوها ✨' },
          { id: 'fun', label: 'گردونه قرارها 🎡' },
          { id: 'spark', label: 'جعبه لبخند و انرژی 🍬' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              ...styles.tabLink,
              background: activeTab === t.id ? 'linear-gradient(135deg, #ff2a70, #ff758c)' : '#fff',
              color: activeTab === t.id ? '#fff' : '#c2185b',
              border: activeTab === t.id ? 'none' : '2px solid #ffccd5'
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* پنل‌های تعاملی اصلی */}
      <main style={styles.content}>
        {/* ۱. هاب و شمارنده زمان */}
        {activeTab === 'hub' && (
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>ثانیه‌شمار ابدیت با تو ⏳💕</h2>
            <div style={styles.timerRow}>
              <div style={styles.timerBlock}><span>{timeTogether.days}</span><label>روز</label></div>
              <div style={styles.timerBlock}><span>{timeTogether.hours}</span><label>ساعت</label></div>
              <div style={styles.timerBlock}><span>{timeTogether.minutes}</span><label>دقیقه</label></div>
              <div style={styles.timerBlock}><span>{timeTogether.seconds}</span><label>ثانیه</label></div>
            </div>
            <p style={{ textAlign: 'center', color: '#ff2a70', marginTop: '22px', fontWeight: 700, fontSize: '1.05rem' }}>
              «از ۸ آگوست ۲۰۲۶ تا همیشه؛ هر تپش قلبم گواهی میده که دنیای من با تو قشنگ‌تره...»
            </p>

            <div style={{ marginTop: '30px', padding: '20px', background: '#fff5f8', borderRadius: '20px', border: '2px dashed #ff8fa3' }}>
              <h3 style={{ color: '#d81b60', fontSize: '1.1rem', marginBottom: '10px' }}>وضعیت هوای قلب ما دوتا ☁️💖</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px' }}>
                <div style={styles.moodBadge}>
                  <strong>حال طاها:</strong>
                  <span>{mood.taha}</span>
                </div>
                <div style={styles.moodBadge}>
                  <strong>حال آنا:</strong>
                  <span>{mood.ana}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ۲. چت‌باکس و یادداشت‌های ابری با Supabase */}
        {activeTab === 'chat' && (
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>صندوقچه یادداشت‌های مخفی (آنلاین) 💌</h2>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: '18px', fontSize: '0.9rem' }}>
              هر پیامی اینجا بنویسی مستقیماً توی دیتابیس ابری ذخیره میشه تا دوتامون ببینیم!
            </p>

            <form onSubmit={addNote} style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select value={author} onChange={e => setAuthor(e.target.value)} style={styles.selectStyle}>
                  <option value="طاها">از طرف طاها 🤴🏻</option>
                  <option value="آنا">از طرف آنا 👸🏼</option>
                </select>
                <input
                  type="text"
                  placeholder="یه حرف عاشقانه یا یادداشت قشنگ بنویس..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  style={{ ...styles.inputStyle, flex: 1 }}
                />
              </div>
              <button type="submit" style={styles.actionBtn}>ارسال به صندوقچه مخفی ✨</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
              {notes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>هنوز پیامی ثبت نشده، اولین پیام رو بنویس! 🍓</p>
              ) : (
                notes.map(n => (
                  <div key={n.id} style={{ ...styles.noteItem, alignSelf: n.sender === 'آنا' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ fontSize: '0.8rem', color: '#ff2a70', fontWeight: 'bold' }}>{n.sender}:</div>
                    <div style={{ fontSize: '0.95rem', color: '#333', marginTop: '4px' }}>{n.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ۳. گالری عکس‌های آپلود شده دونفره */}
        {activeTab === 'gallery' && (
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>آلبوم عکس‌ها و لحظات ناب 📸🌸</h2>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: '16px', fontSize: '0.9rem' }}>
              لینک مستقیم عکس‌های قشنگمون رو بذار تا توی آلبوم ابدی ما ثبت بشه:
            </p>

            <form onSubmit={addPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              <input
                type="text"
                placeholder="لینک مستقیم تصویر (مثلاً از سایت‌های آپلود عکس)"
                value={newPhotoUrl}
                onChange={e => setNewPhotoUrl(e.target.value)}
                style={styles.inputStyle}
              />
              <input
                type="text"
                placeholder="کپشن یا خاطره مربوط به این عکس..."
                value={photoCaption}
                onChange={e => setPhotoCaption(e.target.value)}
                style={styles.inputStyle}
              />
              <button type="submit" style={styles.actionBtn}>افزودن به گالری دونفره 🎀</button>
            </form>

            <div style={styles.galleryGrid}>
              {photos.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#aaa', padding: '20px' }}>
                  عکسی ثبت نشده، عکس سفر اصفهان یا سلفی‌هامون رو اضافه کن! 📷
                </div>
              ) : (
                photos.map(p => (
                  <div key={p.id} style={styles.photoCard}>
                    <img src={p.image_url} alt={p.title} style={styles.photoImg} />
                    {p.title && <div style={styles.photoCaption}>{p.title}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ۴. چک‌لیست و آرزوهای مشترک */}
        {activeTab === 'bucket' && (
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>دفترچه اهداف و آرزوهای مشترک ✨</h2>
            <form onSubmit={addBucketItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="یه قرار جدید، یه سفر باهم، یا یه هدف مشترک بنویس..."
                value={newWish}
                onChange={e => setNewWish(e.target.value)}
                style={{ ...styles.inputStyle, flex: 1 }}
              />
              <button type="submit" style={styles.actionBtn}>ثبت آرزو 🌟</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bucketList.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleBucket(item.id, item.completed)}
                  style={{
                    ...styles.bucketItem,
                    background: item.completed ? '#e8f5e9' : '#fff5f8',
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? '#2e7d32' : '#c2185b'
                  }}
                >
                  <span>{item.completed ? '✅' : '🤍'} {item.task}</span>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>{item.completed ? 'انجام شد!' : 'کلیک کن برای تیک زدن'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۵. گردونه تصمیم‌گیری برای قرارها */}
        {activeTab === 'fun' && (
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>گردونه انتخاب ماجراجویی‌های عاشقانه 🎡🍕</h2>
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div style={styles.spinBox}>
                {spinResult ? spinResult : 'روی دکمه زیر بزن تا گردونه برامون برنامه بچینه! 🎲'}
              </div>
              <button onClick={spinDate} disabled={isSpinning} style={styles.actionBtn}>
                {isSpinning ? 'در حال چرخش هیجان‌انگیز... 🌀' : 'بچرخونش پرنسس! 🍓'}
              </button>
            </div>
          </div>
        )}

        {/* ۶. جعبه حال خوب و پمپاژ شادی */}
        {activeTab === 'spark' && (
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>جعبه اختصاصی لبخند و حس ناب 🍬💖</h2>
            <div style={styles.complimentContainer}>
              <p style={{ fontSize: '1.15rem', color: '#ff0055', fontWeight: 800 }}>{currentCompliment}</p>
            </div>
            <button
              onClick={() => setCurrentCompliment(compliments[Math.floor(Math.random() * compliments.length)])}
              style={{ ...styles.actionBtn, marginTop: '16px' }}
            >
              یه یادآوری قشنگ دیگه بهم بده! 🌸
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          100% { transform: translateY(-100vh) scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  gate: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle, #ffe3ec 0%, #ffafcc 100%)',
    direction: 'rtl',
    padding: '16px'
  },
  gateBox: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '2px solid #ffb3c6',
    borderRadius: '32px',
    padding: '40px 28px',
    textAlign: 'center',
    maxWidth: '380px',
    width: '100%',
    boxShadow: '0 20px 45px rgba(255, 75, 130, 0.25)'
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
  gateSubmit: {
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
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #fff0f5 0%, #ffe3ea 100%)',
    direction: 'rtl',
    paddingBottom: '60px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 24px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '2px solid #ffccd5'
  },
  heartRainBtn: {
    background: '#ff2a70',
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '24px',
    fontWeight: 800,
    fontSize: '0.85rem',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 42, 112, 0.3)'
  },
  soundBtn: {
    background: '#fff',
    border: '2px solid #ff758c',
    color: '#ff2a70',
    padding: '6px 14px',
    borderRadius: '24px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  tabsNav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 10px',
    flexWrap: 'wrap'
  },
  tabLink: {
    padding: '10px 18px',
    borderRadius: '25px',
    fontWeight: 800,
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 175, 204, 0.25)',
    transition: 'all 0.2s'
  },
  content: {
    maxWidth: '720px',
    margin: '10px auto',
    padding: '0 16px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '28px',
    padding: '28px',
    boxShadow: '0 18px 40px rgba(255, 143, 163, 0.25)',
    border: '2px solid #fff'
  },
  sectionHeading: {
    textAlign: 'center',
    color: '#ff2a70',
    fontWeight: 900,
    fontSize: '1.35rem',
    marginBottom: '20px'
  },
  timerRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  timerBlock: {
    background: 'linear-gradient(145deg, #fff2f6, #ffe0ea)',
    border: '2px solid #ffb3c6',
    borderRadius: '18px',
    padding: '16px 4px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(255, 42, 112, 0.1)'
  },
  moodBadge: {
    background: '#fff',
    border: '2px solid #ffccd5',
    padding: '12px 18px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.95rem'
  },
  inputStyle: {
    padding: '12px 16px',
    borderRadius: '16px',
    border: '2px solid #ffb3c6',
    outline: 'none',
    fontSize: '0.95rem'
  },
  selectStyle: {
    padding: '12px',
    borderRadius: '16px',
    border: '2px solid #ffb3c6',
    outline: 'none',
    fontWeight: 'bold',
    color: '#ff2a70',
    background: '#fff'
  },
  actionBtn: {
    width: '100%',
    padding: '13px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #ff2a70, #ff758c)',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(255, 42, 112, 0.3)'
  },
  noteItem: {
    background: '#fff0f5',
    border: '2px solid #ffd1dc',
    borderRadius: '18px',
    padding: '12px 18px',
    maxWidth: '80%'
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '14px',
    marginTop: '15px'
  },
  photoCard: {
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid #ffccd5',
    boxShadow: '0 6px 15px rgba(0,0,0,0.06)'
  },
  photoImg: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    display: 'block'
  },
  photoCaption: {
    padding: '8px',
    fontSize: '0.85rem',
    textAlign: 'center',
    background: '#fff',
    color: '#ff2a70',
    fontWeight: 'bold'
  },
  bucketItem: {
    padding: '14px 18px',
    borderRadius: '16px',
    border: '2px solid #ffd1dc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
  },
  spinBox: {
    padding: '28px',
    background: '#fff0f5',
    border: '3px dashed #ff2a70',
    borderRadius: '24px',
    fontSize: '1.25rem',
    fontWeight: 900,
    color: '#ff2a70',
    marginBottom: '16px'
  },
  complimentContainer: {
    background: '#fff0f5',
    padding: '28px 20px',
    borderRadius: '22px',
    textAlign: 'center',
    border: '2px solid #ffb3c6',
    minHeight: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};