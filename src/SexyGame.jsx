import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ivfksnobyapzizntmgcf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DWH7XNd9-kG0943xm4AVaA_9b5zIem0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// چالش‌های پایه
const DEFAULT_DARES_ANA = [
  "ثبت سلفی با استایل شبانه و نگاه خاص برای آلبوم اختصاصی 📸✨",
  "۳۰ ثانیه لمس آرام و بوسیدن لاله گوش و گردن طاها 🐊💋",
  "نجوا کردن یک خواسته و فانتزی پنهان در فاصله یک سانتی‌متری 🤫",
  "اجرای یک فرمان دونفره بدون مخالفت تا پایان راند 🗝️"
];

const DEFAULT_DARES_TAHA = [
  "۵ دقیقه ماساژ آرام و عمیق شانه و گردن پرنسس با لوسیون 💆‍♂️✨",
  "ثبت یک عکس جذاب با استایل مدنظر آنا برای گالری شخصی 📸💪",
  "پذیرش کامل یک فرماندهی شبانه از سمت آنا بدون چون‌وچرا 👸🏼",
  "بوسیدن دست‌ها و بیان صادقانه یکی از جذاب‌ترین حس‌های قلبی نسبت به آنا 💍"
];

export default function SexyGame({ theme, onParticleTrigger, currentUser = 'taha' }) {
  const isAna = currentUser === 'ana';

  const [gameMode, setGameMode] = useState('menu'); // menu, playing, gameover, custom
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // لیست‌های قابل ویرایش محلی
  const [customDares, setCustomDares] = useState(() => {
    const saved = localStorage.getItem(`custom_dares_${currentUser}`);
    return saved ? JSON.parse(saved) : (isAna ? DEFAULT_DARES_ANA : DEFAULT_DARES_TAHA);
  });
  const [newDareInput, setNewDareInput] = useState('');

  // فیزیک روان و آسان بازی
  const [playerY, setPlayerY] = useState(0);
  const [jumpCount, setJumpCount] = useState(0);
  const [obstacleX, setObstacleX] = useState(100);
  const [collectibleX, setCollectibleX] = useState(150);
  const [hasShield, setHasShield] = useState(false);

  // جریمه و آپلود
  const [currentPenalty, setCurrentPenalty] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // ذخیره چالش‌های شخصی‌سازی‌شده
  const handleAddCustomDare = (e) => {
    e.preventDefault();
    if (!newDareInput.trim()) return;
    const updated = [...customDares, newDareInput.trim()];
    setCustomDares(updated);
    localStorage.setItem(`custom_dares_${currentUser}`, JSON.stringify(updated));
    setNewDareInput('');
    onParticleTrigger('✨');
  };

  // لوپ کنترل‌شده با سرعت ملایم و لذت‌بخش
  useEffect(() => {
    let loop;
    if (gameMode === 'playing') {
      const speed = 1.4; // سرعت ثابت و کاملاً کنترل‌پذیر
      loop = setInterval(() => {
        setObstacleX(prev => {
          if (prev <= 15 && prev >= 5 && playerY < 30) {
            if (hasShield) {
              setHasShield(false);
              onParticleTrigger('🛡️');
              return 100;
            }
            triggerGameOver();
            return 100;
          }
          if (prev <= -5) {
            setScore(s => {
              const next = s + 20;
              if (next > highScore) setHighScore(next);
              return next;
            });
            return 100 + Math.random() * 20;
          }
          return prev - speed;
        });

        // آیتم‌های کمکی
        setCollectibleX(prev => {
          if (prev <= 15 && prev >= 5 && playerY >= 25) {
            setHasShield(true);
            setScore(s => s + 30);
            onParticleTrigger('💖');
            return 160;
          }
          if (prev <= -10) return 150 + Math.random() * 40;
          return prev - (speed * 0.9);
        });
      }, 26);
    }
    return () => clearInterval(loop);
  }, [gameMode, playerY, highScore, hasShield]);

  const handleJump = () => {
    if (gameMode !== 'playing' || jumpCount >= 2) return;
    if (navigator.vibrate) navigator.vibrate(30);
    onParticleTrigger('✨');
    setJumpCount(c => c + 1);

    let h = playerY;
    let up = true;
    const interval = setInterval(() => {
      if (up) {
        h += 8;
        if (h >= 75) up = false;
      } else {
        h -= 5;
        if (h <= 0) {
          h = 0;
          clearInterval(interval);
          setJumpCount(0);
        }
      }
      setPlayerY(h);
    }, 22);
  };

  const startGame = () => {
    setScore(0);
    setObstacleX(100);
    setCollectibleX(150);
    setPlayerY(0);
    setJumpCount(0);
    setHasShield(false);
    setGameMode('playing');
    setUploadSuccess(false);
    onParticleTrigger('🔥');
  };

  const triggerGameOver = () => {
    setGameMode('gameover');
    if (navigator.vibrate) navigator.vibrate([80, 40, 100]);
    onParticleTrigger('💥');
    const picked = customDares[Math.floor(Math.random() * customDares.length)];
    setCurrentPenalty(picked);
  };

  const reRollPenalty = () => {
    if (navigator.vibrate) navigator.vibrate(25);
    onParticleTrigger('🎲');
    const picked = customDares[Math.floor(Math.random() * customDares.length)];
    setCurrentPenalty(picked);
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;
    setIsUploading(true);

    try {
      const senderTag = isAna ? 'پرنسس آنا 🦓 (ثبت چالش)' : 'طاها کروکودیل 🐊 (ثبت چالش)';
      const fullCaption = `🔥 ${senderTag}: ${currentPenalty} | پیام: ${caption || 'خلوتگاه دونفره'}`;
      const { error } = await supabase.from('shared_photos').insert([
        { title: fullCaption, image_url: photoUrl.trim() }
      ]);

      if (!error) {
        setUploadSuccess(true);
        if (navigator.vibrate) navigator.vibrate([60, 40, 80]);
        onParticleTrigger('💋');
        setTimeout(() => {
          setGameMode('menu');
          setPhotoUrl('');
          setCaption('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const playerIcon = isAna ? (jumpCount > 1 ? '🦓💨' : '🦓') : (jumpCount > 1 ? '🐊💨' : '🐊');
  const obstacleIcon = isAna ? '🐊' : '🦓';

  return (
    <div style={{
      ...styles.gameWrapper,
      borderColor: theme.primary,
      boxShadow: theme.glow
    }}>
      <div style={styles.headerRow}>
        <div>
          <span style={{ fontSize: '2rem' }}>{isAna ? '🦓💋🐊' : '🐊🔥🦓'}</span>
          <h2 style={{ color: theme.primary, fontSize: '1.35rem', fontWeight: 900, margin: '4px 0' }}>
            {isAna ? 'کمینگاه صمیمانه: پرنسس آنا 🦓' : 'شکارگاه شبانه: طاها کروکودیل 🐊'}
          </h2>
          <p style={{ color: '#aaa', fontSize: '0.82rem' }}>
            گیم‌پلی روان و بهینه‌سازی‌شده برای تجربه آرام و جذاب دو‌نفره
          </p>
        </div>

        <div style={styles.scoreBoard}>
          <div style={{ color: '#00f0ff', fontWeight: 900, fontSize: '1.15rem' }}>امتیاز: {score}</div>
          <div style={{ color: '#ff007f', fontSize: '0.85rem' }}>بالاترین رکورد: {highScore}</div>
        </div>
      </div>

      {/* منوی حالت‌ها */}
      <div style={{ display: 'flex', gap: '8px', margin: '14px 0 10px', justifyContent: 'center' }}>
        <button
          onClick={() => setGameMode('menu')}
          style={{
            ...styles.modeTab,
            background: gameMode !== 'custom' ? theme.primary : '#1c0310',
            color: '#fff'
          }}
        >
          🎮 اجرای بازی
        </button>
        <button
          onClick={() => setGameMode('custom')}
          style={{
            ...styles.modeTab,
            background: gameMode === 'custom' ? theme.primary : '#1c0310',
            color: '#fff'
          }}
        >
          ✍️ مدیریت چالش‌های اختصاصی ({customDares.length})
        </button>
      </div>

      {/* ۱. منوی شروع */}
      {gameMode === 'menu' && (
        <div style={styles.menuPanel}>
          <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>
            {isAna ? '🦓✨🐊' : '🐊✨🦓'}
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '8px' }}>
            آماده راند جدید هستید؟
          </h3>
          <p style={{ color: '#bbb', fontSize: '0.88rem', lineHeight: 1.8, maxWidth: '500px', margin: '0 auto 18px' }}>
            کنترل پرش‌ها بهبود یافته و موانع با سرعت روان حرکت می‌کنند. قلب‌های شناور 💖 را برای گرفتن سپر دفاعی جمع کنید.
          </p>
          <button onClick={startGame} style={{ ...styles.primaryBtn, background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            شروع راند 🚀🔥
          </button>
        </div>
      )}

      {/* ۲. گیم‌پلی بازی */}
      {gameMode === 'playing' && (
        <div style={styles.arena} onClick={handleJump}>
          <div style={styles.moon}>🌕</div>
          <div style={styles.ground} />

          <div style={{
            ...styles.player,
            bottom: `${playerY + 22}px`,
            filter: hasShield ? 'drop-shadow(0 0 15px #00f0ff)' : 'none'
          }}>
            {hasShield && <span style={{ fontSize: '1.1rem', position: 'absolute', top: '-10px', right: '-10px' }}>🛡️</span>}
            {playerIcon}
          </div>

          <div style={{ ...styles.obstacle, left: `${obstacleX}%` }}>
            {obstacleIcon}
          </div>

          <div style={{
            position: 'absolute',
            bottom: '75px',
            left: `${collectibleX}%`,
            fontSize: '1.6rem'
          }}>
            💖
          </div>

          <div style={styles.jumpHint}>
            برای پرش لمس کنید (دابل‌جامپ فعال است) 🦘
          </div>
        </div>
      )}

      {/* ۳. مدیریت چالش‌های دلخواه */}
      {gameMode === 'custom' && (
        <div style={{ padding: '10px 0' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px', textAlign: 'center' }}>
            افزودن چالش‌های کاملاً شخصی به بازی
          </h3>
          <p style={{ color: '#aaa', fontSize: '0.82rem', textAlign: 'center', marginBottom: '14px' }}>
            می‌توانید هر متن، چالش یا فانتزی دلخواهی را اضافه کنید تا در صورت باخت در بازی ظاهر شود:
          </p>

          <form onSubmit={handleAddCustomDare} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="متن چالش اختصاصی را بنویسید..."
              value={newDareInput}
              onChange={e => setNewDareInput(e.target.value)}
              style={styles.inputField}
            />
            <button type="submit" style={{ ...styles.actionBtn, width: 'auto', padding: '10px 18px', background: theme.primary }}>
              افزودن ➕
            </button>
          </form>

          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {customDares.map((d, index) => (
              <div key={index} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.88rem', color: '#eee' }}>
                {index + 1}. {d}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ۴. صفحه باخت و ثبت چالش */}
      {gameMode === 'gameover' && (
        <div style={styles.gameOverPanel}>
          <span style={{ fontSize: '3rem' }}>🚨💋</span>
          <h3 style={{ color: '#ff0055', fontSize: '1.4rem', fontWeight: 900, margin: '6px 0' }}>
            پایان راند!
          </h3>

          <div style={styles.penaltyCard}>
            <div style={{ color: '#ff758c', fontSize: '0.82rem', fontWeight: 800 }}>حکم ثبت‌شده برای این راند:</div>
            <p style={{ color: '#fff', fontSize: '1.1rem', margin: '10px 0', lineHeight: 1.8, fontWeight: 800 }}>
              {currentPenalty}
            </p>
            <button onClick={reRollPenalty} style={styles.rerollBtn}>
              🎲 تغییر چالش
            </button>
          </div>

          <form onSubmit={handleUploadPhoto} style={{ marginTop: '14px', textAlign: 'right' }}>
            <label style={{ color: '#00f0ff', fontSize: '0.85rem', fontWeight: 800 }}>
              📸 ثبت اختیاری عکس در آلبوم:
            </label>
            <input
              type="text"
              placeholder="لینک عکس..."
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              style={styles.inputField}
            />
            <input
              type="text"
              placeholder="پیام همراه..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              style={{ ...styles.inputField, marginTop: '8px' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={isUploading}
                style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #ff0055, #ff4d88)', flex: 2 }}
              >
                {isUploading ? 'در حال ثبت... ⏳' : 'ثبت در گالری 📸'}
              </button>
              <button
                type="button"
                onClick={startGame}
                style={{ ...styles.actionBtn, background: '#222', flex: 1, border: '1px solid #444' }}
              >
                راند بعد 🔄
              </button>
            </div>

            {uploadSuccess && (
              <p style={{ color: '#4ade80', textAlign: 'center', marginTop: '8px', fontWeight: 800 }}>
                ✅ ثبت با موفقیت انجام شد!
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  gameWrapper: {
    background: 'radial-gradient(circle at 50% 30%, #200212 0%, #080005 100%)',
    borderRadius: '28px',
    padding: '24px',
    border: '2px solid',
    direction: 'rtl',
    position: 'relative',
    overflow: 'hidden'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 0, 85, 0.25)',
    paddingBottom: '12px'
  },
  scoreBoard: {
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid rgba(255, 0, 85, 0.4)',
    borderRadius: '16px',
    padding: '8px 16px',
    textAlign: 'center'
  },
  modeTab: {
    padding: '8px 18px',
    borderRadius: '20px',
    border: '1px solid rgba(255,0,85,0.4)',
    fontWeight: 800,
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  menuPanel: {
    textAlign: 'center',
    padding: '24px 10px'
  },
  primaryBtn: {
    padding: '12px 30px',
    borderRadius: '25px',
    border: 'none',
    color: '#fff',
    fontSize: '1.05rem',
    fontWeight: 900,
    cursor: 'pointer'
  },
  arena: {
    height: '220px',
    background: 'linear-gradient(180deg, #0d0107 0%, #1a0210 100%)',
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid rgba(255, 0, 85, 0.4)',
    cursor: 'pointer',
    userSelect: 'none'
  },
  moon: {
    position: 'absolute',
    top: '16px',
    left: '24px',
    fontSize: '2.2rem',
    opacity: 0.8
  },
  ground: {
    position: 'absolute',
    bottom: '0px',
    width: '100%',
    height: '24px',
    background: 'repeating-linear-gradient(90deg, #110007, #110007 15px, #ff0055 15px, #ff0055 30px)'
  },
  player: {
    position: 'absolute',
    right: '25px',
    fontSize: '2.6rem',
    zIndex: 5,
    transition: 'bottom 0.04s ease-out'
  },
  obstacle: {
    position: 'absolute',
    bottom: '20px',
    fontSize: '2.4rem',
    zIndex: 4,
    transform: 'scaleX(-1)'
  },
  jumpHint: {
    position: 'absolute',
    bottom: '5px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#ff4d88',
    fontSize: '0.78rem',
    fontWeight: 800
  },
  gameOverPanel: {
    background: 'rgba(18, 1, 10, 0.96)',
    borderRadius: '22px',
    padding: '20px',
    border: '2px solid #ff0055',
    textAlign: 'center'
  },
  penaltyCard: {
    background: 'rgba(255, 0, 85, 0.12)',
    border: '2px dashed #ff0055',
    borderRadius: '18px',
    padding: '16px',
    margin: '12px 0'
  },
  rerollBtn: {
    background: 'none',
    border: '1px solid #ff4d88',
    color: '#ff4d88',
    padding: '6px 14px',
    borderRadius: '14px',
    fontSize: '0.82rem',
    fontWeight: 800,
    cursor: 'pointer'
  },
  inputField: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    background: '#120108',
    border: '1px solid #ff0055',
    color: '#fff',
    outline: 'none',
    fontSize: '0.9rem',
    boxSizing: 'border-box'
  },
  actionBtn: {
    padding: '12px 18px',
    borderRadius: '16px',
    border: 'none',
    color: '#fff',
    fontWeight: 800,
    fontSize: '0.92rem',
    cursor: 'pointer'
  }
};