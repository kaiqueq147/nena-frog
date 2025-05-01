import React from "react";

const FrogImageFallback = ({ rarityColor }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#222",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: rarityColor || "#FFF",
        fontSize: "2rem",
        fontWeight: "bold",
        textAlign: "center",
        padding: "1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          fontSize: "6rem",
          opacity: 0.2,
          transform: "rotate(-30deg)",
          pointerEvents: "none",
        }}
      >
        🐸
      </div>
      <div>Sapo Figurinha</div>
    </div>
  );
};

export default FrogImageFallback;
