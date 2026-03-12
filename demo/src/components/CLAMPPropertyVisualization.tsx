import React, { useMemo } from 'react';
import type { PropertyVisualization, PropertyVisualizationGroup } from '../hooks/useLeafPropertyVisualization';

/**
 * PropertyBar.tsx
 * 
 * Componente profesional para mostrar una propiedad CLAMP.
 * Crea una visualización clara y llamativa de cambios.
 * 
 * CARACTERÍSTICAS:
 * - Barra animada con color dinámico
 * - Indicador de target
 * - Texto con valores
 * - Narrativa botánica
 * - Estado de convergencia
 */

interface PropertyBarProps {
  property: PropertyVisualization;
  showNarrative?: boolean;
  size?: 'small' | 'medium' | 'large';
  compact?: boolean;
}

export const PropertyBar: React.FC<PropertyBarProps> = ({
  property,
  showNarrative = true,
  size = 'medium',
  compact = false,
}) => {
  const sizing = {
    small: { height: '6px', fontSize: '9px', gap: '4px', padding: '4px' },
    medium: { height: '10px', fontSize: '11px', gap: '6px', padding: '6px' },
    large: { height: '14px', fontSize: '13px', gap: '8px', padding: '8px' },
  };

  const s = sizing[size];

  // Indicador visual de dirección del cambio
  const directionIcon = useMemo(() => {
    if (property.isConverging) return '▼'; // Convergiendo
    if (property.isMovingAway) return '▲'; // Alejándose
    return '─'; // Estable
  }, [property.isConverging, property.isMovingAway]);

  return (
    <div style={{ marginBottom: s.padding }}>
      {/* Header: Nombre + Narrativa */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: s.fontSize, fontWeight: 'bold', color: property.color }}>
            {property.label}
          </span>
          <span
            style={{
              fontSize: s.fontSize,
              color: property.color,
              opacity: 0.7,
              fontWeight: 'bold',
            }}
          >
            {directionIcon}
          </span>
        </div>

        {/* Valores */}
        <div style={{ fontSize: s.fontSize, color: '#aaa' }}>
          {property.current.toFixed(2)} → {property.target.toFixed(2)}
        </div>
      </div>

      {/* Barra */}
      <div
        style={{
          width: '100%',
          height: s.height,
          backgroundColor: '#222',
          borderRadius: '3px',
          marginTop: '4px',
          marginBottom: '4px',
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${property.color}40`,
        }}
      >
        {/* Barra de progreso */}
        <div
          style={{
            height: '100%',
            width: `${property.normalized * 100}%`,
            backgroundColor: property.color,
            borderRadius: '3px',
            transition: 'width 0.2s ease-out',
            boxShadow: `0 0 8px ${property.color}80, inset 0 0 4px ${property.color}40`,
          }}
        />

        {/* Indicador Target */}
        <div
          style={{
            position: 'absolute',
            left: `${Math.max(0, Math.min(100, (property.target - property.min) / (property.max - property.min) * 100))}%`,
            top: '0',
            height: '100%',
            width: '2px',
            backgroundColor: '#aaf',
            opacity: 0.8,
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      {/* Narrativa */}
      {showNarrative && !compact && (
        <div
          style={{
            fontSize: `${Math.max(8, parseInt(s.fontSize) - 2)}px`,
            color: '#999',
            fontStyle: 'italic',
            marginTop: '2px',
          }}
        >
          {property.description}
        </div>
      )}

      {/* Delta Percent (si está significativamente diferente) */}
      {property.delta > 0.1 && (
        <div
          style={{
            fontSize: `${Math.max(8, parseInt(s.fontSize) - 2)}px`,
            color: property.color,
            marginTop: '2px',
            opacity: property.intensity,
          }}
        >
          Δ {property.deltaPercent.toFixed(0)}% {property.isConverging ? '💚' : property.isMovingAway ? '📈' : '─'}
        </div>
      )}
    </div>
  );
};

/**
 * PropertyGroupPanel.tsx
 * 
 * Panel para un grupo de propiedades (Morphology o Botanical)
 */

interface PropertyGroupPanelProps {
  group: PropertyVisualizationGroup;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  compact?: boolean;
}

export const PropertyGroupPanel: React.FC<PropertyGroupPanelProps> = ({
  group,
  expanded = true,
  onToggle,
  compact = false,
}) => {
  return (
    <div
      style={{
        border: `2px solid ${group.groupColor}40`,
        borderRadius: '6px',
        padding: '10px',
        marginBottom: '10px',
        backgroundColor: `${group.groupColor}10`,
      }}
    >
      {/* Header del grupo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: onToggle ? 'pointer' : 'default',
          marginBottom: '8px',
        }}
        onClick={() => onToggle && onToggle(!expanded)}
      >
        <div>
          <h3
            style={{
              margin: '0 0 4px 0',
              fontSize: '14px',
              fontWeight: 'bold',
              color: group.groupColor,
            }}
          >
            {group.title}
            {expanded ? ' ▼' : ' ▶'}
          </h3>
          <p
            style={{
              margin: '0',
              fontSize: '11px',
              color: '#999',
              fontStyle: 'italic',
            }}
          >
            {group.description}
          </p>
        </div>

        {/* Indicador general */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '10px',
            color: group.groupColor,
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
            Δ {(group.groupDelta * 100).toFixed(0)}%
          </div>
          <div
            style={{
              width: '60px',
              height: '6px',
              backgroundColor: '#222',
              borderRadius: '2px',
              marginTop: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${group.groupDelta * 100}%`,
                height: '100%',
                backgroundColor: group.groupColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* Contenido (expandible) */}
      {expanded && (
        <div
          style={{
            maxHeight: expanded ? 'auto' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-out',
          }}
        >
          {group.properties.map((prop) => (
            <div key={prop.key}>
              <PropertyBar
                property={prop}
                showNarrative={!compact}
                size={compact ? 'small' : 'medium'}
                compact={compact}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * PropertyComparisonWidget.tsx
 * 
 * Widget compacto para mostrar cambios activos
 * Solo muestra propiedades que están cambiando significativamente
 */

interface PropertyComparisonWidgetProps {
  properties: PropertyVisualization[];
  maxShow?: number;
}

export const PropertyComparisonWidget: React.FC<PropertyComparisonWidgetProps> = ({
  properties,
  maxShow = 5,
}) => {
  const active = properties.slice(0, maxShow);

  if (active.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '10px',
          color: '#666',
          fontSize: '12px',
          fontStyle: 'italic',
        }}
      >
        No significant changes
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {active.map((prop) => (
        <div
          key={prop.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px',
            backgroundColor: `${prop.color}20`,
            borderRadius: '4px',
            border: `1px solid ${prop.color}40`,
          }}
        >
          {/* Nombre */}
          <span
            style={{
              flex: 1,
              fontSize: '11px',
              fontWeight: 'bold',
              color: prop.color,
            }}
          >
            {prop.label}
          </span>

          {/* Pequeña barra */}
          <div
            style={{
              width: '40px',
              height: '4px',
              backgroundColor: '#222',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${prop.normalized * 100}%`,
                height: '100%',
                backgroundColor: prop.color,
              }}
            />
          </div>

          {/* Delta % */}
          <span
            style={{
              fontSize: '10px',
              color: prop.color,
              fontWeight: 'bold',
              minWidth: '35px',
              textAlign: 'right',
            }}
          >
            {prop.deltaPercent.toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
};
