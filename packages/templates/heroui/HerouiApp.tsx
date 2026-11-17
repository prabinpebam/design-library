/**
 * The heroui template's app (Q172): HeroUI v3's components on one scrollable page, grouped by kind (fundamentals,
 * compounds) and HeroUI v3's categories, each preview an Example of core components only, at HeroUI v3's default
 * medium size (core normal, 36 px). The look comes from tokens/theme.json. No styles.
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
  Calendar,
  Card,
  Checkbox,
  CheckboxGroup,
  Chip,
  Cluster,
  Code,
  ColourPicker,
  DataTable,
  DateField,
  DatePicker,
  Dialog,
  EmptyState,
  Example,
  Grid,
  Heading,
  LibraryLayout,
  Link,
  MenuButton,
  NumberField,
  PageHeader,
  PageLayout,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  Section,
  SegmentedControl,
  Select,
  Sheet,
  SiteHeader,
  Skeleton,
  Slider,
  Stack,
  Switch,
  TableOfContents,
  Tabs,
  Text,
  TextArea,
  TextField,
  TimeField,
  Tooltip,
  notify,
  type MenuButtonItem,
} from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import type { HerouiDemo, HerouiRecord } from './types';

type Words = Record<string, string>;
const noop = () => undefined;

// HeroUI v3's size names mapped onto core's scale: lg 40 px (m), md default 36 px (normal), sm 32 px (s), compact 28 px (xs).
const sizesOf = (w: Words) =>
  [
    ['m', w.large],
    ['normal', w.medium],
    ['s', w.small],
    ['xs', w.compact],
  ] as const;

function Buttons({ w }: { w: Words }) {
  return (
    <Stack gap="item">
      <Cluster gap="item" align="center">
        <Button emphasis="primary" label={w.primary} onClick={noop} />
        <Button emphasis="strong" label={w.strong} onClick={noop} />
        <Button label={w.outline} onClick={noop} />
      </Cluster>
      <Cluster gap="item" align="center">
        <Button emphasis="quiet" label={w.ghost} onClick={noop} />
        <Button emphasis="danger" label={w.danger} onClick={noop} />
        <Button emphasis="quiet" tone="link" label={w.linkAction} onClick={noop} />
        <Button label={w.disabled} onClick={noop} disabled />
      </Cluster>
    </Stack>
  );
}

function ButtonSizes({ w }: { w: Words }) {
  const [busy, setBusy] = useState(false);
  const save = () => {
    setBusy(true);
    window.setTimeout(() => setBusy(false), 1600);
  };
  return (
    <Stack gap="item">
      <Cluster gap="item" align="center">
        {sizesOf(w).map(([size, label]) => (
          <Button key={size} size={size} emphasis="primary" label={label} onClick={noop} />
        ))}
      </Cluster>
      <Cluster gap="item" align="center">
        <Button emphasis="primary" icon="plus" label={w.newRelease} onClick={noop} />
        <Button icon="save" label={w.save} busy={busy} pendingLabel={w.saving} onClick={save} />
        <Button size="s" icon="edit" iconOnly label={w.edit} onClick={noop} />
        <Button size="s" emphasis="quiet" icon="more" iconOnly label={w.more} onClick={noop} />
      </Cluster>
    </Stack>
  );
}

function Group({ w }: { w: Words }) {
  return (
    <ButtonGroup label={w.period} arrangement="attached">
      <Button size="s" label={w.day} onClick={noop} />
      <Button size="s" label={w.week} onClick={noop} />
      <Button size="s" label={w.month} onClick={noop} />
      <Button size="s" label={w.quarter} onClick={noop} />
    </ButtonGroup>
  );
}

function ToggleGroup({ w }: { w: Words }) {
  const [view, setView] = useState('overview');
  const [layout, setLayout] = useState('list');
  return (
    <Stack gap="item">
      <SegmentedControl
        size="normal"
        label={w.viewMode}
        value={view}
        onChange={setView}
        options={[
          { value: 'overview', label: w.overview },
          { value: 'metrics', label: w.metrics },
          { value: 'logs', label: w.logs },
        ]}
      />
      <SegmentedControl
        size="s"
        iconOnly
        label={w.layoutMode}
        value={layout}
        onChange={setLayout}
        options={[
          { value: 'list', label: w.list, icon: 'list' },
          { value: 'grid', label: w.grid, icon: 'grid' },
          { value: 'board', label: w.board, icon: 'board' },
        ]}
      />
    </Stack>
  );
}

function TextFields({ w }: { w: Words }) {
  const [email, setEmail] = useState('');
  const [query, setQuery] = useState('');
  return (
    <Stack gap="item">
      <TextField mode="form" type="email" label={w.email} placeholder={w.emailHint} value={email} onChange={setEmail} />
      <TextField mode="form" type="search" icon="search" clearable label={w.search} placeholder={w.searchHint} value={query} onChange={setQuery} />
    </Stack>
  );
}

function FieldStates({ w }: { w: Words }) {
  const [slug, setSlug] = useState(w.invalidValue);
  return (
    <Stack gap="item">
      <TextField mode="form" label={w.disabled} placeholder={w.emailHint} value="" disabled />
      <TextField mode="form" label={w.handle} value={slug} onChange={setSlug} error={slug.length < 3 ? w.invalidError : undefined} />
    </Stack>
  );
}

function NumberDemo({ w }: { w: Words }) {
  const [seats, setSeats] = useState(8);
  return <NumberField steppers label={w.seats} value={seats} min={1} max={100} onCommit={setSeats} />;
}

function TextareaDemo({ w }: { w: Words }) {
  const [notes, setNotes] = useState('');
  return <TextArea rows={3} label={w.notes} placeholder={w.notesHint} value={notes} onChange={setNotes} />;
}

function Checkboxes({ w }: { w: Words }) {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const all = a && b ? true : a || b ? 'mixed' : false;
  const toggleAll = (next: boolean) => {
    setA(next);
    setB(next);
  };
  return (
    <CheckboxGroup label={w.channels} hint={w.channelsHint}>
      {/* binary-setting: the Checkbox's own showcase entry; a parent select-all choice in a form group, saved with it */}
      <Checkbox label={w.allTopics} checked={all} onChange={toggleAll} />
      {/* binary-setting: the Checkbox's own showcase entry; a choice in a form group, saved with it, not an instant setting */}
      <Checkbox label={w.builds} checked={a} onChange={setA} />
      {/* binary-setting: the Checkbox's own showcase entry; a choice in a form group, saved with it, not an instant setting */}
      <Checkbox label={w.security} checked={b} onChange={setB} />
      {/* binary-setting: the Checkbox's own showcase entry; disabled form option */}
      <Checkbox label={w.disabled} checked={false} onChange={noop} disabled />
    </CheckboxGroup>
  );
}

