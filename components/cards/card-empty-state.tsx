import React from "react";

type CardEmptyStateProps = {
  title: string;
  body: string;
};

export function CardEmptyState({ title, body }: CardEmptyStateProps) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p className="muted">{body}</p>
    </div>
  );
}
