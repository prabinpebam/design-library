import { useState } from 'react';
import { Checkbox } from '../fundamentals/Checkbox';
import { Field, type FieldProps } from '../fundamentals/Field';
import { Link } from '../fundamentals/Link';
import { NumberField } from '../fundamentals/NumberField';
import { Select } from '../fundamentals/Select';
import { Stack } from '../fundamentals/Stack';
import { TextArea } from '../fundamentals/TextArea';
import { TextField } from '../fundamentals/TextField';
import type { StoryFile } from './story';

function Counted({ unit, max, initial, ...rest }: Omit<FieldProps, 'children' | 'count'> & { unit?: 'characters' | 'words'; max: number; initial: string }) {
  const [value, setValue] = useState(initial);
  return <Field {...rest} count={{ value, max, unit }}>{(control) => <input {...control} value={value} onChange={(e) => setValue(e.target.value)} />}</Field>;
}

function Contact() {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (k: string) => (on: boolean) => setPicked((p) => (on ? [...p, k] : p.filter((x) => x !== k)));
  return (
    <Field label="How should we contact you?" group hint="Choose at least one." error={picked.length ? undefined : 'Choose how we should contact you'}>
      {() => (
        <>
          <Checkbox label="Email" checked={picked.includes('email')} onChange={toggle('email')} />
          <Checkbox label="Phone" checked={picked.includes('phone')} onChange={toggle('phone')} />
          <Checkbox label="Text message" checked={picked.includes('text')} onChange={toggle('text')} />
        </>
      )}
    </Field>
  );
}

function TimeZone() {
  const [zone, setZone] = useState('ist');
  const zones = [
    { value: 'ist', label: 'India (UTC+05:30)' },
    { value: 'utc', label: 'UTC' },
    { value: 'gmt', label: 'London (UTC+00:00)' },
    { value: 'pst', label: 'Los Angeles (UTC−08:00)' },
  ];
  return <Select label="Time zone" orientation="horizontal" hint="Used for review times." options={zones} value={zone} onChange={setZone} />;
}

function Cell({ label, initial, size = 'xs' }: { label: string; initial: string; size?: 'xs' | 's' }) {
  const [value, setValue] = useState(initial);
  return <TextField label={label} hideLabel size={size} value={value} onCommit={setValue} />;
}

