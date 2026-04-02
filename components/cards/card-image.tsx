import React from "react";

type CardImageProps = {
  name: string;
  imageUrl?: string | null;
};

export function CardImage({ name, imageUrl }: CardImageProps) {
  if (!imageUrl) {
    return (
      <div className="image-box" aria-label={`${name} image unavailable`}>
        <div className="empty-state" style={{ height: "100%" }}>
          Image unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="image-box">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={name} />
    </div>
  );
}
