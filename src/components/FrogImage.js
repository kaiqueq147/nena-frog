import React, { useState, useEffect } from "react";

// Lista de imagens de sapo de fallback (emoji)
const FALLBACK_EMOJIS = ["🐸", "🐊", "🦎", "🐢", "🦚", "🐍"];

const FrogImage = ({ src, alt, className, style, onClick }) => {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const [fallbackEmoji] = useState(() => {
    const randomIndex = Math.floor(Math.random() * FALLBACK_EMOJIS.length);
    return FALLBACK_EMOJIS[randomIndex];
  });

  // Reset error state when src changes
  useEffect(() => {
    setError(false);
    setImgSrc(src);
  }, [src]);

  // Pre-validate image URL
  useEffect(() => {
    if (!imgSrc) {
      setError(true);
      return;
    }

    // If it's a relative URL and not starting with data:, convert to absolute
    if (
      !imgSrc.startsWith("http") &&
      !imgSrc.startsWith("data:") &&
      !imgSrc.startsWith("/")
    ) {
      try {
        const absoluteUrl = new URL(imgSrc, window.location.origin).href;
        setImgSrc(absoluteUrl);
      } catch (e) {
        console.error("Failed to convert URL to absolute:", e);
        setError(true);
      }
    }
  }, [imgSrc]);

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
      src={imgSrc}
      alt={alt || "Sapo"}
      className={className}
      style={style}
      onClick={onClick}
      onError={() => setError(true)}
      loading="lazy" // Add lazy loading for better performance
    />
  );
};

export default FrogImage;
