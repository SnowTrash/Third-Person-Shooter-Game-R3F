import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLeafVisualization } from '../hooks/useLeafVisualization';
import {
  useLeafPropertyVisualization,
  useActiveLeavesChanges,
} from '../hooks/useLeafPropertyVisualization';
import {
  PropertyBar,
  PropertyGroupPanel,
  PropertyComparisonWidget,
} from './CLAMPPropertyVisualization';
import { usePaleobotanyEducation } from '../context/PaleobotanyEducationContext';

/**
 * CLAMPDebugHUDRefactored.tsx
 * 
 * HUD de debug completamente rediseñado:
 * ✅ Conectado a useLeafVisualization (misma fuente que miniviz)
 * ✅ Visualización mejorada con colores claros
 * ✅ Componentes reutilizables y profesionales
 * ✅ Código limpio y debugeable
 * ✅ Transiciones suaves
 * 
 * CAMBIOS PRINCIPALES vs original:
 * - Usa useLeafPropertyVisualization para calcular colores/deltas
 * - Componentes separados (PropertyBar, PropertyGroupPanel)
 * - Vistas múltiples: Overview, Detailed, Changes
 * - Mejor uso de espacio y jerarquía visual
 * - Menos código duplicado
 */

type ViewMode = 'overview' | 'detailed' | 'changes';

interface DebugHUDState {
  visible: boolean;
  viewMode: ViewMode;
  expandMorphology: boolean;
  expandBotanical: boolean;
}

