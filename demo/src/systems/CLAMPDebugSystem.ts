import { create } from 'zustand';
import { LeafProperties } from './LeafGeometrySystem';

/**
 * CLAMP Debug System
 * Proporciona herramientas para debuggear parámetros CLAMP en tiempo real
 * Útil para ajustar morphing hacia formas específicas (ej: Quercus)
 */

export interface CLAMPDebugState {
  // De qué estamos debuggeando
  isDebugMode: boolean;
  selectedProperty: keyof LeafProperties | null;
  
  // Perfiles guardados para quick-load
  savedProfiles: Record<string, LeafProperties>;
  
  // Valores override (para testing de parámetros específicos)
  debugOverrides: Partial<LeafProperties>;
  
  // Target profiles predefinidos (científicos)
  targetProfiles: Record<string, LeafProperties>;
  
  // Historial de cambios para rollback
  changeHistory: Array<{ timestamp: number; property: string; from: number; to: number }>;
  
  // Métodos
  toggleDebugMode: () => void;
  setSelectedProperty: (prop: keyof LeafProperties | null) => void;
  setDebugOverride: (property: keyof LeafProperties, value: number) => void;
  clearDebugOverrides: () => void;
  saveProfile: (name: string, profile: LeafProperties) => void;
  loadProfile: (name: string) => LeafProperties | null;
  getHumanReadableName: (property: keyof LeafProperties) => string;
  recordChange: (property: string, from: number, to: number) => void;
  undoLastChange: () => void;
}

// Nombres legibles en español para debugging
const propertyNames: Record<keyof LeafProperties, string> = {
  width: 'Ancho',
  length: 'Largo',
  pointiness: 'Puntería',
  surface: 'Superficie',
  thickness: 'Grosor',
  lobed: 'Lóbulos',
  teeth: 'Dientes',
  teethRegularity: 'Regularidad Dientes',
  teethCloseness: 'Cercanía Dientes',
  teethRounded: 'Dientes Redondeados',
  teethAcute: 'Dientes Agudos',
  teethCompound: 'Dientes Compuestos',
  apexEmarginate: 'Ápice Emarginado',
};

// Perfiles target científicos
const QUERCUS_TARGET: LeafProperties = {
  lobed: 0.95,           // Muy fuertemente lobulada
  teeth: 0.0,            // Completamente sin dientes
  teethRegularity: 0.5,  // N/A
  teethCloseness: 0.5,   // N/A
  teethRounded: 0.5,     // N/A
  teethAcute: 0.5,       // N/A
  teethCompound: 0.0,    // Sin compuestos
  apexEmarginate: 0.0,   // Ápice sólido
  width: 0.7,            // Moderadamente ancha
  length: 1.3,           // Más larga que ancha
  pointiness: 0.3,       // Lóbulos redondeados
  surface: 0.2,          // Muy lisa (coriácea)
  thickness: 0.35,       // Gruesa
};

const INTERMEDIATE_SIMPLE: LeafProperties = {
  ...QUERCUS_TARGET,
  lobed: 0.3,            // Ligeramente lobulada
  thickness: 0.15,
  width: 0.5,
  length: 1.0,
};

const INTERMEDIATE_MODERATE: LeafProperties = {
  ...QUERCUS_TARGET,
  lobed: 0.65,           // Moderadamente lobulada
  thickness: 0.25,
  width: 0.6,
  length: 1.15,
};

const targetProfiles: Record<string, LeafProperties> = {
  'Quercus (Bellotero Fósil)': QUERCUS_TARGET,
  'Forma Simple (Base)': INTERMEDIATE_SIMPLE,
  'Forma Intermedia': INTERMEDIATE_MODERATE,
};

export const useCLAMPDebugStore = create<CLAMPDebugState>((set) => ({
  isDebugMode: false,
  selectedProperty: null,
  debugOverrides: {},
  savedProfiles: {},
  targetProfiles,
  changeHistory: [],

  toggleDebugMode: () =>
    set((state) => ({
      isDebugMode: !state.isDebugMode,
    })),

  setSelectedProperty: (prop) =>
    set({
      selectedProperty: prop,
    }),

  setDebugOverride: (property, value) =>
    set((state) => ({
      debugOverrides: {
        ...state.debugOverrides,
        [property]: Math.max(0, Math.min(1, value)),
      },
    })),

  clearDebugOverrides: () =>
    set({
      debugOverrides: {},
      selectedProperty: null,
    }),

  saveProfile: (name, profile) =>
    set((state) => ({
      savedProfiles: {
        ...state.savedProfiles,
        [name]: profile,
      },
    })),

  loadProfile: (name) => {
    const store = useCLAMPDebugStore.getState();
    return store.savedProfiles[name] || null;
  },

  getHumanReadableName: (property) => propertyNames[property] || property,

  recordChange: (property, from, to) =>
    set((state) => ({
      changeHistory: [
        ...state.changeHistory,
        { timestamp: Date.now(), property, from, to },
      ].slice(-50), // Keep last 50 changes
    })),

  undoLastChange: () =>
    set((state) => {
      if (state.changeHistory.length === 0) return state;
      
      const lastChange = state.changeHistory[state.changeHistory.length - 1];
      const newOverrides = { ...state.debugOverrides };
      
      if (newOverrides[lastChange.property as keyof LeafProperties]) {
        newOverrides[lastChange.property as keyof LeafProperties] = lastChange.from;
      }
      
      return {
        debugOverrides: newOverrides,
        changeHistory: state.changeHistory.slice(0, -1),
      };
    }),
}));

/**
 * Hook para useObserveDebugMode
 * Activa debug mode con tecla 'D'
 */
export function useDebugKeyboard() {
  const toggleDebugMode = useCLAMPDebugStore((state) => state.toggleDebugMode);

  // Setup keyboard listener (hacer en useEffect en component)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      toggleDebugMode();
    }
  };

  return { handleKeyDown };
}
