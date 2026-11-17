/**
 * The alignui template's app (Q169): AlignUI's base components on one scrollable page, grouped by kind (fundamentals,
 * compounds) and AlignUI's categories, each preview an Example of core components only, at AlignUI's default
 * "medium" size (core size m, 40 px). The look comes from tokens/theme.json. No styles.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Router } from '@design-library/core/site';
import {
  Accordion,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  Cluster,
  Code,
  DataTable,
  DatePicker,
  Dialog,
  Example,
  FileUpload,
  Grid,
  LibraryLayout,
  Link,
  MenuButton,
  PageHeader,
  PageLayout,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  Rating,
  Section,
  SegmentedControl,
  Select,
  Sheet,
  SiteHeader,
  Slider,
  Stack,
  Switch,
  TableOfContents,
  Tabs,
  Text,
  TextArea,
  TextField,
  Tooltip,
  notify,
  type UploadItem,
  type MenuButtonItem,
} from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import type { AlignuiDemo, AlignuiRecord } from './types';

type Words = Record<string, string>;
const noop = () => undefined;

function Buttons({ w }: { w: Words }) {
  return (
    <Stack gap="item">
      <Cluster gap="item" align="center">
        <Button size="m" emphasis="primary" label={w.primary} onClick={noop} />
        <Button size="m" emphasis="strong" label={w.neutral} onClick={noop} />
        <Button size="m" label={w.stroke} onClick={noop} />
      </Cluster>
      <Cluster gap="item" align="center">
        <Button size="m" emphasis="quiet" label={w.ghost} onClick={noop} />
        <Button size="m" emphasis="danger" label={w.delete} onClick={noop} />
        <Button size="m" label={w.disabled} onClick={noop} disabled />
      </Cluster>
    </Stack>
  );
}

function ButtonSizes({ w }: { w: Words }) {
  const sizes = [
    ['m', w.medium],
    ['normal', w.small],
    ['s', w.xsmall],
    ['xs', w.xxsmall],
  ] as const;
  return (
    <Cluster gap="item" align="center">
      {sizes.map(([size, label]) => (
        <Button key={size} size={size} emphasis="primary" label={label} onClick={noop} />
      ))}
    </Cluster>
  );
}

function CompactButtons({ w }: { w: Words }) {
  const [busy, setBusy] = useState(false);
  const save = () => {
    setBusy(true);
    window.setTimeout(() => setBusy(false), 1600);
  };
  return (
    <Cluster gap="item" align="center">
      <Button size="m" emphasis="primary" icon="plus" label={w.newProject} onClick={noop} />
      <Button size="m" icon="save" label={w.save} busy={busy} pendingLabel={w.saving} onClick={save} />
      <Button size="s" icon="edit" iconOnly label={w.edit} onClick={noop} />
      <Button size="s" emphasis="quiet" icon="more" iconOnly label={w.more} onClick={noop} />
    </Cluster>
  );
}

function LinkButtons({ w, home }: { w: Words; home: string }) {
  return (
    <Cluster gap="group" align="center">
      <Button size="s" emphasis="quiet" tone="link" label={w.learnMore} onClick={noop} />
      <Link href={home}>{w.viewDocs}</Link>
    </Cluster>
  );
}

function Group({ w }: { w: Words }) {
  return (
    <ButtonGroup label={w.range} arrangement="attached">
      <Button size="s" label={w.day} onClick={noop} />
      <Button size="s" label={w.week} onClick={noop} />
      <Button size="s" label={w.month} onClick={noop} />
      <Button size="s" label={w.year} onClick={noop} />
    </ButtonGroup>
  );
}

// AlignUI's size names on core's scale, as ButtonSizes.
const sizesOf = (w: Words) => [['m', w.medium], ['normal', w.small], ['s', w.xsmall], ['xs', w.xxsmall]] as const;

function Dropdown({ w }: { w: Words }) {
  const [picked, setPicked] = useState('');
  const items: MenuButtonItem[] = [
    { value: 'profile', label: w.profile, icon: 'person', shortcut: 'Ctrl+P' },
    { value: 'settings', label: w.settings, icon: 'settings', shortcut: 'Ctrl+,' },
    { value: 'invite', label: w.invite, icon: 'plus', startsGroup: true },
    { value: 'signout', label: w.signOut, tone: 'danger' },
  ];
  return (
    <Stack gap="item">
      <MenuButton size="m" label={w.account} onSelect={setPicked} items={items} />
      <Cluster gap="item" align="center">
        {sizesOf(w).map(([size, label]) => (
          <MenuButton key={size} size={size} label={label} onSelect={setPicked} items={items} />
        ))}
      </Cluster>
      {picked && <Text variant="body-sm" tone="muted">{picked}</Text>}
    </Stack>
  );
}

function Inputs({ w }: { w: Words }) {
  const [email, setEmail] = useState('');
  const [query, setQuery] = useState('');
  return (
    <Stack gap="item">
      <TextField mode="form" size="m" type="email" label={w.email} placeholder={w.emailHint} value={email} onChange={setEmail} />
      <TextField mode="form" size="m" type="search" icon="search" label={w.search} placeholder={w.searchHint} value={query} onChange={setQuery} />
    </Stack>
  );
}

function InputStates({ w }: { w: Words }) {
  const [name, setName] = useState(w.invalidValue);
  return (
    <Stack gap="item">
      <TextField mode="form" size="m" label={w.disabled} placeholder={w.emailHint} value="" disabled />
      <TextField mode="form" size="m" label={w.username} value={name} onChange={setName} error={name.length < 3 ? w.invalidError : undefined} />
    </Stack>
  );
}

function Textarea({ w }: { w: Words }) {
  const [text, setText] = useState('');
  return <TextArea size="m" rows={4} label={w.message} placeholder={w.messageHint} value={text} onChange={setText} />;
}

function Choose({ w }: { w: Words }) {
  const [value, setValue] = useState('');
  const options = [w.portugal, w.japan, w.canada, w.kenya].map((label) => ({ value: label.toLowerCase(), label }));
  return (
    <Stack gap="item">
      <Select mode="form" size="m" label={w.country} placeholder={w.countryHint} value={value} onChange={setValue} options={options} />
      {sizesOf(w).slice(1).map(([size, label]) => (
        <Select key={size} mode="form" size={size} label={label} placeholder={w.countryHint} value={value} onChange={setValue} options={options} />
      ))}
    </Stack>
  );
}

function Checkboxes({ w }: { w: Words }) {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <Stack gap="item">
      {/* binary-setting: the Checkbox's own showcase entry; a consent or a choice in a form, saved with it, not a setting that acts at once */}
      <Checkbox label={w.terms} checked={a} onChange={setA} description={w.termsMore} />
      {/* binary-setting: the Checkbox's own showcase entry; a consent or a choice in a form, saved with it, not a setting that acts at once */}
      <Checkbox label={w.remember} checked={b} onChange={setB} />
      {/* binary-setting: the Checkbox's own showcase entry; a consent or a choice in a form, saved with it, not a setting that acts at once */}
      <Checkbox label={w.selectAll} checked="mixed" onChange={noop} />
      {/* binary-setting: the Checkbox's own showcase entry; a consent or a choice in a form, saved with it, not a setting that acts at once */}
      <Checkbox label={w.disabled} checked={false} onChange={noop} disabled />
    </Stack>
  );
}

