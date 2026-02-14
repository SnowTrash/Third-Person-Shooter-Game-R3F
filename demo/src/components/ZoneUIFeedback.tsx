import { useInfluenceZones, type ZoneType } from '../context/InfluenceZoneContext';

const ZONE_DESCRIPTIONS: Record<ZoneType, { name: string; color: string; effect: string }> = {
  'ice': { name: 'Ice Zone', color: '#87CEEB', effect: 'Slippery - Movement reduced to 50%' },
  'jump_boost': { name: 'Jump Boost', color: '#FFD700', effect: 'Increased jump height - 150% power' },
  'damage': { name: 'Hazard Zone', color: '#FF6B6B', effect: 'Freezing - Movement disabled' },
  'slow': { name: 'Tar Zone', color: '#8B4513', effect: 'Sticky - Movement reduced to 60%' },
  'speed_boost': { name: 'Speed Boost', color: '#00FF00', effect: 'Enhanced movement - 150% speed' },
};

export const ZoneUIFeedback: React.FC = () => {
  const { playerZoneState } = useInfluenceZones();
  const { dominantZone, isInZone } = playerZoneState;

  if (!isInZone || !dominantZone) {
    return null;
  }

  const zoneInfo = ZONE_DESCRIPTIONS[dominantZone.type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: `3px solid ${zoneInfo.color}`,
        borderRadius: '8px',
        padding: '15px 20px',
        fontFamily: 'Arial, sans-serif',
        color: zoneInfo.color,
        zIndex: 9998,
        minWidth: '250px',
        boxShadow: `0 0 20px ${zoneInfo.color}80, inset 0 0 10px ${zoneInfo.color}20`,
        backdropFilter: 'blur(8px)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    >
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
        ⚡ {zoneInfo.name}
      </div>
      <div style={{ fontSize: '14px', opacity: 0.9 }}>
        {zoneInfo.effect}
      </div>
      <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
        Radius: {dominantZone.radius.toFixed(1)}m
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px ${zoneInfo.color}80, inset 0 0 10px ${zoneInfo.color}20;
          }
          50% {
            box-shadow: 0 0 30px ${zoneInfo.color}ff, inset 0 0 15px ${zoneInfo.color}40;
          }
        }
      `}</style>
    </div>
  );
};
