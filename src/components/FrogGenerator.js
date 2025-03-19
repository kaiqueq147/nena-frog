import React, { useEffect, useRef, useState } from "react";
import "./FrogGenerator.css";

// Configuração dos pacotes e seus preços
const PACK_TYPES = {
  common: {
    name: "Pacote Comum",
    price: 50,
    description: "Chance baixa de obter sapos raros",
    color: "#A9A9A9",
    rarityBoost: 1,
  },
  uncommon: {
    name: "Pacote Incomum",
    price: 150,
    description: "Chance média de obter sapos raros",
    color: "#3CB371",
    rarityBoost: 1.5,
  },
  rare: {
    name: "Pacote Raro",
    price: 300,
    description: "Boa chance de obter sapos raros",
    color: "#4169E1",
    rarityBoost: 2,
  },
  epic: {
    name: "Pacote Épico",
    price: 600,
    description: "Alta chance de obter sapos épicos",
    color: "#9370DB",
    rarityBoost: 3,
  },
  legendary: {
    name: "Pacote Lendário",
    price: 1000,
    description: "Garantia de sapo épico ou lendário",
    color: "#FFD700",
    rarityBoost: 5,
  },
};

const FrogGenerator = ({
  onGenerateFrog,
  frogCount,
  showInitialPack,
  currentFrog,
  loading,
}) => {
  // Estado para controlar as moedas
  const [coins, setCoins] = useState(1000); // Começar com 1000 moedas
  const [selectedPack, setSelectedPack] = useState("common");
  const [showPackSelection, setShowPackSelection] = useState(false);

  // Carregar moedas do localStorage ao iniciar
  useEffect(() => {
    const storedCoins = localStorage.getItem("frogGeneratorCoins");
    if (storedCoins) {
      setCoins(parseInt(storedCoins));
    }
  }, []);

  // Função para ganhar moedas (pode ser chamada periodicamente ou por ações do usuário)
  const earnCoins = (amount) => {
    const newCoins = coins + amount;
    setCoins(newCoins);
    localStorage.setItem("frogGeneratorCoins", newCoins.toString());
  };

  // Função para comprar e gerar sapos
  const handleBuyAndGenerate = async (packType, count = 1) => {
    const pack = PACK_TYPES[packType];
    const totalCost = pack.price * count;

    // Verificar se tem moedas suficientes
    if (coins < totalCost) {
      alert(
        `Moedas insuficientes! Você precisa de ${totalCost} moedas para comprar ${count} ${pack.name}(s).`
      );
      return;
    }

    // Reduzir as moedas
    const newCoins = coins - totalCost;
    setCoins(newCoins);
    localStorage.setItem("frogGeneratorCoins", newCoins.toString());

    // Armazenar o boost de raridade para usar na geração
    localStorage.setItem("currentRarityBoost", pack.rarityBoost.toString());

    // Armazenar a garantia de raridade mínima (apenas para pacote lendário)
    if (packType === "legendary") {
      localStorage.setItem("guaranteedMinRarity", "Épico");
    } else {
      // Remover qualquer garantia anterior
      localStorage.removeItem("guaranteedMinRarity");
    }

    // Usar a função onGenerateFrog existente com a contagem de sapos
    await onGenerateFrog(count);

    // Após abrir pacote, esconder a seleção
    setShowPackSelection(false);
  };

  // Funções para mostrar/esconder a seleção de pacotes
  const openPackSelection = () => {
    setShowPackSelection(true);
  };

  const closePackSelection = () => {
    setShowPackSelection(false);
  };

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

  return (
    <div className="frog-generator">
      <div className="frog-container">
        <div className="initial-pack">
          <div
            className="pack"
            style={{ animation: "packShake 3s ease-in-out infinite" }}
          >
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
              <div className="pack-text">Clique no botão para abrir</div>
            </div>
          </div>
        </div>

        {currentFrog && (
          <div className="frog-display">
            <img
              src={currentFrog.imageUrl}
              alt="Sapo"
              className={`animal ${currentFrog.rarity.class}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/300x400?text=Sapo+não+encontrado";
              }}
            />
            <div
              className="rarity-text"
              style={{ backgroundColor: currentFrog.rarity.color }}
            >
              {currentFrog.rarity.name}
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading">Procurando sapo...</div>
          </div>
        )}
      </div>

      {/* Contador de moedas */}
      <div className="coins-display">
        <span className="coin-icon">🪙</span>
        <span className="coin-amount">{coins}</span>
      </div>

      {/* Botão principal para abrir seleção de pacotes */}
      <div className="button-container">
        <button
          className="generate-frog-btn"
          onClick={(e) => {
            addRippleEffect(e);
            openPackSelection();
          }}
          disabled={loading}
        >
          <span className="generate-frog-btn-text">
            {loading ? (
              <span>
                Procurando<span className="loading-dots"></span>
              </span>
            ) : (
              "Comprar Pacote"
            )}
          </span>
        </button>
      </div>

      {/* Seleção de pacotes */}
      {showPackSelection && (
        <div className="pack-selection-overlay">
          <div className="pack-selection-container">
            <h3 className="pack-selection-title">Escolha um Pacote</h3>

            <div className="pack-options">
              {Object.entries(PACK_TYPES).map(([type, pack]) => (
                <div
                  key={type}
                  className={`pack-option ${
                    selectedPack === type ? "selected" : ""
                  } ${coins < pack.price ? "disabled" : ""}`}
                  onClick={() => coins >= pack.price && setSelectedPack(type)}
                  style={{ borderColor: pack.color }}
                >
                  <h4 style={{ color: pack.color }}>{pack.name}</h4>
                  <p className="pack-description">{pack.description}</p>
                  <div className="pack-price">
                    <span className="coin-icon-small">🪙</span>
                    <span>{pack.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pack-quantity-selector">
              <button
                className="quantity-btn"
                onClick={() => handleBuyAndGenerate(selectedPack, 1)}
                disabled={coins < PACK_TYPES[selectedPack].price}
              >
                Comprar 1
              </button>
              <button
                className="quantity-btn"
                onClick={() => handleBuyAndGenerate(selectedPack, 3)}
                disabled={coins < PACK_TYPES[selectedPack].price * 3}
              >
                Comprar 3
              </button>
              <button
                className="quantity-btn"
                onClick={() => handleBuyAndGenerate(selectedPack, 5)}
                disabled={coins < PACK_TYPES[selectedPack].price * 5}
              >
                Comprar 5
              </button>
            </div>

            <button
              className="close-selection-btn"
              onClick={closePackSelection}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Botão para ganhar moedas (diariamente ou por assistir anúncios) */}
      <div className="earn-coins-container">
        <button className="earn-coins-btn daily" onClick={() => earnCoins(100)}>
          <span className="coin-icon-small">🪙</span> +100 Diárias
        </button>
        <button className="earn-coins-btn ad" onClick={() => earnCoins(50)}>
          <span className="coin-icon-small">🪙</span> +9999 Desbloquear o kaique
        </button>
      </div>

      <p id="frogCount" style={{ color: "white", marginTop: "10px" }}>
        Sapos encontrados: {frogCount}
      </p>
    </div>
  );
};

export default FrogGenerator;
