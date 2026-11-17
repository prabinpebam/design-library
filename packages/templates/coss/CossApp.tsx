/**
 * The coss template's app (Q168): coss ui's components on one scrollable page, grouped by kind (fundamentals,
 * compounds) and category, each preview an Example of core components only. The look comes from tokens/theme.json.
 * No styles.
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
  Chip,
  Cluster,
  Code,
  DataTable,
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
  Statistic,
  Switch,
  TableOfContents,
  Tabs,
  Text,
  TextArea,
  TextField,
  Tooltip,
  type MenuButtonItem,
} from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import type { CossDemo, CossRecord } from './types';

type Words = Record<string, string>;
const noop = () => undefined;

function ButtonVariants({ w }: { w: Words }) {
  return (
    <Cluster gap="item" align="center">
      <Button size="s" emphasis="primary" label={w.button} onClick={noop} />
      <Button size="s" label={w.outline} onClick={noop} />
      <Button size="s" emphasis="quiet" label={w.ghost} onClick={noop} />
      <Button size="s" emphasis="danger" label={w.delete} onClick={noop} />
      <Button size="s" emphasis="quiet" tone="link" label={w.link} onClick={noop} />
    </Cluster>
  );
}

function ButtonSizes({ w }: { w: Words }) {
  return (
    <Cluster gap="item" align="center">
      {(['xs', 's', 'normal', 'm'] as const).map((size) => (
        <Button key={size} size={size} label={w[size]} onClick={noop} />
      ))}
    </Cluster>
  );
}

function ButtonIcons({ w }: { w: Words }) {
  const [busy, setBusy] = useState(false);
  const save = () => {
    setBusy(true);
    window.setTimeout(() => setBusy(false), 1600);
  };
  return (
    <Cluster gap="item" align="center">
      <Button size="s" emphasis="primary" icon="plus" label={w.newItem} onClick={noop} />
      <Button size="s" icon="more" iconOnly label={w.more} onClick={noop} />
      <Button size="s" icon="save" label={w.save} busy={busy} pendingLabel={w.saving} onClick={save} />
    </Cluster>
  );
}

function Group({ w }: { w: Words }) {
  return (
    <ButtonGroup label={w.group} arrangement="attached">
      <Button size="s" label={w.left} onClick={noop} />
      <Button size="s" label={w.center} onClick={noop} />
      <Button size="s" label={w.right} onClick={noop} />
    </ButtonGroup>
  );
}

function Menu({ w }: { w: Words }) {
  const [picked, setPicked] = useState('');
  const items: MenuButtonItem[] = [
    { value: 'edit', label: w.edit, icon: 'edit', shortcut: 'Ctrl+E' },
    { value: 'duplicate', label: w.duplicate, icon: 'copy', shortcut: 'Ctrl+D' },
    { value: 'archive', label: w.archive, icon: 'inbox', startsGroup: true },
    { value: 'delete', label: w.delete, tone: 'danger' },
  ];
  return (
    <Stack gap="item">
      <MenuButton size="s" label={w.options} onSelect={setPicked} items={items} />
      <Cluster gap="item" align="center">
        {(['xs', 's', 'normal', 'm'] as const).map((size) => (
          <MenuButton key={size} size={size} label={w[size]} onSelect={setPicked} items={items} />
        ))}
      </Cluster>
      {picked && <Text variant="body-sm" tone="muted">{picked}</Text>}
    </Stack>
  );
}

function Input({ w }: { w: Words }) {
  const [email, setEmail] = useState('');
  const [query, setQuery] = useState('');
  return (
    <Stack gap="item">
      <TextField mode="form" size="s" type="email" label={w.email} placeholder={w.emailHint} value={email} onChange={setEmail} />
      <TextField mode="form" size="s" type="search" icon="search" label={w.search} placeholder={w.searchHint} value={query} onChange={setQuery} />
    </Stack>
  );
}

function InputStates({ w }: { w: Words }) {
  const [name, setName] = useState(w.invalidValue);
  return (
    <Stack gap="item">
      <TextField mode="form" size="s" label={w.disabled} placeholder={w.emailHint} value="" disabled />
      <TextField mode="form" size="s" label={w.invalid} value={name} onChange={setName} error={name.length < 3 ? w.invalidError : undefined} />
    </Stack>
  );
}

function Number({ w }: { w: Words }) {
  const [n, setN] = useState(4);
  return <NumberField size="s" steppers label={w.quantity} value={n} min={0} max={99} onCommit={setN} />;
}

function Textarea({ w }: { w: Words }) {
  const [text, setText] = useState('');
  return <TextArea size="s" rows={3} label={w.message} placeholder={w.messageHint} value={text} onChange={setText} />;
}

function Choose({ w }: { w: Words }) {
  const [value, setValue] = useState('');
  const options = ['Next.js', 'Vite', 'Remix', 'Astro'].map((label) => ({ value: label.toLowerCase(), label }));
  return (
    <Stack gap="item">
      <Select mode="form" size="s" label={w.framework} placeholder={w.frameworkHint} value={value} onChange={setValue} options={options} />
      {(['xs', 'normal', 'm'] as const).map((size) => (
        <Select key={size} mode="form" size={size} label={w[size]} placeholder={w.frameworkHint} value={value} onChange={setValue} options={options} />
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
      <Checkbox label={w.accept} checked={a} onChange={setA} description={w.acceptMore} />
      {/* binary-setting: the Checkbox's own showcase entry; a consent or a choice in a form, saved with it, not a setting that acts at once */}
      <Checkbox label={w.notify} checked={b} onChange={setB} />
      {/* binary-setting: the Checkbox's own showcase entry; a consent or a choice in a form, saved with it, not a setting that acts at once */}
      <Checkbox label={w.selectAll} checked="mixed" onChange={noop} />
      {/* binary-setting: the Checkbox's own showcase entry; a consent or a choice in a form, saved with it, not a setting that acts at once */}
      <Checkbox label={w.disabled} checked={false} onChange={noop} disabled />
    </Stack>
  );
}

