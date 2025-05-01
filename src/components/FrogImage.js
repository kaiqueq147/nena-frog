import React, { useState } from "react";

// Lista de imagens de sapo de fallback (emoji)
const FALLBACK_EMOJIS = ["🐸", "🐊", "🦎", "🐢", "🦚", "🐍"];

const FrogImage = ({ src, alt, className, style, onClick }) => {
  const [error, setError] = useState(false);
  const [fallbackEmoji] = useState(() => {
    const randomIndex = Math.floor(Math.random() * FALLBACK_EMOJIS.length);
    return FALLBACK_EMOJIS[randomIndex];
  });

  if (error) {
    // Renderizar um fallback quando a imagem não carregar
    return (
      <div
        className={`frog-fallback ${className || ""}`}
        style={{
          backgroundColor: "#1c1c1c",
          color: "#4CAF50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "3rem",
          width: "100%",
          height: "100%",
          borderRadius: "10px",
          ...style,
        }}
        onClick={onClick}
      >
        <span role="img" aria-label="Sapo emoji">
          {fallbackEmoji}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Sapo"}
      className={className}
      style={style}
      onClick={onClick}
      onError={() => setError(true)}
    />
  );
};

export default FrogImage;
