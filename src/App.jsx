import React, { useState, useEffect } from 'react';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);
  const [activeTab, setActiveTab] = useState('hub');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // دوپامین و فان برای ADHD
  const [dopamineCount, setDopamineCount] = useState(0);
  const [hearts, setHearts] = useState([]);
  const [currentCompliment, setCurrentCompliment] = useState('روی دکمه زیر بزن تا یه حقیقت قشنگ بشنوی ✨');
  const [spinnerResult, setSpinnerResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // شمارنده دقیق عاشقی از ۸ آگوست ۲۰۲۶
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

  // باران قلب هنگام کلیک
  const triggerHearts = () => {
    setDopamineCount(prev => prev + 1);
    const id = Date.now();
    const newHearts = Array.from({ length: 12 }).map((_, i) => ({
      id: id + i,
      left: Math.random() * 90 + 5,
      animationDuration: Math.random() * 1.5 + 1.2
    }));
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
    }, 2500);
  };

  const compliments = [
    "آنا، خنده‌هات قشنگ‌ترین دوپامین جهان برای مغز منه! 💕",
    "ذهن شلوغ و خلاقت همون چیزیه که منو دیوونه خودش کرده 🌸",
    "تو قشنگ‌ترین صورتی‌ترین اتفاق تاریخ زندگی طاهایی ✨",
    "یادت نره امروز آب بخوری، استراحت کنی و بدونی بی‌نهایت دوستت دارم 🍓",
    "چشم‌هات زیباترین تابلوی نقاشی دنیاست 🎀",
    "هیچ‌کس توی دنیا شبیه تو نیست؛ تو یه شاهکار نایابی 💖"
  ];

  const dateIdeas = [
    "بستنی قیفی خوردن شبونه تو پیاده‌رو 🍦",
    "دیدن یه فیلم ترسناک در حالی که دستت تو دست منه 🍿",
    "قهوه خوردن تو یه کافه دنج با نور صورتی ☕",
    "پیاده‌روی بدون مقصد تو خیابون‌های اصفهان 🌉",
    "سفارش پیتزا و با هم گیم بازی کردن 🍕🎮",
    "پختن یه دسر نوتلایی باهمدیگه 🍫"
  ];

  const spinDateWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinnerResult(null);
    let count = 0;
    const interval = setInterval(() => {
      setSpinnerResult(dateIdeas[Math.floor(Math.random() * dateIdeas.length)]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 80);
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
      <div style={ui.gateContainer}>
        <div style={ui.floatingBubble1}></div>
        <div style={ui.floatingBubble2}></div>
        <div style={ui.gateCard}>
          <div style={{ fontSize: '3.5rem', animation: 'bounce 1.5s infinite' }}>🌸💖🍓</div>
          <h1 style={{ color: '#ff2d75', fontSize: '1.8rem', fontWeight: 900, margin: '12px 0' }}>
            بهشت خصوصی طاها و آنا
          </h1>
          <p style={{ color: '#ff7597', fontSize: '0.95rem', marginBottom: '24px' }}>
            کلید کهکشان صورتی‌مون رو وارد کن پرنسس ✨
          </p>
          <form onSubmit={handleUnlock}>
            <input
              type="password"
              placeholder="رمز عبور (مثلاً 0808)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={ui.input}
            />
            <button type="submit" style={ui.pinkButton}>ورود به سرزمینمون 🗝️🎀</button>
          </form>
          {passError && <p style={{ color: '#ff0055', marginTop: '12px', fontWeight: 'bold' }}>رمز اشتباهه خوشگلم! دوباره بزن 🥺</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={ui.wrapper}>
      <audio id="bg-music" loop src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-atmosphere-112195.mp3" />

      {/* باران قلب انیمیشنی روی صفحه */}
      {hearts.map(h => (
        <span
          key={h.id}
          style={{
            position: 'fixed',
            left: `${h.left}%`,
            bottom: '0px',
            fontSize: '1.8rem',
            animation: `floatUp ${h.animationDuration}s linear forwards`,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          💖
        </span>
      ))}

      {/* هدر بالای صفحه */}
      <header style={ui.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.6rem' }}>🍓</span>
          <span style={{ fontWeight: 900, color: '#ff2d75', fontSize: '1.2rem' }}>Taha & Ana World</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={triggerHearts} style={ui.dopamineBtn}>
            تزریق دوپامین! ⚡ ({dopamineCount})
          </button>
          <button onClick={toggleMusic} style={ui.musicBtn}>
            {isPlaying ? '⏸ قطع آهنگ' : '🎶 پخش نوای عشق'}
          </button>
        </div>
      </header>

      {/* منوی تب‌های تعاملی صورتی */}
      <nav style={ui.tabContainer}>
        {[
          { id: 'hub', label: 'داشبورد صورتی 🌸' },
          { id: 'dopamine', label: 'دوز شادی و ADHD ⚡' },
          { id: 'timeline', label: 'ردپای عاشقی 🗺️' },
          { id: 'fun', label: 'گردونه قرارها 🎡' },
          { id: 'letters', label: 'کپسول دلتنگی 💌' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...ui.tabItem,
              background: activeTab === tab.id ? 'linear-gradient(135deg, #ff2d75, #ff758c)' : 'rgba(255,255,255,0.7)',
              color: activeTab === tab.id ? '#fff' : '#b83b5e',
              transform: activeTab === tab.id ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* بدنه محتوا */}
      <main style={ui.main}>
        {activeTab === 'hub' && (
          <div style={ui.card}>
            <h2 style={ui.titlePink}>چند وقته که صاحب قلب منی؟ ⏳💖</h2>
            <div style={ui.counterGrid}>
              <div style={ui.counterBox}><span>{timeTogether.days}</span><label>روز</label></div>
              <div style={ui.counterBox}><span>{timeTogether.hours}</span><label>ساعت</label></div>
              <div style={ui.counterBox}><span>{timeTogether.minutes}</span><label>دقیقه</label></div>
              <div style={ui.counterBox}><span>{timeTogether.seconds}</span><label>ثانیه</label></div>
            </div>
            <p style={{ textAlign: 'center', color: '#ff2d75', margin: '20px 0 10px', fontWeight: 600 }}>
              «از ۸ آگوست ۲۰۲۶ تا به این ثانیه، تمام ضربان‌های قلب من به نام تو سند خورده...»
            </p>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button onClick={triggerHearts} style={ui.bigHeartBtn}>
                رو من کلیک کن تا قلب بباره رو سرت! 🎈
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dopamine' && (
          <div style={ui.card}>
            <h2 style={ui.titlePink}>بخش اختصاصی شارژ سریع مغز آنا 🧠✨</h2>
            <p style={{ textAlign: 'center', color: '#888', marginBottom: '18px' }}>
              مخصوص وقتایی که اورثینک داری، حوصلت سر رفته یا مغزت شلوغ پلوغه!
            </p>
            <div style={ui.complimentBox}>
              <p style={{ fontSize: '1.1rem', color: '#ff0055', fontWeight: 700 }}>{currentCompliment}</p>
            </div>
            <button
              onClick={() => setCurrentCompliment(compliments[Math.floor(Math.random() * compliments.length)])}
              style={{ ...ui.pinkButton, marginTop: '15px' }}
            >
              یه حقیقت دیگه راجع به قشنگیت بگو! 🍬
            </button>

            <div style={{ marginTop: '30px', padding: '16px', background: '#fff0f5', borderRadius: '16px' }}>
              <h3 style={{ color: '#d81b60', fontSize: '1.05rem', marginBottom: '8px' }}>چک‌لیست فوری حال‌خوب‌کن 🌸</h3>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.2', color: '#555' }}>
                <li>🥤 یه قلپ آب خنک بخور</li>
                <li>🧘‍♀️ شونه‌هاتو شل کن و فکتو رها کن</li>
                <li>🤍 یادت بیار که طاها همیشه مراقبته و هواتو داره</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'fun' && (
          <div style={ui.card}>
            <h2 style={ui.titlePink}>گردونه تصمیم‌گیری برای قرارهای عاشقانه 🎡🍕</h2>
            <p style={{ textAlign: 'center', color: '#777', marginBottom: '20px' }}>
              وقتایی که نمی‌دونیم چیکار کنیم یا کجا بریم، بذار گردونه برامون تصمیم بگیره!
            </p>
            <div style={{ textAlign: 'center' }}>
              <div style={ui.spinnerDisplay}>
                {spinnerResult ? spinnerResult : 'گردونه منتظر چرخش توئه!'}
              </div>
              <button onClick={spinDateWheel} disabled={isSpinning} style={ui.pinkButton}>
                {isSpinning ? 'داره می‌چرخه... 🌀' : 'بچرخونش ببینیم چی میاد! 🎲'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div style={ui.card}>
            <h2 style={ui.titlePink}>ایستگاه‌های داستان کهکشانی ما 🎀🗺️</h2>
            <div style={ui.timeline}>
              <div style={ui.timelineItem}>
                <div style={ui.timelineDot}>🌸</div>
                <h3 style={{ color: '#ff2d75', margin: '4px 0' }}>۸ آگوست ۲۰۲۶: روز انفجار نور</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>روزی که قصه‌مون شروع شد و دنیام رنگ صورتی و قشنگی به خودش گرفت.</p>
              </div>
              <div style={ui.timelineItem}>
                <div style={ui.timelineDot}>🌉</div>
                <h3 style={{ color: '#ff2d75', margin: '4px 0' }}>سفر اصفهان: دیدار چشم‌های ماهت</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>کنار سی‌وسه‌پل و کوچه‌های دنج، دست تو توی دست من؛ زیباترین صحنه کل دنیا.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'letters' && (
          <div style={ui.card}>
            <h2 style={ui.titlePink}>کیت اضطراری دلتنگی و نامه‌ها 💌🥺</h2>
            <div style={{ background: '#fff0f6', padding: '20px', borderRadius: '18px', border: '2px dashed #ff7597' }}>
              <h3 style={{ color: '#ff2d75', marginBottom: '10px' }}>برای آنا، زیباترین پروانه زندگی من 💕</h3>
              <p style={{ lineHeight: '2', color: '#444' }}>
                آنای قشنگم، هروقت ذهنت شلوغ شد یا دلت گرفت، این صفحه رو باز کن. تمام این کدها، رنگ‌ها، و کلمه‌ها فقط برای اینه که بدونی یه نفر همیشه با تموم وجودش عاشقت هست. مهم نیست چقدر فاصله باشه، من همیشه کنارت و تکیه‌گاهتم.
              </p>
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
    background: 'radial-gradient(circle, #ffe6f0 0%, #ffb6c1 100%)',
    position: 'relative',
    overflow: 'hidden',
    direction: 'rtl'
  },
  floatingBubble1: {
    position: 'absolute',
    top: '-50px',
    left: '-50px',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'rgba(255, 45, 117, 0.15)',
    filter: 'blur(40px)'
  },
  floatingBubble2: {
    position: 'absolute',
    bottom: '-50px',
    right: '-50px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255, 117, 140, 0.25)',
    filter: 'blur(50px)'
  },
  gateCard: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    border: '2px solid #ffccd5',
    borderRadius: '30px',
    padding: '40px 30px',
    textAlign: 'center',
    maxWidth: '380px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(255, 105, 180, 0.25)',
    zIndex: 2
  },
  input: {
    width: '100%',
    padding: '14px',
    borderRadius: '16px',
    border: '2px solid #ff8fa3',
    background: '#fff',
    outline: 'none',
    textAlign: 'center',
    fontSize: '1rem',
    color: '#ff2d75',
    boxSizing: 'border-box'
  },
  pinkButton: {
    width: '100%',
    marginTop: '12px',
    padding: '14px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #ff2d75, #ff758c)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(255, 45, 117, 0.35)',
    transition: 'all 0.2s'
  },
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #fff0f5 0%, #ffe4e9 100%)',
    direction: 'rtl',
    paddingBottom: '50px'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '2px solid #ffd1dc'
  },
  dopamineBtn: {
    background: '#ff2d75',
    border: 'none',
    color: '#fff',
    padding: '8px 14px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 45, 117, 0.3)'
  },
  musicBtn: {
    background: '#fff',
    border: '2px solid #ff7597',
    color: '#ff2d75',
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 10px',
    flexWrap: 'wrap'
  },
  tabItem: {
    border: 'none',
    padding: '10px 16px',
    borderRadius: '25px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 182, 193, 0.3)',
    transition: 'all 0.2s'
  },
  main: {
    maxWidth: '650px',
    margin: '10px auto',
    padding: '0 16px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '26px',
    padding: '28px',
    boxShadow: '0 15px 35px rgba(255, 182, 193, 0.35)',
    border: '2px solid #fff'
  },
  titlePink: {
    textAlign: 'center',
    color: '#ff2d75',
    fontWeight: 900,
    fontSize: '1.3rem',
    marginBottom: '20px'
  },
  counterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  counterBox: {
    background: 'linear-gradient(145deg, #fff5f8, #ffe0e9)',
    border: '2px solid #ffb6c1',
    borderRadius: '18px',
    padding: '16px 6px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(255, 105, 180, 0.15)'
  },
  bigHeartBtn: {
    background: 'linear-gradient(135deg, #ff0844, #ffb199)',
    color: '#fff',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '30px',
    fontSize: '1rem',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(255, 8, 68, 0.4)'
  },
  complimentBox: {
    background: '#fff0f5',
    padding: '24px',
    borderRadius: '20px',
    textAlign: 'center',
    border: '2px solid #ffc2d1',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinnerDisplay: {
    padding: '26px',
    background: '#fff5f8',
    border: '3px dashed #ff2d75',
    borderRadius: '20px',
    fontSize: '1.2rem',
    fontWeight: 900,
    color: '#ff2d75',
    marginBottom: '15px'
  },
  timeline: {
    paddingRight: '20px',
    borderRight: '3px solid #ff7597',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  timelineItem: { position: 'relative' },
  timelineDot: {
    position: 'absolute',
    right: '-32px',
    top: '0',
    fontSize: '1.2rem'
  }
};