function Radios({ w }: { w: Words }) {
  const [channel, setChannel] = useState('stable');
  return (
    <RadioGroup
      label={w.cadence}
      value={channel}
      onChange={setChannel}
      options={[
        { value: 'stable', label: w.stable },
        { value: 'canary', label: w.canary },
        { value: 'nightly', label: w.nightly, disabled: true },
      ]}
    />
  );
}

function SelectDemo({ w }: { w: Words }) {
  const [region, setRegion] = useState('');
  const options = [
    { value: 'eu', label: w.frankfurt },
    { value: 'ap-ne', label: w.tokyo },
    { value: 'us-w', label: w.oregon },
    { value: 'ap-se', label: w.sydney },
  ];
  return (
    <Stack gap="item">
      <Select mode="form" label={w.region} placeholder={w.regionHint} value={region} onChange={setRegion} options={options} />
      {sizesOf(w).map(([size, label]) => (
        <Select key={size} mode="form" size={size} label={label} placeholder={w.regionHint} value={region} onChange={setRegion} options={options} />
      ))}
    </Stack>
  );
}

const cities = [
  'Amsterdam', 'Auckland', 'Bengaluru', 'Berlin', 'Chicago', 'Dublin', 'Lisbon', 'London',
  'Madrid', 'Montreal', 'Nairobi', 'Oslo', 'Seoul', 'Singapore', 'Toronto', 'Zurich',
].map((label) => ({ value: label.toLowerCase(), label }));

