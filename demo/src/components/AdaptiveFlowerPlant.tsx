/**
 * AdaptiveFlowerPlant
 * 
 * Planta que ADAPTA su forma basándose en CLAMP LeafProperties.
 * 
 * Diferencia con ProceduralFlower:
 * - ProceduralFlower: forma predefinida, siempre igual
 * - AdaptiveFlowerPlant: forma dinámica basada en leafProps
 * 
 * Arquitectura:
 * - Recibe LeafProperties (13 CLAMP values)
 * - Exagera cambios 2x para visualización clara
 * - Renderiza geometría generada en tiempo real
 * - Costo: una sola vez (memoizado)
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { generateLeafGeometry, type LeafProperties } from '../systems/LeafGeometrySystem';

interface AdaptiveFlowerPlantProps {
  /** CLAMP properties que determinan la forma */
  leafProps: LeafProperties;
  
  /** Posición en el mundo 3D */
  position: [number, number, number];
  
  /** Color de la planta */
  color: THREE.Color | string;
  
  /** Multiplicador de exageración (2 = 2x más cambio visual) */
  exaggeration?: number;
}

/**
 * Convierte string color a THREE.Color si es necesario
 */
const resolveColor = (color: THREE.Color | string): THREE.Color => {
  if (color instanceof THREE.Color) {
    return color;
  }
  return new THREE.Color(color);
};

/**
 * Exagera las propiedades de la hoja para visualización más clara
 * Manteniendo valores entre 0-1
 */
const exaggerateLeafProperties = (
  props: LeafProperties,
  factor: number = 2
): LeafProperties => {
  return {
    ...props,
    // CLAMP properties - exagerar botánicas
    lobed: Math.min(1, props.lobed * factor),
    teeth: Math.min(1, props.teeth * factor),
    teethCloseness: Math.min(1, props.teethCloseness * factor * 0.8),
    teethRegularity: Math.max(0, props.teethRegularity * (1 + factor * 0.3)),
    apexEmarginate: Math.min(1, props.apexEmarginate * factor * 0.7),
    
    // Morphology properties - cambios sutiles
    pointiness: Math.max(0, props.pointiness * (1 - factor * 0.1)),
    width: Math.max(0.3, props.width * (1 + factor * 0.1)),
    length: Math.max(0.5, Math.min(1.5, props.length * (1 + factor * 0.05))),
  };
};

/**
 * Componente: Planta adaptativa que refleja LeafProperties
 */
export const AdaptiveFlowerPlant: React.FC<AdaptiveFlowerPlantProps> = ({
  leafProps,
  position,
  color,
  exaggeration = 2,
}) => {
  // Exagerar propiedades para visualización clara
  const exaggeratedProps = useMemo(
    () => exaggerateLeafProperties(leafProps, exaggeration),
    [leafProps, exaggeration]
  );

  // Generar geometría basada en propiedades exageradas
  // Si las propiedades cambian, la geometría se regenera automáticamente
  const geometry = useMemo(
    () => generateLeafGeometry(exaggeratedProps),
    [exaggeratedProps]
  );

  const resolvedColor = useMemo(
    () => resolveColor(color),
    [color]
  );

  return (
    <mesh position={position} geometry={geometry}>
      <meshStandardMaterial
        color={resolvedColor}
        metalness={0.1}
        roughness={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Versión optimizada si necesitas muchas plantas
 * Usa React.memo para prevenir re-renders innecesarios
 */
export const AdaptiveFlowerPlantMemo = React.memo(AdaptiveFlowerPlant);