function Radios({ w }: { w: Words }) {
  const [plan, setPlan] = useState('monthly');
  return (
    <RadioGroup
      size="normal"
      label={w.billing}
      value={plan}
      onChange={setPlan}
      options={[
        { value: 'monthly', label: w.monthly },
        { value: 'yearly', label: w.yearly },
        { value: 'lifetime', label: w.lifetime, disabled: true },
      ]}
    />
  );
}

function Switches({ w }: { w: Words }) {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <Stack gap="item">
      <Switch label={w.emailAlerts} checked={a} onChange={setA} />
      <Switch label={w.weeklyDigest} checked={b} onChange={setB} />
      <Switch label={w.disabled} checked={false} onChange={noop} disabled />
    </Stack>
  );
}

function Sliders({ w }: { w: Words }) {
  const [v, setV] = useState<number | number[]>(40);
  const [r, setR] = useState<number | number[]>([25, 75]);
  return (
    <Stack gap="group">
      <Slider label={w.volume} value={v} onChange={setV} min={0} max={100} />
      <Slider label={w.budget} value={r} onChange={setR} min={0} max={100} />
    </Stack>
  );
}

function Datepicker({ w }: { w: Words }) {
  const [day, setDay] = useState<string | null>('2026-11-17');
  return <DatePicker label={w.dueDate} value={day} onChange={setDay} />;
}

