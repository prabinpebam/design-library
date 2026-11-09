import { useState } from 'react';
import { Button, type ButtonSize } from '../fundamentals/Button';
import { List } from '../fundamentals/List';
import { Cluster } from '../fundamentals/Cluster';
import { Grid } from '../fundamentals/Grid';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { TextField, type TextFieldProps } from '../fundamentals/TextField';
import { EmptyState } from '../compounds/EmptyState';
import { useFilter } from '../behaviour/filter';
import type { StoryFile } from './story';

/** A field backed by a save that takes `ms` and either stores the value or fails. */
function Field({ initial = '', ms = 400, fails = false, ...rest }: Omit<TextFieldProps, 'value' | 'onCommit'> & { initial?: string; ms?: number; fails?: boolean }) {
  const [stored, setStored] = useState(initial);
  const save = (next: string) =>
    new Promise<void>((resolve, reject) =>
      setTimeout(() => {
        if (fails) return reject(new Error('refused'));
        setStored(next);
        resolve();
      }, ms),
    );
  return <Field.Inner {...rest} value={stored} onCommit={save} />;
}
Field.Inner = TextField;

/** A field that checks its value as it's saved: an address without a dot is refused with a fix. */
function Checked() {
  const [value, setValue] = useState('studio@example');
  const error = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? undefined : 'Enter an email address with a domain, like ada@example.com.';
  return <TextField label="Contact email" type="email" value={value} error={error} onCommit={(next) => setValue(next)} />;
}

/** Dialling codes: choosing one sets the code and the number's format, shown as the example. */
const countries = [
  { value: 'in', flag: 'in' as const, label: 'India +91', short: '+91', example: '98765 43210' },
  { value: 'us', flag: 'us' as const, label: 'United States +1', short: '+1', example: '(555) 010-0199' },
  { value: 'gb', flag: 'gb' as const, label: 'United Kingdom +44', short: '+44', example: '07700 900123' },
  { value: 'de', flag: 'de' as const, label: 'Germany +49', short: '+49', example: '01512 3456789' },
  { value: 'jp', flag: 'jp' as const, label: 'Japan +81', short: '+81', example: '090-1234-5678' },
];

function Phone({ size }: { size?: ButtonSize }) {
  const [country, setCountry] = useState('in');
  const chosen = countries.find((c) => c.value === country) ?? countries[0];
  return (
    <Field
      size={size}
      label={size ? `Phone · ${size}` : 'Phone number'}
      type="tel"
      placeholder={chosen.example}
      hint={size ? undefined : 'Choose the country first; the example shows its format.'}
      prefixMenu={{ label: 'Country code', value: country, items: countries, onChange: setCountry }}
    />
  );
}

/** A field with an attached action; the last thing it did is said under it. */
function WithAction({ label, action, placeholder, size }: { label: string; action: TextFieldProps['action'] & object; placeholder?: string; size?: ButtonSize }) {
  const [said, setSaid] = useState('');
  const [value, setValue] = useState('');
  return (
    <Stack gap="pair">
      <TextField size={size} label={label} type="search" placeholder={placeholder} value={value} onCommit={setValue} action={{ ...action, onAction: (v) => setSaid(v ? `${action.label}: “${v}”` : `${action.label} with nothing typed`) }} />
      {!size && (
        <Text variant="caption" tone="muted">
          {said || 'Type, then press Enter or the button.'}
        </Text>
      )}
    </Stack>
  );
}

function ScopedSearch() {
  const [scope, setScope] = useState<string | null>('In: Tokens');
  return <Field label="Search the library" type="search" icon="search" clearable shortcut="/" placeholder="Colour, space, radius…" chip={scope ? { label: scope, onRemove: () => setScope(null) } : undefined} hint={scope ? 'Press / anywhere to search. Backspace at the start removes the scope.' : 'Press / anywhere to search.'} />;
}

const sizes: [ButtonSize, string][] = [
  ['xs', 'xs · 24 px'],
  ['s', 's · 36 px'],
  ['normal', 'normal · 44 px (default)'],
  ['m', 'm · 48 px'],
  ['l', 'l · 56 px'],
  ['xl', 'xl · 64 px'],
  ['xxl', 'xxl · 80 px'],
];

const walks = ['Morning over the hills', 'The desert in the last hour of light', 'The ridge at night', 'Low tide at the lagoon', 'First snow on the hills', 'Harvest time in the valley'];

