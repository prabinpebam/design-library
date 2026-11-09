/**
 * The presets dialog (Q70.2, Q70.4; F15.P2, F15.P3): a settings button in the library's title bar and in every
 * standalone template tab's floating toolbar opens it. Pick one global preset, or one preset per category; a choice
 * applies at once to the library and every open template tab (the store persists it and other tabs follow).
 * A mix that matches no preset can be saved under a name, as a global preset or as one category's preset; a person's
 * own presets can be renamed and deleted (with Undo). Built-in presets are read-only.
 */
import { useState, useSyncExternalStore } from 'react';
import { Button, Cluster, Dialog, Heading, notify, RadioGroup, Select, Stack, TextField, type ButtonSize } from '@design-library/core/react';
import {
  applyCategoryPreset,
  applyGlobalPreset,
  categoryPresets,
  currentGlobal,
  currentPreset,
  deletePreset,
  globalPresets,
  isUserPreset,
  presetCategories,
  presetsVersion,
  renamePreset,
  saveCategoryPreset,
  saveGlobalPreset,
  subscribePresets,
} from '@design-library/core/presets';

const CUSTOM = 'custom';
const GLOBAL = 'global';

export function PresetSettings({ size = 's' }: { size?: ButtonSize }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Presets" icon="settings" iconOnly emphasis="quiet" size={size} expanded={open} onClick={() => setOpen(true)} />
      <PresetDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** What is being named: a new preset for a scope (global or a category id), or a new name for one of the person's own. */
interface Naming {
  scope: string;
  renaming?: { id: string; name: string };
}

function PresetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useSyncExternalStore(subscribePresets, presetsVersion);
  const [naming, setNaming] = useState<Naming | null>(null);
  const close = () => {
    setNaming(null);
    onClose();
  };

  const global = currentGlobal();
  const globals = globalPresets().map((g) => ({ value: g.id, label: g.name, description: g.for, meta: g.builtIn ? undefined : 'Yours' }));
  if (!global) globals.push({ value: CUSTOM, label: 'Custom', description: 'Your own mix of the parts below', meta: undefined });

  const namesIn = (scope: string) => (scope === GLOBAL ? globalPresets() : categoryPresets(scope)).map((p) => p.name.trim().toLowerCase());

  /** The actions under a scope's choice: save a mix that matches nothing; rename or delete one of the person's own. */
  const actions = (scope: string, label: string, chosen: { id: string; name: string } | undefined) => {
    if (naming?.scope === scope) {
      return (
        <NameField
          key={naming.renaming?.id ?? 'new'}
          label={naming.renaming ? `New name for ${naming.renaming.name}` : `Name for this ${label}`}
          initial={naming.renaming?.name ?? ''}
          taken={namesIn(scope).filter((n) => n !== naming.renaming?.name.trim().toLowerCase())}
          action={naming.renaming ? 'Rename' : 'Save'}
          onSave={(name) => {
            if (naming.renaming) renamePreset(naming.renaming.id, name);
            else if (scope === GLOBAL) saveGlobalPreset(name);
            else saveCategoryPreset(scope, name);
            setNaming(null);
            notify({ subject: `preset-${scope}`, tone: 'success', message: naming.renaming ? `Renamed to ${name}` : `Saved ${name}` });
          }}
          onCancel={() => setNaming(null)}
        />
      );
    }
    if (!chosen) return <Button label={`Save as a ${label}`} icon="plus" emphasis="quiet" size="s" onClick={() => setNaming({ scope })} />;
    if (!isUserPreset(chosen.id)) return null;
    return (
      <Cluster gap="pair">
        <Button label="Rename" emphasis="quiet" size="s" onClick={() => setNaming({ scope, renaming: chosen })} />
        <Button
          label="Delete"
          emphasis="quiet"
          size="s"
          onClick={() => {
            const undo = deletePreset(chosen.id);
            notify({ subject: `preset-${scope}`, message: `Deleted ${chosen.name}`, action: { label: 'Undo', onAction: undo } });
          }}
        />
      </Cluster>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Presets"
      description="Applies at once to the library and every open template tab."
      actions={<Button label="Done" emphasis="primary" onClick={close} />}
    >
      <Stack gap="section">
        <Stack gap="item">
          <RadioGroup
            label="Preset"
            hint="Built-in presets can’t be changed. Change a part below, then save the mix as your own."
            options={globals}
            value={global?.id ?? CUSTOM}
            onChange={(id) => id !== CUSTOM && applyGlobalPreset(id)}
          />
          {actions(GLOBAL, 'preset', global)}
        </Stack>
        <Stack gap="group">
          <Heading level={3} size="label">
            Each part
          </Heading>
          {presetCategories().map((c) => {
            const current = currentPreset(c.id);
            const options = categoryPresets(c.id).map((p) => ({ value: p.id, label: p.name, description: p.for, group: p.builtIn ? 'Built in' : 'Yours' }));
            if (!current) options.push({ value: CUSTOM, label: 'Custom', description: 'Set on its library page', group: 'Yours' });
            return (
              <Stack key={c.id} gap="pair">
                <Select label={c.label} options={options} value={current?.id ?? CUSTOM} onChange={(id) => id !== CUSTOM && applyCategoryPreset(c.id, id)} />
                {actions(c.id, `${c.label.toLowerCase()} preset`, current)}
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Dialog>
  );
}

/** Names a preset: Save (or Rename) beside the field; a name must be new in its scope. */
function NameField({ label, initial, taken, action, onSave, onCancel }: { label: string; initial: string; taken: string[]; action: string; onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial);
  const [error, setError] = useState<string | undefined>();
  const submit = (text: string) => {
    const next = text.trim();
    if (!next) return setError('Give it a name');
    if (taken.includes(next.toLowerCase())) return setError(`There’s already a preset called ${next}`);
    onSave(next);
  };
  return (
    <Stack gap="item">
      <TextField
        label={label}
        value={name}
        placeholder="Launch week"
        maxLength={40}
        error={error}
        onCommit={(next) => {
          setName(next);
          setError(undefined);
        }}
      />
      <Cluster gap="pair">
        <Button label="Cancel" emphasis="quiet" size="s" onClick={onCancel} />
        <Button label={action} emphasis="primary" size="s" onClick={() => submit(name)} />
      </Cluster>
    </Stack>
  );
}
