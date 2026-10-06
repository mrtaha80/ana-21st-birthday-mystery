import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ivfksnobyapzizntmgcf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DWH7XNd9-kG0943xm4AVaA_9b5zIem0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ANA_DARES = [
  "همین الان یک عکس بسیار جسورانه، با بالاتنه باز یا لباس زیر در نور ملایم اتاق برای طاها ثبت و آپلود کن 📸🔥",
  "یک عکس تمام‌قد از پشت و انحنای بدنت با ژست جذاب برای گالری محرمانه طاها بفرست 🔞✨",
  "آنا موظفه ۳۰ ثانیه لاله گوش و خط گردن طاها رو غرق بوسه‌های خمار و پیوسته کنه 🐊💋",
  "یک سلفی بسیار داغ با نگاه خمار و گاز گرفتن لب پایین در تخت‌خواب ثبت کن 🫦🛏️",
  "آنا باید پشت طاها رو به مدت ۲ دقیقه با سرانگشتانش نوازش عمیق و قلقلکی بده 💆‍♀️🔥",
  "آنا باید در فاصله دو سانتی‌متری از لب‌های طاها، هوس‌انگیزترین خواسته‌اش رو با صدای آروم زمزمه کنه 🤫"
];

const TAHA_DARES = [
  "طاها موظفه پیراهنش رو دربیاره و یک عکس هات از بالاتنه و بازوهای مردانه‌ش برای آنا ثبت کنه 📸💪",
  "۵ دقیقه ماساژ عمیق و لوسیونی کمر، گردن و شانه‌های آنا پرنسس در نور ملایم شمع 💆‍♂️🕯️",
  "پای پرنسس آنا رو روی پاهات بذار و مچ و کف پاش رو با محبت و طمأنینه ببوس 👣💋",
  "پذیرش یک فرمان مطلق و جسورانه از سمت آنا؛ طاها فقط حق داره بگه چشم بانو! 👸🏼👑",
  "طاها باید مسیر گردن تا سینه آنا رو با بوسه‌های متوالی و نفس‌های گرم طی کنه 🔥💋"
];