/** IP14: onChange runs on every keystroke, so a list narrows as the person types; nothing is saved. */
function LiveFilter() {
  const [query, setQuery] = useState('');
  const shown = walks.filter((w) => w.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Stack gap="item">
      <TextField label="Find a walk" type="search" icon="search" mode="form" value={query} onChange={setQuery} placeholder="hills" clearable />
      <Text variant="body-sm" tone="muted">
        {shown.length === walks.length ? `${walks.length} walks` : `${shown.length} of ${walks.length} walks`}
      </Text>
      <List items={shown.map((w) => ({ id: w, content: w }))} />
    </Stack>
  );
}

/** IP29: the list narrows after a pause in typing and says its count once, politely, when it settles. */
const talks = ['Designing for slow networks', 'Type on small screens', 'Colour that holds in dark mode', 'Forms people finish', 'Maps without the clutter', 'Motion that respects the reader', 'Writing error messages', 'Charts on a phone', 'Search that forgives typos', 'Accessible tables', 'Café menus as interfaces', 'Night mode for reading'];

function FilterAsYouType() {
  const [query, setQuery] = useState('');
  const { shown, status, query: settled } = useFilter(talks, query, { count: (n, all) => (n === all ? `${all} talks` : `${n} of ${all} talks`) });
  return (
    <Stack gap="group">
      <Stack gap="item">
        <TextField label="Find a talk" type="search" icon="search" mode="form" value={query} onChange={setQuery} placeholder="screens" clearable />
        <Text variant="body-sm" tone="muted">
          {status}
        </Text>
      </Stack>
      {shown.length ? (
        <List items={shown.map((t) => ({ id: t, content: t }))} />
      ) : (
        <EmptyState reason="no-results" scope="component" headingLevel={3} title={`No talks match “${settled}”`} actions={<Button label="Clear the search" onClick={() => setQuery('')} />}>
          Try one word, or fewer letters.
        </EmptyState>
      )}
    </Stack>
  );
}

/** IP14: fields in a form save together with one button; no field saves or says "Saved" on its own. */
function InForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const emailError = tried && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? 'Enter an email address with a domain, like ada@example.com.' : undefined;
  const nameError = tried && !name.trim() ? 'Enter your name.' : undefined;
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setTried(true);
        setSent(false);
        if (!name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
        setSending(true);
        window.setTimeout(() => {
          setSending(false);
          setSent(true);
        }, 800);
      }}
    >
      <Stack gap="group">
        <TextField label="Your name" name="name" mode="form" value={name} onChange={setName} error={nameError} />
        <TextField label="Email" name="email" type="email" mode="form" value={email} onChange={setEmail} error={emailError} />
        <Stack gap="item">
          <Cluster>
            <Button type="submit" emphasis="primary" label="Send enquiry" busy={sending} pendingLabel="Sending…" />
          </Cluster>
          {sent && <Text tone="success">Sent. We’ll answer within two working days.</Text>}
        </Stack>
      </Stack>
    </form>
  );
}

