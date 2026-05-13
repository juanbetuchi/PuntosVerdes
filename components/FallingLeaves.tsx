const leaves = [
  { left: '4%',  size: 16, dur: '9s',   delay: '0s',   rotate: 15  },
  { left: '13%', size: 12, dur: '11s',  delay: '2.3s', rotate: -20 },
  { left: '24%', size: 20, dur: '8s',   delay: '5.1s', rotate: 30  },
  { left: '36%', size: 14, dur: '10s',  delay: '1.2s', rotate: -10 },
  { left: '48%', size: 18, dur: '7.5s', delay: '7s',   rotate: 22  },
  { left: '59%', size: 12, dur: '12s',  delay: '3.4s', rotate: -28 },
  { left: '70%', size: 22, dur: '8.5s', delay: '0.8s', rotate: 18  },
  { left: '80%', size: 15, dur: '10.5s',delay: '4.6s', rotate: -15 },
  { left: '90%', size: 17, dur: '9.5s', delay: '6.2s', rotate: 35  },
  { left: '19%', size: 11, dur: '11.5s',delay: '8.5s', rotate: -8  },
  { left: '64%', size: 19, dur: '7s',   delay: '2.8s', rotate: 12  },
]

export default function FallingLeaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {leaves.map((l, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="#4caf50"
          className="absolute leaf-fall"
          style={{
            left: l.left,
            top: 0,
            width: l.size,
            height: l.size,
            '--lfd': l.dur,
            animationDelay: l.delay,
            transform: `rotate(${l.rotate}deg)`,
          } as React.CSSProperties}
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
        </svg>
      ))}
    </div>
  )
}