const people = ['Maya Chen', 'Alex Rivera', 'Sam Okafor', 'Ines Duarte', 'Kai Larsen'];

function Avatars({ w }: { w: Words }) {
  return (
    <Stack gap="item">
      <Cluster gap="item" align="center">
        <Avatar name={people[0]} size={24} />
        <Avatar name={people[1]} size={32} />
        <Avatar name={people[2]} size={40} presence="available" />
        <Avatar name={people[3]} size={48} />
      </Cluster>
      <AvatarGroup label={w.team} size={32} max={3} members={people.map((name) => ({ name }))} />
    </Stack>
  );
}

function Badges({ w }: { w: Words }) {
  return (
    <Stack gap="item">
      <Cluster gap="pair" align="center">
        <Badge tone="info" emphasis="strong">{w.new}</Badge>
        <Badge tone="neutral" emphasis="strong">{w.beta}</Badge>
        <Badge tone="success" emphasis="strong">{w.live}</Badge>
        <Badge tone="danger" emphasis="strong">{w.overdue}</Badge>
      </Cluster>
      <Cluster gap="pair" align="center">
        <Badge tone="info">{w.new}</Badge>
        <Badge tone="neutral">{w.beta}</Badge>
        <Badge tone="success">{w.live}</Badge>
        <Badge tone="warning">{w.pending}</Badge>
        <Badge tone="danger">{w.overdue}</Badge>
        <Badge kind="count" count={8} />
      </Cluster>
    </Stack>
  );
}

function StatusBadges({ w }: { w: Words }) {
  return (
    <Cluster gap="pair" align="center">
      <Badge kind="status" tone="success" emphasis="outline">{w.completed}</Badge>
      <Badge kind="status" tone="warning" emphasis="outline">{w.pending}</Badge>
      <Badge kind="status" tone="danger" emphasis="outline">{w.failed}</Badge>
      <Badge kind="status" tone="neutral" emphasis="outline">{w.disabled}</Badge>
    </Cluster>
  );
}

function Tags({ w }: { w: Words }) {
  const [on, setOn] = useState<string[]>(['design']);
  const [kept, setKept] = useState(true);
  const toggle = (id: string) => (next: boolean) => setOn((x) => (next ? [...x, id] : x.filter((y) => y !== id)));
  return (
    <Cluster gap="pair" align="center">
      {(['design', 'research', 'marketing'] as const).map((id) => (
        <Chip key={id} size="s" kind="filter" label={w[id]} selected={on.includes(id)} onChange={toggle(id)} />
      ))}
      {kept && <Chip size="s" kind="input" label={w.figma} onRemove={() => setKept(false)} />}
    </Cluster>
  );
}

function Kbd({ w }: { w: Words }) {
  return (
    <Text variant="body-sm">
      {w.searchKeys} <Code kind="key">{w.ctrl}</Code> <Code kind="key">{w.k}</Code>
    </Text>
  );
}

