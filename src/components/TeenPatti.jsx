"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CasinoDiceAutoMultiplayer.jsx — Professional Responsive Version
 *
 * - Put file into src/components/CasinoDiceAutoMultiplayer.jsx
 * - npm install framer-motion
 * - Tailwind must be configured in project
 * - Optional audio files: /public/sounds/roll.mp3 and /public/sounds/win.mp3
 *
 * Behavior:
 * - START_DELAY seconds startup overlay
 * - ROUND_SECONDS countdown per round (auto)
 * - Fake players place bets during betting window
 * - Betting locked while dice rolls + result display
 * - Mobile-first responsive layout
 */

/* ----------------- Configuration ----------------- */
const ROUND_SECONDS = 75; // seconds countdown each round
const START_DELAY = 5; // seconds before first round starts
const RESULT_HOLD_MS = 4500; // how long to display result before next round (ms)

/* Dice face rotations for final orientation */
const ROTATIONS = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: 90 },
  4: { x: 0, y: -90 },
  5: { x: 90, y: 0 },
  6: { x: 180, y: 0 },
};

/* ----------------- Small helpers ----------------- */
function DiceFace({ number }) {
  const center = 50;
  const gap = 28;
  const positions = {
    1: [[center, center]],
    2: [[center - gap, center - gap], [center + gap, center + gap]],
    3: [[center - gap, center - gap], [center, center], [center + gap, center + gap]],
    4: [
      [center - gap, center - gap],
      [center + gap, center - gap],
      [center - gap, center + gap],
      [center + gap, center + gap],
    ],
    5: [
      [center - gap, center - gap],
      [center + gap, center - gap],
      [center, center],
      [center - gap, center + gap],
      [center + gap, center + gap],
    ],
    6: [
      [center - gap, center - gap],
      [center + gap, center - gap],
      [center - gap, center],
      [center + gap, center],
      [center - gap, center + gap],
      [center + gap, center + gap],
    ],
  };

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g fill="currentColor">
        {positions[number].map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="6" />
        ))}
      </g>
    </svg>
  );
}

/* Payout evaluation */
function payoutFor(type, choice, betAmount, rolled) {
  if (!betAmount) return 0;
  if (type === "number") {
    if (rolled === choice) return Math.round(betAmount * 5);
    return -betAmount;
  } else if (type === "odd-even") {
    const isOdd = rolled % 2 === 1;
    const target = choice === "odd";
    return isOdd === target ? Math.round(betAmount * 1.9) : -betAmount;
  } else if (type === "high-low") {
    const isHigh = rolled >= 4;
    const target = choice === "high";
    return isHigh === target ? Math.round(betAmount * 1.9) : -betAmount;
  }
  return -betAmount;
}

