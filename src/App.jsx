import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import SexyGame from './SexyGame.jsx';

const SUPABASE_URL = 'https://ivfksnobyapzizntmgcf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DWH7XNd9-kG0943xm4AVaA_9b5zIem0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEFAULT_PLAYLIST = [
  { 
    id: 'def-1', 
    title: 'والس عاشقانه شوپن 🎻', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Chopin_-_Nocturne_Op_9_No_2_E_flat_major.ogg',
    added_by: 'system'
  },
  { 
    id: 'def-2', 
    title: 'سونات مهتاب بتهوون 🍷', 
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Moonlight_Sonata_movement_1.ogg',
    added_by: 'system'
  }
];

export default function App() {
  const [showBirthdayIntro, setShowBirthdayIntro] = useState(true);
  const [giftOpened, setGiftOpened] = useState(false);

  const [currentUser, setCurrentUser] = useState(null); // 'taha' | 'ana'
  const [targetLogin, setTargetLogin] = useState('ana');
  const [enteredPass, setEnteredPass] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState('hub');

  const [newPassInput, setNewPassInput] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState(false);

  // سیستم پلی‌لیست اشتراکی متصل به Supabase
  const [sharedSongs, setSharedSongs] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongUrl, setNewSongUrl] = useState('');
  const [showAddAudioModal, setShowAddAudioModal] = useState(false);
  const audioRef = useRef(null);

  const [currentTheme, setCurrentTheme] = useState('velvet');

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [photos, setPhotos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [bucketList, setBucketList] = useState([]);
  const [newWish, setNewWish] = useState('');

  const [confessions, setConfessions] = useState([]);
  const [newConfession, setNewConfession] = useState('');
  const [confessionType, setConfessionType] = useState('apology');
  const [penaltyInputs, setPenaltyInputs] = useState({});

  const [dashboardWhispers, setDashboardWhispers] = useState([]);
  const [myNewWhisper, setMyNewWhisper] = useState('');
  const [showWhisperModal, setShowWhisperModal] = useState(false);

  const [passionMeter, setPassionMeter] = useState(40);
  const [intimateAction, setIntimateAction] = useState(null);

  const [particles, setParticles] = useState([]);
  const [touchWaves, setTouchWaves] = useState([]);

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

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
      const timer = setInterval(fetchAllData, 5000);
      return () => clearInterval(timer);
    }
  }, [currentUser]);

  const fetchAllData = () => {
    fetchNotes();
    fetchPhotos();
    fetchBucket();
    fetchConfessions();
    fetchDashboardWhispers();
    fetchSharedSongs();
  };

  // دریافت آهنگ‌های اشتراکی
  const fetchSharedSongs = async () => {
    try {
      const { data } = await supabase
        .from('shared_songs')
        .select('*')
        .order('id', { ascending: true });
      if (data) setSharedSongs(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ادغام آهنگ‌های پیش‌فرض و آهنگ‌های اشتراکی دیتابیس
  const fullPlaylist = [...DEFAULT_PLAYLIST, ...sharedSongs];
  const activeTrack = fullPlaylist[currentTrackIndex] || fullPlaylist[0];

  // ثبت آهنگ با محدودیت ۵ تا برای هر نفر
  const handleAddCustomSong = async (e) => {
    e.preventDefault();
    if (!newSongUrl.trim()) return;

    // شمارش تعداد آهنگ‌های کاربر فعلی
    const myCurrentSongsCount = sharedSongs.filter(s => s.added_by === currentUser).length;
    if (myCurrentSongsCount >= 5) {
      alert(`سقف مجاز شما پر شده است! هر نفر حداکثر ۵ آهنگ می‌تواند ثبت کند. برای افزودن آهنگ جدید، یکی از قبلی‌های خودت را حذف کن.`);
      return;
    }

    const titleToSave = newSongTitle.trim() || `آهنگ عاشقانه ${currentUser === 'taha' ? 'طاها 🐊' : 'آنا 🦓'}`;

    try {
      const { data, error } = await supabase.from('shared_songs').insert([{
        title: titleToSave,
        url: newSongUrl.trim(),
        added_by: currentUser
      }]).select();

      if (!error && data) {
        setSharedSongs([...sharedSongs, data[0]]);
        setNewSongTitle('');
        setNewSongUrl('');
        setShowAddAudioModal(false);
        spawnParticles('🎶');
        // انتخاب و پخش خودکار آهنگ جدید
        const newIndex = fullPlaylist.length;
        setCurrentTrackIndex(newIndex);
        if (audioRef.current) {
          audioRef.current.src = data[0].url;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // حذف آهنگ (فقط آهنگ‌های خودِ کاربر)
  const handleDeleteSong = async (songId, addedBy) => {
    if (addedBy !== currentUser) {
      alert('شما فقط می‌توانید آهنگ‌هایی که خودتان اضافه کرده‌اید را حذف کنید!');
      return;
    }

    try {
      await supabase.from('shared_songs').delete().eq('id', songId);
      setSharedSongs(sharedSongs.filter(s => s.id !== songId));
      setCurrentTrackIndex(0);
      spawnParticles('🗑️');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenGift = () => {
    setGiftOpened(true);
    spawnParticles('🎁');
    spawnParticles('🎂');
    startAudio();
    if (navigator.vibrate) navigator.vibrate([100, 50, 150]);
    setTimeout(() => {
      setShowBirthdayIntro(false);
    }, 2800);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(false);

    const userEmail = targetLogin === 'taha' 
      ? 'tahaislion@gmail.com' 
      : 'tahaislion+ana@gmail.com';

    const defaultPass = targetLogin === 'taha' ? '1405' : '0808';
    const localPass = localStorage.getItem(`pass_${targetLogin}`);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: enteredPass.trim()
      });

      if (!error && data?.user) {
        loginSuccess();
        return;
      }
    } catch (err) {}

    if ((localPass && localPass === enteredPass.trim()) || enteredPass.trim() === defaultPass) {
      loginSuccess();
    } else {
      setAuthError(true);
      triggerVibrate(200);
      setTimeout(() => setAuthError(false), 2200);
    }
  };

  const loginSuccess = () => {
    setCurrentUser(targetLogin);
    setEnteredPass('');
    spawnParticles(targetLogin === 'taha' ? '🦓' : '🐊');
    triggerVibrate([50, 50, 100]);
    startAudio();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {}
    setCurrentUser(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassInput.trim()) return;
    const passToSave = newPassInput.trim();

    localStorage.setItem(`pass_${currentUser}`, passToSave);
    try {
      await supabase.from('user_auth').upsert({
        username: currentUser,
        passcode: passToSave,
        updated_at: new Date().toISOString()
      });
      await supabase.auth.updateUser({ password: passToSave });
    } catch (err) {
      console.error(err);
    }

    setPassChangeSuccess(true);
    setNewPassInput('');
    triggerVibrate([80, 50, 80]);
    spawnParticles('🔒');
    setTimeout(() => setPassChangeSuccess(false), 3000);
  };

  const triggerVibrate = (pattern) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const startAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const changeTrack = (index) => {
    setCurrentTrackIndex(index);
    if (audioRef.current && fullPlaylist[index]) {
      audioRef.current.src = fullPlaylist[index].url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleGlobalTouch = (e) => {
    const x = e.clientX || (e.touches && e.touches[0]?.clientX);
    const y = e.clientY || (e.touches && e.touches[0]?.clientY);
    if (x && y) {
      const newWave = { id: Date.now(), x, y };
      setTouchWaves(prev => [...prev.slice(-3), newWave]);
      setTimeout(() => {
        setTouchWaves(prev => prev.filter(w => w.id !== newWave.id));
      }, 800);
    }
  };

  const fetchDashboardWhispers = async () => {
    try {
      const { data } = await supabase
        .from('custom_letters')
        .select('*')
        .order('id', { ascending: false });
      if (data) setDashboardWhispers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveWhisper = async (e) => {
    e.preventDefault();
    if (!myNewWhisper.trim()) return;

    try {
      await supabase.from('custom_letters').insert([{
        sender: currentUser,
        title: 'عاشقانه',
        content: myNewWhisper.trim(),
        is_pinned: true
      }]);
      setMyNewWhisper('');
      setShowWhisperModal(false);
      fetchDashboardWhispers();
      spawnParticles('💌');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotes = async () => {
    const { data } = await supabase.from('shared_notes').select('*').order('id', { ascending: false }).limit(30);
    if (data) setNotes(data);
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const authorTag = currentUser === 'taha' ? 'طاها 🐊' : 'آنا 🦓';
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

  const fetchConfessions = async () => {
    try {
      const { data } = await supabase.from('heart_confessions').select('*').order('id', { ascending: false });
      if (data) setConfessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addConfession = async (e) => {
    e.preventDefault();
    if (!newConfession.trim()) return;
    const authorTag = currentUser === 'taha' ? 'طاها 🐊' : 'آنا 🦓';
    try {
      const { data } = await supabase.from('heart_confessions').insert([
        { sender: authorTag, category: confessionType, message: newConfession.trim(), forgiven: false }
      ]).select();
      if (data) {
        setConfessions([data[0], ...confessions]);
        setNewConfession('');
        spawnParticles('🕊️');
        triggerVibrate([50, 100]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignPenaltyToConfession = async (id) => {
    const text = penaltyInputs[id];
    if (!text || !text.trim()) return;

    try {
      await supabase.from('heart_confessions').update({
        message: `${confessions.find(c => c.id === id).message} \n\n[⚡ جریمه تعیین‌شده: ${text.trim()}]`
      }).eq('id', id);

      setPenaltyInputs(prev => ({ ...prev, [id]: '' }));
      fetchConfessions();
      spawnParticles('🔥');
      triggerVibrate([60, 40, 80]);
    } catch (err) {
      console.error(err);
    }
  };

  const forgiveConfession = async (id) => {
    try {
      await supabase.from('heart_confessions').update({ forgiven: true }).eq('id', id);
      setConfessions(confessions.map(c => c.id === id ? { ...c, forgiven: true } : c));
      spawnParticles('🫂');
      triggerVibrate([80, 80, 120]);
    } catch (err) {
      console.error(err);
    }
  };

  const boostPassion = () => {
    triggerVibrate(60);
    spawnParticles('🔥');
    setPassionMeter(prev => {
      const next = prev + 15;
      if (next >= 100) {
        triggerVibrate([100, 50, 150]);
        setIntimateAction('⚡ ولتاژ به ۱۰۰٪ رسید! طاها کروکودیل موظفه همین الان به مدت ۴۰ ثانیه گردن، ترقوه و لب‌های آنا رو غرق بوسه خمار کنه!');
        return 20;
      }
      return next;
    });
  };

  const spawnParticles = (emoji = '💖') => {
    const id = Date.now();
    const batch = Array.from({ length: 14 }).map((_, i) => ({
      id: id + i,
      emoji,
      left: Math.random() * 88 + 6,
      size: Math.random() * 1.5 + 1.2,
      duration: Math.random() * 1.2 + 1.6
    }));
    setParticles(prev => [...prev, ...batch]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !batch.some(b => b.id === p.id)));
    }, 2800);
  };

  const themes = {
    velvet: {
      bg: 'radial-gradient(circle at 50% 25%, #2a0314 0%, #120108 50%, #050003 100%)',
      cardBg: 'rgba(28, 4, 15, 0.9)',
      primary: '#ff0055',
      accent: '#ff3377',
      border: 'rgba(255, 0, 85, 0.5)',
      glow: '0 0 50px rgba(255, 0, 85, 0.45)'
    },
    neonNoir: {
      bg: 'radial-gradient(circle at 50% 40%, #170826 0%, #090212 50%, #030007 100%)',
      cardBg: 'rgba(22, 8, 38, 0.92)',
      primary: '#a855f7',
      accent: '#ec4899',
      border: 'rgba(168, 85, 247, 0.5)',
      glow: '0 0 50px rgba(168, 85, 247, 0.45)'
    },
    pinkDesire: {
      bg: 'radial-gradient(circle at 50% 30%, #38081f 0%, #1a020d 60%, #080004 100%)',
      cardBg: 'rgba(38, 5, 20, 0.92)',
      primary: '#ff1493',
      accent: '#ff69b4',
      border: 'rgba(255, 20, 147, 0.5)',
      glow: '0 0 50px rgba(255, 20, 147, 0.45)'
    }
  };

  const t = themes[currentTheme];

  if (showBirthdayIntro) {
    return (
      <div style={{ ...styles.gateWrapper, background: 'radial-gradient(circle at center, #38051e 0%, #080004 100%)' }}>
        <div style={{
          ...styles.gateCard,
          background: 'rgba(26, 3, 15, 0.95)',
          borderColor: '#ff0055',
          boxShadow: '0 0 70px rgba(255, 0, 85, 0.55)',
          maxWidth: '520px',
          transform: giftOpened ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.4s ease'
        }}>
          <div
            onClick={handleOpenGift}
            style={{
              fontSize: giftOpened ? '5rem' : '4.5rem',
              cursor: 'pointer',
              animation: giftOpened ? 'pulse 0.6s infinite' : 'bounce 1.4s infinite',
              filter: 'drop-shadow(0 0 25px #ff0055)',
              margin: '6px 0 14px'
            }}
          >
            {giftOpened ? '🎂✨🎉' : '🎁💝'}
          </div>

          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#00f0ff', letterSpacing: '2px', textTransform: 'uppercase' }}>
            تولد ۲۱ سالگی پرنسس آنا 👑 | ۲۲ مهر
          </span>

          <h1 style={{ color: '#ff0055', fontSize: '1.75rem', fontWeight: 900, margin: '10px 0' }}>
            تقدیم به ملکه قلب و هوس طاها 💋
          </h1>

          <p style={{ color: '#fff', fontSize: '1.05rem', lineHeight: 1.9, fontWeight: 800, margin: '14px 0 20px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {giftOpened ? (
              <span style={{ color: '#4ade80' }}>درب‌های بهشت اختصاصی‌‌مون باز شد... به دنیای خودت خوش اومدی پرنسس من! 🍓</span>
            ) : (
              "آنای قشنگم، ۲۲ مهر روزیه که خواستنی‌ترین معجزه جهان متولد شد. این وب‌‌سایت کادوی شخصی و همیشگی من برای توئه؛ خلوتگاهی که تمام تپش‌ها، اعتراف‌ها و بازی‌هاش فقط برای تسلیم شدن در برابر تو ساخته شده... روی جعبه کادو بزن تا بازش کنی! 🗝️❤️"
            )}
          </p>

          {!giftOpened && (
            <button onClick={handleOpenGift} style={{ ...styles.gateBtn, background: 'linear-gradient(135deg, #ff0055, #ff4d88)', boxShadow: '0 0 35px rgba(255, 0, 85, 0.6)', fontSize: '1.1rem', padding: '16px' }}>
              باز کردن هدیه تولد و ورود به خلوتگاه 🎁✨
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ ...styles.gateWrapper, background: 'radial-gradient(circle at center, #2e0417 0%, #0a0105 100%)' }}>
        <div style={{ ...styles.gateCard, background: 'rgba(25, 3, 14, 0.94)', borderColor: '#ff0055', boxShadow: '0 0 60px rgba(255, 0, 85, 0.5)' }}>
          <div style={{ fontSize: '3.8rem', animation: 'bounce 1.5s infinite', marginBottom: '8px' }}>
            {targetLogin === 'taha' ? '🐊👑' : '🦓💋'}
          </div>
          <h1 style={{ color: '#ff0055', fontSize: '1.75rem', fontWeight: 900, marginBottom: '6px' }}>
            پرتال اختصاصی {targetLogin === 'taha' ? 'طاها (کروکودیل 🐊)' : 'آنا (گورخر 🦓)'}
          </h1>
          <p style={{ color: '#bbb', fontSize: '0.88rem', marginBottom: '20px' }}>
            رمز ورود محرمانه خودت را وارد کن:
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <button
              onClick={() => { setTargetLogin('taha'); setAuthError(false); }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '16px',
                border: 'none',
                fontWeight: 900,
                cursor: 'pointer',
                background: targetLogin === 'taha' ? 'linear-gradient(135deg, #ff0055, #990033)' : '#1f030f',
                color: '#fff',
                boxShadow: targetLogin === 'taha' ? '0 0 25px rgba(255,0,85,0.6)' : 'none'
              }}
            >
              ورود طاها 🐊
            </button>
            <button
              onClick={() => { setTargetLogin('ana'); setAuthError(false); }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '16px',
                border: 'none',
                fontWeight: 900,
                cursor: 'pointer',
                background: targetLogin === 'ana' ? 'linear-gradient(135deg, #ff007f, #b30059)' : '#1f030f',
                color: '#fff',
                boxShadow: targetLogin === 'ana' ? '0 0 25px rgba(255,0,127,0.6)' : 'none'
              }}
            >
              ورود آنا 🦓 (متولد ۲۲ مهر)
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder={`پین‌کد ${targetLogin === 'taha' ? 'طاها (1405)' : 'آنا (0808)'}`}
              value={enteredPass}
              onChange={(e) => setEnteredPass(e.target.value)}
              style={{ ...styles.gateInput, background: '#12020a', borderColor: '#ff0055', color: '#ff4d88' }}
            />
            <button type="submit" style={{ ...styles.gateBtn, background: 'linear-gradient(135deg, #ff0055, #ff4d88)', boxShadow: '0 0 25px rgba(255, 0, 85, 0.5)' }}>
              گشودن درهای کهکشان 🗝️🔥
            </button>
          </form>

          {authError && (
            <p style={{ color: '#ef4444', marginTop: '12px', fontWeight: 800, fontSize: '0.9rem' }}>
              رمز عبور اشتباه است!
            </p>
          )}
        </div>
      </div>
    );
  }

  const latestHeroPhoto = photos.length > 0 ? photos[0].image_url : null;
  const partnerUser = currentUser === 'taha' ? 'ana' : 'taha';
  const partnerWhispers = dashboardWhispers.filter(w => w.sender === partnerUser);
  const activeWhisper = partnerWhispers.length > 0 ? partnerWhispers[0] : null;

  return (
    <div style={{ ...styles.appContainer, background: t.bg }} onClick={handleGlobalTouch}>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src={activeTrack ? activeTrack.url : DEFAULT_PLAYLIST[0].url}
      />

      {touchWaves.map(w => (
        <span
          key={w.id}
          style={{
            position: 'fixed',
            left: `${w.x}px`,
            top: `${w.y}px`,
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255,0,85,0.8) 0%, transparent 75%)',
            animation: 'touchRipple 0.8s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 9996
          }}
        />
      ))}

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

      {/* موزیک پلیر پیشرفته + سیستم دیتابیسی ثبت و حذف آهنگ با نام فرستنده */}
      <div style={{ ...styles.floatingAudioPlayer, borderColor: t.primary, boxShadow: t.glow }}>
        <button onClick={toggleMusic} style={{ ...styles.playCircle, background: t.primary }}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeTrack ? activeTrack.title : 'موزیک عاشقانه'}
            </span>
            {activeTrack && activeTrack.added_by !== 'system' && (
              <span style={{
                fontSize: '0.68rem',
                padding: '2px 6px',
                borderRadius: '8px',
                background: activeTrack.added_by === 'taha' ? 'rgba(0,240,255,0.2)' : 'rgba(255,0,127,0.2)',
                color: activeTrack.added_by === 'taha' ? '#00f0ff' : '#ff758c',
                fontWeight: 900
              }}>
                توسط: {activeTrack.added_by === 'taha' ? 'طاها 🐊' : 'آنا 🦓'}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
            {fullPlaylist.map((track, i) => (
              <div key={track.id} style={{ display: 'flex', alignItems: 'center', background: currentTrackIndex === i ? t.primary : 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1px 5px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); changeTrack(i); }}
                  style={{
                    background: 'none',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                >
                  {i + 1}
                </button>
                {/* دکمه حذف فقط اگر آهنگ متعلق به کاربر فعلی باشد */}
                {track.added_by === currentUser && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSong(track.id, track.added_by); }}
                    style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.7rem', padding: '0 2px' }}
                    title="حذف این آهنگ"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={(e) => { e.stopPropagation(); setShowAddAudioModal(!showAddAudioModal); }}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '2px 8px',
                fontSize: '0.68rem',
                cursor: 'pointer',
                fontWeight: 800
              }}
            >
              ➕ افزودن (حداکثر ۵)
            </button>
          </div>
        </div>
      </div>

      {/* پنجره ثبت آهنگ با لینک مستقیم در دیتابیس */}
      {showAddAudioModal && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          left: '20px',
          background: 'rgba(18, 2, 10, 0.96)',
          border: `2px solid ${t.primary}`,
          borderRadius: '18px',
          padding: '14px',
          zIndex: 9999,
          maxWidth: '320px',
          boxShadow: t.glow
        }}>
          <span style={{ color: '#00f0ff', fontSize: '0.8rem', fontWeight: 900 }}>
            اشتراک‌گذاری موزیک جدید با عشقت ({sharedSongs.filter(s => s.added_by === currentUser).length}/5):
          </span>
          <form onSubmit={handleAddCustomSong} style={{ marginTop: '8px' }}>
            <input
              type="text"
              placeholder="نام یا توضیح آهنگ..."
              value={newSongTitle}
              onChange={e => setNewSongTitle(e.target.value)}
              style={{ ...styles.inputField, padding: '7px 10px', fontSize: '0.8rem', marginBottom: '6px' }}
            />
            <input
              type="text"
              placeholder="لینک مستقیم mp3 یا ogg..."
              value={newSongUrl}
              onChange={e => setNewSongUrl(e.target.value)}
              style={{ ...styles.inputField, padding: '7px 10px', fontSize: '0.8rem' }}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <button type="submit" style={{ ...styles.actionBtn, padding: '8px', fontSize: '0.78rem', background: t.primary, flex: 2 }}>
                ارسال به دیتابیس 🚀
              </button>
              <button type="button" onClick={() => setShowAddAudioModal(false)} style={{ ...styles.actionBtn, padding: '8px', fontSize: '0.78rem', background: '#333', flex: 1 }}>
                بستن
              </button>
            </div>
          </form>
        </div>
      )}

      {/* هدر بالایی با تنظیم دقیق بارش گورخر برای طاها و کروکودیل برای آنا */}
      <header style={{
        ...styles.navbar,
        borderColor: t.border,
        background: 'rgba(18, 2, 10, 0.88)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {latestHeroPhoto && (
            <div style={{ position: 'relative' }}>
              <img
                src={latestHeroPhoto}
                alt="Avatar"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${t.primary}`,
                  boxShadow: `0 0 15px ${t.primary}`
                }}
              />
              <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', fontSize: '1rem' }}>
                {currentUser === 'taha' ? '🐊' : '🦓'}
              </span>
            </div>
          )}
          <div>
            <div style={{ fontWeight: 900, color: t.primary, fontSize: '1.15rem' }}>
              {currentUser === 'taha' ? 'طاها (کروکودیل مقتدر 🐊)' : 'پرنسس آنا (متولد ۲۲ مهر 🎂)'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
              خلوتگاه اختصاصی دو‌نفره
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => spawnParticles(currentUser === 'taha' ? '🦓' : '🐊')}
            style={styles.badgeBtn}
          >
            {currentUser === 'taha' ? '🦓 باران گورخر' : '🐊 باران کروکودیل'}
          </button>

          <button
            onClick={handleLogout}
            style={{ ...styles.badgeBtn, background: '#ef4444', color: '#fff', border: 'none' }}
          >
            خروج 🚪
          </button>
        </div>
      </header>

      {/* نوار تغییر اتمسفر */}
      <div style={styles.themeSelectorBar}>
        <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>اتمسفر شبانه:</span>
        <button onClick={() => setCurrentTheme('velvet')} style={{ ...styles.themeBtn, background: '#3b051b', color: '#ff4d88', border: currentTheme === 'velvet' ? '2px solid #ff0055' : 'none' }}>🍷 مخمل و شراب (Dark Romance)</button>
        <button onClick={() => setCurrentTheme('neonNoir')} style={{ ...styles.themeBtn, background: '#210936', color: '#c084fc', border: currentTheme === 'neonNoir' ? '2px solid #a855f7' : 'none' }}>💜 سایبرپانک شهوانی (Neon Noir)</button>
        <button onClick={() => setCurrentTheme('pinkDesire')} style={{ ...styles.themeBtn, background: '#4a0828', color: '#f472b6', border: currentTheme === 'pinkDesire' ? '2px solid #ff1493' : 'none' }}>🍓 توت‌فرنگی شهوانی</button>
      </div>

      {/* نوار تب‌ها */}
      <nav style={styles.navTabs}>
        {[
          { id: 'hub', label: 'داشبورد عاشقی ⏳' },
          { id: 'sexy', label: 'بازی کمین و سلفی 🔥' },
          { id: 'heart', label: 'پل دلتنگی و جریمه‌ها ⚡🕊️' },
          { id: 'heat', label: 'رادار صمیمیت لمسی ⚡' },
          { id: 'gallery', label: 'آلبوم پولاروید زنده 📸' },
          { id: 'notes', label: 'پچ‌پچ‌های مخفی 💌' },
          { id: 'bucket', label: 'دفترچه آرزوها 🌟' },
          { id: 'vault', label: 'مدیریت رمز اختصاصی 🔒' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); triggerVibrate(30); }}
            style={{
              ...styles.tabButton,
              background: activeTab === item.id ? `linear-gradient(135deg, ${t.primary}, ${t.accent})` : 'rgba(25, 3, 14, 0.85)',
              color: activeTab === item.id ? '#fff' : '#ff758c',
              border: `2px solid ${t.border}`,
              transform: activeTab === item.id ? 'translateY(-2px)' : 'none',
              boxShadow: activeTab === item.id ? t.glow : 'none'
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* محتوای صفحات */}
      <main style={styles.mainContent}>
        {/* ۱. تب هاب */}
        {activeTab === 'hub' && (
          <div key="hub" className="slide-in-right" style={{ ...styles.card, background: t.cardBg, borderColor: t.border, boxShadow: t.glow }}>
            <h2 style={{ ...styles.cardTitle, color: t.primary }}>
              ثانیه‌شمار دنیای بی‌پایان ما دوتا 💕
            </h2>

            <div style={styles.counterGrid}>
              <div style={{ ...styles.counterBox, background: '#120108', borderColor: t.primary }}>
                <span style={{ ...styles.counterNum, color: '#ff0055' }}>{timeTogether.days}</span>
                <label style={{ ...styles.counterLabel, color: '#aaa' }}>روز باهم</label>
              </div>
              <div style={{ ...styles.counterBox, background: '#120108', borderColor: t.primary }}>
                <span style={{ ...styles.counterNum, color: '#ff0055' }}>{timeTogether.hours}</span>
                <label style={{ ...styles.counterLabel, color: '#aaa' }}>ساعت</label>
              </div>
              <div style={{ ...styles.counterBox, background: '#120108', borderColor: t.primary }}>
                <span style={{ ...styles.counterNum, color: '#ff0055' }}>{timeTogether.minutes}</span>
                <label style={{ ...styles.counterLabel, color: '#aaa' }}>دقیقه</label>
              </div>
              <div style={{ ...styles.counterBox, background: '#120108', borderColor: t.primary }}>
                <span style={{ ...styles.counterNum, color: '#ff4d88' }}>{timeTogether.seconds}</span>
                <label style={{ ...styles.counterLabel, color: '#aaa' }}>ثانیه</label>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '30px 0 10px' }}>
              <div style={{ fontSize: '3.6rem', display: 'flex', justifyContent: 'center', gap: '25px' }}>
                <span className="interactive-animal" onClick={() => spawnParticles('🐊')}>🐊</span>
                <span className="interactive-animal" onClick={() => spawnParticles('💖')}>💖</span>
                <span className="interactive-animal" onClick={() => spawnParticles('🎂')}>🎂</span>
                <span className="interactive-animal" onClick={() => spawnParticles('🦓')}>🦓</span>
              </div>
              <p style={{ color: t.primary, fontWeight: 800, marginTop: '10px' }}>
                روی هر کدوم بزنی انرژی و بارون می‌باره! 🌟
              </p>
            </div>

            {photos.length > 0 && (
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                margin: '20px 0',
                border: `2px solid ${t.primary}`,
                boxShadow: t.glow,
                maxHeight: '230px'
              }}>
                <img
                  src={photos[0].image_url}
                  alt="Spotlight"
                  style={{ width: '100%', height: '230px', objectFit: 'cover', filter: 'brightness(0.8)' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px'
                }}>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>
                    📸 آخرین قاب ثبت شده: {photos[0].title || 'لحظات طلایی ما'}
                  </div>
                </div>
              </div>
            )}

            {/* کارت نجوای واقعی طرف مقابل */}
            <div style={{
              background: 'rgba(0,0,0,0.6)',
              padding: '22px',
              borderRadius: '24px',
              border: `2px dashed ${t.primary}`,
              textAlign: 'center',
              position: 'relative',
              marginTop: '15px'
            }}>
              <span style={{ color: '#00f0ff', fontSize: '0.88rem', fontWeight: 900 }}>
                💌 حرف دل {currentUser === 'taha' ? 'آنا 🦓' : 'طاها 🐊'} برای تو:
              </span>

              <p style={{ fontSize: '1.18rem', color: '#fff', fontWeight: 900, lineHeight: 1.85, margin: '14px 0' }}>
                {activeWhisper 
                  ? activeWhisper.content 
                  : (currentUser === 'taha' 
                      ? "۲۲ مهر زیباترین روز تقویم منه؛ ممنونم که کنارمی کروکودیل من... 🎂💋" 
                      : "تولدت مبارک پرنسس من؛ تمام نفس‌های طاها امشب فدای یک لبخند توئه... 👑🔥")}
              </p>

              <button
                onClick={() => setShowWhisperModal(!showWhisperModal)}
                style={{ ...styles.actionBtn, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, fontSize: '0.88rem', padding: '10px 18px' }}
              >
                {showWhisperModal ? 'بستن پنل ✖' : `✍️ نوشتن پیام یا تبریک تولد برای ${currentUser === 'taha' ? 'آنا 🦓' : 'طاها 🐊'}`}
              </button>

              {showWhisperModal && (
                <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '18px', border: '1px solid rgba(255,0,85,0.3)' }}>
                  <textarea
                    rows="3"
                    placeholder={`متن عاشقانه، تبریک تولد ۲۲ مهر یا دل‌نوشته‌‌ات رو برای داشبورد ${currentUser === 'taha' ? 'آنا' : 'طاها'} بنویس...`}
                    value={myNewWhisper}
                    onChange={e => setMyNewWhisper(e.target.value)}
                    style={{ ...styles.inputField, resize: 'none', lineHeight: 1.7 }}
                  />
                  <button
                    onClick={handleSaveWhisper}
                    style={{ ...styles.actionBtn, marginTop: '10px', background: 'linear-gradient(135deg, #ff0055, #ff4d88)' }}
                  >
                    ثبت در داشبورد عشقم 💌
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ۲. بازی کمین و سلفی */}
        {activeTab === 'sexy' && (
          <div key="sexy" className="slide-in-left">
            <SexyGame theme={t} onParticleTrigger={spawnParticles} currentUser={currentUser} />
          </div>
        )}

        {/* ۳. پل دلتنگی و عذرخواهی */}
        {activeTab === 'heart' && (
          <div key="heart" className="slide-in-right" style={{ ...styles.card, background: t.cardBg, borderColor: t.border, boxShadow: t.glow }}>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <span style={{ fontSize: '3rem' }}>🕊️⚡🫂</span>
              <h2 style={{ ...styles.cardTitle, color: t.primary, margin: '8px 0 4px' }}>
                پل اعتراف، عذرخواهی و تعیین تنبیه متقابل
              </h2>
              <p style={{ color: '#ddd', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
                اگر دلت گرفته یا اشتباهی کردی بنویس؛ طرف مقابل برای این عذرخواهی یک جریمه/تنبیه تعیین می‌کند و پس از انجام، بخشش نهایی ثبت می‌شود!
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', justifyContent: 'center' }}>
              {[
                { id: 'apology', label: 'معذرت‌خواهی 🥺' },
                { id: 'secret', label: 'حقیقت دل 🤍' },
                { id: 'dare_request', label: 'خواسته و تنبیه 🔥' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setConfessionType(cat.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '18px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    background: confessionType === cat.id ? t.primary : '#1f030f',
                    color: confessionType === cat.id ? '#fff' : '#ff758c',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <form onSubmit={addConfession} style={{ marginBottom: '25px' }}>
              <textarea
                rows="4"
                placeholder={
                  confessionType === 'apology' 
                    ? `بنویس کجا اشتباه کردی و چقدر دلت می‌‌خواد دل ${currentUser === 'taha' ? 'آنا پرنسست' : 'طاها کروکودیلت'} رو به دست بیاری...`
                    : 'حرف دل، خواسته یا اعترافت رو بنویس تا طرف مقابل ببینه...'
                }
                value={newConfession}
                onChange={e => setNewConfession(e.target.value)}
                style={{
                  ...styles.inputField,
                  borderRadius: '18px',
                  resize: 'none',
                  fontSize: '0.95rem',
                  lineHeight: 1.7
                }}
              />
              <button
                type="submit"
                style={{
                  ...styles.actionBtn,
                  marginTop: '10px',
                  background: 'linear-gradient(135deg, #e11d48, #be123c)'
                }}
              >
                ارسال به خلوتگاه طرف مقابل 🕊️✨
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
              {confessions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>هنوز پیامی نوشته نشده است 🤍</p>
              ) : (
                confessions.map(item => {
                  const isMine = item.sender.includes(currentUser === 'taha' ? 'طاها' : 'آنا');
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: 'rgba(20, 2, 10, 0.9)',
                        border: `2px solid ${item.forgiven ? '#10b981' : t.primary}`,
                        borderRadius: '20px',
                        padding: '16px 20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 900, color: t.primary, fontSize: '0.9rem' }}>
                          از طرف: {item.sender}
                        </span>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          background: item.category === 'apology' ? '#ffe4e6' : '#f0fdf4',
                          color: item.category === 'apology' ? '#e11d48' : '#15803d'
                        }}>
                          {item.category === 'apology' ? 'معذرت‌خواهی 🥺' : 'حقیقت دل 🤍'}
                        </span>
                      </div>

                      <p style={{ color: '#fff', fontSize: '0.98rem', lineHeight: 1.8, margin: '6px 0', whiteSpace: 'pre-line' }}>
                        {item.message}
                      </p>

                      {!isMine && !item.message.includes('جریمه تعیین‌شده') && !item.forgiven && (
                        <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,0,85,0.1)', borderRadius: '14px', border: '1px dashed #ff0055' }}>
                          <span style={{ color: '#00f0ff', fontSize: '0.82rem', fontWeight: 800 }}>
                            برای این پیام یک جریمه/تنبیه تعیین کن:
                          </span>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                            <input
                              type="text"
                              placeholder="مثلاً: ۵ دقیقه ماساژ یا اجرای یک فانتزی..."
                              value={penaltyInputs[item.id] || ''}
                              onChange={e => setPenaltyInputs({ ...penaltyInputs, [item.id]: e.target.value })}
                              style={{ ...styles.inputField, padding: '8px 12px', fontSize: '0.85rem' }}
                            />
                            <button
                              onClick={() => handleAssignPenaltyToConfession(item.id)}
                              style={{ ...styles.actionBtn, width: 'auto', padding: '8px 14px', background: t.primary, fontSize: '0.82rem' }}
                            >
                              ثبت جریمه ⚡
                            </button>
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {item.forgiven ? (
                          <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                            ✅ بخشیده شد و با آغوش حل شد! 🫂💚
                          </span>
                        ) : (
                          <button
                            onClick={() => forgiveConfession(item.id)}
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              border: 'none',
                              color: '#fff',
                              padding: '6px 14px',
                              borderRadius: '14px',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            بخشیدمت قشنگم، بغلم کن 🫂❤️
                          </button>
                        )}
                        <span style={{ fontSize: '0.72rem', color: '#888' }}>
                          {new Date(item.created_at).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ۴. رادار صمیمیت لمسی */}
        {activeTab === 'heat' && (
          <div key="heat" className="slide-in-right" style={{ ...styles.card, background: t.cardBg, borderColor: t.border, boxShadow: t.glow, textAlign: 'center' }}>
            <h2 style={{ ...styles.cardTitle, color: t.primary }}>رادار هیت و صمیمیت لمسی دونفره ⚡🔥</h2>
            <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '20px' }}>
              روی دکمه آتشین تپ کنید تا شارژ شود؛ در ۱۰۰٪ یک دستور سکسی و فوری صادر می‌شود!
            </p>

            <div style={{
              height: '24px',
              background: '#1a010c',
              borderRadius: '14px',
              overflow: 'hidden',
              margin: '0 auto 20px',
              border: '2px solid rgba(255,0,85,0.4)',
              maxWidth: '450px'
            }}>
              <div style={{
                width: `${passionMeter}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff0055, #ff4d88, #ffeb3b)',
                boxShadow: '0 0 20px #ff0055',
                transition: 'width 0.25s ease'
              }} />
            </div>

            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ff4d88', marginBottom: '20px' }}>
              حرارت فعلی: {passionMeter}% 🔥
            </div>

            <button
              onClick={boostPassion}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid #ff0055',
                background: 'radial-gradient(circle, #ff0055 0%, #660022 100%)',
                color: '#fff',
                fontSize: '2.5rem',
                cursor: 'pointer',
                boxShadow: '0 0 35px rgba(255, 0, 85, 0.6)',
                animation: 'pulse 1.2s infinite'
              }}
            >
              🔥
            </button>

            {intimateAction && (
              <div style={{
                marginTop: '25px',
                padding: '16px',
                borderRadius: '18px',
                background: 'rgba(255,0,85,0.15)',
                border: '2px dashed #ff0055',
                color: '#fff',
                fontWeight: 800,
                lineHeight: 1.8
              }}>
                {intimateAction}
              </div>
            )}
          </div>
        )}

        {/* ۵. گالری پولاروید سه‌بعدی */}
        {activeTab === 'gallery' && (
          <div key="gallery" className="slide-in-right" style={{ ...styles.card, background: t.cardBg, borderColor: t.border, boxShadow: t.glow }}>
            <h2 style={{ ...styles.cardTitle, color: t.primary }}>آلبوم خاطرات پولاروید ما 📸🎀</h2>
            <form onSubmit={addPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              <input
                type="text"
                placeholder="لینک مستقیم تصویر دونفرهمون..."
                value={newPhotoUrl}
                onChange={e => setNewPhotoUrl(e.target.value)}
                style={styles.inputField}
              />
              <input
                type="text"
                placeholder="کپشن یا تاریخ این عکس قشنگ..."
                value={photoCaption}
                onChange={e => setPhotoCaption(e.target.value)}
                style={styles.inputField}
              />
              <button type="submit" style={{ ...styles.actionBtn, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}>
                سنجاق عکس به آلبوم 📷✨
              </button>
            </form>

            <div style={styles.polaroidContainer}>
              {photos.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', gridColumn: '1/-1', padding: '30px' }}>
                  عکسی ثبت نشده! اولین عکس دونفره‌مون رو بذار تا سنجاق بشه 🍓
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

        {/* ۶. یادداشت‌های آنلاین مخفی */}
        {activeTab === 'notes' && (
          <div key="notes" className="slide-in-left" style={{ ...styles.card, background: t.cardBg, borderColor: t.border, boxShadow: t.glow }}>
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
                    background: (n.sender.includes('آنا') || n.sender.includes('گورخر')) ? '#fff0f6' : '#220412',
                    border: `2px solid ${(n.sender.includes('آنا') || n.sender.includes('گورخر')) ? '#ffccd5' : '#ff0055'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: t.primary }}>{n.sender}: </span>
                  <p style={{ marginTop: '4px', color: '#fff' }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۷. دفترچه آرزوها */}
        {activeTab === 'bucket' && (
          <div key="bucket" className="slide-in-right" style={{ ...styles.card, background: t.cardBg, borderColor: t.border, boxShadow: t.glow }}>
            <h2 style={{ ...styles.cardTitle, color: t.primary }}>دفترچه ماجراجویی‌ها و آرزوها 🌟</h2>
            <form onSubmit={addBucketItem} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="یه قرار جدید تو تهران یا اصفهان یا یه سفر باحال بنویس..."
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
                    background: item.completed ? 'rgba(46, 125, 50, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${item.completed ? '#4caf50' : t.border}`
                  }}
                >
                  <span style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#81c784' : '#fff', fontWeight: 700 }}>
                    {item.completed ? '✅' : '🤍'} {item.task}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                    {item.completed ? 'انجام شد!' : 'کلیک برای انجام'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ۸. مدیریت پین‌کد محرمانه */}
        {activeTab === 'vault' && (
          <div key="vault" className="slide-in-left" style={{ ...styles.card, background: t.cardBg, borderColor: t.border, boxShadow: t.glow }}>
            <h2 style={{ ...styles.cardTitle, color: t.primary }}>
              مدیریت پین‌کد محرمانه ({currentUser === 'taha' ? 'طاها 🐊' : 'آنا 🦓'}) 🔒
            </h2>
            <p style={{ color: '#ccc', fontSize: '0.9rem', textAlign: 'center', marginBottom: '20px' }}>
              رمز جدید خود را وارد کنید. با ثبت رمز جدید، رمز قبلی به‌طور کامل باطل و جایگزین می‌شود:
            </p>

            <form onSubmit={handleChangePassword} style={{ maxWidth: '400px', margin: '0 auto' }}>
              <input
                type="password"
                placeholder="رمز عبور جدید را بنویسید..."
                value={newPassInput}
                onChange={e => setNewPassInput(e.target.value)}
                style={styles.inputField}
              />
              <button
                type="submit"
                style={{ ...styles.actionBtn, marginTop: '12px', background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}
              >
                ابطال قبلی و ثبت رمز جدید 🗝️
              </button>
            </form>

            {passChangeSuccess && (
              <p style={{ color: '#10b981', textAlign: 'center', fontWeight: 800, marginTop: '14px' }}>
                ✅ پین‌‌کد جدید ثبت شد و رمز قبلی کاملاً باطل گردید!
              </p>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        .slide-in-right { animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .slide-in-left { animation: slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes floatUp { 0% { transform: translateY(0) scale(0.8); opacity: 1; } 100% { transform: translateY(-100vh) scale(1.4); opacity: 0; } }
        @keyframes touchRipple { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; } 100% { transform: translate(-50%, -50%) scale(7); opacity: 0; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        .interactive-animal { cursor: pointer; transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .interactive-animal:hover { transform: scale(1.35) rotate(10deg); }
        .polaroid-frame { transition: transform 0.35s ease, box-shadow 0.35s ease; }
        .polaroid-frame:hover { transform: rotate(0deg) scale(1.08) !important; z-index: 10; box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; }
      `}</style>
    </div>
  );
}

const styles = {
  gateWrapper: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', direction: 'rtl', padding: '16px' },
  gateCard: { backdropFilter: 'blur(20px)', border: '3px solid', borderRadius: '32px', padding: '36px 26px', textAlign: 'center', maxWidth: '420px', width: '100%' },
  gateInput: { width: '100%', padding: '14px', borderRadius: '16px', border: '2px solid', outline: 'none', textAlign: 'center', fontSize: '1rem', boxSizing: 'border-box' },
  gateBtn: { width: '100%', marginTop: '14px', padding: '14px', borderRadius: '16px', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer' },
  appContainer: { minHeight: '100vh', direction: 'rtl', paddingBottom: '80px', transition: 'background 0.5s ease', overflowX: 'hidden' },
  floatingAudioPlayer: { position: 'fixed', bottom: '20px', left: '20px', background: 'rgba(15, 2, 8, 0.94)', backdropFilter: 'blur(12px)', padding: '8px 18px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 9998, border: '2px solid' },
  playCircle: { width: '38px', height: '38px', borderRadius: '50%', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '2px solid', backdropFilter: 'blur(12px)' },
  badgeBtn: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,0,85,0.4)', color: '#fff', borderRadius: '18px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' },
  themeSelectorBar: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'rgba(0, 0, 0, 0.25)', flexWrap: 'wrap' },
  themeBtn: { padding: '8px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' },
  navTabs: { display: 'flex', justifyContent: 'center', gap: '10px', padding: '16px 10px', flexWrap: 'wrap' },
  tabButton: { padding: '10px 18px', borderRadius: '25px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease' },
  mainContent: { maxWidth: '780px', margin: '10px auto', padding: '0 16px', position: 'relative' },
  card: { borderRadius: '30px', padding: '28px', border: '3px solid', backdropFilter: 'blur(16px)' },
  cardTitle: { textAlign: 'center', fontWeight: 900, fontSize: '1.4rem', marginBottom: '22px' },
  counterGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  counterBox: { border: '3px solid', borderRadius: '22px', padding: '16px 4px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 6px 15px rgba(0,0,0,0.3)' },
  counterNum: { fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.1 },
  counterLabel: { fontSize: '0.9rem', fontWeight: 800, marginTop: '6px' },
  inputField: { width: '100%', padding: '12px 16px', borderRadius: '16px', border: '2px solid rgba(255,0,85,0.4)', background: 'rgba(0,0,0,0.35)', color: '#fff', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' },
  actionBtn: { width: '100%', padding: '14px', borderRadius: '18px', border: 'none', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.25)' },
  polaroidContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px', padding: '15px' },
  tape: { width: '60px', height: '18px', background: 'rgba(255, 235, 179, 0.7)', margin: '-16px auto 10px', borderRadius: '2px' },
  polaroidImg: { width: '100%', height: '170px', objectFit: 'cover', borderRadius: '4px' }
};