function ProgressBar({ w }: { w: Words }) {
  return (
    <Stack gap="group">
      <Progress form="bar" label={w.storage} value={64} showLabel />
      <Progress form="bar" label={w.profileComplete} value={30} showLabel />
    </Stack>
  );
}

function RatingDemo({ w }: { w: Words }) {
  const [score, setScore] = useState<number | null>(4);
  return (
    <Stack gap="item">
      <Rating label={w.yourRating} value={score} onChange={setScore} clearable />
      <Rating label={w.average} value={4.3} readOnly showValue precision={0.5} size="s" />
    </Stack>
  );
}

function Tooltips({ w }: { w: Words }) {
  return (
    <Cluster gap="item" align="center">
      <Tooltip content={w.tooltipText}>
        <Button size="m" label={w.hoverMe} tooltip={false} onClick={noop} />
      </Tooltip>
      <Button size="m" icon="plus" iconOnly label={w.add} onClick={noop} />
    </Cluster>
  );
}

function Segmented({ w }: { w: Words }) {
  const [view, setView] = useState('overview');
  const [icon, setIcon] = useState('list');
  return (
    <Stack gap="item">
      <SegmentedControl
        label={w.view}
        value={view}
        onChange={setView}
        options={[
          { value: 'overview', label: w.overview },
          { value: 'activity', label: w.activity },
          { value: 'members', label: w.members },
        ]}
      />
      <SegmentedControl
        iconOnly
        label={w.layout}
        value={icon}
        onChange={setIcon}
        options={[
          { value: 'list', label: w.list, icon: 'list' },
          { value: 'grid', label: w.grid, icon: 'grid' },
          { value: 'board', label: w.board, icon: 'board' },
        ]}
      />
    </Stack>
  );
}

function Alerts({ w }: { w: Words }) {
  return (
    <Stack gap="item">
      <Alert tone="info" title={w.infoTitle} headingLevel={4}>{w.infoBody}</Alert>
      <Alert tone="success" title={w.successTitle} headingLevel={4}>{w.successBody}</Alert>
      <Alert tone="warning" title={w.warningTitle} headingLevel={4}>{w.warningBody}</Alert>
      <Alert tone="error" title={w.errorTitle} headingLevel={4} actions={<Button size="xs" label={w.retry} onClick={noop} />}>{w.errorBody}</Alert>
    </Stack>
  );
}

function Toasts({ w }: { w: Words }) {
  return (
    <Cluster gap="item" align="center">
      <Button size="m" label={w.showSuccess} onClick={() => notify({ tone: 'success', message: w.toastSaved })} />
      <Button size="m" label={w.showInfo} onClick={() => notify({ tone: 'info', message: w.toastInvite })} />
      <Button size="m" label={w.showError} onClick={() => notify({ tone: 'error', message: w.toastError })} />
    </Cluster>
  );
}

function AccordionDemo({ w }: { w: Words }) {
  return (
    <Accordion
      single
      headingLevel={4}
      defaultOpen={['q1']}
      items={[1, 2, 3].map((i) => ({ id: `q${i}`, title: w[`q${i}`], content: <Text variant="body-sm" tone="muted">{w[`a${i}`]}</Text> }))}
    />
  );
}

function BreadcrumbDemo({ w, home }: { w: Words; home: string }) {
  return <Breadcrumbs items={[{ label: w.home, href: home }, { label: w.projects, href: home }, { label: w.settings }]} />;
}

function tabItems(w: Words) {
  return [
    { id: 'overview', label: w.overview, panel: <Text variant="body-sm" tone="muted">{w.overviewBody}</Text> },
    { id: 'activity', label: w.activity, panel: <Text variant="body-sm" tone="muted">{w.activityBody}</Text> },
    { id: 'members', label: w.members, panel: <Text variant="body-sm" tone="muted">{w.membersBody}</Text> },
  ];
}

