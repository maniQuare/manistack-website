"use client";

import React, { useState, useRef } from "react";

export default function LotteryWheel() {
  const wheelRef = useRef(null);
  const [balance, setBalance] = useState(1000);
  const [presetAmounts] = useState([10, 50, 100, 500]);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const sectors = Array.from({ length: 12 }, (_, i) => i + 1); // 12 sector wheel

  const handleSpin = () => {
    if (!selectedAmount) return alert("Please select a bet amount!");
    if (selectedAmount > balance) return alert("Insufficient balance!");
    setSpinning(true);
    setResult(null);

    const winningSector = sectors[Math.floor(Math.random() * sectors.length)];

    // Wheel rotation logic
    const spins = 5; // full rotations
    const degPerSector = 360 / sectors.length;
    const randomOffset = Math.random() * degPerSector;
    const totalDeg = 360 * spins + (winningSector - 1) * degPerSector + randomOffset;

    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 4s cubic-bezier(.17,.67,.83,.67)";
      wheelRef.current.style.transform = `rotate(${totalDeg}deg)`;
    }

    setTimeout(() => {
      setSpinning(false);
      setResult(winningSector);

      // Win logic: example 1/12 chance multiply bet x5
      if (Math.random() < 1 / 12) {
        setBalance((prev) => prev + selectedAmount * 5);
        alert(`🎉 You won! Number ${winningSector}!`);
      } else {
        setBalance((prev) => prev - selectedAmount);
        alert(`😢 You lost! Number ${winningSector}`);
      }
    }, 4200);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      {/* Balance & Bet Selector */}
      <div className="rounded-xl p-4 bg-white border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-800">💰 Balance & Bet</h3>
        <div className="mt-3 flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-2">
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
          <div className="text-sm text-gray-600">
            Current Balance: <span className="font-semibold text-gray-800">₹{balance}</span>
          </div>
        </div>
      </div>

      {/* Wheel */}
      <div className="relative flex justify-center">
        <div className="w-72 h-72 rounded-full border-4 border-gray-200 shadow-md overflow-hidden relative">
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full flex flex-wrap items-center justify-center"
            style={{ transform: "rotate(0deg)" }}
          >
            {sectors.map((s, i) => (
              <div
                key={i}
                className="w-1/2 h-1/2 flex items-center justify-center border border-gray-100"
                style={{
                  transform: `rotate(${(i * 360) / sectors.length}deg) skewY(-30deg)`,
                  transformOrigin: "100% 100%",
                  backgroundColor: i % 2 === 0 ? "#f3f4f6" : "#ffffff",
                }}
              >
                <span className="text-xs font-bold transform -skew-y-30">{s}</span>
              </div>
            ))}
          </div>
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-3 h-6 bg-red-500 rounded-sm"></div>
        </div>
      </div>

      {/* Spin Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSpin}
          disabled={spinning || !selectedAmount}
          className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {spinning ? "Spinning..." : `Spin ₹${selectedAmount || 0}`}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="text-center text-gray-700 font-semibold text-lg">
          Last Winning Number: <span className="text-sky-600">{result}</span>
        </div>
      )}
    </div>
  );
}
