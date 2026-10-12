import { useState, type Dispatch, type SetStateAction } from 'react';
import type { ExplorePanelTab, ExploreSettings, ShieldId } from '../config/explore-defaults';
import { SHIELD_IDS, SHIELD_LABELS } from '../config/explore-defaults';

interface DeveloperPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ExploreSettings;
  setSettings: Dispatch<SetStateAction<ExploreSettings>>;
}

function RangeSetting({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="dev-range">
      <span>{label}<output>{Number.isInteger(step) ? value : value.toFixed(1)}{suffix}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.currentTarget.value))} />
    </label>
  );
}

function CheckSetting({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="dev-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function DeveloperPanel({ open, onOpenChange, settings, setSettings }: DeveloperPanelProps) {
  const [tab, setTab] = useState<ExplorePanelTab>('character');

  const setShield = (id: ShieldId, enabled: boolean) => {
    setSettings((current) => {
      const shieldStates = { ...current.ship.shieldStates, [id]: enabled };
      return {
        ...current,
        ship: { ...current.ship, shieldStates, shieldsEnabled: SHIELD_IDS.every((shieldId) => shieldStates[shieldId]) },
      };
    });
  };

  return (
    <aside className={`explore-dev-panel${open ? ' is-open' : ''}`} aria-label="Exploration development controls">
      <button className="dev-panel-toggle" type="button" aria-expanded={open} onClick={() => onOpenChange(!open)}>
        <span className="status-dot" /> DEV CONTROLS <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="dev-panel-content">
          <div className="dev-panel-heading"><span>LIVE SCENE TUNING</span><span>SESSION ONLY</span></div>
          <div className="dev-tabs" role="tablist" aria-label="Development settings">
            {(['character', 'ship', 'scene'] as const).map((item) => (
              <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          {tab === 'character' && (
            <div className="dev-tab-content" role="tabpanel">
              <RangeSetting label="Walk speed" value={settings.character.walkSpeed} min={0.5} max={6} step={0.1} suffix=" m/s" onChange={(walkSpeed) => setSettings((current) => ({ ...current, character: { ...current.character, walkSpeed } }))} />
              <RangeSetting label="Run speed" value={settings.character.runSpeed} min={1} max={12} step={0.1} suffix=" m/s" onChange={(runSpeed) => setSettings((current) => ({ ...current, character: { ...current.character, runSpeed } }))} />
              <RangeSetting label="Turn rate" value={settings.character.turnSpeed} min={0.5} max={6} step={0.1} suffix=" rad/s" onChange={(turnSpeed) => setSettings((current) => ({ ...current, character: { ...current.character, turnSpeed } }))} />
              <RangeSetting label="Jump impulse" value={settings.character.jumpImpulse} min={2} max={10} step={0.1} suffix=" m/s" onChange={(jumpImpulse) => setSettings((current) => ({ ...current, character: { ...current.character, jumpImpulse } }))} />
            </div>
          )}

          {tab === 'ship' && (
            <div className="dev-tab-content" role="tabpanel">
              <RangeSetting label="Ship length" value={settings.ship.targetSize} min={48} max={160} step={4} suffix=" m" onChange={(targetSize) => setSettings((current) => ({
                ...current,
                ship: { ...current.ship, targetSize },
                scene: { ...current.scene, groundSize: Math.max(current.scene.groundSize, targetSize * 0.874 + 136) },
              }))} />
              <CheckSetting label="Show collision proxies" checked={settings.ship.showCollisionProxies} onChange={(showCollisionProxies) => setSettings((current) => ({ ...current, ship: { ...current.ship, showCollisionProxies } }))} />
              <CheckSetting label="All shields" checked={settings.ship.shieldsEnabled} onChange={(shieldsEnabled) => setSettings((current) => ({
                ...current,
                ship: {
                  ...current.ship,
                  shieldsEnabled,
                  shieldStates: Object.fromEntries(SHIELD_IDS.map((id) => [id, shieldsEnabled])) as Record<ShieldId, boolean>,
                },
              }))} />
              <details className="dev-shields-details">
                <summary>Individual shield emitters</summary>
                <div className="dev-shield-list">
                  {SHIELD_IDS.map((id) => (
                    <CheckSetting key={id} label={SHIELD_LABELS[id]} checked={settings.ship.shieldStates[id]} onChange={(enabled) => setShield(id, enabled)} />
                  ))}
                </div>
              </details>
            </div>
          )}

          {tab === 'scene' && (
            <div className="dev-tab-content" role="tabpanel">
              <RangeSetting label="Ground size" value={settings.scene.groundSize} min={Math.max(240, settings.ship.targetSize * 0.874 + 136)} max={480} step={12} suffix=" m" onChange={(groundSize) => setSettings((current) => ({ ...current, scene: { ...current.scene, groundSize } }))} />
              <RangeSetting label="Ambient light" value={settings.scene.ambientIntensity} min={0.1} max={2.5} step={0.05} onChange={(ambientIntensity) => setSettings((current) => ({ ...current, scene: { ...current.scene, ambientIntensity } }))} />
              <RangeSetting label="Fog distance" value={settings.scene.fogFar} min={100} max={600} step={10} suffix=" m" onChange={(fogFar) => setSettings((current) => ({ ...current, scene: { ...current.scene, fogFar } }))} />
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
