/**
 * The Project management template's binding (Q61, Q62, Q64): the project (content/shared.json) and the issue in full
 * (content/issue.json) mapped to AppLayout (sidebar, header, view,
 * details), Navigation, Breadcrumbs, Board, DataTable, Section, Badge, Persona, Select, Checkbox, TextArea and Button.
 * Board, Backlog and Issue share one store, so a card moved on the board shows its new status in the backlog. No styles.
 */
import { useState, type ReactNode } from 'react';
import {
  AppLayout,
  Avatar,
  Badge,
  Board,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  Cluster,
  DataTable,
  DescriptionList,
  Heading,
  Link,
  Morph,
  Navigation,
  Persona,
  Section,
  Select,
  Stack,
  Text,
  TextArea,
  TextField,
  announce,
  moveCard,
  notify,
} from '@design-library/core/react';
import { fill } from '@design-library/core/render';
import type { Issue, IssueDetail, ProjectRecord } from './types';

export type ProjectsScreen = 'board' | 'backlog' | 'issue';

// tied to AppLayout's 48rem container change point: panels sit beside the content from the same width
const wide = () => typeof window === 'undefined' || window.matchMedia('(min-width: 48rem)').matches;
const points = (list: Issue[]) => list.reduce((n, i) => n + i.points, 0);

