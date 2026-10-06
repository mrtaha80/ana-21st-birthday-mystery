import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { generateAICoupleContent } from './aiService.js';

const SUPABASE_URL = 'https://ivfksnobyapzizntmgcf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DWH7XNd9-kG0943xm4AVaA_9b5zIem0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ANA_PENALTIES = [
  "همین الان یه سلفی با چشم‌های خمار، یقه باز و لب‌های نیمه‌باز بگیر و مستقیم بفرست 📸🫦",
  "یه عکس بدون چهره فقط از خط ترقوه و گردنت در حالی که داری با انگشت لمسش می‌‌کنی ثبت کن ✨🔥",
  "باید ۳۰ ثانیه گردن، زیر چانه و لاله گوش طاها کروکودیل رو غرق بوسه‌های خمار و داغ کنی 🐊💋",
  "یه عکس از استایل و لباسی که الان تنت داری بگیر؛ مخصوص آرشیو اختصاصی طاها 👗",
  "دست‌هات رو ببر پشت سرت؛ به طاها اجازه بده ۴۰ ثانیه مسیر ترقوه تا گلوت رو به آرومی ببوسه 🍓",
  "با فاصله ۲ سانتی‌متری از لب‌های طاها، داغ‌ترین فانتزی که امشب تو سرته رو نجوا کن 🤫"
];

const TAHA_PENALTIES = [
  "طاها موظفه ۵ دقیقه شانه، گردن و کمر آنا رو با روغن یا لوسیون ماساژ عمیق و ریلکس بده 💆‍♂️🔥",
  "باید پای آنا پرنسس رو آروم روی زانوت بذاری و مچ و کف پاش رو با محبت ماساژ بدی و ببوسی 👣💋",
  "سلفی جذاب و هات از بازوها یا خط فک مردونه‌ت مخصوص گالری شخصی آنا بگیر و آپلود کن 📸💪",
  "حق یک دستور مطلق برای آنا! هرچی گفت، طاها مثل کروکودیل رام‌شده فقط میگه چشم بانو! 👸🏼",
  "طاها باید ۱ دقیقه تمام انگشت‌های دست آنا رو دونه‌دونه ببوسه و توی چشم‌هاش نگاه کنه 💍"
];