function ComboBoxDemo({ w }: { w: Words }) {
  const [city, setCity] = useState('lisbon');
  return <Select mode="form" search label={w.city} placeholder={w.cityHint} value={city} onChange={setCity} options={cities} />;
}

function Switches({ w }: { w: Words }) {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <Stack gap="item">
      <Switch label={w.autoDeploy} checked={a} onChange={setA} />
      <Switch label={w.previewUrls} checked={b} onChange={setB} />
      <Switch label={w.disabled} checked={false} onChange={noop} disabled />
    </Stack>
  );
}

function Sliders({ w }: { w: Words }) {
  const [dim, setDim] = useState<number | number[]>(60);
  const [cap, setCap] = useState<number | number[]>([20, 75]);
  return (
    <Stack gap="group">
      <Slider label={w.opacity} value={dim} onChange={setDim} min={0} max={100} />
      <Slider label={w.priceBand} value={cap} onChange={setCap} min={0} max={100} />
    </Stack>
  );
}

function DatePickerDemo({ w }: { w: Words }) {
  const [day, setDay] = useState<string | null>('2026-11-17');
  return <DatePicker label={w.launchDate} value={day} onChange={setDay} />;
}

function DateTimeFields({ w }: { w: Words }) {
  const [date, setDate] = useState<string | null>('2027-03-15');
  const [time, setTime] = useState<string | null>('09:30');
  return (
    <Stack gap="item">
      <DateField layout="segmented" label={w.birthDate} value={date} onChange={setDate} />
      <TimeField label={w.startTime} value={time} onChange={setTime} />
    </Stack>
  );
}

function CalendarDemo({ w }: { w: Words }) {
  const [day, setDay] = useState<string | null>('2026-11-17');
  return <Calendar label={w.schedule} value={day} onChange={setDay} initialMonth="2026-11" />;
}

function DropdownDemo({ w }: { w: Words }) {
  const [picked, setPicked] = useState('');
  const items: MenuButtonItem[] = [
    { value: 'inspect', label: w.inspect, icon: 'search', shortcut: 'Ctrl+I' },
    { value: 'duplicate', label: w.duplicate, icon: 'copy', shortcut: 'Ctrl+D' },
    { value: 'invite', label: w.invite, icon: 'person', startsGroup: true },
    { value: 'remove', label: w.removeEnv, tone: 'danger' },
  ];
  return (
    <Stack gap="item">
      <Cluster gap="item" align="center">
        <MenuButton label={w.actions} onSelect={setPicked} items={items} />
        <MenuButton icon="person" label={w.account} onSelect={setPicked} items={items} />
      </Cluster>
      <Cluster gap="item" align="center">
        {sizesOf(w).map(([size, label]) => (
          <MenuButton key={size} size={size} label={label} onSelect={setPicked} items={items} />
        ))}
      </Cluster>
      {picked && <Text variant="body-sm" tone="muted">{picked}</Text>}
    </Stack>
  );
}

function TagGroupDemo({ w }: { w: Words }) {
  const [active, setActive] = useState<string[]>(['design', 'tokens']);
  const [kept, setKept] = useState(true);
  const toggle = (id: string) => (next: boolean) => setActive((x) => (next ? [...x, id] : x.filter((y) => y !== id)));
  return (
    <Cluster gap="pair" align="center">
      {(['design', 'frontend', 'accessibility'] as const).map((id) => (
        <Chip key={id} size="s" kind="filter" label={w[id]} selected={active.includes(id)} onChange={toggle(id)} />
      ))}
      {kept && <Chip size="s" kind="input" label={w.tokens} onRemove={() => setKept(false)} />}
    </Cluster>
  );
}

const people = ['Maya Chen', 'Alex Rivera', 'Sam Okafor', 'Ines Duarte', 'Kai Larsen'];

