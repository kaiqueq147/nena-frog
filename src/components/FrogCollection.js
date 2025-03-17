import React from "react";
import "./FrogCollection.css";

const FrogCollection = ({ collection, onShowDetails }) => {
  // Calculate collection stats
  const stats = {
    total: collection.length,
    common: collection.filter((frog) => frog.rarity === "Comum").length,
    uncommon: collection.filter((frog) => frog.rarity === "Incomum").length,
    rare: collection.filter((frog) => frog.rarity === "Raro").length,
    epic: collection.filter((frog) => frog.rarity === "Épico").length,
    legendary: collection.filter((frog) => frog.rarity === "Lendário").length,
  };

  // Separar sapos por raridade
  const legendaryFrogs = collection.filter(
    (frog) => frog.rarity === "Lendário"
  );
  const epicFrogs = collection.filter((frog) => frog.rarity === "Épico");
  const rareFrogs = collection.filter((frog) => frog.rarity === "Raro");
  const uncommonFrogs = collection.filter((frog) => frog.rarity === "Incomum");
  const commonFrogs = collection.filter((frog) => frog.rarity === "Comum");

  // Função para renderizar uma seção de sapos por raridade
  const renderRaritySection = (frogs, rarityName, color) => {
    if (frogs.length === 0) return null;

    // Determinar a classe de raridade
    let rarityClass = "";
    switch (rarityName) {
      case "Lendários":
        rarityClass = "legendary-section";
        break;
      case "Épicos":
        rarityClass = "epic-section";
        break;
      case "Raros":
        rarityClass = "rare-section";
        break;
      case "Incomuns":
        rarityClass = "uncommon-section";
        break;
      case "Comuns":
        rarityClass = "common-section";
        break;
      default:
        rarityClass = "";
    }

    return (
      <div className={`rarity-section ${rarityClass}`}>
        <h3 className="rarity-title" style={{ color: color }}>
          {rarityName} ({frogs.length})
        </h3>
        <div className="collection-grid">
          {frogs.map((frog, index) => (
            <div
              key={index}
              className="collection-item"
              onClick={() => onShowDetails(frog)}
            >
              <img src={frog.imageUrl} alt={`Sapo ${frog.rarity}`} />
              <div
                className="rarity-indicator"
                style={{ backgroundColor: frog.color }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="collection-container">
      <h2 className="collection-title">Minha Coleção de Sapos</h2>

      {renderRaritySection(legendaryFrogs, "Lendários", "#FFD700")}
      {renderRaritySection(epicFrogs, "Épicos", "#9400D3")}
      {renderRaritySection(rareFrogs, "Raros", "#0000FF")}
      {renderRaritySection(uncommonFrogs, "Incomuns", "#008000")}
      {renderRaritySection(commonFrogs, "Comuns", "#808080")}

      <div className="collection-stats">
        <span>
          Total: <span id="total-frogs">{stats.total}</span>
        </span>
        <span>
          Comuns: <span id="common-frogs">{stats.common}</span>
        </span>
        <span>
          Incomuns: <span id="uncommon-frogs">{stats.uncommon}</span>
        </span>
        <span>
          Raros: <span id="rare-frogs">{stats.rare}</span>
        </span>
        <span>
          Épicos: <span id="epic-frogs">{stats.epic}</span>
        </span>
        <span>
          Lendários: <span id="legendary-frogs">{stats.legendary}</span>
        </span>
      </div>
    </div>
  );
};

export default FrogCollection;
