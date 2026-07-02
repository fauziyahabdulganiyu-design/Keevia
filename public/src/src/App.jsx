import { useState } from "react";

const QUESTIONS = [
  {
    id: "business_type",
    label: "What type of business are you?",
    type: "select",
    options: [
      "E-commerce / Product brand",
      "Retail (walk-in store)",
      "SaaS / Tech product",
      "Service-based business",
      "Food & Hospitality",
      "Other",
    ],
  },
  {
    id: "customer_stage",
    label: "Where do most of your customers drop off?",
    type: "select",
    options: [
      "After the first purchase — they never come back",
      "During onboarding — they sign up but don't engage",
      "After a few weeks — interest fades",
      "At renewal or reorder time",
      "I'm not sure / I don't track this",
    ],
  },
  {
    id: "communication",
    label: "How do you currently communicate with customers after they buy?",
    type: "multiselect",
    options: [
      "Email sequences",
      "SMS / WhatsApp",
      "Social media content",
      "Push notifications",
      "In-person follow up",
      "We don't have a system yet",
    ],
  },
  {
    id: "content_strategy",
    label: "Do you create content specifically to retain or re-engage existing customers?",
    type: "select",
    options: [
      "Yes — regularly and intentionally",
      "Sometimes — but it's not structured",
      "Rarely — most content is for new customers",
      "No — we don't do this at all",
    ],
  },
  {
    id: "feedback",
    label: "Do you collect feedback from customers after purchase?",
    type: "select",
    options: [
      "Yes — and we act on it",
      "Yes — but we don't really use it",
      "No — but we want to",
      "No — and it's not a priority",
    ],
  },
  {
    id: "loyalty",
    label: "Do you have anything in place to reward loyal or returning customers?",
    type: "select",
    options: [
      "Yes — a formal loyalty or rewards program",
      "Informally — occasional discounts or perks",
      "Not yet — but we're planning something",
      "No — and we haven't thought about it",
    ],
  },
  {
    id: "biggest_challenge",
    label: "What is your biggest retention challenge right now?",
    type: "textarea",
    placeholder:
      "e.g. Customers love the first product but never reorder. We have no idea why they leave...",
  },
];

const COLORS = {
  bg: "#080810",
  surface: "#0F0F1A",
  card: "#15152A",
  border: "#2A2A45",
  accent: "#B47FFF",
  accentDim: "rgba(180,127,255,0.15)",
  accentDimmer: "rgba(180,127,255,0.07)",
  text: "#F0EEFF",
  muted: "#8B82A8",
  mutedLight: "#4A4468",
};