function TabHorizontal({ w }: { w: Words }) {
  return <Tabs size="normal" label={w.project} items={tabItems(w)} />;
}

function TabVertical({ w }: { w: Words }) {
  return <Tabs size="normal" orientation="vertical" label={w.project} items={tabItems(w)} />;
}

function PaginationDemo() {
  const [page, setPage] = useState(3);
  return <Pagination page={page} pages={12} onChange={setPage} />;
}

function Modal({ w }: { w: Words }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(w.workspaceValue);
  const close = () => setOpen(false);
  return (
    <>
      <Button size="m" label={w.openModal} onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onClose={close}
        size="s"
        title={w.modalTitle}
        description={w.modalBody}
        actions={
          <>
            <Button size="normal" label={w.cancel} onClick={close} />
            <Button size="normal" emphasis="primary" label={w.save} onClick={close} />
          </>
        }
      >
        <TextField mode="form" size="m" label={w.workspace} value={name} onChange={setName} />
      </Dialog>
    </>
  );
}

function Drawer({ w }: { w: Words }) {
  const [open, setOpen] = useState(false);
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button size="m" label={w.openDrawer} onClick={() => setOpen(true)} />
      <Sheet
        open={open}
        onClose={close}
        size="s"
        title={w.drawerTitle}
        description={w.drawerBody}
        actions={
          <>
            <Button size="m" label={w.cancel} onClick={close} />
            <Button size="m" emphasis="primary" label={w.save} onClick={close} />
          </>
        }
      >
        <Stack gap="item">
          <Switch label={w.emailAlerts} checked={a} onChange={setA} />
          <Switch label={w.weeklyDigest} checked={b} onChange={setB} />
        </Stack>
      </Sheet>
    </>
  );
}

function PopoverDemo({ w }: { w: Words }) {
  const [email, setEmail] = useState('');
  return (
    <Popover trigger={{ label: w.openPopover, size: 'm' }} title={w.popoverTitle} width="sm">
      <Stack gap="item">
        <TextField mode="form" size="m" type="email" label={w.email} placeholder={w.emailHint} value={email} onChange={setEmail} />
        <Button size="m" emphasis="primary" label={w.sendInvite} onClick={noop} />
      </Stack>
    </Popover>
  );
}

function TableDemo({ w }: { w: Words }) {
  const rows: [string, string, string, string][] = [
    [people[0], w.designer, w.completed, '$4,200'],
    [people[1], w.engineer, w.pending, '$3,850'],
    [people[2], w.manager, w.failed, '$5,100'],
  ];
  const tone = (s: string) => (s === w.completed ? 'success' : s === w.pending ? 'warning' : 'danger');
  return (
    <DataTable
      label={w.payroll}
      columns={[
        { key: 'name', header: w.name },
        { key: 'role', header: w.role },
        { key: 'status', header: w.status },
        { key: 'amount', header: w.amount },
      ]}
      rows={rows.map(([name, role, status, amount]) => ({
        id: name,
        cells: {
          name: (
            <Cluster gap="pair" align="center">
              <Avatar name={name} size={32} />
              <Text variant="body-sm">{name}</Text>
            </Cluster>
          ),
          role,
          status: <Badge kind="status" tone={tone(status)} emphasis="outline">{status}</Badge>,
          amount,
        },
      }))}
    />
  );
}

function Upload({ w }: { w: Words }) {
  const [files, setFiles] = useState<UploadItem[]>([
    { id: 'brief', name: 'project-brief.pdf', size: 2_400_000, status: 'done' },
    { id: 'cover', name: 'cover-art.png', size: 5_100_000, status: 'uploading', progress: 45 },
  ]);
  const add = (list: File[]) =>
    setFiles((x) => [...x, ...list.map((f) => ({ id: `${f.name}-${f.size}`, name: f.name, size: f.size, status: 'done' as const }))]);
  return (
    <FileUpload
      label={w.attachments}
      hint={w.attachmentsHint}
      multiple
      files={files}
      onAdd={add}
      onRemove={(id) => setFiles((x) => x.filter((f) => f.id !== id))}
    />
  );
}