export default function SexyGame({ theme, onParticleTrigger, currentUser = 'taha' }) {
  const isAna = currentUser === 'ana';

  const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [heatLevel, setHeatLevel] = useState(25);
  const [level, setLevel] = useState(1);

  // فیزیک حرکت و پرش
  const [playerY, setPlayerY] = useState(0);
  const [jumpCount, setJumpCount] = useState(0);
  const [obstacleX, setObstacleX] = useState(100);
  const [shaking, setShaking] = useState(false);

  // جریمه و هوش مصنوعی
  const [currentPenalty, setCurrentPenalty] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const playerIcon = isAna ? (jumpCount > 1 ? '🦓💨' : (jumpCount === 1 ? '🦓⚡' : '🦓')) : (jumpCount > 1 ? '🐊💨' : (jumpCount === 1 ? '🐊⚡' : '🐊'));
  const obstacleIcon = isAna ? '🐊' : '🦓';

  useEffect(() => {
    let loop;
    if (gameState === 'playing') {
      const speed = 2.4 + level * 0.42;
      loop = setInterval(() => {
        setObstacleX(prev => {
          if (prev <= 18 && prev >= 4 && playerY < 48) {
            triggerGameOver();
            return 100;
          }

          if (prev <= -5) {
            setScore(s => {
              const next = s + 20;
              if (next > highScore) setHighScore(next);
              if (next % 80 === 0) setLevel(l => l + 1);
              return next;
            });
            setHeatLevel(h => Math.min(100, h + 6));
            return 100;
          }
          return prev - speed;
        });
      }, 30);
    }
    return () => clearInterval(loop);
  }, [gameState, playerY, level, highScore]);

  const handleJump = () => {
    if (gameState !== 'playing' || jumpCount >= 2) return;
    if (navigator.vibrate) navigator.vibrate(40);
    onParticleTrigger('⚡');
    setJumpCount(c => c + 1);

    let h = playerY;
    let up = true;
    const jumpInterval = setInterval(() => {
      if (up) {
        h += 9;
        if (h >= 80) up = false;
      } else {
        h -= 8;
        if (h <= 0) {
          h = 0;
          clearInterval(jumpInterval);
          setJumpCount(0);
        }
      }
      setPlayerY(h);
    }, 25);
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setHeatLevel(25);
    setObstacleX(100);
    setPlayerY(0);
    setJumpCount(0);
    setGameState('playing');
    setUploadSuccess(false);
    onParticleTrigger('🔥');
    if (navigator.vibrate) navigator.vibrate(60);
  };

  const triggerGameOver = () => {
    setGameState('gameover');
    setShaking(true);
    if (navigator.vibrate) navigator.vibrate([100, 50, 150]);
    setTimeout(() => setShaking(false), 450);
    onParticleTrigger('💥');

    const pool = isAna ? ANA_PENALTIES : TAHA_PENALTIES;
    setCurrentPenalty(pool[Math.floor(Math.random() * pool.length)]);
  };

  // فراخوانی تولید جریمه زنده توسط هوش مصنوعی
  const handleGenerateAiDare = async () => {
    setIsAiGenerating(true);
    onParticleTrigger('✨');
    if (navigator.vibrate) navigator.vibrate(30);

    const generated = await generateAICoupleContent('sexy_dare', currentUser);
    setCurrentPenalty(generated);
    setIsAiGenerating(false);
    onParticleTrigger('🔥');
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;
    setIsUploading(true);

    try {
      const senderTag = isAna ? 'پرنسس آنا 🦓 (جریمه باخت)' : 'طاها کروکودیل 🐊 (جریمه باخت)';
      const fullCaption = `🔥 ${senderTag}: ${currentPenalty} | پیام: ${caption || 'ثبت در گالری'}`;
      const { error } = await supabase.from('shared_photos').insert([
        { title: fullCaption, image_url: photoUrl.trim() }
      ]);

      if (!error) {
        setUploadSuccess(true);
        if (navigator.vibrate) navigator.vibrate([80, 50, 100]);
        onParticleTrigger('💋');
        setTimeout(() => {
          setGameState('menu');
          setPhotoUrl('');
          setCaption('');
        }, 2200);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      ...styles.gameWrapper,
      transform: shaking ? 'scale(1.02) rotate(1deg)' : 'scale(1)',
      borderColor: theme.primary,
      boxShadow: theme.glow
    }}>
      <div style={styles.headerRow}>
        <div>
          <span style={{ fontSize: '2rem', animation: 'pulse 1s infinite' }}>
            {isAna ? '🦓💋🐊' : '🐊🔥🦓'}
          </span>
          <h2 style={{ color: theme.primary, fontSize: '1.35rem', fontWeight: 900, margin: '4px 0' }}>
            {isAna ? 'کمینگاه تمساح: فرار پرنسس آنا 🦓' : 'شکارگاه شبانه: تعقیب طاها کروکودیل 🐊'}
          </h2>
          <p style={{ color: '#aaa', fontSize: '0.82rem' }}>
            {isAna 
              ? 'آنا حواست باشه! اگه گیر بیفتی، باید سلفی‌های فوق‌‌العاده سکسی یا بوسه‌های داغ تحویل طاها بدی!'
              : 'طاها اگه ببازی، باید ماساژهای عمیق و فرمانبرداری کامل از پرنسس رو اجرا کنی!'}
          </p>
        </div>

        <div style={styles.scoreBoard}>
          <div style={{ color: '#00f0ff', fontWeight: 900, fontSize: '1.15rem' }}>امتیاز: {score}</div>
          <div style={{ color: '#ff007f', fontSize: '0.85rem' }}>رکورد: {highScore}</div>
          <div style={{ color: '#f59e0b', fontSize: '0.8rem' }}>سطح هیت: {level}</div>
        </div>
      </div>

      <div style={{ margin: '14px 0 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#ff4d88', fontWeight: 800, marginBottom: '4px' }}>
          <span>ولتاژ صمیمیت بینمون:</span>
          <span>{heatLevel}% 🔥</span>
        </div>
        <div style={styles.heatTrack}>
          <div style={{ ...styles.heatFill, width: `${heatLevel}%` }} />
        </div>
      </div>

      {gameState === 'menu' && (
        <div style={styles.menuPanel}>
          <div style={{ fontSize: '3.6rem', marginBottom: '12px' }}>
            {isAna ? '🦓⚡🐊' : '🐊⚡🦓'}
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '8px' }}>
            {isAna ? 'پرنسس آماده‌ای از دست آرواره‌های بوسه تمساح در بری؟' : 'طاها آماده‌ای برای فتح دل طعمه نانازی؟'}
          </h3>
          <p style={{ color: '#bbb', fontSize: '0.88rem', lineHeight: 1.8, maxWidth: '500px', margin: '0 auto 20px' }}>
            {isAna
              ? 'با پریدن از روی کروکودیل‌ها فرار کن (دابل جامپ داری!). جریمه‌ها متصل به مغز هوش مصنوعی و سلفی زنده است!'
              : 'موانع رو با قدرت رد کن! اگه ببازی، احکام ماساژ و خدمت توسط هوش مصنوعی برات صادر میشه!'}
          </p>
          <button onClick={startGame} style={{ ...styles.primaryBtn, background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            شروع راند اختصاصی 🚀🔥
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={styles.arena} onClick={handleJump}>
          <div style={styles.moon}>🌕</div>
          <div style={styles.ground} />

          <div style={{
            ...styles.player,
            bottom: `${playerY + 22}px`,
            filter: jumpCount > 0 ? 'drop-shadow(0 0 15px #ff007f)' : 'none'
          }}>
            {playerIcon}
          </div>

          <div style={{ ...styles.obstacle, left: `${obstacleX}%` }}>
            {obstacleIcon}
          </div>

          <div style={styles.jumpHint}>
            تپ کن برای پرش (امکان دابل جامپ داری!) 🦘
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div style={styles.gameOverPanel}>
          <span style={{ fontSize: '3rem', animation: 'bounce 1s infinite' }}>🚨💋🔥</span>
          <h3 style={{ color: '#ff0055', fontSize: '1.45rem', fontWeight: 900, margin: '8px 0' }}>
            {isAna ? 'شکار شدی پرنسس من!' : 'کروکودیل رام شد و به دام افتاد!'}
          </h3>

          <div style={styles.penaltyCard}>
            <div style={{ color: '#ff758c', fontSize: '0.85rem', fontWeight: 800 }}>
              {isAna ? 'حکم مجازات طاها برای آنا 👸🏼:' : 'حکم فرمانروایی آنا برای طاها 🤴🏻:'}
            </div>
            <p style={{ color: '#fff', fontSize: '1.1rem', margin: '10px 0', lineHeight: 1.8, fontWeight: 800 }}>
              {currentPenalty}
            </p>

            <button
              type="button"
              onClick={handleGenerateAiDare}
              disabled={isAiGenerating}
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '16px',
                fontSize: '0.85rem',
                fontWeight: 900,
                cursor: 'pointer',
                marginTop: '8px',
                boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)'
              }}
            >
              {isAiGenerating ? 'هوش مصنوعی داره چالش جدید میسازه... ⏳' : '🤖 جریمه نوآورانه با هوش مصنوعی!'}
            </button>
          </div>

          <form onSubmit={handleUploadPhoto} style={{ marginTop: '16px', textAlign: 'right' }}>
            <label style={{ color: '#00f0ff', fontSize: '0.88rem', fontWeight: 800 }}>
              📸 {isAna ? 'آپلود سلفی یا عکس هاتِ پرنسس:' : 'آپلود سلفی یا عکس جذاب طاها:'}
            </label>
            <input
              type="text"
              placeholder="لینک مستقیم عکس (مثلاً از postimages یا imgur)..."
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              style={styles.inputField}
            />
            <input
              type="text"
              placeholder="یه جمله دلبرانه یا شیطنت زیر عکست بنویس..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              style={{ ...styles.inputField, marginTop: '8px' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="submit"
                disabled={isUploading}
                style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #ff0055, #ff4d88)', flex: 2 }}
              >
                {isUploading ? 'در حال ثبت در آلبوم... ⏳' : 'ثبت عکس در آلبوم دونفره 📸💋'}
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
              <p style={{ color: '#4ade80', textAlign: 'center', marginTop: '10px', fontWeight: 800 }}>
                ✅ عکس با موفقیت به گالری پولاروید اضافه شد!
              </p>
            )}
          </form>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  gameWrapper: {
    background: 'radial-gradient(circle at 50% 30%, #1f0210 0%, #080005 100%)',
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
    paddingBottom: '14px'
  },
  scoreBoard: {
    background: 'rgba(0, 0, 0, 0.65)',
    border: '1px solid rgba(255, 0, 85, 0.4)',
    borderRadius: '16px',
    padding: '8px 16px',
    textAlign: 'center'
  },
  heatTrack: {
    height: '14px',
    background: '#15010a',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 0, 85, 0.3)'
  },
  heatFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff0055, #ff4d88, #ffeb3b)',
    boxShadow: '0 0 15px #ff0055',
    transition: 'width 0.25s ease'
  },
  menuPanel: {
    textAlign: 'center',
    padding: '30px 10px'
  },
  primaryBtn: {
    padding: '14px 34px',
    borderRadius: '30px',
    border: 'none',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 0 25px rgba(255, 0, 85, 0.6)',
    transition: 'all 0.2s'
  },
  arena: {
    height: '230px',
    background: 'linear-gradient(180deg, #0d0107 0%, #1a0210 100%)',
    borderRadius: '22px',
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
    fontSize: '2.5rem',
    opacity: 0.85,
    filter: 'drop-shadow(0 0 15px #ff4d88)'
  },
  ground: {
    position: 'absolute',
    bottom: '0px',
    width: '100%',
    height: '26px',
    background: 'repeating-linear-gradient(90deg, #110007, #110007 15px, #ff0055 15px, #ff0055 30px)'
  },
  player: {
    position: 'absolute',
    right: '25px',
    fontSize: '2.8rem',
    zIndex: 5,
    transition: 'bottom 0.04s ease-out'
  },
  obstacle: {
    position: 'absolute',
    bottom: '22px',
    fontSize: '2.6rem',
    zIndex: 4,
    transform: 'scaleX(-1)'
  },
  jumpHint: {
    position: 'absolute',
    bottom: '6px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#ff4d88',
    fontSize: '0.8rem',
    fontWeight: 800
  },
  gameOverPanel: {
    background: 'rgba(15, 1, 8, 0.95)',
    borderRadius: '24px',
    padding: '24px',
    border: '2px solid #ff0055',
    boxShadow: '0 0 35px rgba(255, 0, 85, 0.5)',
    textAlign: 'center'
  },
  penaltyCard: {
    background: 'rgba(255, 0, 85, 0.12)',
    border: '2px dashed #ff0055',
    borderRadius: '20px',
    padding: '18px',
    margin: '14px 0'
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
    fontSize: '0.95rem',
    cursor: 'pointer'
  }
};