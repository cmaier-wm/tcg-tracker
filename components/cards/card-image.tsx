"use client";

import React, { useState } from "react";

type CardImageProps = {
  name: string;
  imageUrl?: string | null;
};

export function CardImage({ name, imageUrl }: CardImageProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!imageUrl || imageFailed) {
    return (
      <div className="image-box" aria-label={`${name} image unavailable`}>
        <div className="image-placeholder">
          Image unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="image-box">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={name} onError={() => setImageFailed(true)} />
    </div>
  );
}
