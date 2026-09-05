/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
}

export default function UserAvatar({ src, name, className = "w-10 h-10 rounded-full" }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const cleanSrc = src && src.trim() !== '' ? src : null;

  if (imageError || !cleanSrc) {
    return (
      <div 
        className={`${className} bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0 select-none`}
        title={name || 'User'}
        style={{ aspectRatio: '1/1' }}
      >
        <User className="w-1/2 h-1/2 text-emerald-600 stroke-[2.5]" />
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={name ? `${name} - REWARDYN Player Profile Avatar` : 'REWARDYN Gamer Avatar'}
      loading="lazy"
      decoding="async"
      onError={() => setImageError(true)}
      referrerPolicy="no-referrer"
      className={`${className} object-cover shrink-0`}
      style={{ aspectRatio: '1/1' }}
    />
  );
}
