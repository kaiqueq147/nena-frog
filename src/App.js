import React, { useState, useEffect } from "react";
import "./App.css";
import FrogGenerator from "./components/FrogGenerator";
import FrogCollection from "./components/FrogCollection";
import PackDisplay from "./components/PackDisplay";
import FrogModal from "./components/FrogModal";
import MultiPackGrid from "./components/MultiPackGrid";

// Importação dinâmica de todas as imagens no diretório
// Esta sintaxe especial é interpretada pelo webpack
function importAllImages(r) {
  const images = {};
  r.keys().forEach((item) => {
    const id = item.replace(/^\.\//, "").replace(/\.(jpg|jpeg|png)$/, "");
    images[id] = r(item);
  });
  return images;
}

// Importa todas as imagens da pasta ./images/frog_images
const importedImages = importAllImages(
  require.context("./images/frog_images", false, /\.(jpg|jpeg|png)$/)
);

// Converte o objeto de imagens importadas em um array para uso fácil
const frogImages = Object.keys(importedImages).map((id) => ({
  id: id,
  url: importedImages[id],
}));

console.log(`Total de imagens de sapos importadas: ${frogImages.length}`);

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

  // Lista de imagens de sapos locais
  const [loadedImages, setLoadedImages] = useState(true);

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

    // Log para confirmar que todas as imagens foram importadas
    console.log(
      "Imagens disponíveis:",
      frogImages.map((img) => img.id).join(", ")
    );

    // Teste de carregar algumas imagens aleatórias
    for (let i = 0; i < 5; i++) {
      const randomImage = getLocalFrogImage();
      console.log(`Testando imagem ${i + 1}:`, randomImage.id);
    }
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

  // Função simplificada para obter uma imagem de sapo
  const getLocalFrogImage = () => {
    // Selecionar uma imagem aleatória do array
    const randomIndex = Math.floor(Math.random() * frogImages.length);
    return frogImages[randomIndex];
  };

  // Adicionar uma função de verificação de imagem para debug
  const logImageAvailability = (imageUrl) => {
    // Criar um objeto Image para verificar se a imagem pode ser carregada
    const img = new Image();
    img.onload = () =>
      console.log(`✅ Imagem carregada com sucesso: ${imageUrl}`);
    img.onerror = () =>
      console.error(`❌ Falha ao carregar imagem: ${imageUrl}`);
    img.src = imageUrl;
  };

  // Modificar a função para carregar imagens locais com verificação
  useEffect(() => {
    // Verificar disponibilidade das imagens importadas
    frogImages.forEach((img) => {
      console.log(`✅ Imagem importada: ${img.id}`);
    });

    setLoadedImages(true);
    console.log("Total de imagens importadas:", frogImages.length);
  }, []);

  // Simplificar a função getFixedRarityFromId
  const getFixedRarityFromId = (id) => {
    // Verificar se existe uma garantia de raridade mínima
    const guaranteedMinRarity = localStorage.getItem("guaranteedMinRarity");

    if (guaranteedMinRarity === "Épico") {
      // Para pacotes lendários, retornar aleatoriamente Épico ou Lendário
      const random = Math.random();
      if (random < 0.7) {
        // 70% de chance de Épico
        return rarities.find((r) => r.name === "Épico");
      } else {
        // 30% de chance de Lendário
        return rarities.find((r) => r.name === "Lendário");
      }
    }

    // Extrair número do ID (assumindo que id pode ser algo como "frog_12")
    const numMatch = id.match(/\d+/);
    const numericValue = numMatch ? parseInt(numMatch[0]) : 0;

    // Determinar a raridade baseada no número da imagem
    const rarityIndex = numericValue % 100;

    if (rarityIndex >= 0 && rarityIndex < 60) {
      return rarities.find((r) => r.name === "Comum");
    } else if (rarityIndex >= 60 && rarityIndex < 85) {
      return rarities.find((r) => r.name === "Incomum");
    } else if (rarityIndex >= 85 && rarityIndex < 95) {
      return rarities.find((r) => r.name === "Raro");
    } else if (rarityIndex >= 95 && rarityIndex < 99) {
      return rarities.find((r) => r.name === "Épico");
    } else {
      return rarities.find((r) => r.name === "Lendário");
    }
  };

  // Função para extrair ID simplificada
  const extractImageId = (imageObj) => {
    // Se for um objeto imagem (do array frogImages)
    if (typeof imageObj === "object" && imageObj.id) {
      return imageObj.id;
    }

    // Se for uma string URL
    if (typeof imageObj === "string") {
      // Extrair apenas o nome do arquivo sem a extensão
      const fileNameMatch = imageObj.match(/([^\/]+)\.[^\.]+$/);
      if (fileNameMatch && fileNameMatch[1]) {
        return fileNameMatch[1];
      }
    }

    // Fallback
    return String(Math.floor(Math.random() * 10000));
  };

  // Modificar a função handleGenerateFrog para evitar IDs duplicados
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
      const usedImageIds = new Set(); // Conjunto para controlar IDs já usados neste lote

      // Tentativas máximas para evitar loop infinito em caso de poucas imagens
      const maxAttempts = frogImages.length * 2;
      let attempts = 0;

      for (let i = 0; i < count; i++) {
        // Limitar tentativas para evitar loop infinito
        if (attempts >= maxAttempts) {
          console.warn(
            "Atingido número máximo de tentativas para encontrar sapos únicos. Alguns pacotes podem estar faltando."
          );
          break;
        }

        // Obter imagem e ID
        const imageObj = getLocalFrogImage();
        const imageId = imageObj.id;

        // Verificar se este ID já foi usado neste lote de pacotes
        if (usedImageIds.has(imageId)) {
          console.log(`ID já usado neste lote: ${imageId}, tentando outro...`);
          attempts++;
          i--; // Decrementar i para tentar novamente este índice
          continue;
        }

        // Adicionar o ID ao conjunto de IDs usados
        usedImageIds.add(imageId);

        const imageUrl = imageObj.url;

        if (!imageUrl) {
          console.error("Falha ao obter imagem de sapo");
          i--; // Tentar novamente
          attempts++;
          continue;
        }

        // Determinar a raridade com base no ID
        const finalRarity = getFixedRarityFromId(imageId);

        // Verificar se este sapo com esta raridade já existe na coleção
        const existingFrog = frogCollection.find(
          (frog) =>
            extractImageId(frog.imageUrl) === imageId &&
            frog.rarity === finalRarity.name
        );

        if (existingFrog) {
          // Se já existe com esta raridade, tentar outro sapo
          console.log(
            "Sapo com esta imagem e raridade já existe na coleção, tentando outra imagem..."
          );
          i--; // Tentar novamente este índice
          attempts++;
          usedImageIds.delete(imageId); // Remover do conjunto para permitir outras raridades
          continue;
        }

        if (count === 1) {
          // Show single pack animation
          setPackData({ imageUrl, imageId, rarity: finalRarity });
          console.log(`Pack único configurado: ${finalRarity.name}`);
          setShowPack(true);
        } else {
          // Add to grid packs
          console.log(`Adicionando ao grid: ${finalRarity.name}`);
          newGridPacks.push({ imageUrl, imageId, rarity: finalRarity });
        }

        // Resetar o contador de tentativas ao encontrar um sapo válido
        attempts = 0;
      }

      // IMPORTANTE: Primeiro definir os pacotes, depois mostrar o grid
      if (count > 1 && newGridPacks.length > 0) {
        console.log(
          `MultiPackGrid configurado com ${newGridPacks.length} sapos`
        );
        setGridPacks(newGridPacks);

        // Mostrar o grid imediatamente
        setShowMultiPackGrid(true);
      }
    } catch (error) {
      console.error("Erro:", error);
      // Limpar as configurações em caso de erro
      localStorage.removeItem("currentRarityBoost");
      localStorage.removeItem("guaranteedMinRarity");
    }
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

  // Modificar a função addFrogToCollection para trabalhar com os novos objetos de imagem
  const addFrogToCollection = (imageObj, rarity) => {
    // Extract the ID from the image object
    const imageId =
      typeof imageObj === "object" ? imageObj.id : extractImageId(imageObj);
    const imageUrl = typeof imageObj === "object" ? imageObj.url : imageObj;

    console.log("Tentando adicionar sapo à coleção:", {
      id: imageId,
      raridade: typeof rarity === "object" ? rarity.name : rarity,
    });

    // Determinar o nome da raridade
    const rarityName = typeof rarity === "object" ? rarity.name : rarity;

    // Verificar se já existe um sapo com a mesma imagem E o mesmo tier
    const existingFrog = frogCollection.find(
      (frog) =>
        extractImageId(frog.imageUrl) === imageId && frog.rarity === rarityName
    );

    // Se o sapo já existe com a mesma raridade, não adicionar novamente
    if (existingFrog) {
      console.log(
        "Sapo com esta imagem e tier já existe na coleção, não será adicionado novamente"
      );
      return false;
    }

    // Garanta que a raridade seja um objeto completo
    let rarityObject = rarity;

    // Se for uma string ou não tiver todas as propriedades necessárias
    if (typeof rarity === "string" || !rarity.class || !rarity.color) {
      rarityObject = rarities.find((r) => r.name === rarityName);

      if (!rarityObject) {
        console.error("Raridade não encontrada:", rarityName);
        rarityObject = rarities[0]; // Usar comum como fallback
      }
    }

    // Add the frog to the collection with the provided data
    const newFrog = {
      imageUrl: imageUrl,
      imageId: imageId,
      rarity: rarityObject.name,
      class: rarityObject.class,
      color: rarityObject.color,
      date: new Date().toISOString(),
    };

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
      // Tentativa de fallback
      try {
        const limitedCollection = newCollection.slice(-100);
        localStorage.setItem(
          "frogCollection",
          JSON.stringify(limitedCollection)
        );
        setFrogCollection(limitedCollection);
        setFrogCount(limitedCollection.length);
        return true;
      } catch (e) {
        console.error("Falha no fallback:", e);
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

  // Modificar a função para imprimir detalhes úteis sobre o ambiente
  useEffect(() => {
    console.log("Ambiente React:", process.env.NODE_ENV);
    console.log("URL pública:", process.env.PUBLIC_URL);
    console.log("Caminho para imagens de sapos:", process.env.PUBLIC_URL);
  }, []);

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