export default function Keevia() {
  const [step, setStep] = useState("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState("");
  const [brandName, setBrandName] = useState("");

  const q = QUESTIONS[current];

  function handleSelect(val) {
    setAnswers((a) => ({ ...a, [q.id]: val }));
  }

  function handleMultiselect(val) {
    const prev = answers[q.id] || [];
    const next = prev.includes(val)
      ? prev.filter((v) => v !== val)
      : [...prev, val];
    setAnswers((a) => ({ ...a, [q.id]: next }));
  }

  function canAdvance() {
    const val = answers[q.id];
    if (!val) return false;
    if (q.type === "multiselect") return val.length > 0;
    if (q.type === "textarea") return val.trim().length > 5;
    return true;
  }

  function next() {
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      runAudit();
    }
  }

  function prev() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  async function runAudit() {
    setStep("loading");
    const summary = QUESTIONS.map((q) => {
      const val = answers[q.id];
      const answer = Array.isArray(val) ? val.join(", ") : val;
      return `${q.label}\nAnswer: ${answer}`;
    }).join("\n\n");

    const prompt = `You are a senior Retention Marketing and Content Strategy expert named Keevia, built by Fauziyah — a retention marketer who helps brand and business owners stop losing customers they worked hard to get.

A business owner has just completed a retention audit. Based on their answers, give them a clear, honest, and deeply actionable retention audit report. Speak directly to them — warm, smart, and like a consultant who genuinely cares about their growth.

Business name (if given): ${brandName || "Not provided"}

Their answers:
${summary}

Your report must include these exact sections:

1. RETENTION HEALTH SCORE
Give a score out of 10 with a one-line verdict that is specific to their situation. Example: "5/10 — You are attracting customers but have no system to bring them back."

2. YOUR 3 BIGGEST RETENTION LEAKS
Identify the 3 most critical gaps based specifically on their answers. Be direct and honest. No generic advice — speak to exactly what they told you.

3. WHAT YOU ARE ALREADY DOING RIGHT
Acknowledge anything positive in their answers, even if small. Every business has something. Be encouraging but truthful.

4. YOUR 90-DAY RETENTION ROADMAP
Give 3 clear prioritized actions for the next 90 days. Each action must be specific, practical, and doable for a small to medium business owner. No vague advice.

5. CONTENT STRATEGY ANGLE
Give 2 content ideas designed specifically to retain their existing customers — not attract new ones. These should feel fresh and tailored to their business type.

6. A PERSONAL NOTE FROM FAUZIYAH
End with a short warm note (3 to 4 sentences) from Fauziyah directly — encouraging, real, and human. Remind them that retention is not just strategy, it is relationship. Sign it as Fauziyah, Your Retention Marketer.

Write in plain, warm, direct language. Mix short paragraphs with the sections. Avoid bullet point overload. Make them feel seen, not lectured.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text =
        data.content?.map((b) => b.text || "").join("\n") ||
        "Something went wrong. Please try again.";
      setResult(text);
      setStep("result");
    } catch {
      setResult("We hit an error generating your audit. Please try again.");
      setStep("result");
    }
  }

  function restart() {
    setStep("intro");
    setCurrent(0);
    setAnswers({});
    setResult("");
    setBrandName("");
  }

  const progress = ((current + 1) / QUESTIONS.length) * 100;

  const s = {
    root: {
      minHeight: "100vh",
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
    },
    card: {
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "20px",
      maxWidth: "620px",
      width: "100%",
      overflow: "hidden",
    },
    header: {
      padding: "20px 28px",
      borderBottom: `1px solid ${COLORS.border}`,
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    logoMark: {
      width: "32px",
      height: "32px",
      background: COLORS.accent,
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    logoText: {
      fontSize: "15px",
      fontWeight: "700",
      letterSpacing: "-0.3px",
      color: COLORS.text,
    },
    logoSub: {
      fontSize: "11px",
      color: COLORS.muted,
      marginTop: "1px",
    },
    body: { padding: "28px" },
    headline: {
      fontSize: "26px",
      fontWeight: "800",
      letterSpacing: "-0.8px",
      lineHeight: "1.2",
      marginBottom: "10px",
    },
    accent: { color: COLORS.accent },
    sub: {
      fontSize: "14px",
      color: COLORS.muted,
      lineHeight: "1.65",
      marginBottom: "20px",
    },
    welcomeBox: {
      background: COLORS.accentDimmer,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "20px",
    },
    welcomeTitle: {
      fontSize: "12px",
      fontWeight: "700",
      color: COLORS.accent,
      textTransform: "uppercase",
      letterSpacing: "0.8px",
      marginBottom: "6px",
    },
    welcomeText: {
      fontSize: "13px",
      color: COLORS.muted,
      lineHeight: "1.6",
    },
    pillRow: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      marginBottom: "20px",
    },
    pill: {
      background: COLORS.accentDimmer,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "100px",
      padding: "5px 12px",
      fontSize: "12px",
      color: COLORS.muted,
    },
    label: {
      fontSize: "12px",
      color: COLORS.muted,
      marginBottom: "6px",
      textTransform: "uppercase",
      letterSpacing: "0.8px",
    },
    input: {
      width: "100%",
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "10px",
      padding: "12px 14px",
      color: COLORS.text,
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      marginBottom: "20px",
      fontFamily: "inherit",
    },
    btn: {
      background: COLORS.accent,
      color: "#080810",
      border: "none",
      borderRadius: "10px",
      padding: "14px 28px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      width: "100%",
      letterSpacing: "-0.2px",
      fontFamily: "inherit",
    },
    btnGhost: {
      background: "transparent",
      color: COLORS.muted,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "10px",
      padding: "14px 28px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      letterSpacing: "-0.2px",
      fontFamily: "inherit",
    },
    progressBar: {
      height: "3px",
      background: COLORS.border,
      borderRadius: "2px",
      marginBottom: "24px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      background: COLORS.accent,
      borderRadius: "2px",
      transition: "width 0.3s ease",
      width: `${progress}%`,
    },
    qLabel: {
      fontSize: "17px",
      fontWeight: "700",
      letterSpacing: "-0.4px",
      marginBottom: "18px",
      lineHeight: "1.35",
    },
    optionBtn: (selected) => ({
      width: "100%",
      textAlign: "left",
      background: selected ? COLORS.accentDim : COLORS.card,
      border: `1px solid ${selected ? COLORS.accent : COLORS.border}`,
      borderRadius: "10px",
      padding: "12px 16px",
      color: selected ? COLORS.accent : COLORS.text,
      fontSize: "14px",
      cursor: "pointer",
      marginBottom: "8px",
      fontWeight: selected ? "600" : "400",
      transition: "all 0.15s",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontFamily: "inherit",
    }),
    checkDot: (selected) => ({
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      border: `2px solid ${selected ? COLORS.accent : COLORS.mutedLight}`,
      background: selected ? COLORS.accent : "transparent",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    textarea: {
      width: "100%",
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "10px",
      padding: "14px",
      color: COLORS.text,
      fontSize: "14px",
      outline: "none",
      resize: "vertical",
      minHeight: "100px",
      boxSizing: "border-box",
      lineHeight: "1.6",
      fontFamily: "inherit",
      marginBottom: "20px",
    },
    navRow: {
      display: "flex",
      gap: "10px",
      marginTop: "8px",
    },
    stepCount: {
      fontSize: "12px",
      color: COLORS.muted,
      marginBottom: "16px",
    },
    loadingWrap: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 32px",
      gap: "16px",
    },
    spinner: {
      width: "40px",
      height: "40px",
      border: `3px solid ${COLORS.border}`,
      borderTop: `3px solid ${COLORS.accent}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
    loadingText: { color: COLORS.muted, fontSize: "14px" },
    resultBody: { padding: "28px" },
    resultTitle: {
      fontSize: "19px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
      marginBottom: "4px",
    },
    resultSub: {
      fontSize: "13px",
      color: COLORS.muted,
      marginBottom: "20px",
    },
    resultContent: {
      fontSize: "14px",
      lineHeight: "1.8",
      color: "#D0D0D0",
      whiteSpace: "pre-wrap",
      marginBottom: "24px",
    },
    contactCard: {
      marginTop: "28px",
      padding: "22px",
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "14px",
    },
    avatar: {
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      background: COLORS.accentDim,
      border: `2px solid ${COLORS.accent}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      fontWeight: "800",
      color: COLORS.accent,
      flexShrink: 0,
    },
    footer: {
      padding: "14px 28px",
      borderTop: `1px solid ${COLORS.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
  };

  return (
    <div style={s.root}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::placeholder { color: #4A4468; }
        a { transition: opacity 0.15s; }
        a:hover { opacity: 0.8; }
      `}</style>

      <div style={s.card}>

        {/* HEADER */}
        <div style={s.header}>
          <div style={s.logoMark}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 12H2L8 2Z" fill="#080810" />
            </svg>
          </div>
          <div>
            <div style={s.logoText}>Keevia</div>
            <div style={s.logoSub}>Retention Audit Tool</div>
          </div>
        </div>

        {/* INTRO */}
        {step === "intro" && (
          <div style={s.body}>
            <div style={s.headline}>
              Know why they leave.<br />
              Know how to make them <span style={s.accent}>stay.</span>
            </div>
            <div style={s.sub}>
              A free AI-powered retention audit built specifically for brand and business owners — whether you sell online, in a walk-in store, or both. Find your gaps, fix your leaks, and keep the customers you worked hard to get.
            </div>

            <div style={s.welcomeBox}>
              <div style={s.welcomeTitle}>Welcome from Fauziyah</div>
              <div style={s.welcomeText}>
                Most businesses spend everything attracting new customers and almost nothing keeping them. I built Keevia to change that. Answer 7 honest questions and I will show you exactly where your retention is breaking down — and what to do about it. This is for you: the business owner who is ready to build something that lasts.
              </div>
            </div>

            <div style={s.pillRow}>
              <span style={s.pill}>7 questions</span>
              <span style={s.pill}>~3 minutes</span>
              <span style={s.pill}>Free AI audit</span>
              <span style={s.pill}>Personalized report</span>
            </div>

            <div style={s.label}>Your brand or business name (optional)</div>
            <input
              style={s.input}
              placeholder="e.g. Nura Skincare, The Bread Spot, TechFlow..."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
            <button style={s.btn} onClick={() => setStep("questions")}>
              Start My Free Audit →
            </button>
          </div>
        )}

        {/* QUESTIONS */}
        {step === "questions" && (
          <div style={s.body}>
            <div style={s.stepCount}>Question {current + 1} of {QUESTIONS.length}</div>
            <div style={s.progressBar}>
              <div style={s.progressFill} />
            </div>
            <div style={s.qLabel}>{q.label}</div>

            {q.type === "select" &&
              q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    style={s.optionBtn(selected)}
                    onClick={() => handleSelect(opt)}
                  >
                    <div style={s.checkDot(selected)}>
                      {selected && (
                        <svg width="8" height="8" viewBox="0 0 8 8">
                          <path d="M1.5 4L3 5.5L6.5 2" stroke="#080810" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {opt}
                  </button>
                );
              })}

            {q.type === "multiselect" &&
              q.options.map((opt) => {
                const selected = (answers[q.id] || []).includes(opt);
                return (
                  <button
                    key={opt}
                    style={s.optionBtn(selected)}
                    onClick={() => handleMultiselect(opt)}
                  >
                    <div style={{ ...s.checkDot(selected), borderRadius: "4px" }}>
                      {selected && (
                        <svg width="8" height="8" viewBox="0 0 8 8">
                          <path d="M1.5 4L3 5.5L6.5 2" stroke="#080810" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {opt}
                  </button>
                );
              })}

            {q.type === "textarea" && (
              <textarea
                style={s.textarea}
                placeholder={q.placeholder}
                value={answers[q.id] || ""}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                }
              />
            )}

            <div style={s.navRow}>
              {current > 0 && (
                <button style={{ ...s.btnGhost, flex: 1 }} onClick={prev}>
                  ← Back
                </button>
              )}
              <button
                style={{
                  ...s.btn,
                  flex: 2,
                  opacity: canAdvance() ? 1 : 0.4,
                  cursor: canAdvance() ? "pointer" : "not-allowed",
                }}
                onClick={canAdvance() ? next : undefined}
              >
                {current === QUESTIONS.length - 1
                  ? "Generate My Audit →"
                  : "Next →"}
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {step === "loading" && (
          <div style={s.loadingWrap}>
            <div style={s.spinner} />
            <div style={s.loadingText}>Analyzing your retention gaps…</div>
          </div>
        )}

        {/* RESULT */}
        {step === "result" && (
          <div style={s.resultBody}>
            <div style={s.resultTitle}>
              {brandName ? `${brandName}'s ` : "Your "}Retention Audit Report
            </div>
            <div style={s.resultSub}>
              Powered by Keevia · Built by Fauziyah, Your Retention Marketer
            </div>
            <div style={s.resultContent}>{result}</div>

            <button style={s.btn} onClick={restart}>
              Run Another Audit →
            </button>

            {/* CONTACT CARD */}
            <div style={s.contactCard}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div style={s.avatar}>F</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: COLORS.text }}>
                    Fauziyah
                  </div>
                  <div style={{ fontSize: "12px", color: COLORS.muted }}>
                    Your Retention Marketer
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "13px", color: COLORS.muted, lineHeight: "1.7", margin: "0 0 16px 0" }}>
                I help brand and business owners — online and in-store — stop losing customers they worked hard to get. Through retention strategy, content, and smart systems like Keevia, I help you build a business that keeps people coming back.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a
                  href="mailto:fauziyahabdulganiyu@gmail.com"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: COLORS.accent,
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  fauziyahabdulganiyu@gmail.com
                </a>

                <div style={{
                  fontSize: "12px",
                  color: COLORS.mutedLight,
                  background: COLORS.accentDimmer,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  padding: "10px 14px",
                  lineHeight: "1.6",
                }}>
                  Want a full retention strategy for your brand? Have questions about your audit? Reach out directly — let's work together.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        {step !== "loading" && (
          <div style={s.footer}>
            <span style={{ fontSize: "12px", color: COLORS.mutedLight }}>
              Built by{" "}
              <span style={{ color: COLORS.accent, fontWeight: "600" }}>
                Fauziyah
              </span>{" "}
              · Your Retention Marketer
            </span>
            <span style={{
              fontSize: "11px",
              color: COLORS.mutedLight,
              background: COLORS.accentDimmer,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "100px",
              padding: "3px 10px",
            }}>
              Keevia
            </span>
          </div>
        )}

      </div>
    </div>
  );
    }
