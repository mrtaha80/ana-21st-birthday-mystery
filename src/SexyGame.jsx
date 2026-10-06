

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ivfksnobyapzizntmgcf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DWH7XNd9-kG0943xm4AVaA_9b5zIem0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// چالش‌های بی‌پروا و جسورانه برای پرنسس آنا (وقتی آنا به دام می‌افتد)
const ANA_DARES = [
  "همین الان یک عکس بسیار جسورانه، با بالاتنه باز یا لباس زیر در نور ملایم اتاق برای طاها ثبت و آپلود کن 📸🔥",
  "یک عکس تمام‌قد از پشت و انحنای بدنت با ژست جذاب برای گالری محرمانه طاها بفرست 🔞✨",
  "آنا موظفه ۳۰ ثانیه لاله گوش و خط گردن طاها رو غرق بوسه‌های خمار و پیوسته کنه 🐊💋",
  "یک سلفی بسیار داغ با نگاه خمار و گاز گرفتن لب پایین در تخت‌خواب ثبت کن 🫦🛏️",
  "آنا باید پشت طاها رو به مدت ۲ دقیقه با سرانگشتانش نوازش عمیق و قلقلکی بده 💆‍♀️🔥",
  "آنا باید در فاصله دو سانتی‌متری از لب‌های طاها، هوس‌انگیزترین خواسته‌اش رو با صدای آروم زمزمه کنه 🤫",
  "عکس بدون لباس از زاویه نزدیک و متمرکز روی خط ترقوه و شانه مخصوص طاها 📸🍓"
];

// چالش‌های سلطنتی، ماساژ و اطاعت برای طاها کروکودیل (وقتی طاها به دام می‌افتد)
const TAHA_DARES = [
  "طاها موظفه پیراهنش رو دربیاره و یک عکس هات از بالاتنه و بازوهای مردانه‌ش برای آنا ثبت کنه 📸💪",
  "۵ دقیقه ماساژ عمیق و لوسیونی کمر، گردن و شانه‌های آنا پرنسس در نور ملایم شمع 💆‍♂️🕯️",
  "پای پرنسس آنا رو روی پاهات بذار و مچ و کف پاش رو با محبت و طمأنینه ببوس 👣💋",
  "پذیرش یک فرمان مطلق و جسورانه از سمت آنا؛ طاها فقط حق داره بگه چشم بانو! 👸🏼👑",
  "طاها باید مسیر گردن تا سینه آنا رو با بوسه‌های متوالی و نفس‌های گرم طی کنه 🔥💋",
  "طاها باید آنا رو محکم به سینه بچسبونه و ۳۰ ثانیه لب‌هاش رو به آتش بکشه بدون این‌که رهاش کنه 🐊❤️"
];

