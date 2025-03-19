import React, { useState, useEffect } from "react";
import "./App.css";
import FrogGenerator from "./components/FrogGenerator";
import FrogCollection from "./components/FrogCollection";
import PackDisplay from "./components/PackDisplay";
import FrogModal from "./components/FrogModal";
import MultiPackGrid from "./components/MultiPackGrid";

function App() {
  const [frogCollection, setFrogCollection] = useState([]);
  const [showCollection, setShowCollection] = useState(false);
  const [selectedFrog, setSelectedFrog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [packData, setPackData] = useState(null);
  const [showPack, setShowPack] = useState(false);
  const [multiPackQueue, setMultiPackQueue] = useState([]);
  const [currentPackIndex, setCurrentPackIndex] = useState(0);
  const [totalPacks, setTotalPacks] = useState(0);
  const [gridPacks, setGridPacks] = useState([]);
  const [showMultiPackGrid, setShowMultiPackGrid] = useState(false);
  const [frogCount, setFrogCount] = useState(0);
  const [showInitialPack, setShowInitialPack] = useState(true);

  // Rarities configuration
  const rarities = [
    { name: "Comum", chance: 60, class: "rarity-common", color: "#a0a0a0" },
    { name: "Incomum", chance: 25, class: "rarity-uncommon", color: "#4CAF50" },
    { name: "Raro", chance: 10, class: "rarity-rare", color: "#2196F3" },
    { name: "Épico", chance: 4, class: "rarity-epic", color: "#9C27B0" },
    {
      name: "Lendário",
      chance: 1,
      class: "rarity-legendary",
      color: "#FFD700",
    },
  ];

  // API keys
  const accessKey = "YOUR_UNSPLASH_ACCESS_KEY";
  const pixabayApiKey = "36988838-387af5e03afe457efbd43c534";

  useEffect(() => {
    // Load collection from localStorage on component mount
    loadCollection();
  }, []);

  const loadCollection = () => {
    const saved = localStorage.getItem("frogCollection");
    console.log("Tentando carregar coleção do localStorage");
    if (saved) {
      try {
        const collection = JSON.parse(saved);
        console.log(
          "Coleção carregada com sucesso:",
          collection.length,
          "sapos"
        );
        setFrogCollection(collection);
        setFrogCount(collection.length);
      } catch (error) {
        console.error("Erro ao carregar a coleção:", error);
        setFrogCollection([]);
        setFrogCount(0);
      }
    } else {
      console.log("Nenhuma coleção encontrada no localStorage");
    }
  };

  const saveCollection = (collection) => {
    localStorage.setItem("frogCollection", JSON.stringify(collection));
    console.log("Coleção salva:", collection.length, "sapos");
    setFrogCollection(collection);
  };

  const extractImageId = (url) => {
    if (url.includes("unsplash.com")) {
      const match = url.match(/\/photos\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1];

      const photoIdMatch = url.match(/photo-([a-zA-Z0-9_-]+)/);
      if (photoIdMatch && photoIdMatch[1]) return photoIdMatch[1];
    }

    if (url.includes("pixabay.com")) {
      const match = url.match(/\/([0-9]+)_/);
      if (match && match[1]) return match[1];
    }

    return hashString(url);
  };

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  };

  const getFixedRarityFromId = (id) => {
    // Verificar se existe uma garantia de raridade mínima
    const guaranteedMinRarity = localStorage.getItem("guaranteedMinRarity");

    if (guaranteedMinRarity === "Épico") {
      // Usar o ID para determinar entre Épico e Lendário de forma consistente
      const numericValue = parseInt(
        id.replace(/[^0-9]/g, "").slice(0, 8) || "0",
        10
      );
      // Se o valor for múltiplo de 5, retorna Lendário (20% de chance), caso contrário Épico
      if (numericValue % 5 === 0) {
        return rarities.find((r) => r.name === "Lendário");
      } else {
        return rarities.find((r) => r.name === "Épico");
      }
    }

    // Para outros casos, usar o algoritmo original
    const numericValue = parseInt(
      id.replace(/[^0-9]/g, "").slice(0, 8) || "0",
      10
    );
    const randomValue = (numericValue % 100) + 1;

    let cumulativeChance = 0;
    for (const rarity of rarities) {
      cumulativeChance += rarity.chance;
      if (randomValue <= cumulativeChance) {
        return rarity;
      }
    }

    return rarities[0];
  };

  const getRarity = () => {
    // Verificar se existe um boost de raridade armazenado
    const rarityBoost = parseFloat(
      localStorage.getItem("currentRarityBoost") || "1"
    );

    // Verificar se existe uma garantia de raridade mínima
    const guaranteedMinRarity = localStorage.getItem("guaranteedMinRarity");

    // Se temos uma garantia, e essa garantia é "Épico" (pacote lendário)
    if (guaranteedMinRarity === "Épico") {
      // Criar uma cópia das raridades, mas filtrar para incluir apenas Épico e Lendário
      const guaranteedRarities = rarities.filter(
        (rarity) => rarity.name === "Épico" || rarity.name === "Lendário"
      );

      // Ajustar as chances apenas entre essas raridades
      const adjustedRarities = guaranteedRarities.map((rarity) => ({
        ...rarity,
        // Manter a proporção relativa entre Épico e Lendário, mas aumentar a chance de Lendário
        chance:
          rarity.name === "Lendário"
            ? rarity.chance * rarityBoost * 2 // Dobrar o boost para Lendário
            : rarity.chance,
      }));

      // Normalizar as chances para somar 100
      const totalChance = adjustedRarities.reduce(
        (sum, r) => sum + r.chance,
        0
      );
      const normalizedRarities = adjustedRarities.map((r) => ({
        ...r,
        chance: (r.chance / totalChance) * 100,
      }));

      // Escolher entre as raridades garantidas
      const random = Math.random() * 100;
      let cumulativeChance = 0;

      for (const rarity of normalizedRarities) {
        cumulativeChance += rarity.chance;
        if (random <= cumulativeChance) {
          // Limpar as configurações após usar
          localStorage.removeItem("currentRarityBoost");
          localStorage.removeItem("guaranteedMinRarity");
          return rarity;
        }
      }

      // Fallback para Épico (caso algo dê errado)
      const epicRarity = rarities.find((r) => r.name === "Épico");
      localStorage.removeItem("currentRarityBoost");
      localStorage.removeItem("guaranteedMinRarity");
      return epicRarity;
    }

    // Código normal para outras situações, sem garantia
    // Aumentar as chances de raridades mais altas com base no rarityBoost
    const adjustedRarities = rarities.map((rarity) => {
      if (rarity.name === "Comum") {
        // Diminuir a chance de comum conforme o boost aumenta
        return {
          ...rarity,
          chance: Math.max(10, rarity.chance - (rarityBoost - 1) * 15),
        };
      } else if (rarity.name === "Incomum") {
        // Manter incomum relativamente estável
        return { ...rarity, chance: rarity.chance };
      } else {
        // Aumentar a chance de raridades altas
        return {
          ...rarity,
          chance: rarity.chance * rarityBoost,
        };
      }
    });

    // Normalizar as chances para somar 100
    const totalChance = adjustedRarities.reduce((sum, r) => sum + r.chance, 0);
    const normalizedRarities = adjustedRarities.map((r) => ({
      ...r,
      chance: (r.chance / totalChance) * 100,
    }));

    // Usar as raridades ajustadas para determinar o resultado
    const random = Math.random() * 100;
    let cumulativeChance = 0;

    for (const rarity of normalizedRarities) {
      cumulativeChance += rarity.chance;
      if (random <= cumulativeChance) {
        // Limpar o boost após usar
        localStorage.removeItem("currentRarityBoost");
        localStorage.removeItem("guaranteedMinRarity");
        return rarity;
      }
    }

    // Limpar configurações
    localStorage.removeItem("currentRarityBoost");
    localStorage.removeItem("guaranteedMinRarity");
    return rarities[0];
  };

  const getFrogFromUnsplash = async () => {
    try {
      const searchTerms = [
        "frog",
        "tree frog",
        "green frog",
        "poison dart frog",
        "bullfrog",
      ];
      const randomTerm =
        searchTerms[Math.floor(Math.random() * searchTerms.length)];

      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${randomTerm}&count=1`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return data[0].urls.regular;
        }
      }
      return null;
    } catch (error) {
      console.error("Erro na API Unsplash:", error);
      return null;
    }
  };

  const getFrogFromPixabay = async () => {
    try {
      const searchTerms = ["frog", "tree frog", "green frog", "toad"];
      const randomTerm =
        searchTerms[Math.floor(Math.random() * searchTerms.length)];

      const url = `https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(
        randomTerm
      )}&image_type=photo`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.hits && data.hits.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.hits.length);
        return data.hits[randomIndex].webformatURL;
      }
      return null;
    } catch (error) {
      console.error("Erro na API Pixabay:", error);
      return null;
    }
  };

  const handleGenerateFrog = async (count = 1) => {
    setShowInitialPack(false);

    try {
      setMultiPackQueue([]);
      setCurrentPackIndex(0);
      setTotalPacks(count);

      // Verificar a garantia de raridade e o boost atual
      const guaranteedMinRarity = localStorage.getItem("guaranteedMinRarity");
      const rarityBoost = parseFloat(
        localStorage.getItem("currentRarityBoost") || "1"
      );

      console.log("Gerando sapos com:", {
        count,
        guaranteedMinRarity,
        rarityBoost,
      });

      const newGridPacks = [];

      for (let i = 0; i < count; i++) {
        let imageUrl = await getFrogFromUnsplash();

        if (!imageUrl) {
          imageUrl = await getFrogFromPixabay();
        }

        if (imageUrl) {
          // Extrair o ID da imagem
          const imageId = extractImageId(imageUrl);

          // Verificar se o sapo já existe na coleção
          const existingFrog = frogCollection.find(
            (frog) => extractImageId(frog.imageUrl) === imageId
          );

          if (existingFrog) {
            // Se já existe, tentar outra imagem
            console.log("Sapo duplicado encontrado, tentando outra imagem...");
            i--; // Tentar novamente este índice
            continue;
          }

          // IMPORTANTE: Usar o getRarity em vez de getFixedRarityFromId para respeitar boosts e garantias
          let finalRarity;

          if (guaranteedMinRarity === "Épico") {
            // Para pacotes lendários, forçar raridade épica ou lendária
            const random = Math.random();
            if (random < 0.7) {
              // 70% chance de épico
              finalRarity = rarities.find((r) => r.name === "Épico");
            } else {
              // 30% chance de lendário
              finalRarity = rarities.find((r) => r.name === "Lendário");
            }
            console.log(`Sapo garantido com raridade: ${finalRarity.name}`);
          } else {
            // Para outros pacotes, aplicar o boost de raridade
            // Configurar objeto simulado para getRarity
            finalRarity = getRarityWithBoost(rarityBoost);
            console.log(
              `Sapo gerado com boost ${rarityBoost}, raridade: ${finalRarity.name}`
            );
          }

          if (count === 1) {
            // Show single pack animation
            setPackData({ imageUrl, rarity: finalRarity });
            console.log(`Pack único configurado: ${finalRarity.name}`);
            setShowPack(true);
          } else {
            // Add to grid packs
            console.log(`Adicionando ao grid: ${finalRarity.name}`);
            newGridPacks.push({ imageUrl, rarity: finalRarity });
          }
        } else {
          console.error("Não foi possível encontrar imagens de sapos");
          break;
        }
      }

      if (count > 1 && newGridPacks.length > 0) {
        // Primeiro, esconda qualquer MultiPackGrid que possa estar aberto
        setShowMultiPackGrid(false);

        // Em seguida, defina os novos pacotes
        setGridPacks([]);

        // Pequeno atraso para garantir que o estado foi atualizado
        setTimeout(() => {
          console.log("Definindo novos pacotes:", newGridPacks.length);
          setGridPacks(newGridPacks);

          // Outro pequeno atraso antes de mostrar o grid
          setTimeout(() => {
            console.log("Mostrando MultiPackGrid...");
            setShowMultiPackGrid(true);
          }, 100);
        }, 100);
      }

      // NÃO limpar as configurações aqui - mover para depois que os sapos forem salvos
    } catch (error) {
      console.error("Erro:", error);
      // Limpar as configurações em caso de erro
      localStorage.removeItem("currentRarityBoost");
      localStorage.removeItem("guaranteedMinRarity");
    }
  };

  // Nova função que aplica o boost de raridade
  const getRarityWithBoost = (boost) => {
    // Ajustar as chances com base no boost
    const adjustedRarities = rarities.map((rarity) => {
      if (rarity.name === "Comum") {
        // Diminuir a chance de comum conforme o boost aumenta
        return {
          ...rarity,
          chance: Math.max(10, rarity.chance - (boost - 1) * 15),
        };
      } else if (rarity.name === "Incomum") {
        // Manter incomum relativamente estável
        return { ...rarity, chance: rarity.chance };
      } else {
        // Aumentar a chance de raridades altas
        return {
          ...rarity,
          chance: rarity.chance * boost,
        };
      }
    });

    // Normalizar as chances para somar 100
    const totalChance = adjustedRarities.reduce((sum, r) => sum + r.chance, 0);
    const normalizedRarities = adjustedRarities.map((r) => ({
      ...r,
      chance: (r.chance / totalChance) * 100,
    }));

    // Usar as raridades ajustadas para determinar o resultado
    const random = Math.random() * 100;
    let cumulativeChance = 0;

    for (const rarity of normalizedRarities) {
      cumulativeChance += rarity.chance;
      if (random <= cumulativeChance) {
        return rarity;
      }
    }

    return rarities[0]; // Fallback para comum
  };

  const handlePackOpened = (imageUrl, rarity) => {
    setShowPack(false);

    // Process next pack in queue if available
    if (multiPackQueue.length > 0) {
      const nextPack = multiPackQueue[0];
      setMultiPackQueue((prev) => prev.slice(1));
      setCurrentPackIndex((prev) => prev + 1);
      setPackData(nextPack);
      setShowPack(true);
    } else {
      setCurrentPackIndex(0);
      setTotalPacks(0);
    }
  };

  const handleShowFrogDetails = (frog) => {
    setSelectedFrog(frog);
    setShowModal(true);
  };

  const addFrogToCollection = (imageUrl, rarity) => {
    // Extract the ID from the image URL
    const imageId = extractImageId(imageUrl);

    console.log("Tentando adicionar sapo à coleção:", {
      id: imageId,
      raridade: typeof rarity === "object" ? rarity.name : rarity,
    });

    // Check if the frog already exists in the collection
    const existingFrogIndex = frogCollection.findIndex(
      (frog) => extractImageId(frog.imageUrl) === imageId
    );

    // If the frog already exists, don't add it again
    if (existingFrogIndex >= 0) {
      console.log("Sapo já existe na coleção, não será adicionado novamente");
      return false;
    }

    // Garanta que a raridade seja um objeto completo
    let rarityObject = rarity;

    // Se for uma string ou não tiver todas as propriedades necessárias
    if (typeof rarity === "string" || !rarity.class || !rarity.color) {
      const rarityName = typeof rarity === "string" ? rarity : rarity.name;
      rarityObject = rarities.find((r) => r.name === rarityName);

      if (!rarityObject) {
        console.error("Raridade não encontrada:", rarityName);
        rarityObject = rarities[0]; // Usar comum como fallback
      }

      console.log("Convertido raridade para objeto completo:", rarityObject);
    }

    // Add the frog to the collection with the fixed rarity
    const newFrog = {
      imageUrl: imageUrl,
      rarity: rarityObject.name,
      class: rarityObject.class,
      color: rarityObject.color,
      date: new Date().toISOString(),
    };

    console.log("Novo sapo a ser adicionado:", newFrog);

    const newCollection = [...frogCollection, newFrog];

    // Salvar explicitamente no localStorage
    try {
      localStorage.setItem("frogCollection", JSON.stringify(newCollection));
      console.log(
        "Coleção salva no localStorage com sucesso, total:",
        newCollection.length
      );
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
      // Tentativa de fallback para coleção menor se for problema de espaço
      if (error.name === "QuotaExceededError") {
        try {
          const limitedCollection = newCollection.slice(-200); // Limitar aos 200 mais recentes
          localStorage.setItem(
            "frogCollection",
            JSON.stringify(limitedCollection)
          );
          console.log(
            "Salvou versão limitada da coleção:",
            limitedCollection.length
          );
          setFrogCollection(limitedCollection);
          setFrogCount(limitedCollection.length);
          return true;
        } catch (e) {
          console.error("Falha no fallback:", e);
        }
      }
    }

    // Atualizar o estado após o localStorage
    setFrogCollection(newCollection);
    setFrogCount(newCollection.length);

    return true;
  };

  const setupMultiPackEvents = () => {
    // Criar um evento personalizado para tocar sons quando um sapo é revelado no grid
    const handlePackReveal = (event) => {
      const { rarity } = event.detail;
      if (window.frogSoundSystem && window.frogSoundSystem.playRaritySound) {
        window.frogSoundSystem.playRaritySound(rarity);
      }
    };

    // Adicionar o listener de evento
    window.addEventListener("frogPackRevealed", handlePackReveal);

    // Remover após um tempo (por exemplo, quando o MultiPackGrid é fechado)
    setTimeout(() => {
      window.removeEventListener("frogPackRevealed", handlePackReveal);
    }, 5 * 60 * 1000); // 5 minutos, ajuste conforme necessário
  };

  // Adicione este useEffect para depurar o problema
  useEffect(() => {
    console.log("Estado do MultiPackGrid:", {
      showMultiPackGrid,
      numGridPacks: gridPacks.length,
    });

    if (showMultiPackGrid && gridPacks.length === 0) {
      console.error(
        "Tentando mostrar MultiPackGrid com lista de pacotes vazia!"
      );
    }
  }, [showMultiPackGrid, gridPacks]);

  return (
    <div className="App">
      <div className="container">
        <img
          src="https://svg-files.pixelied.com/d75398af-665a-499e-ad17-11fea52c21aa/thumb-256px.png"
          alt="Logo"
          style={{ width: "8rem", margin: "1rem", transition: "0.4s" }}
        />
        <h1
          style={{
            textAlign: "center",
            fontSize: "1.3rem",
            width: "20rem",
            margin: "0 auto",
          }}
        >
          Gerador de sapos da helena
        </h1>

        <FrogGenerator
          onGenerateFrog={handleGenerateFrog}
          frogCount={frogCount}
          showInitialPack={showInitialPack}
          currentFrog={packData}
          loading={false}
        />

        <button
          className="toggle-collection"
          onClick={() => setShowCollection(!showCollection)}
        >
          {showCollection ? "Esconder Coleção" : "Ver Coleção de Sapos"}
        </button>

        {showCollection && (
          <FrogCollection
            collection={frogCollection}
            onShowDetails={handleShowFrogDetails}
          />
        )}
      </div>

      {showPack && (
        <PackDisplay
          packData={packData}
          currentPackIndex={currentPackIndex}
          totalPacks={totalPacks}
          onPackOpened={(imageUrl, rarity) => {
            console.log("Pack aberto com raridade:", rarity.name);

            // Garantir que a raridade seja a mesma que foi definida no packData
            const success = addFrogToCollection(imageUrl, rarity);

            console.log("Sapo adicionado à coleção:", success);

            // Limpar as configurações DEPOIS que o sapo for salvo
            localStorage.removeItem("currentRarityBoost");
            localStorage.removeItem("guaranteedMinRarity");

            // Chamar o callback original
            handlePackOpened(imageUrl, rarity);
          }}
          addFrogToCollection={addFrogToCollection}
          getFixedRarityFromId={getFixedRarityFromId}
          extractImageId={extractImageId}
        />
      )}

      {showModal && selectedFrog && (
        <FrogModal frog={selectedFrog} onClose={() => setShowModal(false)} />
      )}

      {showMultiPackGrid && gridPacks.length > 0 ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 1000,
          }}
        >
          <h2 style={{ color: "white", textAlign: "center" }}>
            MultiPackGrid deveria aparecer aqui!
          </h2>
          <MultiPackGrid
            gridPacks={gridPacks}
            onClose={() => {
              console.log("MultiPackGrid fechado");

              // Limpar as configurações
              localStorage.removeItem("currentRarityBoost");
              localStorage.removeItem("guaranteedMinRarity");

              setShowMultiPackGrid(false);
            }}
            addFrogToCollection={(imageUrl, rarity) => {
              console.log("Adicionando sapo do grid à coleção:", rarity.name);

              // Tocar som baseado na raridade quando o usuário clica no sapo no grid
              if (
                window.frogSoundSystem &&
                window.frogSoundSystem.playRaritySound
              ) {
                window.frogSoundSystem.playRaritySound(rarity.name);
              }

              // Adicionar à coleção
              const success = addFrogToCollection(imageUrl, rarity);

              console.log("Sapo adicionado à coleção:", success);

              // Disparar evento informando que um sapo foi revelado
              const event = new CustomEvent("frogPackRevealed", {
                detail: { rarity: rarity.name },
              });
              window.dispatchEvent(event);

              return success;
            }}
            getFixedRarityFromId={getFixedRarityFromId}
            extractImageId={extractImageId}
          />
        </div>
      ) : null}
    </div>
  );
}

export default App;
