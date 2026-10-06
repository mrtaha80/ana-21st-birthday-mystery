import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ivfksnobyapzizntmgcf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DWH7XNd9-kG0943xm4AVaA_9b5zIem0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function SexyGame({ theme, onParticleTrigger }) {
  // فازهای بازی: 'menu', 'playing', 'gameover', 'dare'
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [heatLevel, setHeatLevel] = useState(10);
  const [level, setLevel] = useState(1);

  // موقعیت‌های کاراکتر و تله‌ها (فیزیک بومی)
  const [playerY, setPlayerY] = useState(0); // ارتفاع پرش طعمه (گورخر/جوجو)
  const [isJumping, setIsJumping] = useState(false);
  const [obstacleX, setObstacleX] = useState(100);
  const [obstacleType, setObstacleType] = useState('croc'); // croc, flame
  const [shaking, setShaking] = useState(false);

  // مجازات‌ها و سلفی بازنده
  const [currentPenalty, setCurrentPenalty] = useState(null);
  const [penaltyPhotoUrl, setPenaltyPhotoUrl] = useState('');
  const [penaltyNote, setPenaltyNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const reqRef = useRef();

  const penalties = [
    {
      title: "فرمان شکارچی: سلفی با زاویه هوس‌انگیز 📸🔥",
      desc: "همین الان با دوربین گوشی یه سلفی با چشم‌های خمار، یقه باز یا یه پوز جذاب بگیر و مستقیم آپلود کن تا قفل بازی باز شه!",
      tag: "سلفی آتشین"
    },
    {
      title: "مجازات بوسه گردن تمساح 🐊💋",
      desc: "باید بیای نزدیک و دقیقاً ۱ دقیقه گوش و خط گردن طاها رو ببوسی، بدون این‌که حق داشته باشی دستت رو تکون بدی!",
      tag: "بوسه اسارت"
    },
    {
      title: "عکس مخفی از لباس امشب 👗✨",
      desc: "یه عکس قدی با استایل نانازی و جذاب امشبت بگیر و بفرست تا توی آلبوم اختصاصی برای همیشه آرشیو بشه!",
      tag: "استایل شبانه"
    },
    {
      title: "اعتراف نجواگونه در فاصله ۲ سانتی‌متری 🤫",
      desc: "صورتت رو بچسبون به صورت طاها و بگو الان بیشترین چیزی که ازش می‌خوای چیه...",
      tag: "اعتراف هوس"
    },
    {
      title: "ماساژ تمساح با روغن یا لوسیون 💆‍♂️🔥",
      desc: "۵ دقیقه ماساژ پشت و گردن طاها بدون هیچ بهانه‌ای!",
      tag: "خدمت اختصاصی"
    }
  ];

  // لوپ اصلی بازی با فیزیک و افزایش سرعت
  useEffect(() => {
    let speed = 2.2 + level * 0.45;
    let timer;

    if (gameState === 'playing') {
      timer = setInterval(() => {
        setObstacleX(prev => {
          // برخورد سنجی دقیق
          if (prev <= 18 && prev >= 4 && playerY < 45) {
            triggerGameOver();
            return 100;
          }

          // اگر مانع رد شد
          if (prev <= -5) {
            setScore(s => {
              const newScore = s + 15;
              if (newScore > highScore) setHighScore(newScore);
              if (newScore % 60 === 0) setLevel(l => l + 1);
              return newScore;
            });
            setHeatLevel(h => Math.min(100, h + 8));
            setObstacleType(Math.random() > 0.4 ? 'croc' : 'flame');
            return 100;
          }

          return prev - speed;
        });
      }, 30);
    }

    return () => clearInterval(timer);
  }, [gameState, playerY, level, highScore]);

  // کنترل پرش
  const handleJump = () => {
    if (isJumping || gameState !== 'playing') return;
    setIsJumping(true);
    onParticleTrigger('⚡');

    // انیمیشن پرش قوسی
    let height = 0;
    let goingUp = true;
    const jumpInterval = setInterval(() => {
      if (goingUp) {
        height += 8;
        if (height >= 75) goingUp = false;
      } else {
        height -= 8;
        if (height <= 0) {
          height = 0;
          clearInterval(jumpInterval);
          setIsJumping(false);
        }
      }
      setPlayerY(height);
    }, 28);
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setHeatLevel(15);
    setObstacleX(100);
    setPlayerY(0);
    setIsJumping(false);
    setGameState('playing');
    setUploadSuccess(false);
    onParticleTrigger('🔥');
  };

  const triggerGameOver = () => {
    setGameState('gameover');
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
    onParticleTrigger('💥');

    // انتخاب مجازات رندوم و داغ
    const selected = penalties[Math.floor(Math.random() * penalties.length)];
    setCurrentPenalty(selected);
  };

  // آپلود مستقیم عکس مجازات به دیتابیس مشترک
  const handleUploadPenalty = async (e) => {
    e.preventDefault();
    if (!penaltyPhotoUrl.trim()) return;
    setIsUploading(true);

    try {
      const captionText = `🔥 مجازات باخت بازی [${currentPenalty.tag}]: ${penaltyNote || 'سلفی سفارشی پرنسس'}`;
      const { data, error } = await supabase.from('shared_photos').insert([
        { title: captionText, image_url: penaltyPhotoUrl }
      ]);

      if (!error) {
        setUploadSuccess(true);
        onParticleTrigger('💋');
        setTimeout(() => {
          setGameState('menu');
          setPenaltyPhotoUrl('');
          setPenaltyNote('');
        }, 2200);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      ...styles.gameWrapper,
      transform: shaking ? 'scale(1.02) rotate(1deg)' : 'scale(1)',
      transition: 'transform 0.1s ease'
    }}>
      {/* هدر بالای پنل بازی با نوار هیت */}
      <div style={styles.gameHeader}>
        <div>
          <span style={{ fontSize: '1.8rem', animation: 'pulse 1s infinite' }}>🐊🔥🦓</span>
          <h2 style={{ color: '#ff007f', margin: '4px 0', fontSize: '1.35rem', fontWeight: 900 }}>
            کمینگاه تمساح: دام شبانه طعمه 💋
          </h2>
          <p style={{ color: '#aaa', fontSize: '0.82rem' }}>
            باختن مساویه با اجرای حکم فوری و آپلود سلفی اختصاصی!
          </p>
        </div>

        <div style={styles.statsBox}>
          <div style={{ color: '#00f0ff', fontWeight: 900, fontSize: '1.1rem' }}>امتیاز: {score}</div>
          <div style={{ color: '#ff007f', fontSize: '0.85rem' }}>رکورد آتشین: {highScore}</div>
          <div style={{ color: '#f59e0b', fontSize: '0.8rem' }}>سطح وحشی: {level}</div>
        </div>
      </div>

      {/* نوار حرارت بین دو نفر (Heat Meter) */}
      <div style={{ margin: '14px 0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ff758c', fontWeight: 800, marginBottom: '4px' }}>
          <span>ولتاژ صمیمیت و هیت:</span>
          <span>{heatLevel}% 🔥</span>
        </div>
        <div style={styles.heatBarTrack}>
          <div style={{ ...styles.heatBarFill, width: `${heatLevel}%` }} />
        </div>
      </div>

      {/* ۱. صفحه منوی شروع بازی */}
      {gameState === 'menu' && (
        <div style={styles.menuBox}>
          <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🐊⚡💃</div>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '8px' }}>
            آماده‌ای از دست آرواره‌های بوسه تمساح فرار کنی؟
          </h3>
          <p style={{ color: '#bbb', fontSize: '0.88rem', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 20px' }}>
            قوانین بازی خیلی ساده‌ست: با دکمه پرش، از روی کروکودیل‌ها و شعله‌های هوس بپر. هرچی جلوتر بری سرعت جنون‌آمیز میشه. اگه گیر بیفتی، طاها حکم مجازاتت رو صادر می‌کنه!
          </p>
          <button onClick={startGame} style={styles.startBtn}>
            شروع راند آتشین 🚀🔥
          </button>
        </div>
      )}

      {/* ۲. محیط زنده بازی تحت وب */}
      {gameState === 'playing' && (
        <div style={styles.arena} onClick={handleJump}>
          {/* پس‌زمینه سایبرپانک و خطوط نئونی */}
          <div style={styles.neonMoon}>🌕</div>
          <div style={styles.arenaGround} />

          {/* طعمه (آنا: گورخر/جوجو پرنده) */}
          <div style={{
            ...styles.player,
            bottom: `${playerY + 22}px`,
            filter: isJumping ? 'drop-shadow(0 0 15px #ff007f)' : 'none'
          }}>
            {isJumping ? '🦓💨' : '🦓'}
          </div>

          {/* مانع متحرک: کروکودیل کمین‌کننده یا شعله آتشین */}
          <div style={{
            ...styles.obstacle,
            left: `${obstacleX}%`
          }}>
            {obstacleType === 'croc' ? '🐊' : '🔥'}
          </div>

          {/* نشانگر تاچ */}
          <div style={styles.tapPrompt}>
            برای پرش لمس کن یا کلیک کن! 🦘
          </div>
        </div>
      )}

      {/* ۳. صفحه باخت و صدور حکم مجازات سلفی/عکس */}
      {gameState === 'gameover' && currentPenalty && (
        <div style={styles.penaltyModal}>
          <span style={{ fontSize: '3rem', animation: 'bounce 1s infinite' }}>🚨🐊💋</span>
          <h3 style={{ color: '#ff0055', fontSize: '1.4rem', fontWeight: 900, margin: '8px 0' }}>
            شکار شدی طعمه قشنگم!
          </h3>
          <div style={styles.penaltyCard}>
            <div style={{ color: '#ff758c', fontSize: '0.85rem', fontWeight: 800 }}>{currentPenalty.title}</div>
            <p style={{ color: '#fff', fontSize: '1rem', margin: '8px 0', lineHeight: 1.7, fontWeight: 700 }}>
              {currentPenalty.desc}
            </p>
          </div>

          {/* فرم آپلود عکس یا سلفی برای جبران مجازات */}
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <label style={{ color: '#00f0ff', fontSize: '0.85rem', fontWeight: 800 }}>
              📸 آپلود لینک سلفی یا عکس اختصاصی همین الان:
            </label>
            <input
              type="text"
              placeholder="لینک عکس رو اینجا پیست کن (یا از سایت‌های آپلود مثل postimages)..."
              value={penaltyPhotoUrl}
              onChange={e => setPenaltyPhotoUrl(e.target.value)}
              style={styles.gameInput}
            />
            <input
              type="text"
              placeholder="پیام یا شیطنت زیر عکست بنویس..."
              value={penaltyNote}
              onChange={e => setPenaltyNote(e.target.value)}
              style={{ ...styles.gameInput, marginTop: '8px' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={handleUploadPenalty}
                disabled={isUploading}
                style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #ff007f, #ff5e3a)', flex: 2 }}
              >
                {isUploading ? 'در حال ثبت در آلبوم ابدی... ⏳' : 'ثبت سلفی در آلبوم اختصاصی 📸💋'}
              </button>
              <button
                onClick={startGame}
                style={{ ...styles.actionBtn, background: '#333', flex: 1 }}
              >
                راند بعد 🔄
              </button>
            </div>

            {uploadSuccess && (
              <div style={{ color: '#4ade80', textAlign: 'center', marginTop: '10px', fontWeight: 800 }}>
                ✅ سلفی با موفقیت به گالری محرمانه دونفره اضافه شد!
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
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
    background: 'radial-gradient(circle at center, #1a0b16 0%, #08080a 100%)',
    borderRadius: '28px',
    padding: '24px',
    border: '2px solid #ff007f',
    boxShadow: '0 0 35px rgba(255, 0, 127, 0.35)',
    direction: 'rtl',
    position: 'relative',
    overflow: 'hidden'
  },
  gameHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 0, 127, 0.25)',
    paddingBottom: '14px'
  },
  statsBox: {
    background: 'rgba(0, 0, 0, 0.7)',
    border: '1px solid #ff007f',
    borderRadius: '16px',
    padding: '8px 16px',
    textAlign: 'center'
  },
  heatBarTrack: {
    height: '14px',
    background: '#1f1f2e',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.15)'
  },
  heatBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff007f, #ff5e3a, #ffeb3b)',
    boxShadow: '0 0 15px #ff007f',
    transition: 'width 0.3s ease'
  },
  menuBox: {
    textAlign: 'center',
    padding: '30px 10px'
  },
  startBtn: {
    padding: '14px 32px',
    borderRadius: '30px',
    border: 'none',
    background: 'linear-gradient(135deg, #ff007f, #99004d)',
    color: '#fff',
    fontSize: '1.15rem',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 0 25px rgba(255, 0, 127, 0.6)',
    transition: 'all 0.2s'
  },
  arena: {
    height: '220px',
    background: 'linear-gradient(180deg, #09090e 0%, #170914 100%)',
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid rgba(255, 0, 127, 0.4)',
    cursor: 'pointer',
    userSelect: 'none'
  },
  neonMoon: {
    position: 'absolute',
    top: '15px',
    left: '25px',
    fontSize: '2.5rem',
    opacity: 0.85,
    filter: 'drop-shadow(0 0 15px #ff758c)'
  },
  arenaGround: {
    position: 'absolute',
    bottom: '0px',
    width: '100%',
    height: '26px',
    background: 'repeating-linear-gradient(90deg, #222, #222 15px, #ff007f 15px, #ff007f 30px)'
  },
  player: {
    position: 'absolute',
    right: '25px',
    fontSize: '2.8rem',
    zIndex: 5,
    transition: 'bottom 0.05s ease-out'
  },
  obstacle: {
    position: 'absolute',
    bottom: '24px',
    fontSize: '2.6rem',
    zIndex: 4,
    transform: 'scaleX(-1)'
  },
  tapPrompt: {
    position: 'absolute',
    bottom: '6px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#ff758c',
    fontSize: '0.78rem',
    fontWeight: 800
  },
  penaltyModal: {
    background: 'rgba(0, 0, 0, 0.95)',
    borderRadius: '22px',
    padding: '24px',
    border: '2px solid #ff0055',
    boxShadow: '0 0 35px rgba(255, 0, 85, 0.5)',
    textAlign: 'center'
  },
  penaltyCard: {
    background: 'rgba(255, 0, 85, 0.1)',
    border: '2px dashed #ff0055',
    borderRadius: '18px',
    padding: '16px',
    margin: '12px 0'
  },
  gameInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    background: '#121217',
    border: '1px solid #ff007f',
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
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
  }
};