'use client'

import Image from 'next/image'

interface NexoraLogoProps {
  size?: number
  className?: string
  showText?: boolean
  textClassName?: string
}

export function NexoraLogo({
  size = 34,
  className = '',
  showText = false,
  textClassName = '',
}: NexoraLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative flex shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Image
          src="/nexora-logo.png"
          alt="Logo Nexora"
          width={size}
          height={size}
          className="size-full object-contain drop-shadow-[0_0_10px_rgba(57,120,246,0.5)]"
          priority
        />
      </div>

      {showText && (
        <span
          className={`text-[20px] font-black tracking-[-0.04em] text-[#101b33] dark:text-white ${textClassName}`}
        >
          Nexora
        </span>
      )}
    </div>
  )
}