export function ProjectsApp({ view, screen, state, at, height = 'fill' }: { view: ProjectRecord & { detail: IssueDetail }; screen: ProjectsScreen; state?: string; at: (layout: string) => string; height?: 'fill' | 'screen' | 'lg' }) {
  const [issues, setIssues] = useState(view.issues);
  const [open, setOpen] = useState(wide);
  const [checklist, setChecklist] = useState(view.detail.checklist);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(view.detail.comments);
  const [search, setSearch] = useState('');
  const [description, setDescription] = useState(view.detail.description);
  // The screen state the content names (`edit`), followed when it changes; the reader's own Edit and Cancel otherwise.
  const [editing, setEditing] = useState(state === 'edit');
  const [named, setNamed] = useState(state);
  const [draft, setDraft] = useState<{ title: string; type: Issue['type']; description: string } | null>(null);
  const [titleError, setTitleError] = useState<string>();
  if (named !== state) {
    setNamed(state);
    setEditing(state === 'edit');
  }
  const w = view.strings;
  const statusOf = (id: string) => view.statuses.find((s) => s.id === id)?.title ?? id;
  const issue = issues.find((i) => i.id === view.detail.id)!;
  const update = (id: string, change: Partial<Issue>) => setIssues((all) => all.map((i) => (i.id === id ? { ...i, ...change } : i)));

  const columns = view.statuses.map((s) => ({
    ...s,
    cards: issues
      .filter((i) => i.sprint && i.status === s.id && (!search || i.title.toLowerCase().includes(search.toLowerCase())))
      .map((i) => ({ id: i.id, reference: i.key, title: i.title, href: i.id === view.detail.id ? at('issue') : undefined, tags: [{ label: i.type, tone: view.types[i.type] }], assignee: i.assignee, meta: fill(i.points === 1 ? w.point : w.points, { count: i.points }) })),
  }));
  const onMove = (card: string, to: string, index: number) => {
    const order = moveCard(columns, card, to, index).flatMap((c) => c.cards.map((x) => x.id));
    setIssues((all) => [...all].map((i) => (i.id === card ? { ...i, status: to } : i)).sort((a, b) => (order.indexOf(a.id) + 1 || 999) - (order.indexOf(b.id) + 1 || 999)));
  };

  const table = (label: string, list: Issue[]) => (
    <DataTable
      label={label}
      columns={[
        { key: 'key', header: w.key },
        { key: 'title', header: w.summary },
        { key: 'type', header: w.type },
        { key: 'status', header: w.status },
        { key: 'assignee', header: w.assignee },
        { key: 'points', header: w.pointsHeader },
      ]}
      rows={list.map((i) => ({
        id: i.id,
        cells: {
          key: i.id === view.detail.id ? <Link href={at('issue')}>{i.key}</Link> : i.key,
          title: i.title,
          type: <Badge tone={view.types[i.type]}>{i.type}</Badge>,
          status: statusOf(i.status),
          assignee: i.assignee ? <Persona name={i.assignee} size={24} /> : <Text as="span" tone="muted">{w.unassigned}</Text>,
          points: i.points,
        },
      }))}
    />
  );

  const crumbs: Record<ProjectsScreen, { label: string; href?: string }[]> = {
    board: [{ label: view.project, href: at('board') }, { label: fill(w.sprintBoard, { sprint: view.sprint.name }) }],
    backlog: [{ label: view.project, href: at('board') }, { label: w.backlog }],
    issue: [{ label: view.project, href: at('board') }, { label: w.backlog, href: at('backlog') }, { label: issue.key }],
  };

  let body: ReactNode;
  let aside: ReactNode;
  // The view's head leads everything in it (Q93): AppLayout's head slot, a section above the view's units.
  let head: ReactNode;
  if (screen === 'board') {
    const sprint = issues.filter((i) => i.sprint);
    head = (
      <Stack gap="pair">
        <Heading level={1} size={2}>
          {view.sprint.name}
        </Heading>
        <Text as="p" tone="muted">
          {fill(w.pointsDone, { ends: view.sprint.ends, done: points(sprint.filter((i) => i.status === 'done')), total: points(sprint) })}
        </Text>
      </Stack>
    );
    body = <Board label={fill(w.sprintBoard, { sprint: view.sprint.name })} columns={columns} onMove={onMove} />;
  } else if (screen === 'backlog') {
    const sprint = issues.filter((i) => i.sprint);
    const later = issues.filter((i) => !i.sprint);
    head = (
      <Heading level={1} size={2}>
        {w.backlog}
      </Heading>
    );
    body = (
      <>
        <Section heading={view.sprint.name} intro={fill(w.sprintIntro, { count: sprint.length, points: points(sprint), ends: view.sprint.ends.toLowerCase() })}>
          {table(fill(w.sprintIssues, { sprint: view.sprint.name }), sprint)}
        </Section>
        <Section heading={w.backlog} intro={fill(w.backlogIntro, { count: later.length, points: points(later) })}>
          {table(w.backlogIssues, later)}
        </Section>
      </>
    );
  } else {
    const form = draft ?? { title: issue.title, type: issue.type, description: description.join('\n\n') };
    const change = (next: Partial<typeof form>) => setDraft({ ...form, ...next });
    const stopEditing = () => {
      setEditing(false);
      setDraft(null);
      setTitleError(undefined);
    };
    const save = () => {
      if (!form.title.trim()) {
        setTitleError(w.titleMissing);
        return;
      }
      update(issue.id, { title: form.title.trim(), type: form.type });
      setDescription(form.description.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean));
      stopEditing();
      announce(fill(w.changesSaved, { key: issue.key }));
    };
    head = editing ? (
      <Heading level={1} size={2}>
        {fill(w.editIssue, { key: issue.key })}
      </Heading>
    ) : (
      <Stack gap="pair">
        <Cluster gap="item" align="center">
          <Badge tone={view.types[issue.type]}>{issue.type}</Badge>
          <Text as="span" tone="muted">
            {issue.key}
          </Text>
          <Button label={w.edit} icon="edit" emphasis="quiet" size="s" onClick={() => setEditing(true)} />
        </Cluster>
        <Heading level={1} size={2}>
          {issue.title}
        </Heading>
      </Stack>
    );
    body = (
      <>
        {/* View ↔ edit in one box (Q65 TP4, C27): the description becomes the issue's fields and back; the head above says which. */}
        <Morph state={editing ? 'edit' : 'view'}>
          {editing ? (
            <Stack gap="group">
              <TextField label={w.title} value={form.title} error={titleError} onCommit={(title) => { setTitleError(undefined); change({ title }); }} />
              <Select label={w.type} value={form.type} onChange={(type) => change({ type: type as Issue['type'] })} options={Object.keys(view.types).map((t) => ({ value: t, label: t }))} />
              <TextArea label={w.description} hint={w.descriptionHint} value={form.description} onChange={(text) => change({ description: text })} rows={6} />
              <Cluster gap="item">
                <Button label={w.saveChanges} emphasis="primary" onClick={save} />
                <Button label={w.cancel} onClick={stopEditing} />
              </Cluster>
            </Stack>
          ) : (
            <Section heading={w.description} size={4}>
              <Stack gap="item">
                {description.map((t) => (
                  <Text key={t} as="p">
                    {t}
                  </Text>
                ))}
              </Stack>
            </Section>
          )}
        </Morph>
        <Section heading={w.doneWhen} size={4} intro={fill(w.doneCount, { done: checklist.filter((c) => c.done).length, total: checklist.length })}>
          <CheckboxGroup label={w.checklist}>
            {checklist.map((c) => (
              <Checkbox key={c.id} label={c.label} checked={c.done} onChange={(done) => setChecklist((all) => all.map((x) => (x.id === c.id ? { ...x, done } : x)))} />
            ))}
          </CheckboxGroup>
        </Section>
        <Section heading={w.comments} size={4}>
          <Stack gap="group">
            {comments.map((c) => (
              <Stack key={c.when + c.name} gap="pair">
                <Persona name={c.name} secondary={c.when} size={32} />
                <Text as="p">{c.text}</Text>
              </Stack>
            ))}
            <TextArea label={w.addComment} value={comment} onChange={setComment} rows={3} />
            <Cluster gap="item">
              <Button
                label={w.comment}
                emphasis="primary"
                onClick={() => {
                  if (!comment.trim()) return;
                  setComments((all) => [...all, { name: w.me, when: w.justNow, text: comment.trim() }]);
                  setComment('');
                }}
              />
            </Cluster>
          </Stack>
        </Section>
      </>
    );
    aside = (
      <>
        <Select label={w.status} value={issue.status} onChange={(status) => update(issue.id, { status })} options={view.statuses.map((s) => ({ value: s.id, label: s.title }))} />
        <Select label={w.assignee} value={issue.assignee ?? ''} onChange={(assignee) => update(issue.id, { assignee: assignee || undefined })} options={[{ value: '', label: w.unassigned }, ...view.people.map((p) => ({ value: p, label: p }))]} />
        <DescriptionList
          items={[
            { term: w.pointsHeader, details: String(issue.points) },
            { term: w.sprint, details: issue.sprint ? view.sprint.name : w.backlog },
            { term: w.reporter, details: <Persona name={view.detail.reporter} size={24} /> },
            { term: w.created, details: view.detail.created },
          ]}
        />
      </>
    );
  }

  const current = screen === 'issue' ? 'backlog' : screen;
  return (
    <AppLayout
      height={height}
      label={screen === 'issue' ? issue.title : screen === 'board' ? fill(w.sprintBoard, { sprint: view.sprint.name }) : w.backlog}
      width={screen === 'board' ? 'full' : 'column'}
      sidebarOpen={open}
      onSidebarToggle={() => setOpen((x) => !x)}
      sidebar={
        <>
          <Persona name={view.project} kind="organisation" secondary={w.softwareProject} size={32} />
          <Navigation headingLevel={2} groups={[{ id: 'project', title: w.planning, items: view.places.map((p) => ({ id: p.id, label: p.label, href: at(p.id) })) }]} current={current} />
        </>
      }
      header={<Breadcrumbs items={crumbs[screen]} />}
      headerEnd={
        <>
          {screen === 'board' && <TextField label={w.searchBoard} type="search" icon="search" size="s" hideLabel clearable value={search} onCommit={setSearch} placeholder={w.searchBoard} />}
          <Button label={w.createIssue} emphasis="primary" size="s" onClick={() => notify({ message: fill(w.notInExample, { label: w.creatingIssues }) })} />
          <Avatar name={w.me} size={32} />
        </>
      }
      aside={aside}
      head={head}
    >
      {body}
    </AppLayout>
  );
}
