import { useState } from "react";
import VideoGenerator from "./VideoGenerator";
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  REPLACE THESE WITH YOUR REAL STRIPE PAYMENT LINKS
//     (create them free at dashboard.stripe.com → Payment Links)
// ─────────────────────────────────────────────────────────────────────────────
const STRIPE_LINKS = {
  grind:  "https://buy.stripe.com/cNidRa2E097a7Ie1iOfYY00",
  label:  "https://buy.stripe.com/8x2aEY4M80AE9Qmd1wfYY01",
};

const PLATFORMS = [
  { id: "youtube",   label: "YouTube",   color: "#ff0000", icon: "▶" },
  { id: "instagram", label: "Instagram", color: "#e1306c", icon: "◈" },
  { id: "facebook",  label: "Facebook",  color: "#1877f2", icon: "f" },
  { id: "tiktok",    label: "TikTok",    color: "#ffffff", icon: "♪" },
  { id: "twitter",   label: "X/Twitter", color: "#1da1f2", icon: "𝕏" },
  { id: "spotify",   label: "Spotify",   color: "#1db954", icon: "●" },
];

const GENRES  = ["Hip-Hop","Trap","R&B","Pop","Afrobeats","EDM","Reggaeton","Rock","Gospel","Drill","Amapiano","Latin","Country","Indie"];
const MOODS   = ["Hype","Chill","Emotional","Aggressive","Feel-Good","Dark","Romantic","Party","Motivational","Mysterious"];