function Radios({ w }: { w: Words }) {
  const [plan, setPlan] = useState('pro');
  return (
    <RadioGroup
      size="s"
      label={w.plan}
      value={plan}
      onChange={setPlan}
      options={[
        { value: 'starter', label: w.starter },
        { value: 'pro', label: w.pro },
        { value: 'team', label: w.team, disabled: true },
      ]}
    />
  );
}

function Switches({ w }: { w: Words }) {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <Stack gap="item">
      <Switch size="s" label={w.airplane} checked={a} onChange={setA} />
      <Switch size="s" label={w.marketing} checked={b} onChange={setB} />
      <Switch size="s" label={w.disabled} checked={false} onChange={noop} disabled />
    </Stack>
  );
}

function Toggle({ w }: { w: Words }) {
  const [view, setView] = useState('list');
  const [icon, setIcon] = useState('list');
  const options = [
    { value: 'list', label: w.list, icon: 'list' as const },
    { value: 'grid', label: w.grid, icon: 'grid' as const },
    { value: 'board', label: w.board, icon: 'board' as const },
  ];
  return (
    <Stack gap="item">
      <SegmentedControl size="s" label={w.view} value={view} onChange={setView} options={options.map(({ value, label }) => ({ value, label }))} />
      <SegmentedControl size="s" iconOnly label={w.view} value={icon} onChange={setIcon} options={options} />
    </Stack>
  );
}

function Sliders({ w }: { w: Words }) {
  const [v, setV] = useState<number | number[]>(40);
  const [r, setR] = useState<number | number[]>([20, 80]);
  return (
    <Stack gap="group">
      <Slider size="s" label={w.volume} value={v} onChange={setV} min={0} max={100} />
      <Slider size="s" label={w.price} value={r} onChange={setR} min={0} max={100} />
    </Stack>
  );
}

function Badges({ w }: { w: Words }) {
  return (
    <Cluster gap="pair" align="center">
      <Badge tone="neutral" emphasis="strong">{w.default}</Badge>
      <Badge tone="neutral">{w.secondary}</Badge>
      <Badge tone="neutral" emphasis="outline">{w.outline}</Badge>
      <Badge tone="info">{w.info}</Badge>
      <Badge tone="success">{w.success}</Badge>
      <Badge tone="warning">{w.warning}</Badge>
      <Badge tone="danger">{w.error}</Badge>
      <Badge kind="count" count={8} />
    </Cluster>
  );
}

function Chips({ w }: { w: Words }) {
  const [on, setOn] = useState<string[]>(['design']);
  const [picked, setPicked] = useState(true);
  const toggle = (id: string) => (next: boolean) => setOn((x) => (next ? [...x, id] : x.filter((y) => y !== id)));
  return (
    <Cluster gap="pair" align="center">
      {(['design', 'engineering', 'product'] as const).map((id) => (
        <Chip key={id} size="s" kind="filter" label={w[id]} selected={on.includes(id)} onChange={toggle(id)} />
      ))}
      {picked && <Chip size="s" kind="input" label={w.react} onRemove={() => setPicked(false)} />}
    </Cluster>
  );
}

