'use client';

import { useTheme } from './ThemeProvider';
import Image from 'next/image';

export default function NightSky() {
  const { theme } = useTheme();

  if (theme !== 'night') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Moon */}
      <div className="absolute top-20 right-20 w-48 h-48">
        <Image
          src="/moon/moon.png"
          alt="Moon in night sky"
          width={192}
          height={192}
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </div>
      
      {/* Stars - positioned above the hero section, well-spread out */}
      {/* Small stars (64px) - scaled down significantly */}
      <Image
        src="/stars/whimsical_stars_gold/star_5pt_gold_64.png"
        alt="Twinkling gold star"
        width={16}
        height={16}
        className="absolute top-24 left-1/6 animate-twinkle opacity-80 mix-blend-multiply"
        style={{ animationDelay: '0s' }}
      />
      <Image
        src="/stars/whimsical_stars_pink/star_sparkle_pink_64.png"
        alt="Twinkling pink star"
        width={14}
        height={14}
        className="absolute top-32 right-1/4 animate-twinkle opacity-90 mix-blend-multiply"
        style={{ animationDelay: '1.5s' }}
      />
      <Image
        src="/stars/whimsical_stars_blue/star_6pt_blue_64.png"
        alt="Twinkling blue star"
        width={15}
        height={15}
        className="absolute top-28 left-2/3 animate-twinkle opacity-85 mix-blend-multiply"
        style={{ animationDelay: '2.5s' }}
      />
      
      {/* Medium stars (128px) - scaled down significantly */}
      <Image
        src="/stars/whimsical_stars_gold/star_sparkle_gold_128.png"
        alt="Twinkling gold sparkle star"
        width={20}
        height={20}
        className="absolute top-20 right-1/6 animate-twinkle opacity-90 mix-blend-multiply"
        style={{ animationDelay: '0.8s' }}
      />
      <Image
        src="/stars/whimsical_stars_pink/star_6pt_pink_128.png"
        alt="Twinkling pink star"
        width={18}
        height={18}
        className="absolute top-36 left-1/4 animate-twinkle opacity-80 mix-blend-multiply"
        style={{ animationDelay: '1.2s' }}
      />
      <Image
        src="/stars/whimsical_stars_blue/star_5pt_blue_128.png"
        alt="Twinkling blue star"
        width={19}
        height={19}
        className="absolute top-30 right-2/3 animate-twinkle opacity-85 mix-blend-multiply"
        style={{ animationDelay: '2.8s' }}
      />
      
      {/* Large stars (256px) - scaled down significantly */}
      <Image
        src="/stars/whimsical_stars_gold/star_6pt_gold_256.png"
        alt="Large twinkling gold star"
        width={24}
        height={24}
        className="absolute top-26 left-1/2 animate-twinkle opacity-75 mix-blend-multiply"
        style={{ animationDelay: '1.8s' }}
      />
      <Image
        src="/stars/whimsical_stars_pink/star_sparkle_pink_256.png"
        alt="Large twinkling pink sparkle star"
        width={22}
        height={22}
        className="absolute top-34 right-1/2 animate-twinkle opacity-80 mix-blend-multiply"
        style={{ animationDelay: '0.5s' }}
      />
    </div>
  );
}