function TightLayouts() {
  const [note, setNote] = useState('Ship the focus ring change before the review.');
  const [width, setWidth] = useState(320);
  const [height, setHeight] = useState(180);
  const [tag, setTag] = useState('');
  return (
    <Stack gap="group">
      <Stack gap="pair">
        <Cell label="First name" initial="Asha" size="s" />
        <Cell label="Last name" initial="Rao" size="s" />
        <Cell label="Role" initial="Designer" size="s" />
      </Stack>
      <TextField label="Add a tag" hideLabel value={tag} onCommit={setTag} placeholder="research" action={{ label: 'Add', onAction: setTag }} />
      <Stack gap="pair">
        <NumberField label="W" value={width} onCommit={setWidth} size="s" />
        <NumberField label="H" value={height} onCommit={setHeight} size="s" />
      </Stack>
      <table>
        <thead>
          <tr><th scope="col">Item</th><th scope="col">Owner</th><th scope="col">Due</th></tr>
        </thead>
        <tbody>
          <tr><td><Cell label="Item, row 1" initial="Tokens" /></td><td><Cell label="Owner, row 1" initial="Asha" /></td><td><Cell label="Due, row 1" initial="Friday" /></td></tr>
          <tr><td><Cell label="Item, row 2" initial="Field ring" /></td><td><Cell label="Owner, row 2" initial="Ravi" /></td><td><Cell label="Due, row 2" initial="Monday" /></td></tr>
        </tbody>
      </table>
      <TextArea label="Note" value={note} onChange={setNote} rows={2} />
    </Stack>
  );
}
export default {
  component: 'Field',
  tier: 'fundamental',
  summary: 'The anatomy every input shares: label, control, hint, one message line and a soft count, wired together by id.',
  stories: [
    {
      title: 'Label, control and hint',
      description: 'The label above, short, sentence case, no colon; the hint under the control says the format or where to find it. Any control takes the wiring: here a native email input.',
      code: `<Field label="Email address" hint="We only use it to send the receipt.">
  {(control) => <input {...control} type="email" autoComplete="email" />}
</Field>`,
      render: () => (
        <Field label="Email address" hint="We only use it to send the receipt.">
          {(control) => <input {...control} type="email" autoComplete="email" />}
        </Field>
      ),
    },
    {
      title: 'Optional and required',
      description: 'Fields are required by default, so only the optional ones are marked. On the rare form where most fields are optional, mark the required ones instead.',
      code: `<Field label="Company" necessity="optional">…</Field>
<Field label="Full name" necessity="required">…</Field>`,
      render: () => (
        <>
          <Field label="Company" necessity="optional">{(control) => <input {...control} autoComplete="organization" />}</Field>
          <Field label="Full name" necessity="required">{(control) => <input {...control} autoComplete="name" />}</Field>
        </>
      ),
    },
    {
      title: 'Error, warning and success',
      description: 'One message line at a time. An error says what is wrong and how to fix it and marks the control invalid; a warning cautions without stopping; success confirms a check that could have failed.',
      code: `<Field label="Project name" error="Enter a project name">…</Field>
<Field label="Project name" warning="Another project in this team has this name">…</Field>
<Field label="Username" success="Username available">…</Field>`,
      render: () => (
        <>
          <Field label="Project name" error="Enter a project name">{(control) => <input {...control} />}</Field>
          <Field label="Project name" warning="Another project in this team has this name">{(control) => <input {...control} defaultValue="Atlas" />}</Field>
          <Field label="Username" hint="Letters, digits and hyphens." success="Username available">{(control) => <input {...control} defaultValue="prabin" />}</Field>
        </>
      ),
    },
    {
      title: 'Soft count',
      description: 'Says how many are left; typing past the limit keeps every character and shows the excess as an error, so nothing is lost. Characters or words. Announced only near the limit.',
      code: `<Field label="Summary" count={{ value, max: 60 }}>…</Field>
<Field label="Bio" count={{ value, max: 12, unit: 'words' }}>…</Field>`,
      render: () => (
        <>
          <Counted label="Summary" max={60} initial="Quarterly review of the design library" />
          <Counted label="Bio" unit="words" max={12} initial="Designer and builder of calm tools for careful teams who ship often and well" />
        </>
      ),
    },
    {
      title: 'Label beside the control',
      description: 'For dense settings and property panels: the label takes a third of the row, centred on the control; hints and messages stay under the control.',
      code: `<Field label="Display name" orientation="horizontal">…</Field>
<Select label="Time zone" orientation="horizontal" options={zones} value={zone} onChange={setZone} />`,
      render: () => (
        <>
          <Field label="Display name" orientation="horizontal">{(control) => <input {...control} defaultValue="Design library" />}</Field>
          <TimeZone />
          <Field label="Website" orientation="horizontal" necessity="optional" error="Enter a web address, like example.com">{(control) => <input {...control} type="url" defaultValue="design library" />}</Field>
        </>
      ),
    },
    {
      title: 'A group of controls',
      description: 'Several controls answer one question: a fieldset named by its legend, with the hint and error said for the whole group. Each control keeps its own label.',
      code: `<Field label="How should we contact you?" group hint="Choose at least one." error={…}>
  {() => <><Checkbox label="Email" … /><Checkbox label="Phone" … /></>}
</Field>`,
      render: () => <Contact />,
    },
    {
      title: 'An action beside the label',
      description: 'One action at the end of the label row, such as a way to recover what the field asks for.',
      code: `<Field label="Password" action={<Link href="#/field">Forgot password?</Link>}>…</Field>`,
      render: () => (
        <Field label="Password" action={<Link href="#/field">Forgot password?</Link>}>
          {(control) => <input {...control} type="password" autoComplete="current-password" />}
        </Field>
      ),
    },
    {
      title: 'The label as the page heading',
      description: 'On a page that asks one question, the label is the page’s heading, so the question is said once.',
      code: `<Field label="What is your date of birth?" heading hint="For example, 27 3 1990">…</Field>`,
      render: () => (
        <Field label="What is your date of birth?" heading hint="For example, 27 3 1990">
          {(control) => <input {...control} type="date" autoComplete="bday" />}
        </Field>
      ),
    },
    {
      title: 'Read-only and unavailable',
      description: 'Read-only shows the value and stays focusable and selectable; unavailable dims the field and needn’t be read. Prefer read-only, or say why in the hint.',
      code: `<Field label="Account ID" readOnly>…</Field>
<Field label="Team" disabled hint="Only owners can change the team.">…</Field>`,
      render: () => (
        <>
          <Field label="Account ID" readOnly>{(control) => <input {...control} defaultValue="dl-20481" />}</Field>
          <Field label="Team" disabled hint="Only owners can change the team.">{(control) => <input {...control} defaultValue="Design systems" />}</Field>
        </>
      ),
    },
    {
      title: 'Focus in tight layouts',
      description: 'Every text-entry box shows focus as one ring drawn over its own outline, inward, with no offset: it moves nothing and never reaches past the box, so fields 4 px apart, an attached action and table cells stay clear of each other. Tab through them. The ring is a layer the box owns (`data-dl-ring`), painted from `c.field.ring-color` and `c.field.ring-width`; a state can paint it with a gradient. In forced colours it draws in Highlight.',
      code: `<Stack gap="pair">
  <TextField label="First name" hideLabel size="s" … />
  <TextField label="Last name" hideLabel size="s" … />
</Stack>
<TextField label="Add a tag" hideLabel action={{ label: 'Add', onAction }} … />
<td><TextField label="Owner, row 1" hideLabel size="xs" … /></td>`,
      render: () => <TightLayouts />,
    },
  ],
} satisfies StoryFile;