export default function SexyGame({ theme, onParticleTrigger, currentUser = 'taha' }) {
  const isAna = currentUser === 'ana';
  const partnerUser = isAna ? 'taha' : 'ana';

  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, won, lost, manage, live
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [progress, setProgress] = useState(0); // 0 تا 100 درصد تا خط پایان
  const [currentPenalty, setCurrentPenalty] = useState('');
  
  // ثبت تصویر و همگام‌سازی
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [livePenalties, setLivePenalties] = useState([]);

  // احکام دست‌نویس
  const [targetPenalties, setTargetPenalties] = useState([]);
  const [myNewDare, setMyNewDare] = useState('');
  const [myDaresList, setMyDaresList] = useState([]);

  // متغیرهای فیزیک و موتور بومی Canvas
  const stateRef = useRef({
    playerY: 0,
    playerVy: 0,
    isGrounded: true,
    jumpCount: 0,
    obstacles: [],
    collectibles: [],
    hasShield: false,
    score: 0,
    lives: 3,
    progress: 0,
    distanceRun: 0,
    targetDistance: 1200 // مسافت تا بردن بازی
  });

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
      const { data } = await supabase.from('game_penalties').select('*').order('id', { ascending: false }).limit(8);
      if (data) setLivePenalties(data);
    } catch (e) { console.error(e); }
  };

  const fetchCustomPenalties = async () => {
    try {
      const { data: forMe } = await supabase.from('custom_punishments').select('*').eq('target', currentUser);
      if (forMe) setTargetPenalties(forMe);
      const { data: byMe } = await supabase.from('custom_punishments').select('*').eq('author', currentUser);
      if (byMe) setMyDaresList(byMe);
    } catch (e) { console.error(e); }
  };

  const handleAddDareForPartner = async (e) => {
    e.preventDefault();
    if (!myNewDare.trim()) return;
    try {
      await supabase.from('custom_punishments').insert([{
        author: currentUser,
        target: partnerUser,
        content: myNewDare.trim()
      }]);
      setMyNewDare('');
      fetchCustomPenalties();
      onParticleTrigger('🔥');
    } catch (e) { console.error(e); }
  };

  // کنترلر پرش نرم 60 فریم
  const performJump = () => {
    const s = stateRef.current;
    if (gameState !== 'playing') return;

    if (s.jumpCount < 2) {
      s.playerVy = -11.5; // جهش ملایم و کنترل‌شده
      s.isGrounded = false;
      s.jumpCount += 1;
      if (navigator.vibrate) navigator.vibrate(30);
      onParticleTrigger('⚡');
    }
  };

  // لوپ فیزیک و رندر موتور Canvas
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const s = stateRef.current;
    s.playerY = 0;
    s.playerVy = 0;
    s.jumpCount = 0;
    s.obstacles = [];
    s.collectibles = [];
    s.hasShield = false;
    s.score = 0;
    s.lives = 3;
    s.distanceRun = 0;
    s.progress = 0;

    let spawnTimer = 0;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // رسم افکت پس‌زمینه نئونی
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#1a0210');
      grad.addColorStop(1, '#050004');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // خط افق و زمین نئونی
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 35);
      ctx.lineTo(canvas.width, canvas.height - 35);
      ctx.stroke();

      // شبیه‌سازی فیزیک جاذبه (Gravity & Velocity)
      s.playerY += s.playerVy;
      s.playerVy += 0.58; // شتاب نرم جاذبه

      if (s.playerY >= 0) {
        s.playerY = 0;
        s.playerVy = 0;
        s.isGrounded = true;
        s.jumpCount = 0;
      }

      s.distanceRun += 1.5;
      const progressPercent = Math.min(100, Math.floor((s.distanceRun / s.targetDistance) * 100));
      setProgress(progressPercent);

      // پیروزی در صورت رسیدن به خط پایان
      if (s.distanceRun >= s.targetDistance) {
        setGameState('won');
        onParticleTrigger('👑');
        return;
      }

      // تولید موانع عادلانه با فاصله مناسب
      spawnTimer++;
      if (spawnTimer > 95 && Math.random() < 0.35) {
        s.obstacles.push({
          x: canvas.width + 20,
          w: 32,
          h: 36,
          icon: isAna ? '🐊' : '🦓'
        });
        spawnTimer = 0;
      }

      // تولید سکه قلبی و سپر
      if (spawnTimer === 50 && Math.random() < 0.5) {
        s.collectibles.push({
          x: canvas.width + 20,
          y: canvas.height - 85 - Math.random() * 35,
          w: 24,
          h: 24,
          icon: Math.random() > 0.3 ? '💖' : '🛡️'
        });
      }

      // پردازش و برخوردسنجی موانع
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        obs.x -= 3.8; // سرعت ثابت و استاندارد

        // رسم مانع
        ctx.font = '28px sans-serif';
        ctx.fillText(obs.icon, obs.x, canvas.height - 40);

        // هیت‌باکس دقیق و عادلانه بازیکن
        const pX = 65;
        const pY = canvas.height - 45 + s.playerY;

        if (Math.abs(pX - obs.x) < 28 && pY > canvas.height - 75) {
          if (s.hasShield) {
            s.hasShield = false;
            onParticleTrigger('🛡️');
            s.obstacles.splice(i, 1);
          } else {
            s.lives -= 1;
            setLives(s.lives);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            s.obstacles.splice(i, 1);

            if (s.lives <= 0) {
              handleTriggerGameOver();
              return;
            }
          }
        } else if (obs.x < -30) {
          s.obstacles.splice(i, 1);
          s.score += 25;
          setScore(s.score);
          if (s.score > highScore) setHighScore(s.score);
        }
      }

      // پردازش و جمع‌آوری سکه‌ها
      for (let i = s.collectibles.length - 1; i >= 0; i--) {
        const col = s.collectibles[i];
        col.x -= 3.5;

        ctx.font = '22px sans-serif';
        ctx.fillText(col.icon, col.x, col.y);

        const pX = 65;
        const pY = canvas.height - 45 + s.playerY;

        if (Math.abs(pX - col.x) < 30 && Math.abs(pY - col.y) < 35) {
          if (col.icon === '🛡️') s.hasShield = true;
          s.score += 40;
          setScore(s.score);
          onParticleTrigger(col.icon);
          s.collectibles.splice(i, 1);
        } else if (col.x < -30) {
          s.collectibles.splice(i, 1);
        }
      }

      // رسم بازیکن با افکت سپر و هاله
      const playerDrawY = canvas.height - 42 + s.playerY;
      ctx.font = '36px sans-serif';
      ctx.fillText(isAna ? '🦓' : '🐊', 50, playerDrawY);

      if (s.hasShield) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(68, playerDrawY - 14, 25, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore, isAna]);

  const handleStartGame = () => {
    setScore(0);
    setLives(3);
    setProgress(0);
    setGameState('playing');
    setUploadSuccess(false);
    onParticleTrigger('🔥');
  };

  const handleTriggerGameOver = async () => {
    setGameState('lost');
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
      await supabase.from('game_penalties').insert([{
        player: isAna ? 'آنا 🦓' : 'طاها 🐊',
        dare_text: picked,
        status: 'در انتظار انجام و اثبات'
      }]);
      fetchLivePenalties();
    } catch (e) { console.error(e); }
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;
    setIsUploading(true);

    try {
      const senderTag = isAna ? 'پرنسس آنا 🦓 (اثبات جریمه)' : 'طاها کروکودیل 🐊 (اثبات جریمه)';
      const fullCaption = `🔞 ${senderTag}: ${currentPenalty} | پیام: ${caption || 'ثبت در خلوتگاه'}`;

      await supabase.from('shared_photos').insert([{ title: fullCaption, image_url: photoUrl.trim() }]);
      await supabase.from('game_penalties').insert([{
        player: isAna ? 'آنا 🦓' : 'طاها 🐊',
        dare_text: currentPenalty,
        status: 'انجام شد و عکس ثبت گردید ✅',
        photo_proof: photoUrl.trim()
      }]);

      setUploadSuccess(true);
      fetchLivePenalties();
      onParticleTrigger('💋');
      setTimeout(() => {
        setGameState('menu');
        setPhotoUrl('');
        setCaption('');
      }, 2000);
    } catch (e) { console.error(e); }
    finally { setIsUploading(false); }
  };

  return (
    <div style={{ ...styles.gameWrapper, borderColor: theme.primary, boxShadow: theme.glow }}>
      {/* HUD سربرگ بازی مدرن */}
      <div style={styles.hudHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>{isAna ? '🦓' : '🐊'}</span>
          <div>
            <div style={{ color: theme.primary, fontWeight: 900, fontSize: '1.15rem' }}>
              {isAna ? 'آنا در کمینگاه کروکودیل' : 'طاها در قلمرو پرنسس'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
              {gameState === 'playing' ? `مسیر طی‌شده: ${progress}%` : 'موتور شتاب 60 فریم Canvas'}
            </div>
          </div>
        </div>

        {/* خط سلامت و امتیاز */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ color: '#ff0055', fontSize: '1.2rem', letterSpacing: '2px' }}>
            {'❤️'.repeat(lives)}
          </div>
          <div style={styles.scoreBadge}>
            <span style={{ color: '#00f0ff', fontWeight: 900 }}>{score}</span>
          </div>
        </div>
      </div>

      {/* نوار پیشرفت به سمت بردن بازی */}
      {gameState === 'playing' && (
        <div style={styles.progressBarTrack}>
          <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
        </div>
      )}

      {/* منوی تب‌های جانبی */}
      <div style={{ display: 'flex', gap: '8px', margin: '12px 0', justifyContent: 'center' }}>
        <button
          onClick={() => setGameState('menu')}
          style={{ ...styles.tabBtn, background: gameState === 'menu' || gameState === 'playing' ? theme.primary : '#18020c' }}
        >
          🎮 اجرای بازی
        </button>
        <button
          onClick={() => setGameState('live')}
          style={{ ...styles.tabBtn, background: gameState === 'live' ? theme.primary : '#18020c' }}
        >
          🚨 تابلوی زنده ({livePenalties.length})
        </button>
        <button
          onClick={() => setGameState('manage')}
          style={{ ...styles.tabBtn, background: gameState === 'manage' ? theme.primary : '#18020c' }}
        >
          ✍️ احکام من برای عشقم ({myDaresList.length})
        </button>
      </div>

      {/* ۱. صفحه اصلی منو */}
      {gameState === 'menu' && (
        <div style={styles.centerCard}>
          <div style={{ fontSize: '3.6rem', marginBottom: '8px' }}>{isAna ? '🦓✨' : '🐊🔥'}</div>
          <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 900, marginBottom: '6px' }}>
            رسیدن به خط پایان ۱۰۰٪ = پیروزی و صدور دستور!
          </h3>
          <p style={{ color: '#bbb', fontSize: '0.85rem', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 16px' }}>
            کنترل‌ها کاملاً روان با فیزیک جاذبه بازنویسی شده‌اند. با پریدن از روی موانع و جمع‌آوری قلب‌ها به ۱۰۰٪ برسید تا برنده شوید؛ در غیر این‌صورت احکام دست‌نویس طرف مقابل بالا می‌آید!
          </p>
          <button onClick={handleStartGame} style={styles.startActionBtn}>
            شروع راند (فیزیک روان) 🚀🔥
          </button>
        </div>
      )}

      {/* ۲. محیط موتور Canvas با دکمه لمسی ارگونومیک مخصوص موبایل */}
      {gameState === 'playing' && (
        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            width={680}
            height={220}
            onClick={performJump}
            style={styles.canvasElement}
          />

          {/* دکمه لمسی ارگونومیک شناور برای راحتی در گوشی */}
          <div style={styles.touchControlsArea}>
            <button onTouchStart={performJump} onClick={performJump} style={styles.jumpTouchButton}>
              پرش 🦘 (Double Jump)
            </button>
          </div>
        </div>
      )}

      {/* ۳. پیروزی در بازی */}
      {gameState === 'won' && (
        <div style={styles.centerCard}>
          <span style={{ fontSize: '3.8rem' }}>👑🎉💋</span>
          <h3 style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 900, margin: '8px 0' }}>
            تبریک! شما به خط پایان رسیدید و برنده شدید!
          </h3>
          <p style={{ color: '#fff', fontSize: '1rem', lineHeight: 1.8 }}>
            حالا نوبت شماست که یک دستور یا خواسته دلخواه برای {isAna ? 'طاها 🐊' : 'آنا 🦓'} صادر کنید!
          </p>
          <button onClick={() => setGameState('menu')} style={{ ...styles.startActionBtn, background: '#10b981', marginTop: '12px' }}>
            بازگشت به منو 🔄
          </button>
        </div>
      )}

      {/* ۴. باخت در بازی و لود حکم دست‌نویس */}
      {gameState === 'lost' && (
        <div style={styles.centerCard}>
          <span style={{ fontSize: '3.4rem' }}>🚨🔞💋</span>
          <h3 style={{ color: '#ff0055', fontSize: '1.45rem', fontWeight: 900, margin: '6px 0' }}>
            فرصت‌های شما تمام شد! حکم دست‌نویس {isAna ? 'طاها' : 'آنا'}:
          </h3>

          <div style={styles.dareNoticeBox}>
            <p style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.8, margin: '6px 0' }}>
              {currentPenalty}
            </p>
          </div>

          <form onSubmit={handleUploadProof} style={{ marginTop: '14px', textAlign: 'right' }}>
            <label style={{ color: '#00f0ff', fontSize: '0.85rem', fontWeight: 800 }}>
              📸 آپلود عکس جهت اثبات انجام حکم:
            </label>
            <input
              type="text"
              placeholder="لینک تصویر..."
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              style={styles.formInput}
            />
            <input
              type="text"
              placeholder="پیام یا شیطنت همراه..."
              value={caption}
              onChange={e => setCaption(e.target.value)}
              style={{ ...styles.formInput, marginTop: '8px' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button type="submit" disabled={isUploading} style={styles.submitProofBtn}>
                {isUploading ? 'در حال ثبت... ⏳' : 'ثبت اثبات در آلبوم 📸💋'}
              </button>
              <button type="button" onClick={handleStartGame} style={styles.retryBtn}>
                تلاش دوباره 🔄
              </button>
            </div>
            {uploadSuccess && <p style={{ color: '#4ade80', marginTop: '8px', textAlign: 'center', fontWeight: 800 }}>✅ اثبات با موفقیت ثبت شد!</p>}
          </form>
        </div>
      )}

      {/* ۵. تابلوی زنده */}
      {gameState === 'live' && (
        <div style={{ padding: '8px 0' }}>
          <h4 style={{ color: '#ff0055', textAlign: 'center', fontWeight: 900, marginBottom: '10px' }}>
            تابلوی زنده باخت‌ها و اثبات‌ها
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {livePenalties.map(p => (
              <div key={p.id} style={styles.liveItemCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: theme.primary, fontWeight: 900 }}>{p.player}</span>
                  <span style={{ color: p.status.includes('✅') ? '#4ade80' : '#f59e0b' }}>{p.status}</span>
                </div>
                <p style={{ color: '#fff', fontSize: '0.9rem', margin: '4px 0' }}>{p.dare_text}</p>
                {p.photo_proof && <img src={p.photo_proof} alt="proof" style={{ width: '60px', height: '60px', borderRadius: '8px', marginTop: '4px', objectFit: 'cover' }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ۶. مدیریت احکام دست‌نویس */}
      {gameState === 'manage' && (
        <div style={{ padding: '8px 0' }}>
          <h4 style={{ color: theme.primary, textAlign: 'center', fontWeight: 900, marginBottom: '6px' }}>
            نوشتن احکام دست‌نویس برای {isAna ? 'طاها 🐊' : 'آنا 🦓'}
          </h4>
          <form onSubmit={handleAddDareForPartner} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="متن حکم جدید..."
              value={myNewDare}
              onChange={e => setMyNewDare(e.target.value)}
              style={styles.formInput}
            />
            <button type="submit" style={{ ...styles.submitProofBtn, flex: 'none', padding: '10px 16px' }}>
              ثبت ⚡
            </button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
            {myDaresList.map((d, i) => (
              <div key={d.id} style={styles.customDareItem}>
                {i + 1}. {d.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  gameWrapper: {
    background: 'radial-gradient(circle at 50% 30%, #1a0210 0%, #050004 100%)',
    borderRadius: '26px',
    padding: '20px',
    border: '2px solid',
    direction: 'rtl',
    position: 'relative'
  },
  hudHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255, 0, 85, 0.25)'
  },
  scoreBadge: {
    background: 'rgba(0, 0, 0, 0.65)',
    border: '1px solid #00f0ff',
    borderRadius: '14px',
    padding: '4px 12px',
    fontSize: '0.95rem'
  },
  progressBarTrack: {
    height: '6px',
    background: '#220310',
    borderRadius: '6px',
    overflow: 'hidden',
    margin: '10px 0'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff0055, #00f0ff)',
    transition: 'width 0.1s linear'
  },
  tabBtn: {
    padding: '7px 14px',
    borderRadius: '16px',
    border: '1px solid rgba(255,0,85,0.4)',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 800,
    cursor: 'pointer'
  },
  centerCard: {
    textAlign: 'center',
    padding: '24px 10px'
  },
  startActionBtn: {
    padding: '12px 28px',
    borderRadius: '25px',
    border: 'none',
    background: 'linear-gradient(135deg, #ff0055, #ff3377)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(255,0,85,0.5)'
  },
  canvasElement: {
    width: '100%',
    height: '210px',
    display: 'block',
    border: '2px solid rgba(255,0,85,0.3)',
    borderRadius: '18px',
    cursor: 'pointer'
  },
  touchControlsArea: {
    marginTop: '12px',
    textAlign: 'center'
  },
  jumpTouchButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '20px',
    border: '2px solid #ff0055',
    background: 'linear-gradient(135deg, rgba(255,0,85,0.3), rgba(255,0,85,0.1))',
    color: '#fff',
    fontWeight: 900,
    fontSize: '1.1rem',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)'
  },
  dareNoticeBox: {
    background: 'rgba(255, 0, 85, 0.12)',
    border: '2px dashed #ff0055',
    borderRadius: '18px',
    padding: '16px',
    margin: '12px 0'
  },
  formInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '12px',
    background: '#120108',
    border: '1px solid #ff0055',
    color: '#fff',
    outline: 'none',
    fontSize: '0.88rem',
    boxSizing: 'border-box'
  },
  submitProofBtn: {
    flex: 2,
    padding: '11px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #ff0055, #ff4d88)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer'
  },
  retryBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: '14px',
    border: '1px solid #555',
    background: '#222',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer'
  },
  liveItemCard: {
    background: 'rgba(255,255,255,0.04)',
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,0,85,0.25)'
  },
  customDareItem: {
    background: 'rgba(255,255,255,0.05)',
    padding: '8px 12px',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.85rem'
  }
};