export default {
  component: 'TextField',
  tier: 'fundamental',
  summary: 'One line of text saved on its own when the person leaves the field.',
  stories: [
    {
      title: 'Sizes',
      description: 'Seven box heights on the Button scale, so a field sits level with the buttons beside it. The label and hint keep their size; xs and s are dense surfaces only.',
      code: `<TextField size="xs" label="Filter tokens" icon="search" clearable value={q} onCommit={setQ} />  // xs, s, normal (default), m, l, xl, xxl`,
      render: () => (
        <Stack gap="group">
          {sizes.map(([size, name]) => (
            <Grid key={size} max={2}>
              <Field size={size} label={`Search · ${name}`} icon="search" clearable placeholder="Colour, space, radius…" initial="accent" />
              <Field size={size} label={`Weight · ${name}`} suffix="kg" initial="12.5" />
            </Grid>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Types and content',
      description: 'One field for every one-line value: a leading icon, fixed text before or after the value, a Clear button, a character count, and hidden text with Show. Each extra is read with the field.',
      code: `<TextField label="Search the library" type="search" icon="search" clearable value={q} onCommit={setQ} />
<TextField label="Site address" type="url" prefix="https://" value={url} onCommit={save} />
<TextField label="Price" prefix="£" suffix="per month" value={price} onCommit={save} />
<TextField label="Short bio" maxLength={60} value={bio} onCommit={save} />
<TextField label="Password" type="password" value={pw} onCommit={save} />`,
      render: () => (
        <Grid max={2}>
          <Field label="Search the library" type="search" icon="search" clearable placeholder="Colour, space, radius…" />
          <Field label="Site address" type="url" prefix="https://" initial="studio.example.com" />
          <Field label="Price" prefix="£" suffix="per month" initial="12" />
          <Field label="Short bio" maxLength={60} initial="Designs calm interfaces for busy people." hint="Shown under your name." />
          <Field label="Password" type="password" initial="correct horse" hint="At least 12 characters." />
          <Field label="Display name" optional placeholder="Ada" hint="Shown to people you invite." />
        </Grid>
      ),
    },
    {
      title: 'Phone number: a country code before the box',
      description: 'The code is a menu button attached to the box. Choosing a country sets the code and the example format. The flags are drawn from an SVG set (flag-icons, MIT), so they look the same on every system; the flag is decoration, the code is the information.',
      code: `<TextField label="Phone number" type="tel" placeholder={example}
  prefixMenu={{ label: 'Country code', value: country, items: countries, onChange: setCountry }} value={phone} onCommit={save} />`,
      render: () => (
        <Grid max={2}>
          <Phone />
        </Grid>
      ),
    },
    {
      title: 'With a button: search, send',
      description: 'A button attached after the box acts on what’s typed; Enter presses it too. Icon only when the icon says it all (search), icon and label otherwise, primary only for the view’s main action.',
      code: `<TextField label="Search tokens" type="search" action={{ label: 'Search', icon: 'search', iconOnly: true, onAction: search }} … />
<TextField label="Search tokens" type="search" action={{ label: 'Search', icon: 'search', onAction: search }} … />
<TextField label="Invite by email" type="email" action={{ label: 'Send invite', emphasis: 'primary', onAction: invite }} … />`,
      render: () => (
        <Grid max={2}>
          <WithAction label="Search tokens" placeholder="Accent, radius…" action={{ label: 'Search', icon: 'search', iconOnly: true, onAction: () => undefined }} />
          <WithAction label="Search components" placeholder="Button, field…" action={{ label: 'Search', icon: 'search', onAction: () => undefined }} />
          <WithAction label="Invite by email" placeholder="ada@example.com" action={{ label: 'Send invite', emphasis: 'primary', onAction: () => undefined }} />
        </Grid>
      ),
    },
    {
      title: 'Attached parts at every size',
      description: 'The code menu, the box and the button share one height at all seven sizes: they read the same size tokens, as the split button does.',
      code: `<TextField size="xs" prefixMenu={…} … />  <TextField size="xs" action={{ label: 'Search', icon: 'search', iconOnly: true, … }} … />`,
      render: () => (
        <Stack gap="group">
          {sizes.map(([size]) => (
            <Grid key={size} max={2}>
              <Phone size={size} />
              <WithAction size={size} label={`Search · ${size}`} placeholder="Accent, radius…" action={{ label: 'Search', icon: 'search', onAction: () => undefined }} />
            </Grid>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Search with a shortcut and a scope',
      description: 'The key that jumps here shows while the field is empty and not focused. A scope chip narrows the search; remove it with its button or Backspace at the start.',
      code: `<TextField label="Search the library" type="search" icon="search" clearable shortcut="/"
  chip={{ label: 'In: Tokens', onRemove: clearScope }} value={q} onCommit={setQ} />`,
      render: () => (
        <Grid max={2}>
          <ScopedSearch />
        </Grid>
      ),
    },
    {
      title: 'Keyboards and units',
      description: 'The right on-screen keyboard for the value, and the unit after it. A number someone types but never steps (a postcode, a card number) stays a text field; numbers to adjust are NumberField.',
      code: `<TextField label="Postcode" inputMode="numeric" … />
<TextField label="Amount" inputMode="decimal" prefix="₹" … />
<TextField label="Work email" type="email" … />
<TextField label="Website" type="url" prefix="https://" … />`,
      render: () => (
        <Grid max={2}>
          <Field label="Postcode" inputMode="numeric" placeholder="560001" />
          <Field label="Amount" inputMode="decimal" prefix="₹" placeholder="1,250.00" />
          <Field label="Work email" type="email" placeholder="ada@example.com" />
          <Field label="Website" type="url" prefix="https://" placeholder="studio.example.com" />
          <Field label="Height" inputMode="decimal" suffix="cm" placeholder="172" />
          <Field label="Domain" suffix=".example.com" placeholder="studio" />
        </Grid>
      ),
    },
    {
      title: 'One-time code',
      description: 'One field drawn as a cell per digit: type or paste the code (the phone’s autofill offers it); it saves as soon as it’s complete. A screen reader hears the label and “6 digits”, never six boxes.',
      code: `<TextField label="Verification code" type="code" length={6} hint="Sent to •••• 0199." value={code} onCommit={verify} />`,
      render: () => (
        <Stack gap="group">
          <Field label="Verification code" type="code" length={6} hint="Sent to •••• 0199." ms={900} />
          <Field label="Sign-in code" type="code" length={4} size="s" />
        </Stack>
      ),
    },
    {
      title: 'Grouped, letters and PIN',
      description: 'Groups make a long code easier to copy by eye; pasting “123-456” or “123 456” still fills every cell. Letters and digits take `inputMode="text"`. A PIN draws dots and is a password field, so it isn’t read aloud or kept by autofill.',
      code: `<TextField label="Verification code" type="code" length={6} group={3} … />
<TextField label="Recovery code" type="code" length={8} group={4} inputMode="text" … />
<TextField label="Card PIN" type="code" length={4} masked … />`,
      render: () => (
        <Stack gap="group">
          <Field label="Verification code" type="code" length={6} group={3} hint="Sent to •••• 0199." />
          <Field label="Recovery code" type="code" length={8} group={4} inputMode="text" hint="Letters and digits, from the list you saved." />
          <Field label="Card PIN" type="code" length={4} masked />
        </Stack>
      ),
    },
    {
      title: 'States',
      description: 'Hover, focus and type in each. Invalid says what to fix and keeps the text; read-only shows a value that can be selected and copied but not changed; disabled is for a value that needn’t be read.',
      code: `<TextField label="Contact email" error="Enter an email address with a domain, like ada@example.com." … />
<TextField label="Account ID" readOnly value="acc-2041" … />
<TextField label="Region" disabled value="Europe" hint="Set by your organisation." … />`,
      render: () => (
        <Grid max={2}>
          <Field label="Project name" initial="Spring trip" />
          <Checked />
          <Field label="Account ID" readOnly initial="acc-2041" hint="Copy it for support requests." />
          <Field label="Region" disabled initial="Europe" hint="Set by your organisation." />
        </Grid>
      ),
    },
    {
      title: 'Saving',
      description: 'Change the text, then press Enter or Tab away. The outline takes the commit colour with a spinner, then a tick says it’s saved. An instant save still holds the beat; Clear saves the empty value the same way.',
      code: `<TextField label="Display name" value={name} onCommit={slowSave} />
<TextField label="Short code" value={code} clearable onCommit={instantSave} />`,
      render: () => (
        <Grid max={2}>
          <Field label="Display name" initial="Ada" ms={1200} />
          <Field label="Short code" initial="SPR-24" clearable ms={0} />
        </Grid>
      ),
    },
    {
      title: 'Failed save',
      description: 'Change the text and leave the field. The text stays as typed, the field says what happened, and offers Retry or Revert.',
      code: `<TextField label="Site address" type="url" prefix="https://" value={url} onCommit={failingSave} />`,
      render: () => (
        <Stack gap="item">
          <Field label="Site address" type="url" prefix="https://" initial="example.com" fails />
          <Text variant="caption" tone="muted">
            The save here always fails, to show the recovery.
          </Text>
        </Stack>
      ),
    },
    {
      title: 'Live as you type',
      description: 'onChange runs on every keystroke, so a list narrows while the person types; with mode="form" nothing is saved and nothing announces. The count under the field says how many are left.',
      code: `<TextField label="Find a walk" type="search" icon="search" mode="form" value={query} onChange={setQuery} clearable />`,
      render: () => <LiveFilter />,
    },
    {
      title: 'Filter as you type',
      description: 'useFilter narrows the list after a short pause in typing (the filter-delay token, 250 ms), matching every word and ignoring case and accents. The count under the field is said once, politely, when the list settles; clearing brings everything back at once. No results: an EmptyState in the list’s place with a way out.',
      code: `const [query, setQuery] = useState('');
const { shown, status } = useFilter(talks, query, { count: (n, all) => (n === all ? \`\${all} talks\` : \`\${n} of \${all} talks\`) });

<Stack gap="group">
  <Stack gap="item">
    <TextField label="Find a talk" type="search" icon="search" mode="form" value={query} onChange={setQuery} clearable />
    <Text variant="body-sm" tone="muted">{status}</Text>
  </Stack>
  <List items={shown.map((t) => ({ id: t, content: t }))} />
</Stack>`,
      render: () => <FilterAsYouType />,
    },
    {
      title: 'In a form',
      description: 'mode="form": the fields save together with one Send button. No field saves on blur or says “Saved”; Enter submits the form; errors show on their fields when the form is sent, and the answers stay.',
      code: `<form onSubmit={send}>
  <TextField label="Your name" name="name" mode="form" value={name} onChange={setName} error={nameError} />
  <TextField label="Email" name="email" type="email" mode="form" value={email} onChange={setEmail} error={emailError} />
  <Button type="submit" emphasis="primary" label="Send enquiry" busy={sending} pendingLabel="Sending…" />
</form>`,
      render: () => <InForm />,
    },
  ],
} satisfies StoryFile;
