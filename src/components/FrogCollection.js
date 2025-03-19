import React, { useState, useEffect } from "react";
import "./FrogCollection.css";

const FrogCollection = ({ collection, onShowDetails }) => {
  // Estado para controlar qual página do álbum está sendo visualizada
  const [currentPage, setCurrentPage] = useState("all");
  const [previousPage, setPreviousPage] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Páginas do álbum organizadas em pares (esquerda e direita)
  const albumPages = {
    legendary: { frogs: legendaryFrogs, title: "Lendários", color: "#FFD700" },
    epic: { frogs: epicFrogs, title: "Épicos", color: "#9400D3" },
    rare: { frogs: rareFrogs, title: "Raros", color: "#0000FF" },
    uncommon: { frogs: uncommonFrogs, title: "Incomuns", color: "#008000" },
    common: { frogs: commonFrogs, title: "Comuns", color: "#808080" },
  };

  // Função para mudar a página do álbum com animação
  const changePage = (pageKey) => {
    if (pageKey === currentPage) return;

    setPreviousPage(currentPage);
    setIsTransitioning(true);

    // Definir um tempo para a animação de transição
    setTimeout(() => {
      setCurrentPage(pageKey);
      setIsTransitioning(false);
    }, 300);
  };

  // Dividir sapos em duas colunas (página esquerda e direita)
  const splitFrogsForPages = (frogs) => {
    const leftPage = [];
    const rightPage = [];

    frogs.forEach((frog, index) => {
      if (index % 2 === 0) {
        leftPage.push(frog);
      } else {
        rightPage.push(frog);
      }
    });

    return { leftPage, rightPage };
  };

  // Função para renderizar uma figurinha de sapo
  const renderFrogSticker = (frog, index, color) => {
    if (!frog) return renderEmptySlot(index, color);

    return (
      <div
        key={`frog-${index}`}
        className="album-slot"
        onClick={() => onShowDetails(frog)}
      >
        <div className="album-sticker" style={{ borderColor: color }}>
          <img src={frog.imageUrl} alt={`Sapo ${frog.rarity}`} />
          <div className="sticker-shine"></div>
        </div>
        <div className="slot-number">{index + 1}</div>
      </div>
    );
  };

  // Função para renderizar slots vazios no álbum
  const renderEmptySlot = (index, color) => {
    return (
      <div key={`empty-${index}`} className="album-slot empty">
        <div className="empty-slot" style={{ borderColor: color }}>
          <div className="question-mark">?</div>
        </div>
        <div className="slot-number">{index + 1}</div>
      </div>
    );
  };

  // Função para renderizar uma página do álbum (contém 6 slots)
  const renderAlbumPage = (
    frogs,
    startIndex,
    color,
    pageTitle,
    isRightPage = false
  ) => {
    const pageClass = isRightPage ? "album-right-page" : "album-left-page";
    const slots = [];

    // Criar 6 slots por página
    for (let i = 0; i < 6; i++) {
      const frogIndex = startIndex + i;
      const frog = frogs[frogIndex];
      slots.push(renderFrogSticker(frog, frogIndex, color));
    }

    return (
      <div className={`album-page ${pageClass}`} style={{ borderColor: color }}>
        <div className="page-header" style={{ borderBottomColor: color }}>
          <h3 style={{ color }}>{pageTitle}</h3>
          <span className="page-number">{startIndex / 6 + 1}</span>
        </div>
        <div className="album-grid">{slots}</div>
      </div>
    );
  };

  // Renderizar o álbum aberto para uma categoria específica
  const renderCategoryAlbum = (categoryKey) => {
    const category = albumPages[categoryKey];
    if (!category || category.frogs.length === 0) return null;

    const frogs = category.frogs;
    const { title, color } = category;
    const pages = Math.ceil(frogs.length / 12); // 12 frogs per spread (6 per page)

    // Renderizar apenas o spread atual
    const spreadIndex = 0; // Para futuras implementações: adicionar navegação entre spreads
    const startIndex = spreadIndex * 12;

    return (
      <div className={`album-spread ${isTransitioning ? "turning" : ""}`}>
        <div className="album-binding"></div>
        {renderAlbumPage(
          frogs,
          startIndex,
          color,
          `${title} (${frogs.length})`
        )}
        {renderAlbumPage(frogs, startIndex + 6, color, `${title}`, true)}
      </div>
    );
  };

  // Renderizar o álbum completo com todas as categorias
  const renderFullAlbum = () => {
    return (
      <div className={`album-spread ${isTransitioning ? "turning" : ""}`}>
        <div className="album-binding"></div>
        <div className="album-left-page">
          <div className="page-header" style={{ borderBottomColor: "#FFD700" }}>
            <h3 style={{ color: "#FFD700" }}>Coleção de Sapos</h3>
            <span className="page-number">1</span>
          </div>
          <div className="album-intro">
            <div className="album-cover-art">
              <img
                src="https://svg-files.pixelied.com/d75398af-665a-499e-ad17-11fea52c21aa/thumb-256px.png"
                alt="Logo Sapo"
                className="album-logo"
              />
            </div>
            <p>Album de sapos da nena</p>
            <p>
              {" "}
              <p style={{ color: "green", fontSize: "2em" }}>
                {collection.length}
              </p>{" "}
              Sapos descobertos
            </p>
          </div>
        </div>
        <div className="album-right-page">
          <div className="page-header" style={{ borderBottomColor: "#FFD700" }}>
            <h3 style={{ color: "#FFD700" }}>Estatísticas</h3>
            <span className="page-number">2</span>
          </div>
          <div className="album-stats">
            <div className="stats-progress">
              <div className="completion-header">
                <h4>Progresso Total</h4>
                <div className="completion-bar-container">
                  <div
                    className="completion-bar"
                    style={{ width: `${(stats.total / 100) * 100}%` }}
                  ></div>
                </div>
                <span className="completion-percentage">{stats.total}%</span>
              </div>
            </div>
            <div className="stats-breakdown">
              <div className="stat-item legendary">
                <div className="stat-icon">👑</div>
                <div className="stat-label">Lendários</div>
                <div className="stat-value" id="legendary-frogs">
                  {stats.legendary}
                </div>
              </div>
              <div className="stat-item epic">
                <div className="stat-icon">✨</div>
                <div className="stat-label">Épicos</div>
                <div className="stat-value" id="epic-frogs">
                  {stats.epic}
                </div>
              </div>
              <div className="stat-item rare">
                <div className="stat-icon">💎</div>
                <div className="stat-label">Raros</div>
                <div className="stat-value" id="rare-frogs">
                  {stats.rare}
                </div>
              </div>
              <div className="stat-item uncommon">
                <div className="stat-icon">🍀</div>
                <div className="stat-label">Incomuns</div>
                <div className="stat-value" id="uncommon-frogs">
                  {stats.uncommon}
                </div>
              </div>
              <div className="stat-item common">
                <div className="stat-icon">🐸</div>
                <div className="stat-label">Comuns</div>
                <div className="stat-value" id="common-frogs">
                  {stats.common}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="album-container">
      <h2 className="album-title">Álbum de Sapos</h2>

      {/* Navegação do álbum */}
      <div className="album-navigation">
        <button
          className={`album-tab ${currentPage === "all" ? "active" : ""}`}
          onClick={() => changePage("all")}
        >
          Coleção
        </button>
        <button
          className={`album-tab legendary-tab ${
            currentPage === "legendary" ? "active" : ""
          }`}
          onClick={() => changePage("legendary")}
          disabled={legendaryFrogs.length === 0}
        >
          Lendários
        </button>
        <button
          className={`album-tab epic-tab ${
            currentPage === "epic" ? "active" : ""
          }`}
          onClick={() => changePage("epic")}
          disabled={epicFrogs.length === 0}
        >
          Épicos
        </button>
        <button
          className={`album-tab rare-tab ${
            currentPage === "rare" ? "active" : ""
          }`}
          onClick={() => changePage("rare")}
          disabled={rareFrogs.length === 0}
        >
          Raros
        </button>
        <button
          className={`album-tab uncommon-tab ${
            currentPage === "uncommon" ? "active" : ""
          }`}
          onClick={() => changePage("uncommon")}
          disabled={uncommonFrogs.length === 0}
        >
          Incomuns
        </button>
        <button
          className={`album-tab common-tab ${
            currentPage === "common" ? "active" : ""
          }`}
          onClick={() => changePage("common")}
          disabled={commonFrogs.length === 0}
        >
          Comuns
        </button>
      </div>

      <div className="album-book">
        {currentPage === "all"
          ? renderFullAlbum()
          : renderCategoryAlbum(currentPage)}
      </div>
    </div>
  );
};

export default FrogCollection;