export default function SexyGame({ theme, onParticleTrigger, currentUser = 'taha' }) {
  const isAna = currentUser === 'ana';
  const partnerUser = isAna ? 'taha' : 'ana';

  const [gameMode, setGameMode] = useState('menu'); // menu, playing, gameover, live, manage
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // فیزیک روان و آسان برای بازی
  const [playerY, setPlayerY] = useState(0);
  const [jumpCount, setJumpCount] = useState(0);
  const [obstacleX, setObstacleX] = useState(100);
  const [collectibleX, setCollectibleX] = useState(150);
  const [hasShield, setHasShield] = useState(false);

  // وضعیت جریمه فعلی و همگام‌سازی زنده
  const [currentPenalty, setCurrentPenalty] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [livePenalties, setLivePenalties] = useState([]);

  // احکام دست‌نویس خودمان
  const [targetPenalties, setTargetPenalties] = useState([]);
  const [myNewDare, setMyNewDare] = useState('');
  const [myDaresList, setMyDaresList] = useState([]);

  // بارگذاری داده‌ها از دیتابیس
  useEffect(() => {
    fetchLivePenalties();
    fetchCustomPenalties();
    const interval = setInterval(() => {
      fetchLivePenalties();
      fetchCustomPenalties();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchLivePenalties = async () => {
    try {
      const { data } = await supabase
        .from('game_penalties')
        .select('*')
        .order('id', { ascending: false })
        .limit(10);
      if (data) setLivePenalties(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomPenalties = async () => {
    try {
      const { data: forMe } = await supabase
        .from('custom_punishments')
        .select('*')
        .eq('target', currentUser);
      if (forMe) setTargetPenalties(forMe);

      const { data: byMe } = await supabase
        .from('custom_punishments')
        .select('*')
        .eq('author', currentUser);
      if (byMe) setMyDaresList(byMe);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDareForPartner = async (e) => {
    e.preventDefault();
    if (!myNewDare.trim()) return;

    try {
      await supabase.from('custom_punishments').insert([
        {
          author: currentUser,
          target: partnerUser,
          content: myNewDare.trim()
        }
      ]);
      setMyNewDare('');
      fetchCustomPenalties();
      onParticleTrigger('🔥');
    } catch (err) {
      console.error(err);
    }
  };

  // گیم لوپ روان
  useEffect(() => {
    let loop;
    if (gameMode === 'playing') {
      const speed = 1.45;
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

        setCollectibleX(prev => {
          if (prev <= 15 && prev >= 5 && playerY >= 25) {
            setHasShield(true);
            setScore(s => s + 35);
            onParticleTrigger('💖');
            if (navigator.vibrate) navigator.vibrate(40);
            return 160;
          }
          if (prev <= -10) return 150 + Math.random() * 40;
          return prev - (speed * 0.9);
        });
      }, 26);
    }
    return () => clearInterval(loop);
  }, [gameMode, playerY, highScore, hasShield, targetPenalties]);

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

  // ثبت آنی باخت در دیتابیس
  const triggerGameOver = async () => {
    setGameMode('gameover');
    if (navigator.vibrate) navigator.vibrate([80, 50, 100]);
    onParticleTrigger('💥');

    let picked = '';
    if (targetPenalties.length > 0) {
      picked = targetPenalties[Math.floor(Math.random() * targetPenalties.length)].content;
    } else {
      const pool = isAna ? ANA_DARES : TAHA_DARES;
      picked = pool[Math.floor(Math.random() * pool.length)];
    }
    setCurrentPenalty(picked);

    try {
      await supabase.from('game_penalties').insert([
        {
          player: isAna ? 'آنا 🦓' : 'طاها 🐊',
          dare_text: picked,
          status: 'در انتظار انجام و اثبات'
        }
      ]);
      fetchLivePenalties();
    } catch (err) {
      console.error(err);
    }
  };

  const reRollPenalty = () => {
    if (targetPenalties.length > 0) {
      const picked = targetPenalties[Math.floor(Math.random() * targetPenalties.length)].content;
      setCurrentPenalty(picked);
    } else {
      const pool = isAna ? ANA_DARES : TAHA_DARES;
      setCurrentPenalty(pool[Math.floor(Math.random() * pool.length)]);
    }
  };

  // ارسال عکس برای تکمیل جریمه
  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;
    setIsUploading(true);

    try {
      const senderTag = isAna ? 'پرنسس آنا 🦓 (اثبات جریمه)' : 'طاها کروکودیل 🐊 (اثبات جریمه)';
      const fullCaption = `🔞 ${senderTag}: ${currentPenalty} | پیام: ${caption || 'ثبت در خلوتگاه'}`;

      await supabase.from('shared_photos').insert([
        { title: fullCaption, image_url: photoUrl.trim() }
      ]);

      await supabase.from('game_penalties').insert([
        {
          player: isAna ? 'آنا 🦓' : 'طاها 🐊',
          dare_text: currentPenalty,
          status: 'انجام شد و عکس ثبت گردید ✅',
          photo_proof: photoUrl.trim()
        }
      ]);

      setUploadSuccess(true);
      fetchLivePenalties();
      onParticleTrigger('💋');
      setTimeout(() => {
        setGameMode('menu');
        setPhotoUrl('');
        setCaption('');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const playerIcon = isAna ? (jumpCount > 1 ? '🦓💨' : '🦓') : (jumpCount > 1 ? '🐊💨' : '🐊');
  const obstacleIcon = isAna ? '🐊' : '🦓';

  return (
    <div style={{ ...styles.gameWrapper, borderColor: theme.primary, boxShadow: theme.glow }}>
      <div style={styles.headerRow}>
        <div>
          <span style={{ fontSize: '2.2rem' }}>{isAna ? '🦓💋🐊' : '🐊🔥🦓'}</span>
          <h2 style={{ color: theme.primary, fontSize: '1.35rem', fontWeight: 900, margin: '4px 0' }}>
            {isAna ? 'کمینگاه شهوانی تمساح: اسارت پرنسس آنا 🦓' : 'شکارگاه شبانه: تسلیم طاها کروکودیل 🐊'}
          </h2>
          <p style={{ color: '#ccc', fontSize: '0.82rem' }}>
            جریمه‌ها مستقیماً در تابلوی زنده ثبت می‌شوند و اولویت با تنبیه‌های دست‌نویس عشقت است!
          </p>
        </div>

        <div style={styles.scoreBoard}>
          <div style={{ color: '#00f0ff', fontWeight: 900, fontSize: '1.15rem' }}>امتیاز: {score}</div>
          <div style={{ color: '#ff007f', fontSize: '0.85rem' }}>بالاترین رکورد: {highScore}</div>
        </div>
      </div>

      {/* منوی ناوبری بازی */}
      <div style={{ display: 'flex', gap: '8px', margin: '14px 0 10px', justifyContent: 'center' }}>
        <button
          onClick={() => setGameMode('menu')}
          style={{ ...styles.modeTab, background: gameMode === 'menu' || gameMode === 'playing' ? theme.primary : '#1a020c', color: '#fff' }}
        >
          🎮 بازی کمینگاه
        </button>
        <button
          onClick={() => setGameMode('live')}
          style={{ ...styles.modeTab, background: gameMode === 'live' ? theme.primary : '#1a020c', color: '#fff' }}
        >
          🚨 تابلوی زنده ({livePenalties.length})
        </button>
        <button
          onClick={() => setGameMode('manage')}
          style={{ ...styles.modeTab, background: gameMode === 'manage' ? theme.primary : '#1a020c', color: '#fff' }}
        >
          ✍️ نوشتن تنبیه برای {isAna ? 'طاها 🐊' : 'آنا 🦓'} ({myDaresList.length})
        </button>
      </div>

      {/* ۱. منوی شروع */}
      {gameMode === 'menu' && (
        <div style={styles.menuPanel}>
          <div style={{ fontSize: '3.6rem', marginBottom: '10px' }}>
            {isAna ? '🦓✨🐊' : '🐊✨🦓'}
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '8px' }}>
            آماده ورود به بازی هستید؟
          </h3>
          <p style={{ color: '#bbb', fontSize: '0.88rem', lineHeight: 1.8, maxWidth: '500px', margin: '0 auto 18px' }}>
            سرعت بازی ملایم است. اگر ببازی، جریمه در تابلوی زنده بالا می‌آید و منتظر عکس اثبات تو می‌ماند!
          </p>
          <button onClick={startGame} style={{ ...styles.primaryBtn, background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            ورود به بازی 🚀🔥
          </button>
        </div>
      )}

      {/* ۲. اجرای بازی */}
      {gameMode === 'playing' && (
        <div style={styles.arena} onClick={handleJump}>
          <div style={styles.moon}>🌕</div>
          <div style={styles.ground} />

          <div style={{
            ...styles.player,
            bottom: `${playerY + 22}px`,
            filter: hasShield ? 'drop-shadow(0 0 16px #00f0ff)' : 'none'
          }}>
            {hasShield && <span style={{ fontSize: '1.1rem', position: 'absolute', top: '-10px', right: '-10px' }}>🛡️</span>}
            {playerIcon}
          </div>

          <div style={{ ...styles.obstacle, left: `${obstacleX}%` }}>
            {obstacleIcon}
          </div>

          <div style={{ position: 'absolute', bottom: '75px', left: `${collectibleX}%`, fontSize: '1.6rem' }}>
            💖
          </div>

          <div style={styles.jumpHint}>
            تپ کنید برای پرش روان (دابل‌جامپ فعال است) 🦘
          </div>
        </div>
      )}

      {/* ۳. تابلوی زنده جریمه‌های ثبت‌شده */}
      {gameMode === 'live' && (
        <div style={{ padding: '10px 0' }}>
          <h3 style={{ color: '#ff0055', fontSize: '1.15rem', fontWeight: 900, textAlign: 'center', marginBottom: '6px' }}>
            تابلوی زنده باخت‌ها و جریمه‌های صادرشده
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
            {livePenalties.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#777', padding: '20px' }}>هنوز جریمه‌ای ثبت نشده است.</p>
            ) : (
              livePenalties.map(p => (
                <div key={p.id} style={{
                  background: 'rgba(255, 0, 85, 0.08)',
                  border: '1px solid rgba(255, 0, 85, 0.3)',
                  padding: '12px 16px',
                  borderRadius: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 900, color: theme.primary, fontSize: '0.88rem' }}>بازیکن: {p.player}</span>
                    <span style={{ fontSize: '0.78rem', color: p.status.includes('✅') ? '#4ade80' : '#f59e0b', fontWeight: 800 }}>{p.status}</span>
                  </div>
                  <p style={{ color: '#fff', fontSize: '0.95rem', margin: '4px 0', lineHeight: 1.6 }}>{p.dare_text}</p>
                  {p.photo_proof && (
                    <div style={{ marginTop: '6px' }}>
                      <img src={p.photo_proof} alt="proof" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #ff0055' }} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ۴. مدیریت تنبیه‌های دست‌نویس برای طرف مقابل */}
      {gameMode === 'manage' && (
        <div style={{ padding: '10px 0' }}>
          <h3 style={{ color: theme.primary, fontSize: '1.15rem', fontWeight: 900, textAlign: 'center', marginBottom: '6px' }}>
            نوشتن تنبیه و حکم برای {isAna ? 'طاها 🐊' : 'آنا 🦓'}
          </h3>
          <p style={{ color: '#aaa', fontSize: '0.82rem', textAlign: 'center', marginBottom: '14px' }}>
            هر درخواستی بنویسی، به محض باخت عشقت در بازی برای او ظاهر می‌شود!
          </p>

          <form onSubmit={handleAddDareForPartner} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="متن حکم دست‌نویس..."
              value={myNewDare}
              onChange={e => setMyNewDare(e.target.value)}
              style={styles.inputField}
            />
            <button type="submit" style={{ ...styles.actionBtn, width: 'auto', padding: '10px 18px', background: theme.primary }}>
              ثبت ⚡
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
            {myDaresList.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#777' }}>هنوز حکمی ننوشته‌ای!</p>
            ) : (
              myDaresList.map((d, index) => (
                <div key={d.id} style={{ background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,0,85,0.3)', color: '#fff', fontSize: '0.88rem' }}>
                  {index + 1}. {d.content}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ۵. صفحه باخت و ثبت اثبات عکس */}
      {gameMode === 'gameover' && (
        <div style={styles.gameOverPanel}>
          <span style={{ fontSize: '3.2rem' }}>🚨🔞💋</span>
          <h3 style={{ color: '#ff0055', fontSize: '1.45rem', fontWeight: 900, margin: '6px 0' }}>
            به دام افتادی! جریمه در صفحه طرف مقابل ثبت شد!
          </h3>

          <div style={styles.penaltyCard}>
            <div style={{ color: '#ff758c', fontSize: '0.82rem', fontWeight: 800 }}>حکم صادرشده:</div>
            <p style={{ color: '#fff', fontSize: '1.15rem', margin: '10px 0', lineHeight: 1.85, fontWeight: 900 }}>
              {currentPenalty}
            </p>
            <button onClick={reRollPenalty} style={styles.rerollBtn}>
              🎲 تغییر چالش
            </button>
          </div>

          <form onSubmit={handleUploadProof} style={{ marginTop: '14px', textAlign: 'right' }}>
            <label style={{ color: '#00f0ff', fontSize: '0.88rem', fontWeight: 800 }}>
              📸 آپلود لینک عکس جهت اثبات انجام جریمه:
            </label>
            <input
              type="text"
              placeholder="لینک مستقیم تصویر..."
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

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="submit"
                disabled={isUploading}
                style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #ff0055, #ff4d88)', flex: 2 }}
              >
                {isUploading ? 'در حال ثبت... ⏳' : 'ثبت اثبات عکس 📸💋'}
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
                ✅ جریمه با موفقیت انجام و در گالری ثبت شد!
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