function Progresses({ w }: { w: Words }) {
  return (
    <Stack gap="group">
      <Progress form="bar" label={w.upload} value={60} showLabel />
      <Progress form="inline" label={w.loading} />
    </Stack>
  );
}

function Skeletons() {
  return (
    <Stack gap="item">
      <Skeleton shape="circle" size="lg" />
      <Skeleton shape="text" lines={2} />
    </Stack>
  );
}

function Tooltips({ w }: { w: Words }) {
  return (
    <Cluster gap="item" align="center">
      <Tooltip content={w.add}>
        <Button size="s" label={w.add} tooltip={false} onClick={noop} />
      </Tooltip>
      <Button size="s" icon="plus" iconOnly label={w.add} onClick={noop} />
    </Cluster>
  );
}

const people = ['Maya Chen', 'Alex Rivera', 'Sam Okafor', 'Ines Duarte', 'Kai Larsen'];

function Avatars({ w }: { w: Words }) {
  return (
    <Stack gap="item">
      <Cluster gap="item" align="center">
        <Avatar name={people[0]} size={24} />
        <Avatar name={people[1]} size={32} />
        <Avatar name={people[2]} size={40} presence="available" />
        <Avatar name={people[3]} size={40} shape="square" />
      </Cluster>
      <AvatarGroup label={w.people} size={32} max={3} members={people.map((name) => ({ name }))} />
    </Stack>
  );
}

function Kbd({ w }: { w: Words }) {
  return (
    <Text variant="body-sm">
      {w.commandK} <Code kind="key">{w.ctrl}</Code> <Code kind="key">{w.k}</Code>
    </Text>
  );
}

