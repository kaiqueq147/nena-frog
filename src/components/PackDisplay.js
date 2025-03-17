import React, { useState, useEffect, useRef } from "react";
import "./PackDisplay.css";

const PackDisplay = ({
  packData,
  currentPackIndex,
  totalPacks,
  onPackOpened,
  addFrogToCollection,
  getFixedRarityFromId,
  extractImageId,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const packContainerRef = useRef(null);
  const tearAudioRef = useRef(null);
  const rareAudioRef = useRef(null);

  useEffect(() => {
    // Reset state when new pack data is received
    setIsOpening(false);
    setIsRevealed(false);

    // Pré-carregar os elementos de áudio
    tearAudioRef.current = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-paper-rip-1376.mp3"
    );
    rareAudioRef.current = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-magical-coin-win-1936.mp3"
    );

    // Adicionar tratamento de erros para os elementos de áudio
    tearAudioRef.current.addEventListener("error", () => {
      console.log("Erro ao carregar áudio de rasgar");
    });

    rareAudioRef.current.addEventListener("error", () => {
      console.log("Erro ao carregar áudio raro");
    });

    // Pré-carregar os áudios
    tearAudioRef.current.load();
    rareAudioRef.current.load();

    return () => {
      // Limpar recursos quando o componente for desmontado
      if (tearAudioRef.current) {
        tearAudioRef.current.pause();
        tearAudioRef.current = null;
      }

      if (rareAudioRef.current) {
        rareAudioRef.current.pause();
        rareAudioRef.current = null;
      }
    };
  }, [packData]);

  const playTearSound = () => {
    if (tearAudioRef.current) {
      tearAudioRef.current.currentTime = 0;
      tearAudioRef.current.play().catch((e) => {
        console.log("Erro ao reproduzir áudio de rasgar:", e);
      });
    }
  };

  const playRareSound = () => {
    if (rareAudioRef.current) {
      rareAudioRef.current.currentTime = 0;
      rareAudioRef.current.play().catch((e) => {
        console.log("Erro ao reproduzir áudio raro:", e);
      });
    }
  };

  const createConfetti = (isRare) => {
    const colors = isRare
      ? ["#FFD700", "#FFC107", "#FF9800", "#FF5722", "#F44336"]
      : ["#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107"];

    const container = packContainerRef.current;
    if (!container) return;

    // Remove old confetti
    const oldConfetti = container.querySelectorAll(".confetti");
    oldConfetti.forEach((c) => c.remove());

    // Create new confetti
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";

      const x = Math.random() * window.innerWidth;
      const delay = Math.random() * 3;
      const duration = 2 + Math.random() * 2;

      confetti.style.left = `${x}px`;
      confetti.style.top = "-10px";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = `${5 + Math.random() * 10}px`;
      confetti.style.height = `${5 + Math.random() * 10}px`;
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
      confetti.style.opacity = "0";

      confetti.style.animation = `confettiFall ${duration}s ${delay}s ease-in forwards`;

      container.appendChild(confetti);
    }
  };

  const handlePackClick = () => {
    if (isOpening) return;

    setIsOpening(true);

    // Play tear sound
    playTearSound();

    // After tear animation completes, reveal the card
    setTimeout(() => {
      setIsRevealed(true);

      // Check if it's a rare frog
      const fixedRarity = getFixedRarityFromId(
        extractImageId(packData.imageUrl)
      );
      const isRare =
        fixedRarity.name === "Raro" ||
        fixedRarity.name === "Épico" ||
        fixedRarity.name === "Lendário";

      if (isRare) {
        setTimeout(() => {
          playRareSound();
          createConfetti(isRare);
        }, 500);
      }

      // Add frog to collection
      addFrogToCollection(packData.imageUrl, fixedRarity);

      // Close pack after animation
      setTimeout(() => {
        onPackOpened(packData.imageUrl, fixedRarity);
      }, 1500);
    }, 800);
  };

  return (
    <div className="pack-container" ref={packContainerRef}>
      {totalPacks > 1 && (
        <div className="pack-counter">
          Pacote {currentPackIndex + 1} de {totalPacks}
        </div>
      )}

      {!isOpening && (
        <div className="pack-instructions">Clique no pacote para abrir</div>
      )}

      <div className="pack" onClick={handlePackClick}>
        {!isOpening && (
          <div className="pack-front">
            <div className="pack-shine"></div>
            <img
              src="https://svg-files.pixelied.com/d75398af-665a-499e-ad17-11fea52c21aa/thumb-256px.png"
              alt="Logo"
              className="pack-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150?text=Logo";
              }}
            />
            <div className="pack-text">Pacote de Sapos</div>
          </div>
        )}

        {isOpening && (
          <div className="tear-effect">
            <div className={`tear-left ${isOpening ? "tear-open-left" : ""}`}>
              <div className="tear-content-left">
                <img
                  src="https://svg-files.pixelied.com/d75398af-665a-499e-ad17-11fea52c21aa/thumb-256px.png"
                  alt="Logo"
                  className="pack-logo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Logo";
                  }}
                />
              </div>
            </div>
            <div className={`tear-right ${isOpening ? "tear-open-right" : ""}`}>
              <div className="tear-content-right">
                <img
                  src="https://svg-files.pixelied.com/d75398af-665a-499e-ad17-11fea52c21aa/thumb-256px.png"
                  alt="Logo"
                  className="pack-logo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Logo";
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="pack-back">
          <div className={`pack-card ${isRevealed ? "card-reveal" : ""}`}>
            <img
              src={packData.imageUrl}
              alt="Sapo"
              className="pack-card-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/300x400?text=Sapo+não+encontrado";
              }}
            />
            <div
              className="pack-card-rarity"
              style={{ backgroundColor: packData.rarity.color }}
            >
              {packData.rarity.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackDisplay;
