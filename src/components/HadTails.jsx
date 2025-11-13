/*
HeadTailGame - Next.js + React component (JSX) with Tailwind CSS

Usage (Next.js App Router or Pages):
1. Place your realistic coin images in the project's public folder as:
   /public/heads.png and /public/tails.png
2. Save this file as `src/components/HeadTailGame.jsx` (or any path you prefer).
3. Import and render where needed (e.g. in a page):
   import HeadTailGame from '@/components/HeadTailGame';
   <HeadTailGame />

Notes:
- Uses next/image for optimized loading but will fall back to <img> if you prefer.
- Coin flip animation is preserved; image swap is handled by opacity transitions.
- No external libraries required (besides Next.js + Tailwind already configured).
*/

import React, { useState, useRef } from "react";
import Image from "next/image";

export default function HeadTailGame() {
  const [playerChoice, setPlayerChoice] = useState(null); // 'HEADS' | 'TAILS'
  const [lastResult, setLastResult] = useState(null); // 'HEADS' | 'TAILS'
  const [isFlipping, setIsFlipping] = useState(false);
  const [score, setScore] = useState({ wins: 0, losses: 0 });
  const [history, setHistory] = useState([]);
  const flipRef = useRef(null);

  function randomResult() {
    return Math.random() < 0.5 ? "HEADS" : "TAILS";
  }

  function handleChoice(choice) {
    if (isFlipping) return;
    setPlayerChoice(choice);
    doFlip(choice);
  }

  function doFlip(choice) {
    setIsFlipping(true);
    setLastResult(null);

    // restart CSS animation
    if (flipRef.current) {
      flipRef.current.classList.remove("flip-animate");
      // trigger reflow
      void flipRef.current.offsetWidth;
      flipRef.current.classList.add("flip-animate");
    }

    const duration = 1400; // match animation CSS
    setTimeout(() => {
      const outcome = randomResult();
      setLastResult(outcome);

      const won = outcome === choice;
      setScore((prev) => ({
        wins: prev.wins + (won ? 1 : 0),
        losses: prev.losses + (won ? 0 : 1),
      }));

      setHistory((h) =>
        [{ id: Date.now(), choice, outcome, won }, ...h].slice(0, 12)
      );

      setIsFlipping(false);
    }, duration);
  }

  function resetAll() {
    setScore({ wins: 0, losses: 0 });
    setHistory([]);
    setPlayerChoice(null);
    setLastResult(null);
  }

  // helper for showing result text
  const resultText = () => {
    if (isFlipping) return "Flipping...";
    if (!lastResult) return "Pick Heads or Tails";
    return `${lastResult} • ${
      lastResult === playerChoice ? "You won!" : "You lost"
    }`;
  };



  const [presetAmounts] = useState([10, 50, 100, 500, 1000]);
const [selectedAmount, setSelectedAmount] = useState(null);
const [balance, setBalance] = useState(1000); // starting balance

const handlePlaceBet = () => {
  if (!selectedAmount) return alert("Please select an amount!");
  if (selectedAmount > balance) return alert("Insufficient balance!");
  alert(`Bet of ₹${selectedAmount} placed!`);
};


  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold">
            Head & Tails Coin
          </h2>
          <div className="text-sm text-gray-500">
           
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="col-span-1 flex flex-col gap-4">
            <div className="rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <div className="text-sm text-gray-600">Choose your side</div>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => handleChoice("HEADS")}
                  disabled={isFlipping}
                  className={`flex-1 py-3 rounded-lg font-bold shadow-sm transition transform disabled:opacity-50 disabled:cursor-not-allowed ${
                    playerChoice === "HEADS"
                      ? "bg-sky-600 text-white"
                      : "bg-sky-50 text-sky-700"
                  }`}
                >
                  HEADS
                </button>

                <button
                  onClick={() => handleChoice("TAILS")}
                  disabled={isFlipping}
                  className={`flex-1 py-3 rounded-lg font-bold shadow-sm transition transform disabled:opacity-50 disabled:cursor-not-allowed ${
                    playerChoice === "TAILS"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  TAILS
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    if (!isFlipping)
                      doFlip(Math.random() < 0.5 ? "HEADS" : "TAILS");
                  }}
                  className="flex-1 py-2 rounded-md border hover:bg-gray-50"
                >
                  Random Flip
                </button>
                <button
                  onClick={resetAll}
                  className="flex-1 py-2 rounded-md border hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>

       
            </div>

            <div className="rounded-xl p-4 bg-white border border-gray-100">
              <div className="text-sm text-gray-600">Score</div>
              <div className="mt-3 flex gap-3 items-center">
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Wins</div>
                  <div className="text-xl font-semibold">{score.wins}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Losses</div>
                  <div className="text-xl font-semibold">{score.losses}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">History</div>
                  <div className="text-xl font-semibold">{history.length}</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Last: {lastResult ?? "—"}
              </div>
            </div>

            <div className="rounded-xl p-4 bg-white border border-gray-100 overflow-auto max-h-48">
              <div className="text-sm text-gray-600">Recent flips</div>
              <ul className="mt-3 space-y-2">
                {history.length === 0 && (
                  <li className="text-sm text-gray-400">No flips yet.</li>
                )}
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold ${
                          h.outcome === "HEADS"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {h.outcome === "HEADS" ? "H" : "T"}
                      </div>
                      <div>
                        <div className="font-medium">You: {h.choice}</div>
                        <div className="text-xs text-gray-500">
                          Outcome: {h.outcome} • {h.won ? "Win" : "Lose"}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(h.id).toLocaleTimeString()}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coin area (center) */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center">
            <div className="relative">
              <div
                ref={flipRef}
                className="w-56 h-56 rounded-full flex items-center justify-center shadow-2xl select-none transform transition-transform"
              >
                {/* Two stacked images with crossfade */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Heads image */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                      lastResult === "HEADS"
                        ? "opacity-100"
                        : isFlipping
                        ? "opacity-30"
                        : lastResult
                        ? "opacity-20"
                        : "opacity-90"
                    }`}
                  >
                    <Image
                      src="/heads.png"
                      alt="Heads"
                      width={220}
                      height={220}
                      className="object-contain rounded-full"
                      priority
                    />
                  </div>

                  {/* Tails image */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                      lastResult === "TAILS"
                        ? "opacity-100"
                        : isFlipping
                        ? "opacity-30"
                        : lastResult
                        ? "opacity-20"
                        : "opacity-10"
                    }`}
                  >
                    <Image
                      src="/tails.png"
                      alt="Tails"
                      width={220}
                      height={220}
                      className="object-contain rounded-full"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="rounded-full px-4 py-2 bg-white border shadow-sm text-sm font-semibold">
                  {resultText()}
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              {playerChoice ? (
                <div>
                  Last pick: <span className="font-medium">{playerChoice}</span>
                </div>
              ) : (
                <div className="italic text-gray-400">No pick yet</div>
              )}
            </div>
          </div>

          {/* Right column */}
          {/* Right column */}
<div className="col-span-1 flex flex-col gap-4">
  {/* 💰 Bet Amount Selector */}
  <div className="rounded-xl p-4 bg-white border border-gray-100">
    <h3 className="font-semibold text-gray-800">💸 Choose Your Bet Amount</h3>

    {/* Amount options */}
    <div className="mt-3 grid grid-cols-3 gap-3">
      {presetAmounts.map((amt) => (
        <button
          key={amt}
          onClick={() => setSelectedAmount(amt)}
          className={`py-2 rounded-lg border text-sm font-semibold transition
            ${
              selectedAmount === amt
                ? "bg-sky-600 text-white border-sky-600 shadow-md scale-105"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
        >
          ₹{amt}
        </button>
      ))}
    </div>

    {/* Place Bet button */}
    <button
      onClick={handlePlaceBet}
      disabled={!selectedAmount || isFlipping}
      className="w-full mt-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
    >
      Place Bet ₹{selectedAmount || 0}
    </button>

    {/* Current balance */}
    <div className="mt-3 text-sm text-gray-600">
      Balance: <span className="font-semibold text-gray-800">₹{balance}</span>
    </div>
  </div>

  {/* 🎯 Quick Actions */}
  <div className="rounded-xl p-4 bg-white border border-gray-100">
    <h3 className="font-semibold text-gray-800">Quick Actions</h3>
    <div className="mt-3 flex gap-2">
      <button
        onClick={() => handleChoice("HEADS")}
        disabled={isFlipping || !selectedAmount}
        className="flex-1 py-2 rounded-md bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 transition"
      >
        Flip HEADS
      </button>
      <button
        onClick={() => handleChoice("TAILS")}
        disabled={isFlipping || !selectedAmount}
        className="flex-1 py-2 rounded-md bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50 transition"
      >
        Flip TAILS
      </button>
    </div>
  </div>

  {/* 📊 Stats */}
  <div className="rounded-xl p-4 bg-white border border-gray-100">
    <h3 className="font-semibold text-gray-800">Stats</h3>
    <div className="mt-2 text-sm text-gray-600 space-y-2">
      <div>
        Winning percentage:{" "}
        {(() => {
          const total = score.wins + score.losses;
          return total
            ? Math.round((score.wins / total) * 100) + "%"
            : "—";
        })()}
      </div>
      <div>Total flips: {score.wins + score.losses}</div>
    </div>
  </div>
</div>

          


        </div>
      </div>

      <style>{`\n        .flip-animate {\n          animation: coinFlip 1.4s cubic-bezier(.34,.9,.64,1) both;\n          transform-origin: 50% 50%;\n        }\n\n        @keyframes coinFlip {\n          0% { transform: rotateX(0) rotateY(0) scale(1); }\n          20% { transform: rotateX(720deg) rotateY(360deg) scale(1.05); }\n          50% { transform: rotateX(1080deg) rotateY(720deg) scale(1.02); }\n          100% { transform: rotateX(1440deg) rotateY(1080deg) scale(1); }\n        }\n      `}</style>
    </div>
  );
}
