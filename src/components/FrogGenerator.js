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

// Criar um objeto global para funções de áudio
window.frogSoundSystem = {
  playRaritySound: null, // Será definido posteriormente
  playPackOpenSound: null,
  playCoinSound: null,
};

const FrogGenerator = ({
  onGenerateFrog,
  frogCount,
  showInitialPack,
  currentFrog,
  loading: externalLoading, // Renomeado para evitar conflito
}) => {
  // Estado para controlar as moedas
  const [coins, setCoins] = useState(1000); // Começar com 1000 moedas
  const [selectedPack, setSelectedPack] = useState("common");
  const [showPackSelection, setShowPackSelection] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Novo estado para controlar loading do botão

  // Estado para controlar o limite diário
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [resetTime, setResetTime] = useState("");
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [showLimitMessage, setShowLimitMessage] = useState(false);

  // Carregar moedas e informações do limite diário do localStorage ao iniciar
  useEffect(() => {
    const storedCoins = localStorage.getItem("frogGeneratorCoins");
    if (storedCoins) {
      setCoins(parseInt(storedCoins));
    }

    // Carregar ganhos do dia atual
    loadDailyEarnings();

    // Verificar e atualizar o horário de reset
    updateResetTime();

    // Configurar timer para verificar o reset a cada minuto
    const intervalId = setInterval(() => {
      checkAndResetDaily();
      updateResetTime();
    }, 60000); // a cada minuto

    // Chamar uma vez para inicializar
    checkAndResetDaily();

    // Tocar som de boas-vindas quando o componente montar (som de sapo)
    setTimeout(() => {
      playSound("welcome-audio", 0.3);
    }, 1000);

    // Pré-carregar todos os sons para evitar atrasos
    preloadAllSounds();

    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, []);

  // Função para carregar os ganhos diários do localStorage
  const loadDailyEarnings = () => {
    try {
      const storedData = localStorage.getItem("frogDailyEarnings");
      if (storedData) {
        const data = JSON.parse(storedData);
        const today = new Date().toLocaleDateString();

        // Se o dia armazenado for hoje, use os ganhos armazenados
        if (data.date === today) {
          setTodayEarnings(data.amount);
          setIsLimitReached(data.amount >= 3000);
        } else {
          // Se for um dia diferente, zerar os ganhos
          setTodayEarnings(0);
          setIsLimitReached(false);
          saveDailyEarnings(0);
        }
      } else {
        // Se não houver dados, inicializar
        setTodayEarnings(0);
        setIsLimitReached(false);
        saveDailyEarnings(0);
      }
    } catch (error) {
      console.error("Erro ao carregar ganhos diários:", error);
      setTodayEarnings(0);
      setIsLimitReached(false);
    }
  };

  // Função para salvar os ganhos diários no localStorage
  const saveDailyEarnings = (amount) => {
    try {
      const today = new Date().toLocaleDateString();
      localStorage.setItem(
        "frogDailyEarnings",
        JSON.stringify({
          date: today,
          amount: amount,
        })
      );
    } catch (error) {
      console.error("Erro ao salvar ganhos diários:", error);
    }
  };

  // Função para verificar e resetar o limite diário
  const checkAndResetDaily = () => {
    const now = new Date();
    const resetHour = 21; // 21:00 horas

    // Verificar se já passou do horário de reset (21:00)
    if (now.getHours() >= resetHour) {
      // Obter data armazenada no localStorage
      const storedData = localStorage.getItem("frogDailyEarnings");
      if (storedData) {
        const data = JSON.parse(storedData);
        const storedDate = new Date(data.date);

        // Criar data de hoje às 21:00
        const todayReset = new Date();
        todayReset.setHours(resetHour, 0, 0, 0);

        // Se a data armazenada for anterior ao horário de reset de hoje, resetar
        if (storedDate < todayReset) {
          setTodayEarnings(0);
          setIsLimitReached(false);
          saveDailyEarnings(0);
          console.log("Limite diário resetado às 21:00");
        }
      }
    }
  };

  // Função para atualizar o tempo até o próximo reset
  const updateResetTime = () => {
    const now = new Date();
    let nextReset = new Date();
    nextReset.setHours(21, 0, 0, 0); // 21:00 horas

    // Se já passou das 21:00, o próximo reset é amanhã
    if (now >= nextReset) {
      nextReset.setDate(nextReset.getDate() + 1);
    }

    // Calcular tempo restante
    const diffMs = nextReset - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    setResetTime(`${diffHrs}h ${diffMins}m`);
  };

  // Função para pré-carregar todos os sons
  const preloadAllSounds = () => {
    const soundIds = [
      "welcome-audio",
      "coin-sound",
      "pack-open-sound",
      "common-audio",
      "uncommon-audio",
      "rare-audio",
      "epic-audio",
      "legendary-audio",
    ];

    soundIds.forEach((id) => {
      const audio = document.getElementById(id);
      if (audio) {
        audio.load();
      }
    });
  };

  // Função para tocar som
  const playSound = (id, volume = 0.5) => {
    try {
      // Pausar todos os sons primeiro (opcional - você pode querer remover isso para MultiPackGrid)
      const allAudios = document.querySelectorAll("audio");
      allAudios.forEach((audio) => {
        if (audio.id !== id) {
          // Não interromper o som que queremos tocar
          audio.pause();
          audio.currentTime = 0;
        }
      });

      const audio = document.getElementById(id);
      if (audio) {
        // Verificar se o áudio já está tocando
        if (!audio.paused) {
          // Clonar o elemento de áudio para permitir reprodução simultânea
          const clone = audio.cloneNode(true);
          clone.volume = volume;
          clone
            .play()
            .catch((e) => console.error("Erro ao reproduzir som:", e));

          // Remover o clone após a reprodução
          clone.onended = () => {
            if (clone.parentNode) {
              clone.parentNode.removeChild(clone);
            }
          };

          // Adicionar o clone ao DOM temporariamente
          document.body.appendChild(clone);
        } else {
          audio.volume = volume;
          audio
            .play()
            .catch((e) => console.error("Erro ao reproduzir som:", e));
        }
      }
    } catch (error) {
      console.error("Erro ao tocar som:", error);
    }
  };

  // Função para tocar som baseado na raridade
  const playRaritySound = (rarityName) => {
    switch (rarityName) {
      case "Lendário":
        playSound("legendary-audio", 0.6);
        break;
      case "Épico":
        playSound("epic-audio", 0.5);
        break;
      case "Raro":
        playSound("rare-audio", 0.5);
        break;
      case "Incomum":
        playSound("uncommon-audio", 0.4);
        break;
      default:
        playSound("common-audio", 0.3);
    }
  };

  // Exportar as funções de som para o objeto global
  useEffect(() => {
    window.frogSoundSystem.playRaritySound = playRaritySound;
    window.frogSoundSystem.playPackOpenSound = () =>
      playSound("pack-open-sound");
    window.frogSoundSystem.playCoinSound = () => playSound("coin-sound");

    // Limpar as referências quando o componente for desmontado
    return () => {
      window.frogSoundSystem.playRaritySound = null;
      window.frogSoundSystem.playPackOpenSound = null;
      window.frogSoundSystem.playCoinSound = null;
    };
  }, []);

  // Função para ganhar moedas com som e limite diário
  const earnCoins = (amount) => {
    // Verificar limite diário
    const newTodayEarnings = todayEarnings + amount;
    if (newTodayEarnings > 3000) {
      // Mostrar mensagem de limite atingido
      setShowLimitMessage(true);

      // Esconder a mensagem após 5 segundos
      setTimeout(() => {
        setShowLimitMessage(false);
      }, 5000);

      return;
    }

    // Atualizar moedas
    const newCoins = coins + amount;
    setCoins(newCoins);
    localStorage.setItem("frogGeneratorCoins", newCoins.toString());

    // Atualizar ganhos diários
    setTodayEarnings(newTodayEarnings);
    saveDailyEarnings(newTodayEarnings);

    // Verificar se o limite foi atingido com este ganho
    if (newTodayEarnings >= 3000) {
      setIsLimitReached(true);
      setShowLimitMessage(true);

      // Esconder a mensagem após 5 segundos
      setTimeout(() => {
        setShowLimitMessage(false);
      }, 5000);
    }

    // Tocar som de moeda
    playSound("coin-sound");
  };

  // Função para comprar e gerar sapos com som
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

    // Ativar o loading
    setIsLoading(true);

    // Tocar som de abrir pacote
    playSound("pack-open-sound");

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

    try {
      // Usar a função onGenerateFrog existente com a contagem de sapos
      await onGenerateFrog(count);
    } catch (error) {
      console.error("Erro ao gerar sapos:", error);
      alert("Ocorreu um erro ao gerar sapos. Tente novamente.");
    } finally {
      // Desativar o loading mesmo se ocorrer um erro
      setIsLoading(false);

      // Após abrir pacote, esconder a seleção
      setShowPackSelection(false);
    }
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

  // Efeito para tocar o som quando um novo sapo é exibido
  useEffect(() => {
    if (currentFrog && currentFrog.rarity) {
      // Pequeno atraso para garantir que o som toque após a animação do sapo
      setTimeout(() => {
        playRaritySound(currentFrog.rarity.name);
      }, 500);
    }
  }, [currentFrog]);

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

        {externalLoading && (
          <div className="loading-overlay">
            <div className="loading">Procurando sapo...</div>
          </div>
        )}
      </div>

      {/* Contador de moedas com informações de limite diário */}
      <div className="coins-display">
        <div className="coins-info">
          <span className="coin-icon">🪙</span>
          <span className="coin-amount">{coins}</span>
        </div>
        <div className="daily-limit-info">
          <span>Hoje: {todayEarnings}/3000</span>
          <div className="daily-limit-progress">
            <div
              className="daily-limit-bar"
              style={{
                width: `${Math.min((todayEarnings / 3000) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <span>Reset em: {resetTime}</span>
        </div>
      </div>

      {/* Botão principal para abrir seleção de pacotes */}
      <div className="button-container">
        <button
          className={`generate-frog-btn ${
            isLoading || externalLoading ? "loading" : ""
          }`}
          onClick={(e) => {
            if (!isLoading && !externalLoading) {
              addRippleEffect(e);
              openPackSelection();
            }
          }}
          disabled={isLoading || externalLoading}
        >
          <span className="generate-frog-btn-text">
            {isLoading || externalLoading ? (
              <span>
                Abrindo pacotes<span className="loading-dots"></span>
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
                  } ${coins < pack.price || isLoading ? "disabled" : ""}`}
                  onClick={() =>
                    !isLoading && coins >= pack.price && setSelectedPack(type)
                  }
                  style={{
                    borderColor: pack.color,
                    background: `linear-gradient(135deg, ${pack.color}40, ${pack.color}90)`,
                  }}
                >
                  {/* Pacote estilizado com cor de fundo */}
                  <div className="pack-visual-container">
                    <div
                      className="pack-visual"
                      style={{
                        backgroundColor: pack.color,
                        backgroundImage: `linear-gradient(45deg, ${
                          pack.color
                        }, ${adjustColor(pack.color, 30)})`,
                      }}
                    >
                      <div className="pack-visual-shine"></div>
                      <img
                        src="https://svg-files.pixelied.com/d75398af-665a-499e-ad17-11fea52c21aa/thumb-256px.png"
                        alt="Logo"
                        className="pack-visual-logo"
                      />
                      <div className="pack-stamp">
                        {pack.name.split(" ")[1]}
                      </div>
                    </div>
                  </div>

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
                className={`quantity-btn ${isLoading ? "loading" : ""}`}
                onClick={() => handleBuyAndGenerate(selectedPack, 1)}
                disabled={coins < PACK_TYPES[selectedPack].price || isLoading}
              >
                {isLoading ? (
                  <span>
                    Abrindo<span className="loading-dots"></span>
                  </span>
                ) : (
                  "Comprar 1"
                )}
              </button>
              <button
                className={`quantity-btn ${isLoading ? "loading" : ""}`}
                onClick={() => handleBuyAndGenerate(selectedPack, 3)}
                disabled={
                  coins < PACK_TYPES[selectedPack].price * 3 || isLoading
                }
              >
                {isLoading ? (
                  <span>
                    Abrindo<span className="loading-dots"></span>
                  </span>
                ) : (
                  "Comprar 3"
                )}
              </button>
              <button
                className={`quantity-btn ${isLoading ? "loading" : ""}`}
                onClick={() => handleBuyAndGenerate(selectedPack, 5)}
                disabled={
                  coins < PACK_TYPES[selectedPack].price * 5 || isLoading
                }
              >
                {isLoading ? (
                  <span>
                    Abrindo<span className="loading-dots"></span>
                  </span>
                ) : (
                  "Comprar 5"
                )}
              </button>
            </div>

            <button
              className="close-selection-btn"
              onClick={closePackSelection}
              disabled={isLoading}
            >
              {isLoading ? "Abrindo pacotes..." : "Cancelar"}
            </button>
          </div>
        </div>
      )}

      {/* Botão para ganhar moedas (diariamente ou por assistir anúncios) */}
      <div className="earn-coins-container">
        <button
          className={`earn-coins-btn daily ${isLimitReached ? "disabled" : ""}`}
          onClick={() => earnCoins(100)}
          disabled={isLimitReached}
        >
          <span className="coin-icon-small">🪙</span> +100 Diárias
        </button>
        <button
          className={`earn-coins-btn ad ${isLimitReached ? "disabled" : ""}`}
          onClick={() => {
            if (isLimitReached) {
              setShowLimitMessage(true);
              setTimeout(() => {
                setShowLimitMessage(false);
              }, 5000);
            } else {
              alert("Não desbloqueou não");
            }
          }}
          disabled={isLimitReached}
        >
          <span className="coin-icon-small">🪙</span> +9999 Desbloquear o kaique
        </button>
      </div>

      {/* Mensagem de limite diário atingido */}
      {showLimitMessage && (
        <div className="limit-message">
          <div className="limit-message-content">
            <h3>Hora de tomar o remédio! 💊</h3>
            <p>Você atingiu o limite diário de 3000 moedas.</p>
            <p>O limite será resetado às 21:00h.</p>
            <p>Tempo até o reset: {resetTime}</p>
            <button onClick={() => setShowLimitMessage(false)}>Entendi</button>
          </div>
        </div>
      )}

      <p id="frogCount" style={{ color: "white", marginTop: "10px" }}>
        Sapos encontrados: {frogCount}
      </p>

      {/* Elementos de áudio */}
      <audio
        id="welcome-audio"
        src="https://freesound.org/data/previews/349/349549_5121236-lq.mp3" // Som de sapo inicial
        preload="auto"
      ></audio>
      <audio
        id="coin-sound"
        src="https://freesound.org/data/previews/256/256113_3263906-lq.mp3" // Som de moeda
        preload="auto"
      ></audio>
      <audio
        id="pack-open-sound"
        src="https://freesound.org/data/previews/411/411642_5121236-lq.mp3" // Som de abrir pacote
        preload="auto"
      ></audio>
      <audio
        id="common-audio"
        src="https://freesound.org/data/previews/35/35304_62844-lq.mp3" // Som comum
        preload="auto"
      ></audio>
      <audio
        id="uncommon-audio"
        src="https://freesound.org/data/previews/80/80921_1022651-lq.mp3" // Som incomum
        preload="auto"
      ></audio>
      <audio
        id="rare-audio"
        src="https://freesound.org/data/previews/320/320181_5260872-lq.mp3" // Som raro
        preload="auto"
      ></audio>
      <audio
        id="epic-audio"
        src="https://cdn.freesound.org/previews/793/793399_17068324-lq.mp3" // Som épico
        preload="auto"
      ></audio>
      <audio
        id="legendary-audio"
        src="https://freesound.org/data/previews/387/387232_7255534-lq.mp3" // Som lendário
        preload="auto"
      ></audio>

      {/* Adicione CSS para animação de loading (pontos) */}
      <style>
        {`
          .loading-dots:after {
            content: '.';
            animation: dots 1.5s steps(5, end) infinite;
          }
          
          @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60% { content: '...'; }
            80%, 100% { content: ''; }
          }
          
          .quantity-btn.loading,
          .generate-frog-btn.loading {
            background: linear-gradient(45deg, #6a6a6a, #9e9e9e);
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  );
};

// Função auxiliar para ajustar cores (torná-las mais claras ou escuras)
function adjustColor(hex, percent) {
  // Validar entrada
  if (!hex || typeof hex !== "string") return hex;

  // Remover # se presente
  hex = hex.replace("#", "");

  // Converter para RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Ajustar valores
  r = Math.min(255, Math.max(0, r + percent));
  g = Math.min(255, Math.max(0, g + percent));
  b = Math.min(255, Math.max(0, b + percent));

  // Converter de volta para hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export default FrogGenerator;
