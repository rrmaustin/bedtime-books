'use client';

import Image from 'next/image';
import { getOwlPosition, getButterflyPosition } from '@/lib/positions';

export default function InteractiveTree() {
  const owlPosition = getOwlPosition();
  const butterflyPosition = getButterflyPosition();
  
  return (
    <div className="fixed left-0 bottom-0 z-0">
      <div className="relative w-[60vw] h-screen">
        {/* Tree Background */}
        <Image
          src="/trees/tree-with-hole-2.png"
          alt="Whimsical tree with hole (alternative)"
          width={1024}
          height={1536}
          className="w-full h-full object-contain object-left-bottom drop-shadow-lg"
          priority
        />
        
        {/* Owl Head Overlay */}
        <div 
          className="absolute drop-shadow-md"
          style={{
            top: owlPosition.top,
            left: owlPosition.left,
            transform: owlPosition.transform,
            zIndex: owlPosition.zIndex
          }}
        >
          <Image
            src="/animals/owl-head-1.png"
            alt="Owl head peeking from tree hole"
            width={owlPosition.width}
            height={owlPosition.height}
          />
        </div>
        
        {/* Butterfly Background Element */}
        <div 
          className="absolute drop-shadow-sm opacity-80"
          style={{
            top: butterflyPosition.top,
            right: butterflyPosition.right,
            marginRight: butterflyPosition.marginRight,
            zIndex: butterflyPosition.zIndex,
            transform: `rotate(${butterflyPosition.rotation})`
          }}
        >
          <Image
            src="/animals/butterfly_1.png"
            alt="Whimsical butterfly"
            width={butterflyPosition.width}
            height={butterflyPosition.height}
          />
        </div>
      </div>
    </div>
  );
}
