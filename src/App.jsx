/* Subject: a playful, intimate birthday mystery for Ana, made by Taha. Design plan: Persian RTL secret-case file meets Isfahan travel ticket; ink navy, saffron, lagoon and paper; Spectral-like editorial display with system sans; a single clear journey: open the envelope → solve three tiny clues → reveal the birthday note. Signature: a hand-drawn zebra stripe crossing a folded map. Keep every interaction optional, calm, and easy to resume. */
import { useEffect, useState } from 'react';
import './style.css';

const clues = [
  { icon: '🦓', title: 'ردِ راه‌راه', prompt: 'گورخرِ قصه‌مون همیشه دنبال چه چیزی می‌گرده؟', options: ['یک جای امن برای پناه گرفتن', 'هویجِ بنفش', 'قطارِ بی‌مسافر'], answer: 0, note: 'آره… پناه، همون‌جاییه که دل آدم آروم می‌گیره.' },
  { icon: '🐊', title: 'رازِ کروکدیل', prompt: 'کروکدیلِ قصه چه چیزی رو از همه بیشتر دوست داره؟', options: ['ماجراجوییِ بی‌نقشه', 'خنده‌ی آنا و صدای دلبرش', 'خوابِ زمستونی'], answer: 1, note: 'جواب درست: همون صدایی که خونه رو پیدا می‌کنه.' },
  { icon: '🧭', title: 'نقشه‌ی اصفهان', prompt: 'این اولین سفرِ طاها برای دیدنِ آناست. مقصدِ واقعی کجاست؟', options: ['فقط یک شهر روی نقشه', 'جایی کنارِ آدمِ موردعلاقه‌ات', 'ایستگاهِ آخرِ دنیا'], answer: 1, note: 'اصفهان قشنگه؛ ولی مقصد، تویی.' },
];
const sparkle = ['✳', '✦', '·', '✷'];

