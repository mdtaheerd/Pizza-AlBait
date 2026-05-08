'use client'

import { motion } from 'framer-motion'

export function AnimatedTeamIllustration() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-2xl overflow-hidden">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background shapes */}
        <motion.circle
          cx="320"
          cy="60"
          r="40"
          fill="#fef2f2"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="60"
          cy="240"
          r="30"
          fill="#fff7ed"
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Desk/Table */}
        <rect x="60" y="200" width="280" height="8" rx="4" fill="#d97706" />
        <rect x="80" y="208" width="8" height="60" fill="#b45309" />
        <rect x="312" y="208" width="8" height="60" fill="#b45309" />

        {/* Left Person */}
        <motion.g
          initial={{ y: 10 }}
          animate={{ y: [10, 0, 10] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Body */}
          <ellipse cx="120" cy="180" rx="25" ry="30" fill="#dc2626" />
          {/* Head */}
          <circle cx="120" cy="135" r="22" fill="#fcd9b6" />
          {/* Hair */}
          <ellipse cx="120" cy="120" rx="20" ry="12" fill="#1f2937" />
          {/* Eyes */}
          <circle cx="113" cy="135" r="2" fill="#1f2937" />
          <circle cx="127" cy="135" r="2" fill="#1f2937" />
          {/* Smile */}
          <path d="M112 143 Q120 150 128 143" fill="none" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
          {/* Laptop */}
          <rect x="95" y="175" width="50" height="30" rx="3" fill="#374151" />
          <rect x="100" y="180" width="40" height="20" rx="2" fill="#60a5fa" />
          <motion.rect
            x="105"
            y="185"
            width="30"
            height="3"
            fill="#fff"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.rect
            x="105"
            y="191"
            width="20"
            height="3"
            fill="#fff"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </motion.g>

        {/* Center Person (standing) */}
        <motion.g
          initial={{ y: 5 }}
          animate={{ y: [5, -5, 5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          {/* Body */}
          <ellipse cx="200" cy="165" rx="28" ry="40" fill="#ea580c" />
          {/* Head */}
          <circle cx="200" cy="105" r="25" fill="#fcd9b6" />
          {/* Hair */}
          <ellipse cx="200" cy="88" rx="22" ry="14" fill="#92400e" />
          {/* Eyes */}
          <circle cx="192" cy="105" r="2.5" fill="#1f2937" />
          <circle cx="208" cy="105" r="2.5" fill="#1f2937" />
          {/* Smile */}
          <path d="M190 115 Q200 123 210 115" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          {/* Arms presenting */}
          <motion.path
            d="M172 145 Q155 140 150 155"
            fill="none"
            stroke="#fcd9b6"
            strokeWidth="8"
            strokeLinecap="round"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: "172px 145px" }}
          />
          <motion.path
            d="M228 145 Q245 140 250 155"
            fill="none"
            stroke="#fcd9b6"
            strokeWidth="8"
            strokeLinecap="round"
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: "228px 145px" }}
          />
          {/* Clipboard */}
          <rect x="245" y="145" width="25" height="35" rx="3" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="2" />
          <rect x="250" y="155" width="15" height="2" fill="#dc2626" />
          <rect x="250" y="160" width="15" height="2" fill="#9ca3af" />
          <rect x="250" y="165" width="10" height="2" fill="#9ca3af" />
        </motion.g>

        {/* Right Person */}
        <motion.g
          initial={{ y: 8 }}
          animate={{ y: [8, -2, 8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          {/* Body */}
          <ellipse cx="280" cy="180" rx="25" ry="30" fill="#0ea5e9" />
          {/* Head */}
          <circle cx="280" cy="135" r="22" fill="#fcd9b6" />
          {/* Hair */}
          <ellipse cx="280" cy="120" rx="18" ry="10" fill="#1f2937" />
          {/* Glasses */}
          <circle cx="273" cy="133" r="6" fill="none" stroke="#1f2937" strokeWidth="1.5" />
          <circle cx="287" cy="133" r="6" fill="none" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="279" y1="133" x2="281" y2="133" stroke="#1f2937" strokeWidth="1.5" />
          {/* Eyes */}
          <circle cx="273" cy="133" r="1.5" fill="#1f2937" />
          <circle cx="287" cy="133" r="1.5" fill="#1f2937" />
          {/* Smile */}
          <path d="M272 143 Q280 149 288 143" fill="none" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
          {/* Document */}
          <motion.g
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: "280px 185px" }}
          >
            <rect x="260" y="175" width="40" height="30" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="265" y="182" width="20" height="2" fill="#dc2626" />
            <rect x="265" y="187" width="28" height="2" fill="#d1d5db" />
            <rect x="265" y="192" width="24" height="2" fill="#d1d5db" />
          </motion.g>
        </motion.g>

        {/* Floating elements */}
        <motion.g
          initial={{ y: 0, opacity: 0.8 }}
          animate={{ y: [-5, 5, -5], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Document icon */}
          <rect x="45" y="80" width="24" height="30" rx="3" fill="white" stroke="#dc2626" strokeWidth="2" />
          <rect x="50" y="88" width="14" height="2" fill="#dc2626" />
          <rect x="50" y="93" width="14" height="2" fill="#e5e7eb" />
          <rect x="50" y="98" width="10" height="2" fill="#e5e7eb" />
        </motion.g>

        <motion.g
          initial={{ y: 0, opacity: 0.8 }}
          animate={{ y: [5, -5, 5], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          {/* Checkmark icon */}
          <circle cx="350" cy="140" r="15" fill="#dcfce7" />
          <path d="M342 140 L348 146 L358 134" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>

        <motion.g
          initial={{ y: 0, opacity: 0.8 }}
          animate={{ y: [-3, 3, -3], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          {/* Star icon */}
          <path
            d="M70 40 L73 48 L82 48 L75 54 L78 62 L70 57 L62 62 L65 54 L58 48 L67 48 Z"
            fill="#fbbf24"
          />
        </motion.g>

        {/* Connection lines */}
        <motion.path
          d="M145 150 Q200 120 255 150"
          fill="none"
          stroke="#dc2626"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  )
}