function Typography({ w }: { w: Words }) {
  return (
    <Stack gap="pair">
      <Heading level={3} size={2}>{w.heading}</Heading>
      <Text>{w.body}</Text>
      <Text variant="body-sm" tone="muted">{w.body}</Text>
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

function Empty({ w }: { w: Words }) {
  return (
    <EmptyState reason="first-use" scope="component" headingLevel={4} title={w.emptyTitle} actions={<Button size="s" emphasis="primary" icon="plus" label={w.create} onClick={noop} />}>
      {w.emptyBody}
    </EmptyState>
  );
}

function CardDemo({ w }: { w: Words }) {
  const [name, setName] = useState('');
  return (
    <Card
      title={w.cardTitle}
      description={w.cardBody}
      headingLevel={4}
      actions={
        <Cluster gap="item" justify="between">
          <Button size="s" label={w.cancel} onClick={noop} />
          <Button size="s" emphasis="primary" label={w.deploy} onClick={noop} />
        </Cluster>
      }
    >
      <TextField mode="form" size="s" label={w.name} placeholder={w.nameValue} value={name} onChange={setName} />
    </Card>
  );
}

function AccordionDemo({ w }: { w: Words }) {
  return (
    <Accordion
      single
      headingLevel={4}
      defaultOpen={['q1']}
      items={[1, 2, 3].map((i) => ({ id: `q${i}`, title: w[`q${i}`], content: <Text variant="body-sm">{w[`a${i}`]}</Text> }))}
    />
  );
}

function TabsDemo({ w }: { w: Words }) {
  return (
    <Tabs
      size="s"
      label={w.tabs}
      items={[
        { id: 'account', label: w.account, panel: <Text variant="body-sm" tone="muted">{w.accountBody}</Text> },
        { id: 'password', label: w.password, panel: <Text variant="body-sm" tone="muted">{w.passwordBody}</Text> },
      ]}
    />
  );
}

function DialogDemo({ w }: { w: Words }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(w.nameValue);
  const close = () => setOpen(false);
  return (
    <>
      <Button size="s" label={w.openDialog} onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onClose={close}
        size="s"
        title={w.dialogTitle}
        description={w.dialogBody}
        actions={
          <>
            <Button size="s" label={w.cancel} onClick={close} />
            <Button size="s" emphasis="primary" label={w.save} onClick={close} />
          </>
        }
      >
        <TextField mode="form" size="s" label={w.name} value={name} onChange={setName} />
      </Dialog>
    </>
  );
}

function SheetDemo({ w }: { w: Words }) {
  const [open, setOpen] = useState(false);
  const [a, setA] = useState(true);
  const close = () => setOpen(false);
  return (
    <>
      <Button size="s" label={w.openSheet} onClick={() => setOpen(true)} />
      <Sheet
        open={open}
        onClose={close}
        size="s"
        title={w.sheetTitle}
        description={w.sheetBody}
        actions={
          <>
            <Button size="s" label={w.cancel} onClick={close} />
            <Button size="s" emphasis="primary" label={w.save} onClick={close} />
          </>
        }
      >
        <Switch size="s" label={w.notify} checked={a} onChange={setA} />
      </Sheet>
    </>
  );
}

function PopoverDemo({ w }: { w: Words }) {
  const [width, setWidth] = useState(320);
  const [height, setHeight] = useState(240);
  return (
    <Popover trigger={{ label: w.openPopover, size: 's' }} title={w.popoverTitle} width="sm">
      <Stack gap="item">
        <NumberField size="s" label={w.width} unit="px" value={width} onCommit={setWidth} />
        <NumberField size="s" label={w.height} unit="px" value={height} onCommit={setHeight} />
      </Stack>
    </Popover>
  );
}

function BreadcrumbDemo({ w, home }: { w: Words; home: string }) {
  return <Breadcrumbs items={[{ label: w.home, href: home }, { label: w.components, href: home }, { label: w.breadcrumb }]} />;
}

function PaginationDemo() {
  const [page, setPage] = useState(2);
  return <Pagination page={page} pages={10} onChange={setPage} />;
}

function TableDemo({ w }: { w: Words }) {
  const rows: [string, string, string, string][] = [
    ['INV001', w.paid, w.card, '$250.00'],
    ['INV002', w.pending, w.paypal, '$150.00'],
    ['INV003', w.unpaid, w.transfer, '$350.00'],
  ];
  const tone = (s: string) => (s === w.paid ? 'success' : s === w.pending ? 'warning' : 'danger');
  return (
    <DataTable
      label={w.invoices}
      columns={[
        { key: 'invoice', header: w.invoice },
        { key: 'status', header: w.status },
        { key: 'method', header: w.method },
        { key: 'amount', header: w.amount },
      ]}
      rows={rows.map(([invoice, status, method, amount]) => ({
        id: invoice,
        cells: { invoice, status: <Badge tone={tone(status)}>{status}</Badge>, method, amount },
      }))}
    />
  );
}

function StatisticDemo({ w }: { w: Words }) {
  return <Statistic label={w.revenue} value={45231.89} format={{ style: 'currency', currency: 'USD' }} change={w.change} direction="up" good="up" period={w.period} />;
}

function CalendarDemo({ w }: { w: Words }) {
  const [day, setDay] = useState<string | null>('2026-11-17');
  return <Calendar label={w.date} value={day} onChange={setDay} initialMonth="2026-11" />;
}

const demos: Record<CossDemo, (w: Words, home: string) => ReactNode> = {
  'button-variants': (w) => <ButtonVariants w={w} />,
  'button-sizes': (w) => <ButtonSizes w={w} />,
  'button-icons': (w) => <ButtonIcons w={w} />,
  'button-group': (w) => <Group w={w} />,
  menu: (w) => <Menu w={w} />,
  input: (w) => <Input w={w} />,
  'input-states': (w) => <InputStates w={w} />,
  'number-field': (w) => <Number w={w} />,
  textarea: (w) => <Textarea w={w} />,
  select: (w) => <Choose w={w} />,
  checkbox: (w) => <Checkboxes w={w} />,
  'radio-group': (w) => <Radios w={w} />,
  switch: (w) => <Switches w={w} />,
  'segmented-control': (w) => <Toggle w={w} />,
  slider: (w) => <Sliders w={w} />,
  badge: (w) => <Badges w={w} />,
  chip: (w) => <Chips w={w} />,
  progress: (w) => <Progresses w={w} />,
  skeleton: () => <Skeletons />,
  tooltip: (w) => <Tooltips w={w} />,
  avatar: (w) => <Avatars w={w} />,
  kbd: (w) => <Kbd w={w} />,
  typography: (w) => <Typography w={w} />,
  alert: (w) => <Alerts w={w} />,
  empty: (w) => <Empty w={w} />,
  card: (w) => <CardDemo w={w} />,
  accordion: (w) => <AccordionDemo w={w} />,
  tabs: (w) => <TabsDemo w={w} />,
  dialog: (w) => <DialogDemo w={w} />,
  sheet: (w) => <SheetDemo w={w} />,
  popover: (w) => <PopoverDemo w={w} />,
  breadcrumb: (w, home) => <BreadcrumbDemo w={w} home={home} />,
  pagination: () => <PaginationDemo />,
  table: (w) => <TableDemo w={w} />,
  calendar: (w) => <CalendarDemo w={w} />,
  statistic: (w) => <StatisticDemo w={w} />,
};

export function CossApp({ view, ...data }: { view: CossRecord }) {
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
