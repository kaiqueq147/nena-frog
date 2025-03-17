import React, { useEffect, useRef, useState } from "react";
import "./FrogGenerator.css";

// Configuração do limite diário - pode ser facilmente alterada aqui
const DEFAULT_DAILY_LIMIT = 100;

const FrogGenerator = ({
  onGenerateFrog,
  frogCount,
  showInitialPack,
  currentFrog,
  loading,
  hasItemsToCollect,
  hasItemsToReveal,
  handleCollectAll,
  handleRevealAll,
  dailyLimit = DEFAULT_DAILY_LIMIT, // Recebe o limite como prop com valor padrão
}) => {
  // Estado para controlar o limite diário
  const [dailyFrogsGenerated, setDailyFrogsGenerated] = useState(0);
  const [nextResetTime, setNextResetTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);

  // Referência para o elemento de áudio
  const frogSoundRef = useRef(null);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const storedData = localStorage.getItem("frogGeneratorLimits");
    if (storedData) {
      const { count, resetTime, storedLimit } = JSON.parse(storedData);

      // Se o limite armazenado for diferente do atual, resetar o contador
      if (storedLimit !== dailyLimit) {
        setDailyFrogsGenerated(0);
        setNextResetTime(null);
        localStorage.setItem(
          "frogGeneratorLimits",
          JSON.stringify({
            count: 0,
            resetTime: null,
            storedLimit: dailyLimit,
          })
        );
      } else {
        setDailyFrogsGenerated(count);
        setNextResetTime(resetTime);
      }
    }
  }, [dailyLimit]);

  // Atualizar o timer a cada segundo
  useEffect(() => {
    if (nextResetTime) {
      const updateTimeRemaining = () => {
        const now = new Date().getTime();
        const resetTime = new Date(nextResetTime).getTime();
        const difference = resetTime - now;

        if (difference <= 0) {
          // Resetar o contador quando o tempo acabar
          setDailyFrogsGenerated(0);
          setNextResetTime(null);
          setTimeRemaining(null);
          localStorage.setItem(
            "frogGeneratorLimits",
            JSON.stringify({
              count: 0,
              resetTime: null,
              storedLimit: dailyLimit,
            })
          );
          clearInterval(timerRef.current);
        } else {
          // Calcular horas, minutos e segundos restantes
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setTimeRemaining({ hours, minutes, seconds });
        }
      };

      // Atualizar imediatamente e depois a cada segundo
      updateTimeRemaining();
      timerRef.current = setInterval(updateTimeRemaining, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [nextResetTime, dailyLimit]);

  // Função para reproduzir o som de sapo
  const playFrogSound = () => {
    if (frogSoundRef.current) {
      frogSoundRef.current.currentTime = 0;
      frogSoundRef.current.play().catch((error) => {
        console.log("Erro ao reproduzir som:", error);
      });
    }
  };

  const handleGenerateFrog = async (count) => {
    // Verificar se o limite diário foi atingido
    if (dailyFrogsGenerated >= dailyLimit) {
      alert(
        `Você atingiu o limite diário de ${dailyLimit} sapos. Tente novamente amanhã!`
      );
      return;
    }

    // Verificar se o número de sapos solicitados excede o limite restante
    const remainingFrogs = dailyLimit - dailyFrogsGenerated;
    const frogsToGenerate = Math.min(count, remainingFrogs);

    if (frogsToGenerate < count) {
      alert(
        `Você só pode gerar mais ${remainingFrogs} sapo(s) hoje. Gerando ${remainingFrogs} sapo(s).`
      );
    }

    // Gerar os sapos
    await onGenerateFrog(frogsToGenerate);

    // Atualizar o contador
    const newCount = dailyFrogsGenerated + frogsToGenerate;
    setDailyFrogsGenerated(newCount);

    // Se atingiu o limite, definir o timer de 24 horas
    if (newCount >= dailyLimit) {
      const resetTime = new Date();
      resetTime.setHours(resetTime.getHours() + 24);
      setNextResetTime(resetTime.toISOString());

      // Salvar no localStorage
      localStorage.setItem(
        "frogGeneratorLimits",
        JSON.stringify({
          count: newCount,
          resetTime: resetTime.toISOString(),
          storedLimit: dailyLimit,
        })
      );
    } else {
      // Atualizar o localStorage com o novo contador
      localStorage.setItem(
        "frogGeneratorLimits",
        JSON.stringify({
          count: newCount,
          resetTime: nextResetTime,
          storedLimit: dailyLimit,
        })
      );
    }
  };

  // Formatar o tempo restante para exibição
  const formatTimeRemaining = () => {
    if (!timeRemaining) return "";

    const { hours, minutes, seconds } = timeRemaining;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Efeito para tocar o som quando um novo sapo for gerado
  useEffect(() => {
    if (currentFrog && !loading) {
      playFrogSound();
    }
  }, [currentFrog, loading]);

  // Função para ordenar sapos por raridade
  const sortByRarity = (frogs) => {
    // Definindo a ordem de raridade (do mais raro para o mais comum)
    const rarityOrder = {
      Lendário: 1,
      Épico: 2,
      Raro: 3,
      Incomum: 4,
      Comum: 5,
    };

    // Ordenando os sapos com base na ordem de raridade
    return [...frogs].sort((a, b) => {
      return rarityOrder[a.rarity.name] - rarityOrder[b.rarity.name];
    });
  };

  // Se tivermos uma coleção de sapos para exibir, vamos ordená-los
  // Nota: Isso assume que você tem uma prop 'frogs' ou algo similar
  // Se não tiver, você precisará ajustar seu código para incluir essa coleção

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
      <audio ref={frogSoundRef} preload="auto">
        <source src="/sounds/frog-sound.mp3" type="audio/mpeg" />
      </audio>

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

      {/* Contador de sapos diários e timer */}
      <div className="daily-limit-info">
        <div className="daily-counter">
          <span>Sapos hoje: </span>
          <span
            className={dailyFrogsGenerated >= dailyLimit ? "limit-reached" : ""}
          >
            {dailyFrogsGenerated}/{dailyLimit}
          </span>
        </div>

        {timeRemaining && (
          <div className="reset-timer">
            <span>Próximo reset em: </span>
            <span className="timer-value">{formatTimeRemaining()}</span>
          </div>
        )}
      </div>

      <div className="button-container">
        <button
          className={`generate-frog-btn ${
            dailyFrogsGenerated >= dailyLimit ? "disabled" : ""
          }`}
          onClick={(e) => {
            addRippleEffect(e);
            handleGenerateFrog(1);
          }}
          disabled={loading || dailyFrogsGenerated >= dailyLimit}
        >
          <span className="generate-frog-btn-text">
            {loading ? (
              <span>
                Procurando<span className="loading-dots"></span>
              </span>
            ) : dailyFrogsGenerated >= dailyLimit ? (
              "Limite Diário Atingido"
            ) : (
              "Gerar sapo"
            )}
          </span>
        </button>
      </div>

      <div className="multi-pack-options">
        <button
          className="multi-pack-btn"
          onClick={() => handleGenerateFrog(3)}
          disabled={
            loading ||
            dailyFrogsGenerated >= dailyLimit ||
            dailyFrogsGenerated + 3 > dailyLimit
          }
        >
          Abrir 3 pacotes
        </button>
        <button
          className="multi-pack-btn"
          onClick={() => handleGenerateFrog(5)}
          disabled={
            loading ||
            dailyFrogsGenerated >= dailyLimit ||
            dailyFrogsGenerated + 5 > dailyLimit
          }
        >
          Abrir 5 pacotes
        </button>
        <button
          className="multi-pack-btn"
          onClick={() => handleGenerateFrog(10)}
          disabled={
            loading ||
            dailyFrogsGenerated >= dailyLimit ||
            dailyFrogsGenerated + 10 > dailyLimit
          }
        >
          Abrir 10 pacotes
        </button>
      </div>

      <p id="frogCount" style={{ color: "white", marginTop: "10px" }}>
        Sapos encontrados: {frogCount}
      </p>
    </div>
  );
};

export default FrogGenerator;
