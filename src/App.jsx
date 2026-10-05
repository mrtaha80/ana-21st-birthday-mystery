import React, { useState, useEffect } from 'react';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);
  const [activeTab, setActiveTab] = useState('universe');
  const [isPlaying, setIsPlaying] = useState(false);

  // شمارنده عشق از ۸ آگوست ۲۰۲۶
  const [timeTogether, setTimeTogether] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const startDate = new Date('2026-08-08T00:00:00');
    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, now - startDate);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeTogether({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    // رمز عبور ورود (می‌توانی تغییر دهی: مثلا تاریخ یا 0808)
    if (passcode.trim() === '0808' || passcode.trim().toLowerCase() === 'ana') {
      setUnlocked(true);
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  const toggleMusic = () => {
    const audio = document.getElementById('bg-music');
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!unlocked) {
    return (
      <div style={gateStyles.container}>
        <div style={gateStyles.card}>
          <div style={gateStyles.heartPulse}>❤️</div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '8px' }}>دنیای اختصاصی طاها و آنا</h1>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px' }}>کلید ورود به کهکشان ما را وارد کن</p>
          <form onSubmit={handleUnlock}>
            <input
              type="password"
              placeholder="رمز عبور دلخواه (مثلاً 0808)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={{
                ...gateStyles.input,
                borderColor: passError ? '#ff4d4f' : 'rgba(255,255,255,0.2)'
              }}
            />
            <button type="submit" style={gateStyles.button}>گشودن دروازه ✨</button>
          </form>
          {passError && <p style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '10px' }}>رمز اشتباه است عشق من!</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={appStyles.layout}>
      {/* موزیک پلیر پس‌زمینه */}
      <audio id="bg-music" loop src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-atmosphere-112195.mp3" />

      {/* هدر بالایی و پلیر شناور */}
      <header style={appStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🌌</span>
          <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>Taha & Ana's Universe</span>
        </div>
        <button onClick={toggleMusic} style={appStyles.musicBtn}>
          {isPlaying ? '⏸ قطع موزیک عاشقانه' : '🎵 پخش موزیک عاشقانه'}
        </button>
      </header>

      {/* نویگیشن تب‌ها */}
      <nav style={appStyles.nav}>
        {[
          { id: 'universe', label: 'داشبورد ما' },
          { id: 'timeline', label: 'مسیر عاشقی' },
          { id: 'letters', label: 'کپسول نامه‌ها' },
          { id: 'emergency', label: 'دلتنگ شدم ❤️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...appStyles.tabBtn,
              borderBottom: activeTab === tab.id ? '2px solid #e056fd' : 'none',
              color: activeTab === tab.id ? '#fff' : '#888'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={appStyles.main}>
        {activeTab === 'universe' && (
          <div style={appStyles.section}>
            <h2 style={appStyles.sectionTitle}>چقدر از آغاز یکی‌شدنمان می‌گذرد؟</h2>
            <div style={appStyles.counterGrid}>
              <div style={appStyles.counterCard}><span>{timeTogether.days}</span><label>روز</label></div>
              <div style={appStyles.counterCard}><span>{timeTogether.hours}</span><label>ساعت</label></div>
              <div style={appStyles.counterCard}><span>{timeTogether.minutes}</span><label>دقیقه</label></div>
              <div style={appStyles.counterCard}><span>{timeTogether.seconds}</span><label>ثانیه</label></div>
            </div>
            <p style={{ textAlign: 'center', color: '#ff7979', marginTop: '20px', fontStyle: 'italic' }}>
              «از ۸ آگوست، هر ثانیه با تو جهان من روشن‌تر شد...»
            </p>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div style={appStyles.section}>
            <h2 style={appStyles.sectionTitle}>ایستگاه‌های سرنوشت</h2>
            <div style={appStyles.timeline}>
              <div style={appStyles.timelineItem}>
                <span style={appStyles.timelineBadge}>۸ آگوست ۲۰۲۶</span>
                <h3>نقطه عطف جهان: شروع ما</h3>
                <p>روزی که قلب‌هایمان به هم پیوند خورد و این قصه عاشقانه آغاز شد.</p>
              </div>
              <div style={appStyles.timelineItem}>
                <span style={appStyles.timelineBadge}>قرار اصفهان</span>
                <h3>دیدار چشم‌هایت در پایتخت هنر</h3>
                <p>قدم زدن زیر سایه پل‌ها و ثبت ماندگارترین خاطره عمرمان.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'letters' && (
          <div style={appStyles.section}>
            <h2 style={appStyles.sectionTitle}>کپسول نامه‌های قفل‌شده</h2>
            <div style={appStyles.letterCard}>
              <h3>نامه اول: برای لحظه‌ای که این سایت را باز می‌کنی 💌</h3>
              <p>
                آنای عزیزم، اگر داری این متن را می‌خوانی یعنی این وب‌سایت کوچک توانسته پلی باشد بین قلب من و تو. تک‌تک خط‌های این کد را برای نشاندن لبخند روی لب‌های تو نوشتم...
              </p>
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div style={{ ...appStyles.section, textAlign: 'center' }}>
            <h2 style={{ color: '#ff4d4f' }}>کیت اضطراری دلتنگی ❤️</h2>
            <p style={{ color: '#ccc', lineHeight: '1.8' }}>
              هر زمان حس کردی فاصله‌ها زیاد شده یا دلت گرفت، چشم‌هایت را ببند و یادت باشد:
              هیچ مسافتی زورش به عشقی که برایت در قلبم ساخته‌ام نمی‌رسد. من همیشه و همه‌جا کنارت هستم.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

const gateStyles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle at center, #1a0826 0%, #05010a 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    direction: 'rtl'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    padding: '40px',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    maxWidth: '360px',
    width: '90%'
  },
  heartPulse: { fontSize: '3rem', marginBottom: '15px' },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    textAlign: 'center'
  },
  button: {
    width: '100%',
    marginTop: '15px',
    padding: '12px',
    background: 'linear-gradient(135deg, #e056fd 0%, #686de0 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

const appStyles = {
  layout: {
    minHeight: '100vh',
    background: '#0a0512',
    color: '#fff',
    direction: 'rtl',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 25px',
    background: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  musicBtn: {
    background: 'rgba(224, 86, 253, 0.15)',
    border: '1px solid #e056fd',
    color: '#e056fd',
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer'
  },
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '15px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '0.95rem',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  main: { maxWidth: '700px', margin: '30px auto', padding: '0 20px' },
  section: {
    background: 'rgba(255,255,255,0.03)',
    padding: '25px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  sectionTitle: { textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem', color: '#e056fd' },
  counterGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  counterCard: {
    background: 'rgba(0,0,0,0.4)',
    padding: '15px 5px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
  },
  timeline: { borderRight: '2px solid #e056fd', paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  timelineItem: { position: 'relative' },
  timelineBadge: { fontSize: '0.75rem', background: '#e056fd', padding: '2px 8px', borderRadius: '10px' },
  letterCard: { background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', lineHeight: '1.8', color: '#ddd' }
};