/* ----------------- Component ----------------- */
export default function CasinoDiceAutoMultiplayer() {
  // user
  const [balance, setBalance] = useState(5000);
  const [bet, setBet] = useState(100);
  const [betType, setBetType] = useState("number"); // number | odd-even | high-low
  const [betChoice, setBetChoice] = useState(null); // number | "odd"/"even" | "high"/"low"

  // rounds & flow
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(ROUND_SECONDS);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(1);

  // UI / visuals
  const [history, setHistory] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // fake players
  const [players, setPlayers] = useState([
    { id: "p1", name: "Asha", balance: 12000 },
    { id: "p2", name: "Raj", balance: 9800 },
    { id: "p3", name: "Meera", balance: 7700 },
    { id: "p4", name: "Sahil", balance: 6000 },
  ]);
  const playerBetsRef = useRef({}); // current round bets from players

  // audio refs
  const rollSoundRef = useRef(null);
  const winSoundRef = useRef(null);

  // timers
  const countdownIntervalRef = useRef(null);
  const fakeBetIntervalRef = useRef(null);
  const confettiTimeoutRef = useRef(null);
  const startupTimerRef = useRef(null);

  /* ----------------- Lifecycle: startup + countdown ----------------- */
  useEffect(() => {
    // startup delay before first round
    startupTimerRef.current = setTimeout(() => {
      setGameStarted(true);
      setCountdown(ROUND_SECONDS);
    }, START_DELAY * 1000);

    return () => {
      clearTimeout(startupTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // when gameStarted true, start countdown loop
    if (!gameStarted) return;

    // clear any existing interval
    clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    return () => clearInterval(countdownIntervalRef.current);
  }, [gameStarted]);

  /* ----------------- Fake players betting during betting window ----------------- */
  useEffect(() => {
    // clear old interval
    clearInterval(fakeBetIntervalRef.current);

    if (!rolling && countdown > 0 && gameStarted) {
      // fake players place/change bets at intervals
      fakeBetIntervalRef.current = setInterval(() => {
        setPlayers((prev) => {
          const copy = [...prev];
          const idx = Math.floor(Math.random() * copy.length);
          const p = copy[idx];
          // small bet amounts
          const betAmt = [20, 50, 100, 200][Math.floor(Math.random() * 4)];
          if (p.balance < 20) return copy;
          const types = ["number", "odd-even", "high-low"];
          const t = types[Math.floor(Math.random() * types.length)];
          let choice = null;
          if (t === "number") choice = 1 + Math.floor(Math.random() * 6);
          else if (t === "odd-even") choice = Math.random() > 0.5 ? "odd" : "even";
          else choice = Math.random() > 0.5 ? "high" : "low";

          playerBetsRef.current[p.id] = { playerId: p.id, name: p.name, type: t, choice, amount: betAmt };

          // make a small visual "reserve" deduction (demo only)
          copy[idx] = { ...p, balance: Math.max(0, p.balance - Math.min(betAmt, Math.floor(p.balance * 0.02))) };

          // push brief notification
          pushNotification(`${p.name} placed ${t === "number" ? `#${choice}` : choice} • ₹${betAmt}`);

          return copy;
        });
      }, 1200 + Math.random() * 1400);
    }

    return () => clearInterval(fakeBetIntervalRef.current);
  }, [rolling, countdown, gameStarted]);

  /* ----------------- Notifications helper ----------------- */
  function pushNotification(text) {
    const id = Math.random().toString(36).slice(2, 9);
    setNotifications((n) => [{ id, text }, ...n].slice(0, 6));
    setTimeout(() => {
      setNotifications((n) => n.filter((x) => x.id !== id));
    }, 4500);
  }

  /* ----------------- Confetti helper ----------------- */
  function spawnConfetti(type = "win") {
    const items = Array.from({ length: 20 }).map(() => ({
      id: Math.random().toString(36).slice(2),
      left: 20 + Math.random() * 60 + "%",
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 12,
      delay: Math.random() * 0.3,
      color: type === "win" ? ["#FFD700", "#FFB800", "#FF6B6B", "#8BC34A"][Math.floor(Math.random() * 4)] : "#9CA3AF",
    }));
    setConfetti(items);
    clearTimeout(confettiTimeoutRef.current);
    confettiTimeoutRef.current = setTimeout(() => setConfetti([]), 1800);
  }

  /* ----------------- Sound helper ----------------- */
  function playSound(ref) {
    try {
      if (ref?.current) {
        ref.current.currentTime = 0;
        ref.current.play().catch(() => {});
      }
    } catch (e) {}
  }

  /* ----------------- The round: lock bets, roll & resolve ----------------- */
  useEffect(() => {
    if (!gameStarted) return;
    if (countdown === 0 && !rolling) {
      // start round flow
      startRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, gameStarted]);

  async function startRound() {
    setRolling(true);
    setResult(null);
    playSound(rollSoundRef);

    // snapshot current fake players bets
    const currentPlayerBets = Object.values(playerBetsRef.current || {});

    // short rolling animation wait
    const spinDuration = 1400 + Math.floor(Math.random() * 700); // small randomness
    await new Promise((res) => setTimeout(res, spinDuration));

    // roll
    const final = 1 + Math.floor(Math.random() * 6);
    setResult(final);

    // resolve fake players
    if (currentPlayerBets.length) {
      setPlayers((prev) => {
        const copy = prev.map((p) => ({ ...p }));
        currentPlayerBets.forEach((pb) => {
          const idx = copy.findIndex((x) => x.id === pb.playerId);
          if (idx === -1) return;
          const change = payoutFor(pb.type, pb.choice, pb.amount, final);
          copy[idx].balance = Math.max(0, copy[idx].balance + change);
        });
        return copy;
      });
    }

    // resolve user's bet if placed (balance was reserved at Place Bet)
    let userNet = 0;
    let userOutcomeText = "No bet placed";
    if (betType && betChoice && bet > 0) {
      const net = payoutFor(betType, betChoice, bet, final);
      userNet = net;
      setBalance((b) => Math.max(0, b + net));
      userOutcomeText = net > 0 ? `WIN +₹${net}` : `LOSE -₹${Math.abs(net)}`;
    }

    // history & notifications
    const timestamp = new Date().toLocaleTimeString();
    setHistory((h) => [`Round ${round} • ${timestamp} • Rolled ${final} • You: ${userOutcomeText}`, ...h].slice(0, 60));
    if (userNet > 0) {
      spawnConfetti("win");
      playSound(winSoundRef);
      pushNotification(`You won ₹${userNet}!`);
    } else if (userNet < 0) {
      spawnConfetti("lose");
      pushNotification(`You lost ₹${Math.abs(userNet)}`);
    } else {
      spawnConfetti("lose");
    }

    // clear player bets and small delay to show result
    playerBetsRef.current = {};
    await new Promise((res) => setTimeout(res, RESULT_HOLD_MS));

    // prepare next round
    setRound((r) => r + 1);
    setCountdown(ROUND_SECONDS);
    setRolling(false);
    setResult(null);
  }

  /* ----------------- User actions ----------------- */
  function placeUserBet() {
    if (!gameStarted) {
      pushNotification(`Game not started yet`);
      return;
    }
    if (!betChoice) {
      pushNotification(`Choose a value before placing a bet`);
      return;
    }
    if (bet > balance) {
      pushNotification(`Insufficient balance`);
      return;
    }
    // reserve bet (demo)
    setBalance((b) => Math.max(0, b - bet));
    setHistory((h) => [`Placed: ${betType === "number" ? `#${betChoice}` : betChoice} • ₹${bet}`, ...h].slice(0, 60));
    pushNotification(`You placed ${betType === "number" ? `#${betChoice}` : betChoice} • ₹${bet}`);
  }

  function adminRollNow() {
    if (!gameStarted) {
      // start immediately
      clearTimeout(startupTimerRef.current);
      setGameStarted(true);
      setCountdown(1);
    } else {
      setCountdown(0);
    }
  }

  function resetDemo() {
    setBalance(5000);
    setBet(100);
    setBetType("number");
    setBetChoice(null);
    setHistory([]);
    setPlayers([
      { id: "p1", name: "Asha", balance: 12000 },
      { id: "p2", name: "Raj", balance: 9800 },
      { id: "p3", name: "Meera", balance: 7700 },
      { id: "p4", name: "Sahil", balance: 6000 },
    ]);
    playerBetsRef.current = {};
    setRound(1);
    setResult(null);
    setRolling(false);
    setCountdown(ROUND_SECONDS);
    setConfetti([]);
    setNotifications([]);
  }

  /* ----------------- Cleanup on unmount ----------------- */
  useEffect(() => {
    return () => {
      clearInterval(countdownIntervalRef.current);
      clearInterval(fakeBetIntervalRef.current);
      clearTimeout(confettiTimeoutRef.current);
      clearTimeout(startupTimerRef.current);
    };
  }, []);

  /* ----------------- UI helpers ----------------- */
  const bettingOpen = gameStarted && !rolling && countdown > 0;
  const timeLabel = !gameStarted ? `Starting in ${START_DELAY}s` : `${countdown}s`;

  /* ----------------- Render ----------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06040a] to-[#18050a] text-white p-4">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold shadow">D</div>
          <div>
            <div className="text-xl font-bold">Dice Royale — Pro</div>
            <div className="text-sm text-slate-400">Auto rounds • Luxury table</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={adminRollNow} className="px-3 py-2 rounded-md bg-amber-400 text-black font-semibold">Roll Now</button>
          <button onClick={resetDemo} className="px-3 py-2 rounded-md bg-gray-800/60">Reset Demo</button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Game area (spans 3 cols on large screens) */}
        <section className="lg:col-span-3 rounded-3xl bg-[linear-gradient(180deg,#0b0810,transparent)] p-6 shadow-lg overflow-hidden">
          {/* top row */}
          <div className="flex items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold">Auto Dice Table</h2>
              <div className="text-sm text-slate-400">Round {round} • {bettingOpen ? "Betting Open" : "Betting Locked"}</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-300">Next roll in</div>
              <div className="text-2xl font-bold text-amber-400">{timeLabel}</div>
            </div>
          </div>

          {/* table */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0f1714] to-[#071013] p-6 flex flex-col items-center">
            <div className="w-full max-w-3xl relative">
              <div className="mx-auto w-full h-56 rounded-2xl bg-gradient-to-b from-[#101418] to-[#071013] shadow-inner border border-amber-900/5 flex items-center justify-center relative">
                {/* ambient spotlight */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-80 h-28 bg-gradient-to-b from-amber-500/6 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* dice cube */}
                <div className="relative w-40 h-40">
                  <motion.div
                    animate={
                      rolling
                        ? { rotateX: 720 + Math.random() * 720, rotateY: 720 + Math.random() * 720 }
                        : result
                        ? { rotateX: ROTATIONS[result].x + 720, rotateY: ROTATIONS[result].y + 720 }
                        : { rotateX: 10, rotateY: -10 }
                    }
                    transition={{ duration: rolling ? 1.4 : 0.9, ease: "easeOut" }}
                    className="w-40 h-40 relative mx-auto transform-style-preserve-3d"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* faces */}
                    {[1,2,3,4,5,6].map((n, i) => {
                      // map indices to transforms same as earlier faces
                      const faceStyle = [
                        { transform: "translateZ(80px)" },
                        { transform: "rotateX(90deg) translateZ(80px)" },
                        { transform: "rotateY(90deg) translateZ(80px)" },
                        { transform: "rotateY(-90deg) translateZ(80px)" },
                        { transform: "rotateX(-90deg) translateZ(80px)" },
                        { transform: "rotateX(180deg) translateZ(80px)" },
                      ][i];
                      return (
                        <div key={n} className="absolute w-full h-full rounded-lg bg-white shadow-lg border border-amber-50 flex items-center justify-center text-amber-700" style={{ ...faceStyle, backfaceVisibility: "hidden" }}>
                          <div className="w-24 h-24"><DiceFace number={n} /></div>
                        </div>
                      );
                    })}
                  </motion.div>

                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-28 h-6 bg-gradient-to-b from-black/40 to-transparent rounded-full blur-xl" />
                </div>
              </div>

              {/* betting panel (only while bettingOpen) */}
              <div className="mt-6 w-full flex flex-col items-center">
                <div className={`w-full max-w-3xl p-4 rounded-lg ${bettingOpen ? "bg-white/4" : "bg-black/10"} border border-amber-900/5`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-slate-300">Your Balance</div>
                      <div className="text-lg font-semibold text-amber-300">₹ {balance}</div>
                    </div>
                    <div className="text-sm text-slate-400">Round {round} • {bettingOpen ? "Betting open" : "Locked"}</div>
                  </div>

                  {bettingOpen ? (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setBet((b) => Math.max(10, b - 50))} className="px-3 py-1 rounded-md bg-gray-800/60">-50</button>
                          <div className="px-4 py-2 rounded-md bg-gradient-to-r from-amber-50/5 to-amber-50/2 border border-amber-100 font-semibold text-amber-300">₹ {bet}</div>
                          <button onClick={() => setBet((b) => b + 50)} className="px-3 py-1 rounded-md bg-gray-800/60">+50</button>
                        </div>
                        <div className="ml-auto text-sm text-slate-400">Place bets until timer ends</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Bet Type */}
                        <div className="p-3 rounded bg-gray-900/30">
                          <div className="text-xs text-slate-300 mb-2">Bet Type</div>
                          <div className="flex gap-2">
                            <button onClick={() => { setBetType("number"); setBetChoice(null); }} className={`flex-1 py-2 rounded ${betType === "number" ? "bg-amber-400 text-black" : "bg-gray-800/60"}`}>Number</button>
                            <button onClick={() => { setBetType("odd-even"); setBetChoice(null); }} className={`flex-1 py-2 rounded ${betType === "odd-even" ? "bg-amber-400 text-black" : "bg-gray-800/60"}`}>Odd/Even</button>
                            <button onClick={() => { setBetType("high-low"); setBetChoice(null); }} className={`flex-1 py-2 rounded ${betType === "high-low" ? "bg-amber-400 text-black" : "bg-gray-800/60"}`}>High/Low</button>
                          </div>
                        </div>

                        {/* Bet Choice */}
                        <div className="p-3 rounded bg-gray-900/30">
                          <div className="text-xs text-slate-300 mb-2">Choose</div>
                          {betType === "number" && (
                            <div className="flex gap-2 flex-wrap">
                              {[1,2,3,4,5,6].map((n) => (
                                <button key={n} onClick={() => setBetChoice(n)} className={`w-10 h-10 rounded ${betChoice === n ? "bg-amber-400 text-black" : "bg-gray-800/60"}`}>{n}</button>
                              ))}
                            </div>
                          )}
                          {betType === "odd-even" && (
                            <div className="flex gap-2">
                              <button onClick={() => setBetChoice("odd")} className={`px-4 py-2 rounded ${betChoice === "odd" ? "bg-amber-400 text-black" : "bg-gray-800/60"}`}>Odd</button>
                              <button onClick={() => setBetChoice("even")} className={`px-4 py-2 rounded ${betChoice === "even" ? "bg-amber-400 text-black" : "bg-gray-800/60"}`}>Even</button>
                            </div>
                          )}
                          {betType === "high-low" && (
                            <div className="flex gap-2">
                              <button onClick={() => setBetChoice("high")} className={`px-4 py-2 rounded ${betChoice === "high" ? "bg-amber-400 text-black" : "bg-gray-800/60"}`}>High (4-6)</button>
                              <button onClick={() => setBetChoice("low")} className={`px-4 py-2 rounded ${betChoice === "low" ? "bg-amber-400 text-black" : "bg-gray-800/60"}`}>Low (1-3)</button>
                            </div>
                          )}
                        </div>

                        {/* Quick actions */}
                        <div className="p-3 rounded bg-gray-900/30 flex flex-col justify-between">
                          <div>
                            <div className="text-xs text-slate-300 mb-2">Quick Actions</div>
                            <button onClick={placeUserBet} className="w-full py-2 rounded bg-amber-400 text-black font-semibold">Place Bet</button>
                            <button onClick={() => { setBetChoice(null); setBetType("number"); }} className="w-full mt-2 py-2 rounded bg-gray-800/60">Clear</button>
                          </div>
                          <div className="text-xs text-slate-400 mt-2">Payouts: Number=5× • Odd/Even=1.9× • High/Low=1.9×</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-slate-300 py-6">Betting closed — wait for result</div>
                  )}
                </div>
              </div>

              {/* result banner */}
              <div className="mt-6">
                <AnimatePresence>
                  {result && (
                    <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`px-6 py-3 rounded-full font-semibold ${result && betChoice !== null && payoutFor(betType, betChoice, bet, result) > 0 ? "bg-amber-400 text-black" : "bg-gray-700 text-white"} shadow-lg`}>
                      Rolled: {result} • {betChoice ? (payoutFor(betType, betChoice, bet, result) > 0 ? `YOU WIN +₹${payoutFor(betType,betChoice,bet,result)}` : `YOU LOSE -₹${Math.abs(payoutFor(betType,betChoice,bet,result))}`) : "You did not place bet"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* confetti layer */}
              <div className="absolute inset-0 pointer-events-none">
                {confetti.map((c) => (
                  <motion.div key={c.id} initial={{ y: -20, opacity: 0, scale: 0.6 }} animate={{ y: 220 + Math.random() * 80, opacity: 1, rotate: c.rotate }} transition={{ delay: c.delay, duration: 1.1, ease: "easeOut" }} style={{ left: c.left, position: "absolute", transform: "translateX(-50%)" }}>
                    <div className="w-2 h-4 rounded-sm" style={{ background: c.color }} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right: Sidebar */}
        <aside className="rounded-3xl p-6 bg-gradient-to-b from-[#0b0710] to-[#08060a] border border-amber-900/10 shadow-lg">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-amber-200">Game Panel</h3>
            <p className="text-sm text-slate-400 mt-1">Auto rounds every {ROUND_SECONDS}s — place bets while timer runs</p>
          </div>

          <div className="mb-4">
            <div className="text-xs text-slate-400">Your Balance</div>
            <div className="text-lg font-semibold text-amber-300">₹ {balance}</div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-slate-400">Players (live)</div>
            <div className="mt-2 bg-gradient-to-b from-black/20 to-transparent rounded-lg p-2 border border-amber-900/5 max-h-48 overflow-auto">
              {players.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-amber-800/20 flex items-center justify-center text-amber-300 font-semibold">{p.name[0]}</div>
                    <div>{p.name}</div>
                  </div>
                  <div className="font-semibold text-amber-300">₹ {p.balance}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-slate-400">Notifications</div>
            <div className="mt-2 space-y-2">
              {notifications.length === 0 ? <div className="text-sm text-slate-500">No recent bets</div> : notifications.map(n => (
                <div key={n.id} className="text-sm text-slate-200/90 border-b border-amber-900/5 pb-1">{n.text}</div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-slate-400">History</div>
            <div className="mt-2 h-44 overflow-auto bg-gradient-to-b from-black/20 to-transparent rounded-lg p-2 border border-amber-900/5">
              {history.length === 0 ? <div className="text-slate-500 text-sm">No rounds yet</div> : (
                <ul className="space-y-2 text-sm">
                  {history.map((h, i) => <li key={i} className="text-slate-200/90 text-sm border-b border-amber-900/5 pb-1">{h}</li>)}
                </ul>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setCountdown(ROUND_SECONDS); setPlayers((p)=>p.map(x=>({...x, balance: x.balance+500}))); }} className="flex-1 py-2 rounded-md bg-emerald-600/80">Boost Players</button>
            <button onClick={adminRollNow} className="flex-1 py-2 rounded-md bg-amber-400 text-black font-semibold">Roll Now</button>
          </div>

          <div className="mt-4 text-xs text-slate-400">Payouts: Number = 5× • Odd/Even = 1.9× • High/Low = 1.9×</div>

          {/* audio */}
          <audio ref={rollSoundRef} src="/sounds/roll.mp3" preload="auto" />
          <audio ref={winSoundRef} src="/sounds/win.mp3" preload="auto" />
        </aside>
      </main>

      {/* startup overlay */}
      <AnimatePresence>
        {!gameStarted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="relative z-50 bg-gradient-to-b from-[#0b0710] to-[#12070b] p-8 rounded-xl shadow-2xl border border-amber-900/10 text-center w-[90%] max-w-md">
              <div className="text-2xl font-bold text-amber-300 mb-2">Welcome to Dice Royale</div>
              <div className="text-sm text-slate-300 mb-4">Game starting in <strong>{START_DELAY}s</strong></div>
              <div className="text-sm text-slate-400 mb-4">Place bets once the timer begins. Enjoy the demo!</div>
              <div className="flex gap-2 justify-center">
                <button onClick={() => { clearTimeout(startupTimerRef.current); setGameStarted(true); setCountdown(ROUND_SECONDS); }} className="px-4 py-2 rounded bg-amber-400 text-black font-semibold">Start Now</button>
                <button onClick={() => { /* do nothing — wait */ }} className="px-4 py-2 rounded bg-gray-800/60">Wait</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