function AvatarDemo({ w }: { w: Words }) {
  return (
    <Stack gap="item">
      <Cluster gap="item" align="center">
        <Avatar name={people[0]} size={24} />
        <Avatar name={people[1]} size={32} />
        <Avatar name={people[2]} size={40} presence="available" />
        <Avatar name={people[3]} size={40} shape="square" />
      </Cluster>
      <AvatarGroup label={w.contributors} size={32} max={3} members={people.map((name) => ({ name }))} />
    </Stack>
  );
}

function ChipAndBadgeDemo({ w }: { w: Words }) {
  return (
    <Stack gap="item">
      <Cluster gap="pair" align="center">
        <Badge tone="info" emphasis="strong">{w.featured}</Badge>
        <Badge tone="neutral" emphasis="strong">{w.stableTag}</Badge>
        <Badge tone="success" emphasis="strong">{w.ready}</Badge>
        <Badge tone="danger" emphasis="strong">{w.failed}</Badge>
        <Badge kind="count" count={12} />
      </Cluster>
      <Cluster gap="pair" align="center">
        <Badge tone="info">{w.featured}</Badge>
        <Badge tone="neutral">{w.stableTag}</Badge>
        <Badge kind="status" tone="success">{w.active}</Badge>
        <Badge kind="status" tone="warning">{w.queued}</Badge>
        <Badge kind="status" tone="neutral">{w.paused}</Badge>
      </Cluster>
    </Stack>
  );
}

function KbdAndTypography({ w, href }: { w: Words; href: string }) {
  return (
    <Stack gap="item">
      <Heading level={4}>{w.typeHeading}</Heading>
      <Text variant="body-sm" tone="muted">{w.typeBody}</Text>
      <Cluster gap="group" align="center">
        <Text variant="body-sm">
          {w.shortcutLead} <Code kind="key">{w.ctrl}</Code> <Code kind="key">{w.k}</Code>
        </Text>
        <Link href={href} external newTab>{w.docsLink}</Link>
      </Cluster>
    </Stack>
  );
}

function ColorPickerDemo({ w }: { w: Words }) {
  const [hex, setHex] = useState('#0485f7');
  return (
    <ColourPicker
      label={w.accentColor}
      value={hex}
      onChange={(next) => setHex(next)}
      swatches={[{ title: w.swatches, colours: ['#0485f7', '#17c964', '#f5a524', '#ff383c', '#7828c8', '#18181b'] }]}
    />
  );
}

function AlertsDemo({ w }: { w: Words }) {
  return (
    <Stack gap="item">
      <Alert tone="info" title={w.infoTitle} headingLevel={4}>{w.infoBody}</Alert>
      <Alert tone="success" title={w.successTitle} headingLevel={4}>{w.successBody}</Alert>
      <Alert tone="warning" title={w.warningTitle} headingLevel={4}>{w.warningBody}</Alert>
      <Alert tone="error" title={w.errorTitle} headingLevel={4} actions={<Button size="xs" label={w.retry} onClick={noop} />}>{w.errorBody}</Alert>
    </Stack>
  );
}

function ProgressDemo({ w }: { w: Words }) {
  return (
    <Stack gap="group">
      <Progress form="bar" label={w.bundle} value={72} showLabel />
      <Progress form="bar" label={w.indexing} value={38} showLabel />
      <Cluster gap="pair" align="center">
        <Progress form="inline" label={w.syncing} />
        <Text variant="body-sm" tone="muted">{w.syncing}</Text>
      </Cluster>
    </Stack>
  );
}

function SkeletonDemo() {
  return (
    <Stack gap="item">
      <Skeleton shape="circle" size="lg" />
      <Skeleton shape="text" lines={3} />
    </Stack>
  );
}