const CLAMPDebugHUDRefactored: React.FC = () => {
  // Hooks de datos - estos se actualizan cuando cambia el estado
  const leafViz = useLeafVisualization();
  const propertyGroups = useLeafPropertyVisualization();
  const activeChanges = useActiveLeavesChanges(0.1);

  const { debugAddTime, completePuzzleAction, debugAdvanceToNextPhase, debugRevertToPreviousPhase, debugSubtractTime, debugCompletePuzzle } =
    usePaleobotanyEducation();

  // Estado local - inicializar con valores sanos
  const [hud, setHud] = useState<DebugHUDState>({
    visible: false,
    viewMode: 'overview',
    expandMorphology: true,
    expandBotanical: true,
  });

  // IMPORTANTE: Crear un objeto memoizado que agrupe todos los datos derivados
  // Esto fuerza re-renders cuando los datos cambien
  const derivedData = useMemo(
    () => ({
      similarity: leafViz.similarity,
      dominantZone: leafViz.dominantZone,
      phaseInfo: leafViz.phaseInfo,
      progress: leafViz.progress,
      currentPhase: leafViz.currentPhase,
      groupsLength: propertyGroups.length,
      activeChangesLength: activeChanges.length,
      timeAccumulated: leafViz.timeAccumulated,
      timeRequired: leafViz.timeRequired,
      puzzlesCompleted: leafViz.puzzlesCompleted,
      puzzlesRequired: leafViz.puzzlesRequired,
    }),
    [
      leafViz.similarity,
      leafViz.dominantZone?.type,
      leafViz.dominantZone?.color,
      leafViz.phaseInfo.name,
      leafViz.phaseInfo.era,
      leafViz.phaseInfo.ma,
      leafViz.progress,
      leafViz.currentPhase,
      propertyGroups.length,
      activeChanges.length,
      leafViz.timeAccumulated,
      leafViz.timeRequired,
      leafViz.puzzlesCompleted,
      leafViz.puzzlesRequired,
    ]
  );

  // Log para debugging (solo en desarrollo)
  useEffect(() => {
    if (hud.visible) {
      console.debug(
        '[CLAMP HUD] Data updated:',
        derivedData.similarity.toFixed(1),
        'zone:',
        derivedData.dominantZone?.type,
        'active-changes:',
        derivedData.activeChangesLength
      );
    }
  }, [derivedData, hud.visible]);

  // Memoizar funciones de actualización para evitar re-renders innecesarios
  const toggleVisibility = useCallback(() => {
    setHud(prev => ({ ...prev, visible: !prev.visible }));
  }, []);

  const switchViewMode = useCallback((mode: ViewMode) => {
    setHud(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const toggleMorphology = useCallback((expanded: boolean) => {
    setHud(prev => ({ ...prev, expandMorphology: expanded }));
  }, []);

  const toggleBotanical = useCallback((expanded: boolean) => {
    setHud(prev => ({ ...prev, expandBotanical: expanded }));
  }, []);

  // Keyboard shortcuts - PROFESIONAL CON DEBUG MEJORADO
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isShift = e.shiftKey;

      switch (key) {
        // ============ NAVEGACIÓN HUD ============
        case 'h':
          toggleVisibility();
          break;

        // ============ CAMBIO DE VISTAS ============
        case '1':
          if (hud.visible) switchViewMode('overview');
          break;
        case '2':
          if (hud.visible) switchViewMode('detailed');
          break;
        case '3':
          if (hud.visible) switchViewMode('changes');
          break;

        // ============ PUZZLES & OBJETIVOS ============
        case 'p':
          completePuzzleAction();
          break;

        // ============ DEBUG: TIEMPO (T / Shift+T) ============
        case 't':
          if (isShift) {
            debugSubtractTime(10); // Shift+T: -10 segundos
          } else {
            debugAddTime(10); // T: +10 segundos
          }
          break;

        // ============ DEBUG: FASES (F / Shift+F) ============
        case 'f':
          if (isShift) {
            debugRevertToPreviousPhase(); // Shift+F: Revertir fase
          } else {
            debugAdvanceToNextPhase(); // F: Avanzar fase (solo si no es automático)
          }
          break;

        // ============ DEBUG: GANAR PUZZLE (G) ============
        case 'g':
          debugCompletePuzzle();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    hud.visible,
    toggleVisibility,
    switchViewMode,
    debugAddTime,
    debugSubtractTime,
    completePuzzleAction,
    debugAdvanceToNextPhase,
    debugRevertToPreviousPhase,
    debugCompletePuzzle,
  ]);

  // Minimized button (cuando no está visible)
  if (!hud.visible) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '8px 12px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: `2px solid ${derivedData.similarity > 80 ? '#4a4' : derivedData.similarity > 50 ? '#ff0' : '#f44'}`,
          borderRadius: '4px',
          color: '#fff',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 9998,
          transition: 'all 0.2s',
          backdropFilter: 'blur(4px)',
        }}
        onClick={toggleVisibility}
      >
        <div style={{ fontWeight: 'bold' }}>Press [H] for Debug</div>
        <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
          Sim: {derivedData.similarity.toFixed(0)}%
        </div>
      </div>
    );
  }

  // Panel completo
  return (
    <div
      key={`hud-${derivedData.similarity.toFixed(1)}-${derivedData.activeChangesLength}`}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '500px',
        maxHeight: '90vh',
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        border: '2px solid #4a4',
        borderRadius: '8px',
        color: '#fff',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 0 40px #4a4 40',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #4a4 40',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#4a4 20',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#4a4' }}>
            🌿 CLAMP Debug HUD
          </h2>
          <p style={{ margin: '0', fontSize: '10px', color: '#999' }}>
            Press [1/2/3] to switch views | [T/P/F] for debug
          </p>
        </div>
        <button
          onClick={toggleVisibility}
          style={{
            padding: '6px 10px',
            backgroundColor: 'transparent',
            border: '1px solid #666',
            color: '#aaa',
            cursor: 'pointer',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          ✕
        </button>
      </div>

      {/* View Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px',
          borderBottom: '1px solid #333',
          backgroundColor: '#0a0a0f',
        }}
      >
        {(['overview', 'detailed', 'changes'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => switchViewMode(mode)}
            style={{
              flex: 1,
              padding: '6px',
              backgroundColor: hud.viewMode === mode ? '#4a4 30' : 'transparent',
              border: `1px solid ${hud.viewMode === mode ? '#4a4' : '#333'}`,
              color: hud.viewMode === mode ? '#4a4' : '#666',
              cursor: 'pointer',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
          >
            {mode === 'overview' && '📊 Overview'}
            {mode === 'detailed' && '📈 Detailed'}
            {mode === 'changes' && '⚡ Changes'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          fontSize: '12px',
        }}
      >
        {/* OVERVIEW MODE */}
        {hud.viewMode === 'overview' && (
          <div>
            {/* Similarity Score Grande */}
            <div
              style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#0a0a0f',
                borderRadius: '6px',
                marginBottom: '12px',
                  border: `2px solid ${derivedData.similarity > 80 ? '#4a4' : derivedData.similarity > 50 ? '#ff0' : '#f44'}`,
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4a4' }}>
                  {derivedData.similarity.toFixed(0)}%
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                  CLAMP Similarity to Target
                </div>

                {/* Barra de similitud */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#222',
                    borderRadius: '2px',
                    marginTop: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${derivedData.similarity}%`,
                      height: '100%',
                      backgroundColor:
                        derivedData.similarity > 80
                          ? '#4a4'
                          : derivedData.similarity > 50
                            ? '#ff0'
                            : '#f44',
                      transition: 'width 0.3s ease-out',
                    }}
                  />
                </div>
              </div>

            {/* Fase actual & Progreso */}
            <div
              style={{
                padding: '10px',
                backgroundColor: '#1a1a1f',
                borderRadius: '4px',
                marginBottom: '12px',
                border: '1px solid #333',
              }}
            >
              <div style={{ color: '#4a4', fontWeight: 'bold', marginBottom: '4px' }}>
                📍 {derivedData.phaseInfo.name}
              </div>
              <div style={{ fontSize: '10px', color: '#999', marginBottom: '8px' }}>
                {derivedData.phaseInfo.era} ({derivedData.phaseInfo.ma} MYA)
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#222',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${derivedData.progress * 100}%`,
                      height: '100%',
                      backgroundColor:
                        derivedData.progress >= 1 ? '#4a4' : '#4a4 88',
                      transition: 'width 0.3s ease-out',
                    }}
                  />
                </div>
                <div style={{ fontSize: '9px', color: '#aaa', marginTop: '2px' }}>
                  {derivedData.currentPhase >= 4 ? '✅ Fase Final' : `${(derivedData.progress * 100).toFixed(0)}% hacia siguiente`}
                </div>
              </div>

              {/* Detalles de Requerimientos */}
              {derivedData.currentPhase < 4 && (
                <div style={{ fontSize: '9px', color: '#888', lineHeight: '1.4' }}>
                  <div>
                    ⏱️ Tiempo: <span style={{ color: derivedData.timeAccumulated >= derivedData.timeRequired ? '#4a4' : '#f88' }}>
                      {derivedData.timeAccumulated.toFixed(0)}s / {derivedData.timeRequired}s
                    </span>
                  </div>
                  <div>
                    🧩 Puzzles: <span style={{ color: derivedData.puzzlesCompleted >= derivedData.puzzlesRequired ? '#4a4' : '#f88' }}>
                      {derivedData.puzzlesCompleted} / {derivedData.puzzlesRequired}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Props más importantes (top 5 activas) */}
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa' }}>
                ⚡ Most Active Changes
              </h3>
              <PropertyComparisonWidget properties={activeChanges} maxShow={5} />
            </div>

            {/* Stats de zona */}
            {derivedData.dominantZone && (
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#1a1a1f',
                  borderRadius: '4px',
                  border: `1px solid ${derivedData.dominantZone.color}40`,
                }}
              >
                <div
                  style={{
                    color: derivedData.dominantZone.color,
                    fontWeight: 'bold',
                    marginBottom: '4px',
                  }}
                >
                  🏞️ Zone: {derivedData.dominantZone.type.toUpperCase()}
                </div>
                <div style={{ fontSize: '10px', color: '#999' }}>
                  {derivedData.dominantZone.description}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DETAILED MODE */}
        {hud.viewMode === 'detailed' && (
          <div>
            {propertyGroups.map((group) => (
              <PropertyGroupPanel
                key={group.category}
                group={group}
                expanded={
                  group.category === 'morphology'
                    ? hud.expandMorphology
                    : hud.expandBotanical
                }
                onToggle={(expanded) => {
                  if (group.category === 'morphology') {
                    toggleMorphology(expanded);
                  } else {
                    toggleBotanical(expanded);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* CHANGES MODE */}
        {hud.viewMode === 'changes' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#aaa' }}>
              Properties Changing ({activeChanges.length} active)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeChanges.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', fontSize: '11px' }}>
                  No significant changes detected
                </div>
              ) : (
                activeChanges.map((prop) => (
                  <PropertyBar
                    key={prop.key}
                    property={prop}
                    size="medium"
                    showNarrative={true}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Controles */}
      <div
        style={{
          padding: '8px',
          borderTop: '1px solid #333',
          backgroundColor: '#0a0a0f',
          fontSize: '9px',
          color: '#999',
        }}
      >
        <div style={{ marginBottom: '3px', color: '#aaa', fontWeight: 'bold' }}>
          🎮 VISTAS:
        </div>
        <div style={{ marginBottom: '4px', marginLeft: '4px' }}>
          <strong>[1]</strong> Overview | <strong>[2]</strong> Detailed | <strong>[3]</strong> Changes
        </div>

        <div style={{ marginBottom: '3px', color: '#aaa', fontWeight: 'bold' }}>
          🚀 AUTO-PROGRESO:
        </div>
        <div style={{ marginBottom: '4px', marginLeft: '4px' }}>
          Las fases avanzan automáticamente. Verifica el progreso arriba ↑
        </div>

        <div style={{ marginBottom: '3px', color: '#f88', fontWeight: 'bold' }}>
          🔧 DEBUG:
        </div>
        <div style={{ marginLeft: '4px' }}>
          <strong>[T]</strong>: +10s | <strong>[Shift+T]</strong>: -10s<br />
          <strong>[P]</strong>: Puzzle | <strong>[G]</strong>: Win Puzzle<br />
          <strong>[F]</strong>: Force Phase+ | <strong>[Shift+F]</strong>: Phase-<br />
          <strong>[H]</strong>: Toggle HUD
        </div>
      </div>
    </div>
  );
};

export default CLAMPDebugHUDRefactored;
