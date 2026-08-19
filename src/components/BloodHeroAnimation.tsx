import React from "react";
import { motion } from "motion/react";

interface BloodHeroAnimationProps {
  lang?: "bn" | "en";
}

export default function BloodHeroAnimation({ lang = "bn" }: BloodHeroAnimationProps) {
  return (
    <div className="relative w-full max-w-lg aspect-square flex items-center justify-center select-none" id="seamless-blood-animation-hero">
      {/* SVG Canvas with 100% Vector Transparency and Zero Bounding Box */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full overflow-visible drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Blood Liquid Red Gradient */}
          <linearGradient id="bloodBagLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="60%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          {/* Bag Plastic Sheen Gradient */}
          <linearGradient id="plasticSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0.15" />
          </linearGradient>

          {/* Tube Liquid Gradient */}
          <linearGradient id="tubeBlood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B91C1C" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>

          {/* Heart Glow Radial */}
          <radialGradient id="heartAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>

          {/* Blood Drop Gradient */}
          <radialGradient id="dropGlow" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </radialGradient>
        </defs>

        {/* 1. Ambient Background Pulse Aura */}
        <motion.circle
          cx="250"
          cy="250"
          r="180"
          fill="url(#heartAura)"
          animate={{
            scale: [0.9, 1.15, 0.9],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 2. Hanging IV Stand & Top Ring Hook */}
        <g id="stand-top">
          {/* Top hanging rope / rod */}
          <line x1="250" y1="10" x2="250" y2="70" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="250" cy="15" r="7" fill="#64748B" />
          
          {/* IV Bag Hanging Eyelet */}
          <path
            d="M 230,70 Q 250,55 270,70 L 275,85 L 225,85 Z"
            fill="#E2E8F0"
            stroke="#94A3B8"
            strokeWidth="3"
          />
          <circle cx="250" cy="72" r="5" fill="#94A3B8" />
        </g>

        {/* 3. The Blood Bag (IV Transfusion Pack) */}
        <g id="blood-bag-group" transform="translate(180, 80)">
          {/* Outer Plastic Bag Boundary */}
          <rect
            x="0"
            y="5"
            width="140"
            height="180"
            rx="24"
            fill="#FFFFFF"
            fillOpacity="0.85"
            stroke="#CBD5E1"
            strokeWidth="3.5"
            className="backdrop-blur-xs"
          />

          {/* Liquid Blood Container with dynamic undulating level */}
          <g clipPath="url(#bagClip)">
            <clipPath id="bagClip">
              <rect x="5" y="10" width="130" height="170" rx="20" />
            </clipPath>

            {/* Pulsing Liquid Fill */}
            <motion.rect
              x="5"
              y="35"
              width="130"
              height="150"
              fill="url(#bloodBagLiquid)"
              animate={{
                y: [38, 32, 38],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Undulating liquid wave at the top of the fluid */}
            <motion.path
              d="M 5,40 Q 35,32 70,40 T 135,40 L 135,180 L 5,180 Z"
              fill="url(#bloodBagLiquid)"
              animate={{
                d: [
                  "M 5,40 Q 35,32 70,40 T 135,40 L 135,180 L 5,180 Z",
                  "M 5,36 Q 35,44 70,36 T 135,36 L 135,180 L 5,180 Z",
                  "M 5,40 Q 35,32 70,40 T 135,40 L 135,180 L 5,180 Z",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Translucent Surface Highlight Sheen */}
            <path
              d="M 10,15 L 45,15 L 20,165 L 10,165 Z"
              fill="url(#plasticSheen)"
            />

            {/* Liquid Bubble Particles */}
            <motion.circle
              cx="40"
              cy="120"
              r="4"
              fill="#FFFFFF"
              fillOpacity="0.6"
              animate={{
                cy: [140, 50],
                opacity: [0, 0.8, 0],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.circle
              cx="95"
              cy="130"
              r="3"
              fill="#FFFFFF"
              fillOpacity="0.5"
              animate={{
                cy: [150, 60],
                opacity: [0, 0.7, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.8, ease: "easeOut" }}
            />
            <motion.circle
              cx="70"
              cy="110"
              r="2.5"
              fill="#FFFFFF"
              fillOpacity="0.7"
              animate={{
                cy: [130, 45],
                opacity: [0, 0.9, 0],
              }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 1.4, ease: "easeOut" }}
            />
          </g>

          {/* Measurement Markings (ml ticks) */}
          <line x1="120" y1="50" x2="130" y2="50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <line x1="123" y1="70" x2="130" y2="70" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="120" y1="90" x2="130" y2="90" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <line x1="123" y1="110" x2="130" y2="110" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="120" y1="130" x2="130" y2="130" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

          {/* Central Medical Label Badge */}
          <rect
            x="25"
            y="65"
            width="90"
            height="70"
            rx="12"
            fill="#FFFFFF"
            fillOpacity="0.95"
            stroke="#F1F5F9"
            strokeWidth="1.5"
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
          />

          {/* Label Red Cross / Heart Sign */}
          <path
            d="M 70,76 C 70,76 60,68 52,75 C 44,82 50,94 70,106 C 90,94 96,82 88,75 C 80,68 70,76 70,76 Z"
            fill="#DC2626"
          />

          <text
            x="70"
            y="120"
            textAnchor="middle"
            fill="#1E293B"
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="1"
          >
            {lang === "bn" ? "জীবন দান" : "GIVE LIFE"}
          </text>
          <text
            x="70"
            y="131"
            textAnchor="middle"
            fill="#DC2626"
            fontSize="8.5"
            fontWeight="800"
            fontFamily="sans-serif"
          >
            450 ml • SAFE
          </text>

          {/* Bag Bottom Nozzles */}
          <rect x="40" y="183" width="16" height="12" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          <rect x="84" y="183" width="16" height="12" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
        </g>

        {/* 4. Heart-Shaped Flowing Medical Transfusion Tube */}
        <g id="transfusion-tube">
          {/* Outer Translucent Tube Shadow/Body */}
          <path
            d="M 232,274 C 232,340 140,360 140,410 C 140,460 210,470 250,420 C 290,470 360,460 360,410 C 360,360 268,340 268,274"
            fill="none"
            stroke="#FEE2E2"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 232,274 C 232,340 140,360 140,410 C 140,460 210,470 250,420 C 290,470 360,460 360,410 C 360,360 268,340 268,274"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />

          {/* Flowing Animated Red Blood Stream inside Tube */}
          <motion.path
            d="M 232,274 C 232,340 140,360 140,410 C 140,460 210,470 250,420 C 290,470 360,460 360,410 C 360,360 268,340 268,274"
            fill="none"
            stroke="url(#tubeBlood)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="20 15"
            animate={{
              strokeDashoffset: [140, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </g>

        {/* 5. Beating Biological Lifesaver Heart at Tube Nexus */}
        <motion.g
          id="beating-heart-center"
          transform="translate(250, 415)"
          animate={{
            scale: [1, 1.18, 1, 1.25, 1],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Heart Pulsing Glow Shadow */}
          <path
            d="M 0,-15 C 0,-15 -28,-40 -50,-20 C -72,0 -50,35 0,65 C 50,35 72,0 50,-20 C 28,-40 0,-15 0,-15 Z"
            fill="url(#dropGlow)"
            filter="drop-shadow(0 8px 18px rgba(220, 38, 38, 0.45))"
          />

          {/* Heart Interior Shine Curve */}
          <path
            d="M -30,-12 C -42,0 -32,20 -5,38"
            fill="none"
            stroke="#FFA8A8"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Heart Rate / ECG Vital Graph inside Heart */}
          <motion.path
            d="M -24,8 L -14,8 L -8,0 L -2,18 L 4,-8 L 10,14 L 16,8 L 24,8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{
              pathLength: [0, 1, 1, 0],
              opacity: [0.3, 1, 1, 0.3],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.g>

        {/* 6. Floating Droplet Elements with Natural Drips */}
        <motion.g
          animate={{
            y: [0, 15, 0],
            rotate: [-4, 4, -4],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Drop Left */}
          <g transform="translate(85, 230)">
            <path
              d="M 18,0 C 18,0 0,22 0,34 C 0,46 10,54 20,54 C 30,54 40,46 40,34 C 40,22 22,0 22,0 Z"
              fill="url(#dropGlow)"
              filter="drop-shadow(0 6px 12px rgba(220,38,38,0.3))"
            />
            <circle cx="15" cy="30" r="3.5" fill="#FFFFFF" fillOpacity="0.75" />
            <text x="20" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="sans-serif">
              O+
            </text>
          </g>

          {/* Drop Right */}
          <g transform="translate(370, 210)">
            <path
              d="M 18,0 C 18,0 0,22 0,34 C 0,46 10,54 20,54 C 30,54 40,46 40,34 C 40,22 22,0 22,0 Z"
              fill="url(#dropGlow)"
              filter="drop-shadow(0 6px 12px rgba(220,38,38,0.3))"
            />
            <circle cx="15" cy="30" r="3.5" fill="#FFFFFF" fillOpacity="0.75" />
            <text x="20" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">
              AB+
            </text>
          </g>
        </motion.g>

        {/* 7. Sparkle and Star Accents */}
        <motion.g
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Sparkle 1 */}
          <path
            d="M 370,110 Q 370,120 380,120 Q 370,120 370,130 Q 370,120 360,120 Q 370,120 370,110 Z"
            fill="#F59E0B"
          />
          {/* Sparkle 2 */}
          <path
            d="M 115,350 Q 115,360 125,360 Q 115,360 115,370 Q 115,360 105,360 Q 115,360 115,350 Z"
            fill="#EF4444"
          />
        </motion.g>
      </svg>
    </div>
  );
}
