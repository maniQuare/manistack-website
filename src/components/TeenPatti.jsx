"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const SUITS = ["S", "H", "D", "C"];
const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

function getRandomCard() {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  return `${rank}${suit}`;
}

export default function AndarBaharGame() {
  const [andarCards, setAndarCards] = useState([]);
  const [baharCards, setBaharCards] = useState([]);
  const [jokerCard, setJokerCard] = useState(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState("Click 'Start Game' to begin dealing!");

  useEffect(() => {
    if (!gameRunning) return;
    if (!jokerCard) {
      const joker = getRandomCard();
      setJokerCard(joker);
      setMessage(`Joker card is ${joker}`);
    }
  }, [gameRunning]);

  const startGame = async () => {
    resetGame();
    setGameRunning(true);
    const joker = getRandomCard();
    setJokerCard(joker);
    setMessage(`Joker card is ${joker}`);

    let isAndar = true;
    for (let i = 0; i < 52; i++) {
      await new Promise((r) => setTimeout(r, 700));
      const newCard = getRandomCard();

      if (isAndar) {
        setAndarCards((prev) => [...prev, newCard]);
      } else {
        setBaharCards((prev) => [...prev, newCard]);
      }

      if (newCard.slice(0, -1) === joker.slice(0, -1)) {
        setWinner(isAndar ? "ANDAR" : "BAHAR");
        setMessage(`Winner: ${isAndar ? "ANDAR" : "BAHAR"} side!`);
        setGameRunning(false);
        break;
      }
      isAndar = !isAndar;
    }
  };

  const resetGame = () => {
    setAndarCards([]);
    setBaharCards([]);
    setWinner(null);
    setMessage("New round ready!");
    setJokerCard(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-green-700 p-6 text-white">
      <h1 className="text-3xl font-bold mb-4 tracking-wide">🎴 Andar Bahar Pro</h1>

      {/* Game Table */}
      <div className="relative w-full max-w-4xl bg-green-800 rounded-3xl border-4 border-yellow-600 p-8 shadow-2xl overflow-hidden">
        {/* Labels */}
        <div className="absolute left-8 top-4 bg-black/30 px-3 py-1 rounded-lg text-yellow-400 font-semibold">
          ANDAR
        </div>
        <div className="absolute right-8 top-4 bg-black/30 px-3 py-1 rounded-lg text-yellow-400 font-semibold">
          BAHAR
        </div>

        {/* Joker Card Center */}
        {jokerCard && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Image
              src={`/cards/${jokerCard}.png`}
              alt={jokerCard}
              width={120}
              height={160}
              className="rounded-xl shadow-xl"
            />
          </motion.div>
        )}

        {/* Andar / Bahar cards with animation */}
        <AnimatePresence>
          {andarCards.map((card, i) => (
            <AnimatedCard key={`andar-${i}`} side="ANDAR" index={i} card={card} />
          ))}
          {baharCards.map((card, i) => (
            <AnimatedCard key={`bahar-${i}`} side="BAHAR" index={i} card={card} />
          ))}
        </AnimatePresence>

        {/* Winner Label */}
        {winner && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"
          >
            <h2 className="text-4xl font-extrabold text-yellow-400 drop-shadow-lg">
              🏆 {winner} Wins!
            </h2>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={startGame}
          disabled={gameRunning}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg shadow-md disabled:opacity-50"
        >
          {gameRunning ? "Dealing..." : "Start Game"}
        </button>
        <button
          onClick={resetGame}
          className="bg-gray-300 hover:bg-gray-400 text-black font-bold px-6 py-2 rounded-lg shadow-md"
        >
          Reset
        </button>
      </div>

      {/* Message */}
      <p className="mt-4 text-lg text-yellow-200">{message}</p>
    </div>
  );
}

/* 🔥 Animated Card Component */
function AnimatedCard({ side, index, card }) {
  const isAndar = side === "ANDAR";

  return (
    <motion.div
      initial={{
        x: 0,
        y: 0,
        rotateY: 0,
        rotate: 0,
        opacity: 0,
        scale: 0.7,
      }}
      animate={{
        x: isAndar ? -220 : 220,
        y: isAndar ? -index * 4 : index * 4,
        rotateY: 180,
        rotate: isAndar ? -10 + Math.random() * 10 : 10 - Math.random() * 10,
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 18,
        delay: index * 0.15,
      }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 perspective-[1200px]"
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        className="relative w-20 h-28 rounded-lg shadow-lg"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center",
        }}
      >
        {/* Back of Card */}
        <motion.div
          className="absolute inset-0 bg-red-700 rounded-lg border-2 border-yellow-400 flex items-center justify-center text-lg font-bold text-yellow-200"
          style={{ backfaceVisibility: "hidden" }}
        >
          🎴
        </motion.div>

        {/* Front of Card */}
        <motion.div
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <Image
            src={`/cards/${card}.png`}
            alt={card}
            width={160}
            height={224}
            className="object-cover w-full h-full"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