async function askClaude(prompt) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080808;--card:#101010;--card2:#161616;--border:#1e1e1e;
  --gold:#f5c842;--gold2:#d4a017;--white:#f0ede6;--muted:#555;
  --green:#2ecc71;--red:#e74c3c;--blue:#3b82f6;
}
body{background:var(--bg);color:var(--white);font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden}
/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:.9rem 2rem;background:rgba(8,8,8,.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)}
.logo{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;color:var(--gold);letter-spacing:3px;cursor:pointer}
.nav-links{display:flex;gap:.3rem}
.nb{background:none;border:none;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding:.45rem 1rem;border-radius:5px;cursor:pointer;transition:all .2s}
.nb:hover,.nb.on{color:var(--white);background:var(--border)}
.nav-cta{background:var(--gold);color:#000;font-weight:700;font-size:.82rem;border:none;padding:.5rem 1.3rem;border-radius:5px;cursor:pointer;transition:background .2s;letter-spacing:.5px}
.nav-cta:hover{background:var(--gold2)}
/* HERO */
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6rem 2rem 4rem;position:relative;overflow:hidden}
.hero-glow{position:absolute;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(245,200,66,.07) 0%,transparent 70%);top:-100px;left:50%;transform:translateX(-50%);pointer-events:none}
.hero-grid{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(245,200,66,.03) 59px,rgba(245,200,66,.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(245,200,66,.03) 59px,rgba(245,200,66,.03) 60px);pointer-events:none}
.hero-tag{display:inline-block;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:var(--gold);border:1px solid rgba(245,200,66,.3);padding:.35rem 1rem;border-radius:100px;margin-bottom:1.5rem;animation:up .5s ease both}
.hero h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(3.8rem,11vw,8rem);line-height:.9;color:var(--white);margin-bottom:1.5rem;animation:up .5s .08s ease both}
.hero h1 em{color:var(--gold);font-style:normal}
.hero p{max-width:500px;color:#999;font-size:1rem;line-height:1.7;margin-bottom:2.5rem;animation:up .5s .16s ease both}
.hero-btns{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;animation:up .5s .22s ease both}
.btn-p{background:var(--gold);color:#000;font-weight:700;font-size:.95rem;padding:.85rem 2rem;border:none;border-radius:7px;cursor:pointer;transition:all .2s}
.btn-p:hover{background:var(--gold2);transform:translateY(-2px);box-shadow:0 10px 30px rgba(245,200,66,.2)}
.btn-s{background:transparent;color:var(--white);font-weight:600;font-size:.95rem;padding:.85rem 2rem;border:1px solid var(--border);border-radius:7px;cursor:pointer;transition:all .2s}
.btn-s:hover{border-color:#444}
.stats{display:flex;gap:3rem;justify-content:center;flex-wrap:wrap;margin-top:4rem;animation:up .5s .3s ease both}
.stat-num{font-family:'Bebas Neue',sans-serif;font-size:3rem;color:var(--gold);line-height:1}
.stat-lbl{font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px}
/* SECTION */
.sec{padding:5rem 2rem;max-width:1080px;margin:0 auto}
.sec-lbl{font-size:.72rem;text-transform:uppercase;letter-spacing:3px;color:var(--gold);margin-bottom:.6rem}
.sec-ttl{font-family:'Bebas Neue',sans-serif;font-size:clamp(2rem,5vw,3.5rem);margin-bottom:2.5rem}
/* STEPS */
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1.2rem}
.step{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.75rem 1.5rem;position:relative;overflow:hidden;transition:border-color .2s}
.step:hover{border-color:#333}
.step::after{content:attr(data-n);position:absolute;top:-.4rem;right:.6rem;font-family:'Bebas Neue',sans-serif;font-size:5rem;color:rgba(245,200,66,.04);line-height:1;pointer-events:none}
.step-ico{font-size:1.6rem;margin-bottom:.9rem}
.step h3{font-size:.95rem;font-weight:600;margin-bottom:.4rem}
.step p{font-size:.84rem;color:var(--muted);line-height:1.6}
/* PLATFORM BADGES on home */
.platform-grid{display:flex;flex-wrap:wrap;gap:.75rem;margin-bottom:2.5rem}
.plat-badge{display:flex;align-items:center;gap:.5rem;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:.5rem 1rem;font-size:.85rem;font-weight:600}
.plat-dot{width:9px;height:9px;border-radius:50%}
/* PLANS */
.plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.2rem}
.plan{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:2rem;transition:border-color .2s}
.plan.feat{border-color:var(--gold)}
.plan-badge{display:inline-block;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#000;background:var(--gold);padding:.22rem .7rem;border-radius:100px;margin-bottom:.9rem}
.plan-name{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;margin-bottom:.15rem}
.plan-price{font-family:'Bebas Neue',sans-serif;font-size:3.2rem;color:var(--gold);line-height:1}
.plan-per{font-size:.78rem;color:var(--muted);margin-bottom:1.5rem}
.plan-feats{list-style:none;margin-bottom:1.75rem}
.plan-feats li{font-size:.85rem;color:#aaa;padding:.38rem 0;border-bottom:1px solid var(--border);display:flex;gap:.5rem;align-items:flex-start}
.plan-feats li::before{content:'✓';color:var(--green);font-weight:700;flex-shrink:0;margin-top:1px}
.plan-btn{width:100%;padding:.75rem;border-radius:7px;font-weight:700;font-size:.88rem;cursor:pointer;transition:all .2s;border:none;color:var(--white);background:var(--border)}
.plan.feat .plan-btn{background:var(--gold);color:#000}
.plan.feat .plan-btn:hover{background:var(--gold2)}
.plan-btn:hover{background:#333}
/* stripe badge */
.stripe-note{display:flex;align-items:center;gap:.5rem;color:var(--muted);font-size:.78rem;margin-top:1.5rem;justify-content:center}
.stripe-lock{font-size:1rem}
/* DEMO */
.demo-wrap{padding-top:5rem;min-height:100vh}
.demo-inner{max-width:800px;margin:0 auto;padding:2rem}
.demo-ttl{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;margin-bottom:.4rem}
.demo-sub{color:var(--muted);font-size:.92rem;margin-bottom:2rem}
.form-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:2rem}
.field{margin-bottom:1.2rem}
.field label{display:block;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:.45rem}
.field input,.field select,.field textarea{width:100%;background:#080808;border:1px solid var(--border);border-radius:8px;color:var(--white);font-family:'DM Sans',sans-serif;font-size:.92rem;padding:.72rem 1rem;outline:none;transition:border-color .2s;resize:vertical}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--gold)}
.field select option{background:#111}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
/* platform multi-select */
.plat-picks{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.2rem}
.plat-pick{display:flex;align-items:center;gap:.4rem;padding:.4rem .85rem;border-radius:6px;border:1px solid var(--border);background:var(--card2);font-size:.82rem;font-weight:600;cursor:pointer;transition:all .15s;user-select:none}
.plat-pick.sel{border-color:var(--gold);background:rgba(245,200,66,.08);color:var(--gold)}
/* generate btn */
.gen-btn{width:100%;padding:1rem;background:var(--gold);border:none;border-radius:8px;font-family:'Bebas Neue',sans-serif;font-size:1.35rem;letter-spacing:2px;color:#000;cursor:pointer;transition:all .2s;margin-top:.5rem}
.gen-btn:hover:not(:disabled){background:var(--gold2);transform:translateY(-2px)}
.gen-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
/* output */
.output-card{margin-top:1.75rem;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:2rem;animation:up .35s ease}
.out-lbl{font-size:.72rem;text-transform:uppercase;letter-spacing:2px;color:var(--gold);margin-bottom:1rem}
/* video mock */
.vid-mock{background:#000;border-radius:10px;aspect-ratio:16/9;position:relative;overflow:hidden;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:center}
.vid-bars{display:flex;align-items:flex-end;gap:5px;height:70px}
.bar{width:11px;background:var(--gold);border-radius:3px 3px 0 0;animation:bounce 1.1s ease-in-out infinite;opacity:.8}
.bar:nth-child(2){animation-delay:.1s}.bar:nth-child(3){animation-delay:.2s}.bar:nth-child(4){animation-delay:.3s}
.bar:nth-child(5){animation-delay:.4s}.bar:nth-child(6){animation-delay:.2s}.bar:nth-child(7){animation-delay:.1s}
@keyframes bounce{0%,100%{height:18px}50%{height:62px}}
.vid-overlay{position:absolute;inset:0;padding:1.2rem;display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 55%)}
.vid-plats{display:flex;gap:.4rem;flex-wrap:wrap}
.vid-pt{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;padding:.18rem .55rem;border-radius:3px;color:#fff}
.vid-name{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.4rem,4vw,2.2rem);color:#fff;text-shadow:0 2px 16px #000}
.script-box{background:#080808;border:1px solid var(--border);border-radius:8px;padding:1.2rem;font-size:.88rem;line-height:1.75;color:#ccc;white-space:pre-wrap;max-height:300px;overflow-y:auto}
.action-row{display:flex;gap:.75rem;margin-top:1rem;flex-wrap:wrap}
.act-btn{background:var(--border);color:var(--white);border:none;border-radius:6px;padding:.6rem 1.2rem;font-size:.83rem;cursor:pointer;transition:background .2s;font-family:'DM Sans',sans-serif;font-weight:600}
.act-btn:hover{background:#2a2a2a}
.act-btn.gold{background:var(--gold);color:#000}
.act-btn.gold:hover{background:var(--gold2)}
/* spinner */
.spinner{display:flex;align-items:center;gap:.75rem;color:var(--muted);font-size:.88rem;padding:1.2rem 0}
.spin{width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin .65s linear infinite;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}
/* DASHBOARD */
.dash-wrap{padding-top:5rem;min-height:100vh}
.dash-inner{max-width:1020px;margin:0 auto;padding:2rem}
.dash-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem;flex-wrap:wrap;gap:1rem}
.dash-ttl{font-family:'Bebas Neue',sans-serif;font-size:2.3rem}
.kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:1rem;margin-bottom:1.75rem}
.kpi{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:1.2rem 1.4rem}
.kpi-lbl{font-size:.72rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:.35rem}
.kpi-val{font-family:'Bebas Neue',sans-serif;font-size:2.1rem;color:var(--gold)}
.kpi-sub{font-size:.75rem;color:var(--green)}
.tbl-card{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:2rem}
.tbl-hdr{padding:1.2rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.tbl-hdr-ttl{font-weight:600;font-size:.88rem}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);padding:.7rem 1.5rem;border-bottom:1px solid var(--border)}
td{padding:.9rem 1.5rem;font-size:.86rem;border-bottom:1px solid rgba(30,30,30,.7)}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.015)}
.badge{display:inline-block;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:.2rem .6rem;border-radius:4px}
.b-done{background:rgba(46,204,113,.13);color:var(--green)}
.b-pend{background:rgba(245,200,66,.13);color:var(--gold)}
.b-draft{background:rgba(80,80,80,.2);color:var(--muted)}
.pdots{display:inline-flex;gap:4px;align-items:center}
.pd{width:8px;height:8px;border-radius:50%}
/* LAUNCH GUIDE */
.guide-wrap{padding-top:5rem;min-height:100vh}
.guide-inner{max-width:820px;margin:0 auto;padding:2rem}
.guide-ttl{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;margin-bottom:.4rem}
.guide-sub{color:var(--muted);font-size:.92rem;margin-bottom:2.5rem}
.step-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.75rem;margin-bottom:1.2rem;position:relative;overflow:hidden}
.step-card::before{content:attr(data-n);position:absolute;top:-.5rem;right:.75rem;font-family:'Bebas Neue',sans-serif;font-size:6rem;color:rgba(245,200,66,.04);pointer-events:none;line-height:1}
.step-card h3{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--gold);margin-bottom:.5rem}
.step-card p{font-size:.9rem;color:#aaa;line-height:1.7;margin-bottom:.9rem}
.step-card p:last-child{margin-bottom:0}
.step-card ul{list-style:none;margin:.5rem 0}
.step-card ul li{font-size:.88rem;color:#aaa;padding:.28rem 0;display:flex;gap:.5rem}
.step-card ul li::before{content:'→';color:var(--gold);flex-shrink:0}
.code-block{background:#080808;border:1px solid var(--border);border-radius:7px;padding:1rem 1.2rem;font-family:'Courier New',monospace;font-size:.82rem;color:#e2c97e;margin:.75rem 0;overflow-x:auto;white-space:pre}
.tool-row{display:flex;flex-wrap:wrap;gap:.6rem;margin:.5rem 0}
.tool-tag{background:var(--card2);border:1px solid var(--border);border-radius:6px;padding:.35rem .75rem;font-size:.8rem;font-weight:600;color:#ccc}
.tool-tag.free{border-color:rgba(46,204,113,.35);color:var(--green)}
.tool-tag.paid{border-color:rgba(245,200,66,.35);color:var(--gold)}
.highlight-box{background:rgba(245,200,66,.06);border:1px solid rgba(245,200,66,.2);border-radius:8px;padding:1rem 1.2rem;margin:.75rem 0;font-size:.88rem;line-height:1.65;color:#ddd}
/* animations */
@keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
/* scrollbar */
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
`;

// ── mock dashboard data ────────────────────────────────────────────────────
const MOCK = [
  { artist:"Lil Versa",   genre:"Trap",     plats:["youtube","instagram","tiktok"], status:"done",    date:"May 20", revenue:"$19" },
  { artist:"Nova Reign",  genre:"R&B",      plats:["youtube","instagram"],          status:"done",    date:"May 19", revenue:"$19" },
  { artist:"DJ Fractal",  genre:"EDM",      plats:["youtube","spotify"],            status:"pending", date:"May 22", revenue:"$19" },
  { artist:"Kaleidra",    genre:"Pop",      plats:["instagram","facebook"],         status:"draft",   date:"May 23", revenue:"—"  },
  { artist:"YungPappi",   genre:"Afrobeats",plats:["tiktok","instagram","twitter"], status:"done",    date:"May 21", revenue:"$19" },
];

const PCOLOR = { youtube:"#ff0000", instagram:"#e1306c", facebook:"#1877f2", tiktok:"#ffffff", twitter:"#1da1f2", spotify:"#1db954" };

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]           = useState("home");
  const [selPlats, setSelPlats] = useState(["youtube","instagram","tiktok"]);
  const [form, setForm]         = useState({ artist:"", genre:"Hip-Hop", mood:"Hype", bio:"" });
  const [loading, setLoading]   = useState(false);
  const [output, setOutput]     = useState(null);
  const [copied, setCopied]     = useState(false);

  const togglePlat = (id) => setSelPlats(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);

  const handleGenerate = async () => {
    if (!form.artist || selPlats.length === 0) return;
    setLoading(true); setOutput(null);
    const platNames = selPlats.map(id => PLATFORMS.find(p=>p.id===id)?.label).join(", ");
    const prompt = `You are a professional music video scriptwriter and social media strategist.

Create a SHORT punchy 60-second promotional video SCRIPT for a music artist optimized for: ${platNames}.

Artist: ${form.artist}
Genre: ${form.genre}
Vibe: ${form.mood}
Bio/Notes: ${form.bio || "None"}

Structure your response EXACTLY like this:

🎬 HOOK (0-3 sec)
[grabby first line for the video — make it electric]

🎤 ARTIST INTRO (3-8 sec)
[short hype intro]

🔥 VIBE SECTION (8-45 sec)
[describe the energy, sound, key lyrics to highlight or themes]

📢 CALL TO ACTION (45-60 sec)
[follow, stream, share — tailored to the platforms]

📝 ON-SCREEN TEXT OVERLAYS
• [line 1]
• [line 2]
• [line 3]
• [line 4]

#️⃣ HASHTAGS
[8 relevant hashtags]

💡 PLATFORM TIPS
${selPlats.includes("tiktok") ? "- TikTok: [specific tip]" : ""}
${selPlats.includes("instagram") ? "- Instagram: [specific tip]" : ""}
${selPlats.includes("youtube") ? "- YouTube: [specific tip]" : ""}
${selPlats.includes("twitter") ? "- X/Twitter: [specific tip]" : ""}
${selPlats.includes("facebook") ? "- Facebook: [specific tip]" : ""}
${selPlats.includes("spotify") ? "- Spotify: [specific tip]" : ""}

Keep it REAL, HYPE, and authentic to the genre.`;
    const text = await askClaude(prompt);
    setOutput(text);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output || "");
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output || ""], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${form.artist || "promo"}-script.txt`; a.click();
  };

  return (
    <>
      <style>{CSS}</style>

      {/* NAV */}
      <nav>
        <div className="logo" onClick={() => setTab("home")}>CLIPWAVE</div>
        <div className="nav-links">
          {[["home","Home"],["demo","Try It"],["dashboard","Dashboard"],["launch","🚀 Launch Guide"]].map(([s,l]) => (
            <button key={s} className={`nb ${tab===s?"on":""}`} onClick={() => setTab(s)}>{l}</button>
          ))}
        </div>
        <button className="nav-cta" onClick={() => setTab("demo")}>Free Trial</button>
      </nav>

      {/* ══════════ HOME ══════════ */}
      {tab === "home" && <>
        <div className="hero">
          <div className="hero-glow"/><div className="hero-grid"/>
          <span className="hero-tag">🎵 AI Promo Videos for Artists</span>
          <h1>Make Artists<br/><em>Go Viral</em></h1>
          <p>Generate punchy 60-second promo scripts for YouTube, TikTok, Instagram & more — powered by AI, done in seconds.</p>
          <div className="hero-btns">
            <button className="btn-p" onClick={() => setTab("demo")}>Generate Free Script →</button>
            <button className="btn-s" onClick={() => setTab("launch")}>How to Launch</button>
          </div>
          <div className="stats">
            <div className="stat"><div className="stat-num">6</div><div className="stat-lbl">Platforms Supported</div></div>
            <div className="stat"><div className="stat-num">60s</div><div className="stat-lbl">Generate Time</div></div>
            <div className="stat"><div className="stat-num">$0</div><div className="stat-lbl">To Start</div></div>
          </div>
        </div>

        {/* Platforms */}
        <div className="sec">
          <div className="sec-lbl">Platforms</div>
          <div className="sec-ttl">One Script. Every Platform.</div>
          <div className="platform-grid">
            {PLATFORMS.map(p => (
              <div className="plat-badge" key={p.id}>
                <div className="plat-dot" style={{background:p.color}}/>
                {p.label}
              </div>
            ))}
          </div>
          <p style={{color:"var(--muted)",fontSize:".9rem"}}>Scripts are automatically tailored with platform-specific tips and CTAs for each channel you select.</p>
        </div>

        {/* How it works */}
        <div className="sec" style={{paddingTop:0}}>
          <div className="sec-lbl">The Process</div>
          <div className="sec-ttl">Three Steps to Buzz</div>
          <div className="steps">
            {[
              {n:"01",ico:"🎤",t:"Drop Artist Info",d:"Name, genre, vibe, bio. 30 seconds to fill in."},
              {n:"02",ico:"⚡",t:"AI Writes the Script",d:"Claude crafts a viral-ready 60-sec promo with hooks, overlays & hashtags."},
              {n:"03",ico:"📱",t:"Post Across Platforms",d:"Use the script to film or animate your video and blast it everywhere."},
              {n:"04",ico:"💰",t:"Collect Payment",d:"Artists pay via Stripe. You deliver. Simple business."},
            ].map(s => (
              <div className="step" key={s.n} data-n={s.n}>
                <div className="step-ico">{s.ico}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="sec" style={{paddingTop:0}}>
          <div className="sec-lbl">Pricing</div>
          <div className="sec-ttl">Start Free. Scale Up.</div>
          <div className="plans">
            {[
              { name:"Starter", price:"$0",  per:"/month – forever", badge:null, feat:false,
                feats:["3 scripts/month","YouTube + Instagram + TikTok","Basic hashtag suggestions","Email support"],
                action:() => setTab("demo"), label:"Start Free" },
              { name:"Grind",   price:"$19", per:"/month", badge:"Most Popular", feat:true,
                feats:["Unlimited scripts","All 6 platforms","Custom brand voice","Priority generation","Script downloads","Analytics"],
                action:() => window.open(STRIPE_LINKS.grind,"_blank"), label:"Subscribe — $19/mo" },
              { name:"Label",   price:"$79", per:"/month", badge:null, feat:false,
                feats:["Everything in Grind","Up to 50 artists","White-label export","API access","Dedicated support"],
                action:() => window.open(STRIPE_LINKS.label,"_blank"), label:"Subscribe — $79/mo" },
            ].map(p => (
              <div key={p.name} className={`plan ${p.feat?"feat":""}`}>
                {p.badge && <div className="plan-badge">{p.badge}</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">{p.price}</div>
                <div className="plan-per">{p.per}</div>
                <ul className="plan-feats">{p.feats.map(f => <li key={f}>{f}</li>)}</ul>
                <button className="plan-btn" onClick={p.action}>{p.label}</button>
              </div>
            ))}
          </div>
          <div className="stripe-note">
            <span className="stripe-lock">🔒</span>
            Payments secured by Stripe — cancel anytime
          </div>
        </div>
      </>}

      {/* ══════════ DEMO ══════════ */}
      {tab === "demo" && (
        <div className="demo-wrap">
          <div className="demo-inner">
            <div className="demo-ttl">Generate a Promo Script</div>
            <div className="demo-sub">Fill in the details — our AI writes a viral-ready script in seconds.</div>
            <div className="form-card">
              <div className="field">
                <label>Artist Name *</label>
                <input placeholder="e.g. Lil Versa" value={form.artist} onChange={e=>setForm({...form,artist:e.target.value})}/>
              </div>
              <div className="row2">
                <div className="field">
                  <label>Genre</label>
                  <select value={form.genre} onChange={e=>setForm({...form,genre:e.target.value})}>
                    {GENRES.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Vibe / Mood</label>
                  <select value={form.mood} onChange={e=>setForm({...form,mood:e.target.value})}>
                    {MOODS.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Pick Platforms *</label>
                <div className="plat-picks">
                  {PLATFORMS.map(p => (
                    <div key={p.id} className={`plat-pick ${selPlats.includes(p.id)?"sel":""}`} onClick={()=>togglePlat(p.id)}>
                      <div className="plat-dot" style={{background:selPlats.includes(p.id)?p.color:"var(--muted)",width:8,height:8,borderRadius:"50%"}}/>
                      {p.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Artist Bio / Notes (optional)</label>
                <textarea rows={3} placeholder="e.g. 19-year-old from Atlanta, dropping first mixtape, known for melodic hooks..." value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/>
              </div>
              <button className="gen-btn" onClick={handleGenerate} disabled={loading||!form.artist||selPlats.length===0}>
                {loading ? "GENERATING…" : "GENERATE PROMO SCRIPT ⚡"}
              </button>
            </div>

            {loading && <div className="spinner"><div className="spin"/>AI is writing your script…</div>}

            {output && (
              <div className="output-card">
                <div className="out-lbl">🎬 Your Promo Script</div>
                <div className="vid-mock">
                  <div className="vid-bars">
                    {[1,2,3,4,5,6,7].map(i=><div key={i} className="bar" style={{height:`${20+i*5}px`}}/>)}
                  </div>
                  <div className="vid-overlay">
                    <div className="vid-plats">
                      {selPlats.map(id => {
                        const p = PLATFORMS.find(x=>x.id===id);
                        return <span key={id} className="vid-pt" style={{background:PCOLOR[id]}}>{p?.label}</span>;
                      })}
                    </div>
                    <div className="vid-name">{form.artist.toUpperCase()}</div>
                  </div>
                </div>
                <div className="script-box">{output}</div>
                <div className="action-row">
                  <button className="act-btn" onClick={handleCopy}>{copied?"✓ Copied!":"Copy Script"}</button>
                  <button className="act-btn" onClick={handleDownload}>⬇ Download .txt</button>
                  <button className="act-btn gold" onClick={()=>setTab("dashboard")}>Save to Dashboard →</button>
                  <VideoGenerator script={script} isPaidUser={true} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ DASHBOARD ══════════ */}
      {tab === "dashboard" && (
        <div className="dash-wrap">
          <div className="dash-inner">
            <div className="dash-hdr">
              <div className="dash-ttl">Artist Dashboard</div>
              <button className="act-btn gold" onClick={()=>setTab("demo")}>+ New Script</button>
            </div>
            <div className="kpi-row">
              {[
                {lbl:"Scripts Generated",val:"47",sub:"↑ 12 this month"},
                {lbl:"Artists Managed",val:"14",sub:"↑ 3 new"},
                {lbl:"Est. Reach",val:"2.1M",sub:"↑ 340K this week"},
                {lbl:"Revenue",val:"$380",sub:"↑ $95 this month"},
                {lbl:"Platforms Covered",val:"6",sub:"All active"},
              ].map(k=>(
                <div className="kpi" key={k.lbl}>
                  <div className="kpi-lbl">{k.lbl}</div>
                  <div className="kpi-val">{k.val}</div>
                  <div className="kpi-sub">{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="tbl-card">
              <div className="tbl-hdr">
                <div className="tbl-hdr-ttl">Recent Promo Scripts</div>
                <span style={{fontSize:".78rem",color:"var(--muted)"}}>Last 7 days</span>
              </div>
              <table>
                <thead><tr><th>Artist</th><th>Genre</th><th>Platforms</th><th>Status</th><th>Date</th><th>Revenue</th></tr></thead>
                <tbody>
                  {MOCK.map((v,i)=>(
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{v.artist}</td>
                      <td style={{color:"var(--muted)"}}>{v.genre}</td>
                      <td><div className="pdots">{v.plats.map(id=><div key={id} className="pd" style={{background:PCOLOR[id]}} title={id}/>)}</div></td>
                      <td><span className={`badge ${v.status==="done"?"b-done":v.status==="pending"?"b-pend":"b-draft"}`}>{v.status==="done"?"Delivered":v.status==="pending"?"Generating":"Draft"}</span></td>
                      <td style={{color:"var(--muted)"}}>{v.date}</td>
                      <td style={{color:"var(--green)",fontWeight:600}}>{v.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ LAUNCH GUIDE ══════════ */}
      {tab === "launch" && (
        <div className="guide-wrap">
          <div className="guide-inner">
            <div className="guide-ttl">🚀 How to Launch CLIPWAVE</div>
            <div className="guide-sub">A step-by-step guide to get your app live and making money — no coding degree required.</div>

            {/* STEP 1 */}
            <div className="step-card" data-n="1">
              <h3>Step 1 — Get Your Own Anthropic API Key</h3>
              <p>The AI that writes the scripts runs on Claude. You need your own key so YOU control the costs (about $0.003 per script — very cheap).</p>
              <ul>
                <li>Go to <strong>console.anthropic.com</strong> → sign up free</li>
                <li>Click <strong>API Keys</strong> → Create a new key</li>
                <li>Copy it — you'll add it to your app in Step 3</li>
              </ul>
              <div className="highlight-box">💡 Keep your API key secret — never paste it in public code. You'll store it in a secure environment variable.</div>
            </div>

            {/* STEP 2 */}
            <div className="step-card" data-n="2">
              <h3>Step 2 — Set Up Stripe Payments</h3>
              <p>Stripe lets you collect money without building a payment system yourself. It's free to set up — they just take 2.9% per transaction.</p>
              <ul>
                <li>Go to <strong>dashboard.stripe.com</strong> → create a free account</li>
                <li>Click <strong>Payment Links</strong> → Create Link</li>
                <li>Set price to $19/month (Grind) and $79/month (Label)</li>
                <li>Copy each link and paste it into the <code>STRIPE_LINKS</code> object at the top of the code</li>
                <li>Turn on <strong>Stripe Customer Portal</strong> so users can cancel themselves</li>
              </ul>
              <div className="code-block">{`const STRIPE_LINKS = {
  grind: "https://buy.stripe.com/YOUR_LINK_HERE",
  label: "https://buy.stripe.com/YOUR_LINK_HERE",
};`}</div>
              <div className="tool-row">
                <span className="tool-tag free">Stripe — Free to set up</span>
                <span className="tool-tag">2.9% + 30¢ per transaction</span>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="step-card" data-n="3">
              <h3>Step 3 — Deploy the App (Free Hosting)</h3>
              <p>The easiest way to get this live is <strong>Vercel</strong> — it's free for personal projects and takes about 5 minutes.</p>
              <ul>
                <li>Download the <code>.jsx</code> file from Claude</li>
                <li>Create a new React project with Vite:</li>
              </ul>
              <div className="code-block">{`npm create vite@latest clipwave -- --template react
cd clipwave
npm install
# Replace src/App.jsx with the file you downloaded`}</div>
              <ul>
                <li>Create a <code>.env</code> file in your project root:</li>
              </ul>
              <div className="code-block">{`VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here`}</div>
              <ul>
                <li>Push to GitHub (free at <strong>github.com</strong>)</li>
                <li>Go to <strong>vercel.com</strong> → Import your GitHub repo</li>
                <li>Add your env variable in Vercel's settings panel</li>
                <li>Hit Deploy — you get a free <code>.vercel.app</code> URL!</li>
              </ul>
              <div className="tool-row">
                <span className="tool-tag free">Vercel — Free tier</span>
                <span className="tool-tag free">GitHub — Free</span>
                <span className="tool-tag free">Vite — Free</span>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="step-card" data-n="4">
              <h3>Step 4 — Get a Real Domain Name</h3>
              <p>Your Vercel URL works, but a real domain (like <strong>clipwave.io</strong>) makes you look legit and builds trust with artists.</p>
              <ul>
                <li>Buy a domain at <strong>Namecheap</strong> or <strong>GoDaddy</strong> (~$10–15/year)</li>
                <li>In Vercel, go to your project → <strong>Domains</strong> → Add your domain</li>
                <li>Follow Vercel's instructions to point your domain (takes ~10 minutes)</li>
              </ul>
              <div className="tool-row">
                <span className="tool-tag paid">Namecheap ~$10/year</span>
              </div>
            </div>

            {/* STEP 5 */}
            <div className="step-card" data-n="5">
              <h3>Step 5 — Protect Your API Key (Important!)</h3>
              <p>Right now the API key is called from the browser, which means anyone could steal it. For a real launch, you need a simple backend proxy. Here's the easiest way:</p>
              <ul>
                <li>In Vercel, create a file at <code>api/generate.js</code> in your project</li>
                <li>This becomes a serverless function that holds your secret key</li>
                <li>Your frontend calls <code>/api/generate</code> instead of Anthropic directly</li>
              </ul>
              <div className="code-block">{`// api/generate.js (Vercel Serverless Function)
export default async function handler(req, res) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.json(data);
}`}</div>
              <div className="highlight-box">💡 This way your API key lives only on the server — users never see it.</div>
            </div>

            {/* STEP 6 */}
            <div className="step-card" data-n="6">
              <h3>Step 6 — Get Your First Customers</h3>
              <p>The app is live. Now it's time to hustle. Here's how to find artists who'll pay:</p>
              <ul>
                <li><strong>Instagram & TikTok</strong> — Search hashtags like #unsignedartist #newmusic #indieartist. DM 20 artists a day with your link.</li>
                <li><strong>Reddit</strong> — Post in r/WeAreTheMusicMakers, r/makinghiphop, r/trapproduction</li>
                <li><strong>SoundCloud & DistroKid forums</strong> — Artists there are hungry for promotion tools</li>
                <li><strong>Offer free scripts first</strong> — Generate a real script for an artist's track for free, show them the result, then pitch the subscription</li>
                <li><strong>YouTube shorts</strong> — Post a demo video showing the app generating a script in real time</li>
              </ul>
              <div className="highlight-box">🎯 Goal: Get 10 paying users at $19/month = $190/month recurring. Then scale from there.</div>
            </div>

            {/* STEP 7 */}
            <div className="step-card" data-n="7">
              <h3>Step 7 — Your Monthly Cost Breakdown</h3>
              <p>Here's what it actually costs to run this at scale:</p>
              <ul>
                <li>Vercel hosting — <strong>Free</strong> (up to 100GB bandwidth)</li>
                <li>Domain — <strong>~$1/month</strong></li>
                <li>Anthropic API — <strong>~$0.003 per script</strong> (100 scripts = $0.30)</li>
                <li>Stripe fees — <strong>2.9% per payment</strong></li>
              </ul>
              <div className="highlight-box">💰 At 10 users paying $19/month = $190 revenue. Your costs = ~$2. Profit = ~$188/month. Scale to 100 users = ~$1,880/month.</div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