export default function App() {
  const [started, setStarted] = useState(() => localStorage.getItem('ana-case-started') === 'yes');
  const [step, setStep] = useState(() => Number(localStorage.getItem('ana-case-step') || 0));
  const [answers, setAnswers] = useState(() => JSON.parse(localStorage.getItem('ana-case-answers') || '{}'));
  const [calm, setCalm] = useState(() => localStorage.getItem('ana-case-calm') === 'yes');
  const [openNote, setOpenNote] = useState(false);
  useEffect(() => { localStorage.setItem('ana-case-started', started ? 'yes' : 'no'); }, [started]);
  useEffect(() => { localStorage.setItem('ana-case-step', String(step)); }, [step]);
  useEffect(() => { localStorage.setItem('ana-case-answers', JSON.stringify(answers)); }, [answers]);
  useEffect(() => { localStorage.setItem('ana-case-calm', calm ? 'yes' : 'no'); document.documentElement.classList.toggle('calm-mode', calm); }, [calm]);
  const done = step >= clues.length;
  const answer = (choice) => {
    const correct = choice === clues[step].answer;
    setAnswers({ ...answers, [step]: choice });
    if (correct) setStep(step + 1);
  };
  const restart = () => { setStep(0); setAnswers({}); setStarted(false); setOpenNote(false); localStorage.removeItem('ana-case-step'); localStorage.removeItem('ana-case-answers'); };

  return <main className="page">
    <header className="topbar"><a className="brand" href="#top" aria-label="به ابتدای پرونده">A<span>✳</span>T <small>پرونده‌ی خصوصی</small></a><button className="calm-toggle" onClick={() => setCalm(!calm)} aria-pressed={calm}><span className="toggle-dot" />{calm ? 'حالتِ آرام روشن' : 'حالتِ آرام'}</button></header>
    <section id="top" className="hero">
      <div className="hero-copy"><p className="eyebrow"><span className="live-dot" /> پرونده‌ی رمزدار · فقط برای آنا</p><h1>بیست‌ویک<br/><em>رازِ قشنگ</em></h1><p className="intro">یک گورخر، یک کروکدیل، و یک سفرِ خیلی دور برای رسیدن به تو.</p>
      {!started ? <button className="primary" onClick={() => setStarted(true)}>پاکت رو باز کن <span>←</span></button> : <a className="primary" href="#clue">{done ? 'برگرد به نامه' : 'ادامه‌ی معما'} <span>←</span></a>}
      <p className="micro">بدون زمان‌سنج · هر وقت خواستی مکث کن</p></div>
      <div className="art" aria-label="طرح گورخر و کروکدیل زیر ستاره‌ها" role="img"><div className="sun"/><div className="orbit one-orbit"/><div className="orbit orbit-two"/><div className="mapline"/><div className="stamp">۲۲<br/><small>مهر</small></div><div className="zebra">🦓</div><div className="croc">🐊</div><div className="stars">{sparkle.map((s,i)=><span key={i} className={'star star-'+i}>{s}</span>)}</div><p className="art-label">از طاها، برای آنا<br/><span>مقصد: کنارِ تو</span></p></div>
    </section>
    <div className="ticker" aria-hidden="true"><span>دلبرم ✳ گورخر ✳ جوجو ✳ کروکدیل ✳ پناهم ✳ دلبرم ✳ گورخر ✳</span></div>
    <section className="journey" id="clue">
      <div className="section-heading"><div><p className="eyebrow">یک بازیِ کوچولوی بی‌عجله</p><h2>{done ? 'پرونده حل شد.' : 'سه نشونه تا سورپرایز'}</h2></div><div className="progress-wrap"><span>{Math.min(step, 3)} از ۳</span><div className="progress"><i style={{width: `${Math.min(step/3*100,100)}%`}} /></div></div></div>
      {!started && <div className="locked"><span>✉</span><p>پاکت رو باز کن تا اولین نشونه پیداش بشه.</p><button onClick={() => setStarted(true)}>باز کردنِ پاکت</button></div>}
      {started && !done && <article className="clue-card"><div className="clue-side"><span className="clue-icon">{clues[step].icon}</span><span className="clue-count">نشونه‌ی {['اول','دوم','سوم'][step]}</span><h3>{clues[step].title}</h3><p>جوابِ اشتباه؟ هیچ اشکالی نداره، دوباره امتحان کن.</p></div><div className="clue-main"><p className="question">{clues[step].prompt}</p><div className="choices">{clues[step].options.map((o,i)=><button key={o} className={'choice '+(answers[step]===i?'selected':'')} onClick={()=>answer(i)}><span className="choice-key">{['الف','ب','پ'][i]}</span>{o}<span className="check">{answers[step]===i?'✓':'↙'}</span></button>)}</div>{answers[step]===clues[step].answer && <p className="feedback" role="status">{clues[step].note}</p>}</div></article>}
      {done && <div className="complete"><div className="confetti" aria-hidden="true">✦　✳　✷　✦　✧</div><p className="eyebrow">مأموریت با موفقیت انجام شد</p><h3>جایزه‌ات، یک نامه‌ست.</h3><p>حاضری بازش کنی، آنا؟</p><button className="primary" onClick={()=>setOpenNote(true)}>نامه‌ی طاها رو بخون <span>←</span></button>{openNote&&<div className="letter"><button className="close-letter" onClick={()=>setOpenNote(false)} aria-label="بستن نامه">×</button><p className="eyebrow">برای آنا، با تمامِ دل</p><h4>تولدت مبارک، دلبرم.</h4><p>بیست‌ویک‌سالگی‌ات مبارک، جوجوی من. این اولین باره که برای دیدنت میام اصفهان، و راستش از فکرِ دیدنت دلم پر از ذوقه. امیدوارم امسالت پر از لحظه‌هایی باشه که دلت می‌خواد نگه‌شون داری. هر جا باشی، تو پناهِ منی؛ و من همیشه کروکدیلِ تو می‌مونم.</p><p className="letter-sign">با عشق، طاها <span>🐊</span></p></div>}</div>}
    </section>
    <section className="postcard"><div className="postcard-copy"><p className="eyebrow">یادداشتِ سفر</p><h2>تهران تا اصفهان.<br/><em>بهانه‌اش تویی.</em></h2><p>این صفحه رو می‌تونی هر وقت خواستی دوباره باز کنی؛ پیشرفتِ معما روی همین دستگاه می‌مونه.</p></div><div className="route"><div className="route-point">طاها<span>مبدأ</span></div><div className="route-line"><span>✦</span><i/></div><div className="route-point destination">آنا<span>مقصد</span></div><span className="route-plane">✈</span></div></section>
    <footer><span>ساخته‌شده با عشق، برای آنا</span><button onClick={restart}>از اول بازی کن ↺</button><span>۲۲ مهر · ۲۱ سالگی</span></footer>
  </main>
}
