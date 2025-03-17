import React from "react";
import "./FrogModal.css";

const FrogModal = ({ frog, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="frog-detail-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="modal-close" onClick={onClose}>
          &times;
        </span>
        <img src={frog.imageUrl} alt="Sapo" className="modal-image" />
        <div className="modal-info">
          <h3 className="modal-title">Sapo {frog.rarity}</h3>
          <p className="modal-rarity">
            Raridade: <span style={{ color: frog.color }}>{frog.rarity}</span>
          </p>
          <p className="modal-date">
            Encontrado em: <span>{formatDate(frog.date)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FrogModal;
