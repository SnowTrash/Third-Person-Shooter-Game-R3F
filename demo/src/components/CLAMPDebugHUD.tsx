import React, { useEffect, useState } from 'react';
import { usePaleobotanyEducation } from '../context/PaleobotanyEducationContext';
import { useLeafMorphHistory } from '../context/LeafMorphHistoryContext';
import {
  PHASE_CHECKPOINTS,
  calculateCLAMPSimilarity,
  getInterpolatedLeafTarget,
} from '../systems/QuercusEvolutionSystem';
import type { LeafProperties } from '../systems/LeafGeometrySystem';

/**
 * CLAMPDebugHUD - Quercus Evolution Edition
 * 
 * Visualización completa del sistema CLAMP:
 * - 13 propiedades botánicas (actual vs target)
 * - Progreso de fase
 * - Tiempo acumulado
 * - Controles de debug (H=toggle, T=time, P=puzzle, F=force phase)
 */

interface DebugPanelState {
  visible: boolean;
  expandedSection: 'properties' | 'progress' | 'controls' | null;
}

const CLAMPDebugHUD: React.FC = () => {
  const { evolutionState, updateEvolution, completePuzzleAction, debugAdvanceToNextPhase, debugAddTime } = usePaleobotanyEducation();
  const { getCurrentMorph } = useLeafMorphHistory();
  const [debugPanel, setDebugPanel] = useState<DebugPanelState>({ visible: false, expandedSection: null });
  const [frameCount, setFrameCount] = useState(0);

  // Obtener hoja actual y target
  const currentLeaf = getCurrentMorph();
  const targetLeaf = getInterpolatedLeafTarget(evolutionState);
  const similarity = calculateCLAMPSimilarity(currentLeaf, targetLeaf);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setDebugPanel(prev => ({ ...prev, visible: !prev.visible }));
      }
      if (e.key === 't' || e.key === 'T') {
        debugAddTime(10);
      }
      if (e.key === 'p' || e.key === 'P') {
        completePuzzleAction();
      }
      if (e.key === 'f' || e.key === 'F') {
        debugAdvanceToNextPhase();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [completePuzzleAction, debugAdvanceToNextPhase, debugAddTime]);

  // Update evolution cada frame
  useEffect(() => {
    const interval = setInterval(() => {
      updateEvolution(0.016); // ~60 FPS
      setFrameCount(f => f + 1);
    }, 16);

    return () => clearInterval(interval);
  }, [updateEvolution]);

  if (!debugPanel.visible) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '8px 12px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          fontSize: '12px',
          cursor: 'pointer',
          border: '1px solid #4a4',
          borderRadius: '4px',
          zIndex: 9998,
        }}
        onClick={() => setDebugPanel(prev => ({ ...prev, visible: true }))}
      >
        Press D for CLAMP Debug
      </div>
    );
  }

  const checkpoint = PHASE_CHECKPOINTS[evolutionState.currentPhase];

  // Propiedades para comparar
  const properties: Array<[keyof LeafProperties, string, number, number]> = [
    ['width', 'Width', 0, 1],
    ['length', 'Length', 0.5, 1.5],
    ['pointiness', 'Pointiness', 0, 1],
    ['surface', 'Surface', 0, 1],
    ['thickness', 'Thickness', 0, 1],
    ['lobed', 'Lobed', 0, 1],
    ['teeth', 'Teeth', 0, 1],
    ['teethRegularity', 'Regularity', 0, 1],
    ['teethCloseness', 'Closeness', 0, 1],
    ['teethRounded', 'Rounded', 0, 1],
    ['teethAcute', 'Acute', 0, 1],
    ['teethCompound', 'Compound', 0, 1],
    ['apexEmarginate', 'Apex', 0, 1],
  ];

  const renderPropertyBar = (current: number, target: number, min: number, max: number) => {
    const normalizedCurrent = (current - min) / (max - min);
    const normalizedTarget = (target - min) / (max - min);
    const diff = Math.abs(current - target);
    const color = diff < 0.1 ? '#4a4' : diff < 0.3 ? '#ff0' : '#f44';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        {/* Current bar */}
        <div style={{ width: '60px', height: '8px', backgroundColor: '#333', borderRadius: '2px', position: 'relative' }}>
          <div
            style={{
              width: `${normalizedCurrent * 100}%`,
              height: '100%',
              backgroundColor: color,
              borderRadius: '2px',
              transition: 'width 0.1s',
            }}
          />
        </div>

        {/* Values */}
        <span style={{ fontSize: '10px', color, minWidth: '70px' }}>
          {current.toFixed(2)} → {target.toFixed(2)}
        </span>

        {/* Target indicator */}
        <div
          style={{
            width: '3px',
            height: '12px',
            backgroundColor: '#aaf',
            marginLeft: '4px',
            position: 'relative',
            left: `${normalizedTarget * 60 - 2}px`,
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '500px',
        maxHeight: '90vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: '#fff',
        fontSize: '11px',
        border: '2px solid #4f4',
        borderRadius: '6px',
        padding: '12px',
        fontFamily: 'monospace',
        overflowY: 'auto',
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #4f4', paddingBottom: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4f4' }}>
          ◆ CLAMP Debug HUD ◆
        </div>
        <button
          onClick={() => setDebugPanel(prev => ({ ...prev, visible: false }))}
          style={{
            background: 'none',
            border: 'none',
            color: '#f44',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ×
        </button>
      </div>

      {/* Phase Progress */}
      <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(68, 255, 68, 0.1)', borderRadius: '4px', borderLeft: '3px solid #4f4' }}>
        <div style={{ fontWeight: 'bold', color: '#4f4', marginBottom: '4px' }}>
          Phase {evolutionState.currentPhase}/4: {checkpoint.name}
        </div>
        <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '6px' }}>
          {checkpoint.scientificEra} ({checkpoint.approximateMillionsYearsAgo} Ma)
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '12px', backgroundColor: '#222', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
          <div
            style={{
              width: `${evolutionState.progressTowardsNext * 100}%`,
              height: '100%',
              backgroundColor: '#4f4',
              transition: 'width 0.2s',
            }}
          />
        </div>

        {/* Requirements */}
        <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>
          ⏱ Time: {evolutionState.timeAccumulatedInZone.toFixed(1)}s / {checkpoint.requiredTimeInZone}s
        </div>
        <div style={{ fontSize: '9px', color: '#aaa' }}>
          🎲 Puzzles: {evolutionState.puzzlesCompletedInPhase} / {checkpoint.requiredPuzzles}
        </div>

        {/* Similarity score */}
        <div style={{ fontSize: '10px', color: '#f0f', marginTop: '6px', fontWeight: 'bold' }}>
          🧬 CLAMP Similarity: {similarity.toFixed(1)}%
        </div>
      </div>

      {/* CLAMP Properties */}
      <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(100, 100, 255, 0.05)', borderRadius: '4px', borderLeft: '3px solid #88f' }}>
        <div
          onClick={() => setDebugPanel(prev => ({ ...prev, expandedSection: prev.expandedSection === 'properties' ? null : 'properties' }))}
          style={{ fontWeight: 'bold', color: '#88f', cursor: 'pointer', marginBottom: '6px', userSelect: 'none' }}>
          {debugPanel.expandedSection === 'properties' ? '▼' : '▶'} CLAMP Properties (13)
        </div>

        {debugPanel.expandedSection === 'properties' && (
          <div style={{ marginTop: '8px' }}>
            {properties.map(([key, label, min, max]) => (
              <div key={key} style={{ marginBottom: '6px' }}>
                <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>
                  {label}
                </div>
                {renderPropertyBar(currentLeaf[key], targetLeaf[key], min, max)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(255, 200, 0, 0.05)', borderRadius: '4px', borderLeft: '3px solid #fc0' }}>
        <div style={{ fontWeight: 'bold', color: '#fc0', marginBottom: '6px' }}>
          🎮 Keyboard Shortcuts
        </div>
        <div style={{ fontSize: '9px', color: '#aaa', lineHeight: '1.6' }}>
          <div><strong>D</strong> - Toggle Debug HUD</div>
          <div><strong>T</strong> - Add 10 seconds time</div>
          <div><strong>P</strong> - Complete puzzle</div>
          <div><strong>F</strong> - Force next phase</div>
        </div>

        {/* Manual buttons */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          <button
            onClick={() => debugAddTime(10)}
            style={{
              flex: 1,
              padding: '4px 8px',
              backgroundColor: '#224',
              color: '#4af',
              border: '1px solid #4af',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            +10s
          </button>
          <button
            onClick={completePuzzleAction}
            style={{
              flex: 1,
              padding: '4px 8px',
              backgroundColor: '#242',
              color: '#4f4',
              border: '1px solid #4f4',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            Puzzle
          </button>
          <button
            onClick={debugAdvanceToNextPhase}
            style={{
              flex: 1,
              padding: '4px 8px',
              backgroundColor: '#424',
              color: '#f44',
              border: '1px solid #f44',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            →Phase
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ fontSize: '8px', color: '#666', padding: '6px', backgroundColor: '#111', borderRadius: '3px' }}>
        Frame: {frameCount} | Similarity measures distance from current CLAMP to target vector. ◆ Green = close, Yellow = moderate, Red = far.
      </div>
    </div>
  );
};

export default CLAMPDebugHUD;