const demos: Record<AlignuiDemo, (w: Words, home: string) => ReactNode> = {
  button: (w) => <Buttons w={w} />,
  'button-sizes': (w) => <ButtonSizes w={w} />,
  'compact-button': (w) => <CompactButtons w={w} />,
  'link-button': (w, home) => <LinkButtons w={w} home={home} />,
  'button-group': (w) => <Group w={w} />,
  dropdown: (w) => <Dropdown w={w} />,
  input: (w) => <Inputs w={w} />,
  'input-states': (w) => <InputStates w={w} />,
  textarea: (w) => <Textarea w={w} />,
  select: (w) => <Choose w={w} />,
  checkbox: (w) => <Checkboxes w={w} />,
  radio: (w) => <Radios w={w} />,
  switch: (w) => <Switches w={w} />,
  slider: (w) => <Sliders w={w} />,
  datepicker: (w) => <Datepicker w={w} />,
  avatar: (w) => <Avatars w={w} />,
  badge: (w) => <Badges w={w} />,
  'status-badge': (w) => <StatusBadges w={w} />,
  tag: (w) => <Tags w={w} />,
  kbd: (w) => <Kbd w={w} />,
  'progress-bar': (w) => <ProgressBar w={w} />,
  rating: (w) => <RatingDemo w={w} />,
  tooltip: (w) => <Tooltips w={w} />,
  'segmented-control': (w) => <Segmented w={w} />,
  alert: (w) => <Alerts w={w} />,
  toast: (w) => <Toasts w={w} />,
  accordion: (w) => <AccordionDemo w={w} />,
  breadcrumb: (w, home) => <BreadcrumbDemo w={w} home={home} />,
  'tab-horizontal': (w) => <TabHorizontal w={w} />,
  'tab-vertical': (w) => <TabVertical w={w} />,
  pagination: () => <PaginationDemo />,
  modal: (w) => <Modal w={w} />,
  drawer: (w) => <Drawer w={w} />,
  popover: (w) => <PopoverDemo w={w} />,
  table: (w) => <TableDemo w={w} />,
  'file-upload': (w) => <Upload w={w} />,
};

export function AlignuiApp({ view, ...data }: { view: AlignuiRecord }) {
  useEffect(() => void loadFace('inter'), []);
  const { groups, words: w } = view;
  return (
    <div {...data}>
      <Router handleLinks={false}>
      <LibraryLayout
        navLabel={view.page.navLabel}
        header={<SiteHeader name={view.name} href={view.home} actions={<Link href={view.source.href} external newTab>{view.source.label}</Link>} />}
        nav={
          <Stack gap="group">
            {groups.map((g) => (
              <TableOfContents key={g.id} label={g.title} trackCurrent={false} items={g.categories.map((c) => ({ anchor: c.id, label: c.title }))} />
            ))}
          </Stack>
        }
        main={
          <PageLayout header={<PageHeader title={view.page.title} lead={view.page.lead} />}>
            {groups.map((g) => (
              <Section key={g.id} heading={g.title} anchor={g.id} intro={g.intro}>
                {g.categories.map((c) => (
                  <Section key={c.id} heading={c.title} anchor={c.id} level={3} intro={c.intro} nested>
                    <Grid max={2} min="m">
                      {c.examples.map((e) => (
                        <Example key={e.demo} title={e.title} description={e.description}>
                          {demos[e.demo](w, view.home)}
                        </Example>
                      ))}
                    </Grid>
                  </Section>
                ))}
              </Section>
            ))}
          </PageLayout>
        }
      />
      </Router>
    </div>
  );
}
