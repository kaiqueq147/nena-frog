import React, { useState } from "react";
import "./MultiPackGrid.css";

const MultiPackGrid = ({
  gridPacks,
  onClose,
  addFrogToCollection,
  getFixedRarityFromId,
  extractImageId,
  playTearSound,
  playRareSound,
}) => {
  const [flippedPacks, setFlippedPacks] = useState([]);
  const [collectedPacks, setCollectedPacks] = useState([]);

  // Função para adicionar efeito de ondulação ao clicar
  const addRippleEffect = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = "ripple";

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 800);
  };

  const handleFlipPack = (index) => {
    if (flippedPacks.includes(index)) return;

    // Play tear sound
    if (playTearSound) {
      playTearSound();
    }

    // Get fixed rarity for the pack
    const pack = gridPacks[index];
    const fixedRarity = getFixedRarityFromId(extractImageId(pack.imageUrl));

    // Adicionar classe de animação baseada na raridade
    const packElement = document.querySelectorAll(".mini-pack")[index];
    let rarityClass = "";

    switch (fixedRarity.name) {
      case "Lendário":
        rarityClass = "reveal-legendary";
        createLegendaryEffect(packElement);
        break;
      case "Épico":
        rarityClass = "reveal-epic";
        createEpicEffect(packElement);
        break;
      case "Raro":
        rarityClass = "reveal-rare";
        createRareEffect(packElement);
        break;
      case "Incomum":
        rarityClass = "reveal-uncommon";
        createUncommonEffect(packElement);
        break;
      default:
        rarityClass = "reveal-common";
        createCommonEffect(packElement);
    }

    packElement.classList.add("reveal-animation", rarityClass);

    // Remover classes de animação após a conclusão
    setTimeout(() => {
      packElement.classList.remove("reveal-animation", rarityClass);
    }, 1500);

    setFlippedPacks((prev) => [...prev, index]);

    // Check if it's a rare frog
    const isRare =
      fixedRarity.name === "Raro" ||
      fixedRarity.name === "Épico" ||
      fixedRarity.name === "Lendário";
    if (isRare) {
      setTimeout(() => {
        if (playRareSound) {
          playRareSound();
        }
      }, 500);
    }

    // Add to collection
    addFrogToCollection(pack.imageUrl, fixedRarity);
  };

  // Funções para criar efeitos visuais baseados na raridade
  const createLegendaryEffect = (element) => {
    // Efeito de explosão dourada
    const explosion = document.createElement("div");
    explosion.className = "legendary-explosion";
    element.appendChild(explosion);

    // Adicionar partículas douradas
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const particle = document.createElement("div");
        particle.className = "common-dust";
        particle.style.backgroundColor = "rgba(255, 215, 0, 0.8)";
        particle.style.width = `${Math.random() * 8 + 4}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.setProperty(
          "--dust-x",
          `${(Math.random() - 0.5) * 200}px`
        );
        particle.style.setProperty(
          "--dust-y",
          `${(Math.random() - 0.5) * 200}px`
        );
        particle.style.setProperty(
          "--dust-rotate",
          `${Math.random() * 360}deg`
        );
        element.appendChild(particle);

        setTimeout(() => {
          particle.remove();
        }, 1500);
      }, i * 50);
    }

    setTimeout(() => {
      explosion.remove();
    }, 1000);
  };

  const createEpicEffect = (element) => {
    // Efeito de ondas roxas
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const wave = document.createElement("div");
        wave.className = "epic-wave";
        element.appendChild(wave);

        setTimeout(() => {
          wave.remove();
        }, 1500);
      }, i * 300);
    }
  };

  const createRareEffect = (element) => {
    // Efeito de brilho azul
    const glow = document.createElement("div");
    glow.className = "rare-glow";
    element.appendChild(glow);

    setTimeout(() => {
      glow.remove();
    }, 1500);
  };

  const createUncommonEffect = (element) => {
    // Efeito de folhas verdes caindo
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const leaf = document.createElement("div");
        leaf.className = "uncommon-leaf";
        leaf.style.left = `${Math.random() * 100}%`;
        leaf.style.setProperty("--leaf-x", `${(Math.random() - 0.5) * 100}px`);
        leaf.style.setProperty("--leaf-rotate", `${Math.random() * 360}deg`);
        element.appendChild(leaf);

        setTimeout(() => {
          leaf.remove();
        }, 2000);
      }, i * 100);
    }
  };

  const createCommonEffect = (element) => {
    // Efeito de poeira cinza
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const dust = document.createElement("div");
        dust.className = "common-dust";
        dust.style.left = `${Math.random() * 100}%`;
        dust.style.top = `${Math.random() * 100}%`;
        dust.style.setProperty("--dust-x", `${(Math.random() - 0.5) * 100}px`);
        dust.style.setProperty("--dust-y", `${(Math.random() - 0.5) * 100}px`);
        dust.style.setProperty("--dust-rotate", `${Math.random() * 360}deg`);
        element.appendChild(dust);

        setTimeout(() => {
          dust.remove();
        }, 1500);
      }, i * 50);
    }
  };

  const handleFlipAll = (e) => {
    // Adicionar efeito de ondulação
    addRippleEffect(e);

    // Play tear sound
    if (playTearSound) {
      playTearSound();
    }

    // Get all unflipped packs
    const unflippedIndices = gridPacks
      .map((_, index) => index)
      .filter((index) => !flippedPacks.includes(index));

    // Flip packs with delay
    unflippedIndices.forEach((index, i) => {
      setTimeout(() => {
        setFlippedPacks((prev) => [...prev, index]);

        // Get fixed rarity for the pack
        const pack = gridPacks[index];
        const fixedRarity = getFixedRarityFromId(extractImageId(pack.imageUrl));

        // Check if it's a rare frog and it's the first one
        const isRare =
          fixedRarity.name === "Raro" ||
          fixedRarity.name === "Épico" ||
          fixedRarity.name === "Lendário";
        if (isRare && i === 0) {
          setTimeout(() => {
            if (playRareSound) {
              playRareSound();
            }
          }, 500);
        }

        // Add to collection
        addFrogToCollection(pack.imageUrl, fixedRarity);
      }, i * 200);
    });
  };

  const handleCollectAll = (e) => {
    // Adicionar efeito de ondulação
    addRippleEffect(e);

    // Add all packs to collection
    gridPacks.forEach((pack, index) => {
      if (!collectedPacks.includes(index)) {
        const fixedRarity = getFixedRarityFromId(extractImageId(pack.imageUrl));
        addFrogToCollection(pack.imageUrl, fixedRarity);
      }
    });

    setCollectedPacks(gridPacks.map((_, index) => index));
    onClose();
  };

  return (
    <div className="multi-pack-grid">
      <div className="grid-controls">
        <button id="flip-all-btn" onClick={handleFlipAll}>
          Revelar Todos
        </button>
        <button id="collect-all-btn" onClick={handleCollectAll}>
          Coletar Todos
        </button>
      </div>
      <div className="grid-container">
        {gridPacks.map((pack, index) => {
          // Obter a raridade do sapo
          const fixedRarity = getFixedRarityFromId(
            extractImageId(pack.imageUrl)
          );

          return (
            <div
              key={index}
              className={`mini-pack ${
                flippedPacks.includes(index) ? "mini-pack-flipped" : ""
              }`}
              onClick={() => handleFlipPack(index)}
            >
              <div className="mini-pack-front">
                <div className="mini-pack-shine"></div>
                <img
                  src="https://svg-files.pixelied.com/d75398af-665a-499e-ad17-11fea52c21aa/thumb-256px.png"
                  alt="Logo"
                  className="mini-pack-logo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Logo";
                  }}
                />
                <div className="mini-pack-text">Pacote de Sapos</div>
              </div>
              <div className="mini-pack-back" data-rarity={fixedRarity.name}>
                <div className="mini-pack-card">
                  <img
                    src={pack.imageUrl}
                    alt="Sapo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/300x400?text=Sapo+não+encontrado";
                    }}
                  />
                  <div
                    className="mini-pack-rarity"
                    style={{
                      backgroundColor: fixedRarity.color,
                    }}
                  >
                    {fixedRarity.name}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiPackGrid;
