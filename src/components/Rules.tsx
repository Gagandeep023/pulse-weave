import React from 'react';

interface RulesProps {
  onStart: () => void;
}

export const Rules: React.FC<RulesProps> = ({ onStart }) => {
  return (
    <div className="pw-overlay">
      <div className="pw-overlay-content">
        <h1 className="pw-title">Pulse Weave</h1>
        <p className="pw-tagline">Feel the rhythm. Thread the needle.</p>

        <div className="pw-rules-section">
          <h2>How to Play</h2>
          <p className="pw-goal">Thread through all rings to reach the outside.</p>
          <ol className="pw-rules-list">
            <li>Rings rotate around the center. Each has a gap.</li>
            <li>Tap anywhere to jump to the next ring outward.</li>
            <li>Time it right to pass through the gap.</li>
            <li>Miss the gap and you bounce back to the center.</li>
            <li>Three bounces in one level and it is over.</li>
          </ol>
          <p className="pw-tip">
            <strong>Tip:</strong> Watch the rhythm. Each ring has its own tempo. Wait for the gaps to align.
          </p>
        </div>

        <button className="pw-start-btn" onClick={onStart}>
          Start
        </button>
      </div>
    </div>
  );
};