function TabsDemo({ w }: { w: Words }) {
  const items = [
    { id: 'overview', label: w.overview, panel: <Text variant="body-sm" tone="muted">{w.overviewBody}</Text> },
    { id: 'metrics', label: w.metrics, panel: <Text variant="body-sm" tone="muted">{w.metricsBody}</Text> },
    { id: 'logs', label: w.logs, panel: <Text variant="body-sm" tone="muted">{w.logsBody}</Text> },
  ];
  return (
    <Stack gap="group">
      <Tabs size="s" label={w.viewMode} items={items} />
      <Tabs size="s" orientation="vertical" label={w.viewMode} items={items} />
    </Stack>
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

function BreadcrumbsAndPagination({ w, home }: { w: Words; home: string }) {
  const [page, setPage] = useState(3);
  return (
    <Stack gap="group">
      <Breadcrumbs items={[{ label: w.homeCrumb, href: home }, { label: w.projectsCrumb, href: home }, { label: w.currentCrumb }]} />
      <Pagination page={page} pages={10} onChange={setPage} />
    </Stack>
  );
}

function ModalDemo({ w }: { w: Words }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [name, setName] = useState(w.projectValue);
  return (
    <>
      <Cluster gap="item" align="center">
        <Button label={w.openModal} onClick={() => setEditOpen(true)} />
        <Button emphasis="danger" label={w.openAlert} onClick={() => setConfirmOpen(true)} />
      </Cluster>
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        size="s"
        title={w.modalTitle}
        description={w.modalBody}
        actions={
          <>
            <Button emphasis="quiet" label={w.ghost} onClick={() => setEditOpen(false)} />
            <Button emphasis="primary" label={w.save} onClick={() => setEditOpen(false)} />
          </>
        }
      >
        <TextField mode="form" label={w.projectName} value={name} onChange={setName} />
      </Dialog>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        size="s"
        title={w.alertDialogTitle}
        description={w.alertDialogBody}
        actions={
          <>
            <Button emphasis="quiet" label={w.ghost} onClick={() => setConfirmOpen(false)} />
            <Button emphasis="danger" label={w.confirmDelete} onClick={() => setConfirmOpen(false)} />
          </>
        }
      />
    </>
  );
}

function DrawerDemo({ w }: { w: Words }) {
  const [open, setOpen] = useState(false);
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  const close = () => setOpen(false);
  return (
    <>
      <Button label={w.openDrawer} onClick={() => setOpen(true)} />
      <Sheet
        open={open}
        onClose={close}
        size="s"
        title={w.drawerTitle}
        description={w.drawerBody}
        actions={
          <>
            <Button emphasis="quiet" label={w.ghost} onClick={close} />
            <Button emphasis="primary" label={w.save} onClick={close} />
          </>
        }
      >
        <Stack gap="item">
          <Switch label={w.builds} checked={a} onChange={setA} />
          <Switch label={w.security} checked={b} onChange={setB} />
        </Stack>
      </Sheet>
    </>
  );
}

function PopoverAndTooltip({ w }: { w: Words }) {
  const [email, setEmail] = useState('');
  return (
    <Cluster gap="item" align="center">
      <Popover trigger={{ label: w.openPopover }} title={w.popoverTitle} width="sm">
        <Stack gap="item">
          <TextField mode="form" type="email" label={w.email} placeholder={w.emailHint} value={email} onChange={setEmail} />
          <Button emphasis="primary" label={w.sendLink} onClick={noop} />
        </Stack>
      </Popover>
      <Tooltip content={w.tooltipHint}>
        <Button emphasis="quiet" label={w.copyUrl} tooltip={false} onClick={noop} />
      </Tooltip>
    </Cluster>
  );
}

function ToastDemo({ w }: { w: Words }) {
  return (
    <Cluster gap="item" align="center">
      <Button label={w.showSaved} onClick={() => notify({ tone: 'success', message: w.toastSaved })} />
      <Button label={w.showUpdate} onClick={() => notify({ tone: 'info', message: w.toastUpdate })} />
      <Button label={w.showFailure} onClick={() => notify({ tone: 'error', message: w.toastFailure })} />
    </Cluster>
  );
}

function TableDemo({ w }: { w: Words }) {
  const rows: [string, string, string, string][] = [
    [people[0], w.architect, w.active, '$1,420'],
    [people[1], w.platform, w.queued, '$980'],
    [people[2], w.product, w.failed, '$640'],
  ];
  const tone = (s: string) => (s === w.active ? 'success' : s === w.queued ? 'warning' : 'danger');
  return (
    <DataTable
      label={w.membersTable}
      columns={[
        { key: 'member', header: w.memberCol },
        { key: 'role', header: w.roleCol },
        { key: 'status', header: w.statusCol },
        { key: 'spend', header: w.spendCol },
      ]}
      rows={rows.map(([name, role, status, spend]) => ({
        id: name,
        cells: {
          member: (
            <Cluster gap="pair" align="center">
              <Avatar name={name} size={32} />
              <Text variant="body-sm">{name}</Text>
            </Cluster>
          ),
          role,
          status: <Badge kind="status" tone={tone(status)}>{status}</Badge>,
          spend,
        },
      }))}
    />
  );
}

function CardDemo({ w }: { w: Words }) {
  const [domain, setDomain] = useState('');
  return (
    <Card
      title={w.cardTitle}
      description={w.cardBody}
      headingLevel={4}
      actions={
        <Cluster gap="item" justify="between">
          <Button emphasis="quiet" label={w.ghost} onClick={noop} />
          <Button emphasis="primary" label={w.configure} onClick={noop} />
        </Cluster>
      }
    >
      <TextField mode="form" label={w.clusterDomain} placeholder={w.clusterHint} value={domain} onChange={setDomain} />
    </Card>
  );
}

function EmptyStateDemo({ w }: { w: Words }) {
  return (
    <EmptyState
      reason="first-use"
      scope="component"
      headingLevel={4}
      title={w.emptyTitle}
      actions={<Button emphasis="primary" icon="plus" label={w.createFirst} onClick={noop} />}
    >
      {w.emptyBody}
    </EmptyState>
  );
}

const demos: Record<HerouiDemo, (w: Words, home: string, sourceHref: string) => ReactNode> = {
  button: (w) => <Buttons w={w} />,
  'button-sizes': (w) => <ButtonSizes w={w} />,
  'button-group': (w) => <Group w={w} />,
  'toggle-button-group': (w) => <ToggleGroup w={w} />,
  'text-field': (w) => <TextFields w={w} />,
  'field-states': (w) => <FieldStates w={w} />,
  'number-field': (w) => <NumberDemo w={w} />,
  textarea: (w) => <TextareaDemo w={w} />,
  checkbox: (w) => <Checkboxes w={w} />,
  'radio-group': (w) => <Radios w={w} />,
  select: (w) => <SelectDemo w={w} />,
  'combo-box': (w) => <ComboBoxDemo w={w} />,
  switch: (w) => <Switches w={w} />,
  slider: (w) => <Sliders w={w} />,
  'date-picker': (w) => <DatePickerDemo w={w} />,
  'date-time-fields': (w) => <DateTimeFields w={w} />,
  calendar: (w) => <CalendarDemo w={w} />,
  dropdown: (w) => <DropdownDemo w={w} />,
  'tag-group': (w) => <TagGroupDemo w={w} />,
  avatar: (w) => <AvatarDemo w={w} />,
  'chip-and-badge': (w) => <ChipAndBadgeDemo w={w} />,
  'kbd-and-typography': (w, _home, sourceHref) => <KbdAndTypography w={w} href={sourceHref} />,
  'color-picker': (w) => <ColorPickerDemo w={w} />,
  alert: (w) => <AlertsDemo w={w} />,
  progress: (w) => <ProgressDemo w={w} />,
  skeleton: () => <SkeletonDemo />,
  tabs: (w) => <TabsDemo w={w} />,
  accordion: (w) => <AccordionDemo w={w} />,
  'breadcrumbs-and-pagination': (w, home) => <BreadcrumbsAndPagination w={w} home={home} />,
  modal: (w) => <ModalDemo w={w} />,
  drawer: (w) => <DrawerDemo w={w} />,
  'popover-and-tooltip': (w) => <PopoverAndTooltip w={w} />,
  toast: (w) => <ToastDemo w={w} />,
  table: (w) => <TableDemo w={w} />,
  card: (w) => <CardDemo w={w} />,
  'empty-state': (w) => <EmptyStateDemo w={w} />,
};

export function HerouiApp({ view, ...data }: { view: HerouiRecord }) {
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
                            {demos[e.demo](w, view.home, view.source.href)}
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
