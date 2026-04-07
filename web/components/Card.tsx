import React from "react";

export default function Card({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      {title && <h2>{title}</h2>}
      {description && <p className="muted" style={{ marginBottom: "1rem" }}>{description}</p>}
      {children}
    </div>
  );
}
