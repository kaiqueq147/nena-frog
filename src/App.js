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
    if (saved) {
      const collection = JSON.parse(saved);
      setFrogCollection(collection);
      setFrogCount(collection.length);
    }
  };

  const saveCollection = (collection) => {
    localStorage.setItem("frogCollection", JSON.stringify(collection));
    setFrogCollection(collection);
  };

  const addFrogToCollection = (imageUrl, rarity) => {
    // Extract the ID from the image URL
    const imageId = extractImageId(imageUrl);

    // Check if the frog already exists in the collection
    const existingFrogIndex = frogCollection.findIndex(
      (frog) => extractImageId(frog.imageUrl) === imageId
    );

    // If the frog already exists, don't add it again
    if (existingFrogIndex >= 0) {
      return false;
    }

    // Add the frog to the collection with the fixed rarity
    const newCollection = [
      ...frogCollection,
      {
        imageUrl: imageUrl,
        rarity: rarity.name,
        class: rarity.class,
        color: rarity.color,
        date: new Date().toISOString(),
      },
    ];

    saveCollection(newCollection);
    setFrogCount(newCollection.length);
    return true;
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

      const newGridPacks = [];

      for (let i = 0; i < count; i++) {
        // Obter a raridade computada pelas regras de garantia e boost
        const rarity = getRarity();
        let imageUrl = await getFrogFromUnsplash();

        if (!imageUrl) {
          imageUrl = await getFrogFromPixabay();
        }

        if (imageUrl) {
          setFrogCount((prevCount) => prevCount + 1);

          if (count === 1) {
            // Show single pack animation
            // Usar diretamente a raridade calculada por getRarity()
            setPackData({ imageUrl, rarity: rarity });
            setShowPack(true);
          } else {
            // Add to grid packs com a raridade correta
            newGridPacks.push({ imageUrl, rarity });
          }
        } else {
          console.error("Não foi possível encontrar imagens de sapos");
          break;
        }
      }

      if (count > 1 && newGridPacks.length > 0) {
        setGridPacks(newGridPacks);
        setShowMultiPackGrid(true);
      }
    } catch (error) {
      console.error("Erro:", error);
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
          onPackOpened={handlePackOpened}
          addFrogToCollection={addFrogToCollection}
          getFixedRarityFromId={getFixedRarityFromId}
          extractImageId={extractImageId}
        />
      )}

      {showModal && selectedFrog && (
        <FrogModal frog={selectedFrog} onClose={() => setShowModal(false)} />
      )}

      {showMultiPackGrid && (
        <MultiPackGrid
          gridPacks={gridPacks}
          onClose={() => setShowMultiPackGrid(false)}
          addFrogToCollection={addFrogToCollection}
          getFixedRarityFromId={getFixedRarityFromId}
          extractImageId={extractImageId}
        />
      )}

      <audio
        id="audio"
        src="https://od.lk/s/MjhfMzI5MDYxNjVf/frog-croaking-soundbible%20%28mp3cut.net%29.mp3"
        type="audio/mp3"
      ></audio>
      <audio
        id="pack-audio"
        src="https://assets.mixkit.co/sfx/preview/mixkit-opening-a-soda-can-2355.mp3"
        type="audio/mp3"
      ></audio>
      <audio
        id="rare-audio"
        src="https://assets.mixkit.co/sfx/preview/mixkit-magical-coin-win-1936.mp3"
        type="audio/mp3"
      ></audio>
      <audio
        id="tear-audio"
        src="https://assets.mixkit.co/sfx/preview/mixkit-paper-rip-1376.mp3"
        type="audio/mp3"
      ></audio>
    </div>
  );
}

export default App;
