# Step 5: use layouts

Goal: every screen built on one layout that owns its regions, spacing and scrolling, so your views only fill regions.
> **Paths:** `agent/…`, `schemas/…` and `guide/…` are inside the installed package (`node_modules/@design-library/core/`); your templates live in your project, here `src/templates/{id}/`. Commands marked *library repository* run only there.


## Pick a layout

All are in `@design-library/core/react`; props in `agent/components/{Name}.json`.

| Layout | For | Regions (props) | Not for |
| --- | --- | --- | --- |
| **SiteLayout** | A website page: sticky site header, sections in one centred column, full-width footer; the window scrolls | `header`, children (main), `footer`; `width` `wide` or `reading` | An app with its own panes |
| **AppLayout** | A working app: collapsible sidebar of places, header, the view scrolling on its own, optional details column | `sidebar`, `header`, `headerEnd`, children, `aside`; needs `label`, `sidebarOpen`, `onSidebarToggle` | A conversation, an editor with a canvas, a website |
| **ChatLayout** | A conversation: sidebar of chats, header, messages in a reading column, the composer pinned under it | `sidebar`, `header`, children (messages), `composer`, `empty` | A list beside a document |
| **EditorLayout** | An editor: a bar, a hideable panel at each side, the working area between; panels float in narrow windows | `bar`, `start`, `end`, `tools`, children (canvas); `startOpen`/`endOpen` and their toggles; `resizable` | A list beside a document, a conversation |
| **ListDetail** | A list beside the chosen item: inbox, settings, files, people; one at a time with Back when narrow | `list`, children (detail); `listLabel`, `detailLabel`, `show`, `onBack`, `backLabel` | A reading page, a side task (use Sheet) |
| **PageLayout** | One page's reading column: its header, then sections | `header`, children | An app frame or a dense working screen |
| **LibraryLayout** | A catalogue or documentation app: header, navigation, main, optional side pane | `header`, `nav`, `main`, `aside` | Single-task screens |
| **Hero** | A view's opening (eyebrow, large title, lead, actions, picture), inside a page | `title`, `eyebrow`, `lead`, `actions`, `note`, `picture` | A page's head (PageHeader) or a section heading (Section) |

**Inside a region**, arrange with fundamentals, never with styled wrappers:

| Need | Use |
| --- | --- |
| Things in a column, a group's space apart | `Stack gap="pair" \| "item" \| "group" \| "section"` |
| A wrapping row (actions, tags) | `Cluster gap=… justify=… align=…` |
| Equal columns compared side by side | `Grid max={2 \| 3 \| 4}` (one column below two columns' width) |
| A headed group of content | `Section heading=… intro=…` |
| A scroll region inside a pane | `ScrollArea` (bleeds to the pane's edge, focus never clipped) |

## Use a layout in JSX

```tsx
import { AppLayout, Navigation, PageHeader, Stack } from '@design-library/core/react';

export function Orders() {
  const [open, setOpen] = useState(true);
  return (
    <AppLayout label="Shop admin" sidebar={<Navigation … />} sidebarOpen={open} onSidebarToggle={() => setOpen(!open)} header={<PageHeader title="Orders" />}>
      <Stack gap="group">{/* the view */}</Stack>
    </AppLayout>
  );
}
```

Read the layout's file in `agent/components/` for each prop's words (`label` names the app for assistive technology; `sidebarLabel` names the sidebar).

## Use a layout from content

In a template, a manifest's layout names its component and regions; the renderer fills them:

```json
{ "id": "home", "title": "Home", "component": "SiteLayout", "content": "content/home.json",
  "regions": [
    { "id": "header", "shared": true, "accepts": ["site-header"] },
    { "id": "main", "accepts": ["*"] },
    { "id": "footer", "shared": true, "accepts": ["site-footer"] }
  ] }
```

- **`SiteLayout`** is bound by the core: name it and its three regions, and content needs no code.
- **Any other layout** (`AppLayout`, `ChatLayout`, `EditorLayout`, a layout of your own) is bound in the template's `registry.tsx` under `layouts`, a function from the content to the layout:

  ```tsx
  export const registry: Template['registry'] = {
    layouts: {
      AppLayout: ({ shared, contentOf, ctx }) => <ShopApp view={shared?.record as unknown as ShopRecord} screen={ctx.layout} at={ctx.href} />,
    },
  };
  ```

  A binding gets `content` (this layout's file), `shared`, `contentOf(layout)` (another layout's content), `ctx` (`layout`, `settings`, `state`, `href`, `picture`, `blocks`) and `region(id)` (a region's blocks, drawn). Worked examples: `projects` (AppLayout), `chat` (ChatLayout), `design` (EditorLayout), `conference` (its own SponsorsLayout inside SiteLayout).

## Make a layout of your own

Only when no core layout holds your screen's regions. It is a custom part ([Step 4](4-components.md), step 6), in your template's `parts/layouts/`:

1. Name it `{template}.{Name}Layout`; its props are its **regions** (`ReactNode`) plus settings; it is made from compounds, fundamentals and tokens, **never another layout**. A section layout goes inside a page layout's region (as `conference.SponsorsLayout` goes in `SiteLayout`'s main).
2. Its CSS owns the regions' arrangement (`display: grid`, `gap`, padding at one level below the visual wrapper, scroll regions to the edge), in `@layer templates`, with tokens only.
3. Narrow windows: no sideways scroll from 320 px; regions stack or one shows at a time.
4. List it in the manifest's `parts.layouts`, bind it in `registry.tsx` `layouts`, name it as a layout's `component`.

## Do and don't

| Do | Don't |
| --- | --- |
| One layout per screen, chosen by what the person does there | Nest a page layout in a page layout, or make a layout from another layout |
| Let the layout own space, scrolling and sticky parts | Add margins, padding, heights or `overflow` in a view |
| Pad once at the right level; let scroll regions reach the edge | Pad a visual wrapper all round, or clip focus rings |
| Name every region a person moves between (`label`, `sidebarLabel`, `listLabel`) | Leave landmarks unnamed |

## Check it

| Check | Proves |
| --- | --- |
| `npx tsc --noEmit` | Regions and settings are the right props |
| `npx design-library-check-content --templates src/templates` | Content fills only the regions its layout declares, with blocks each region accepts |
| *Library repository:* `npm run check:views`, `npm run check:parts`, `npm run check:clipping`; in your project, read against the rules and open it at 320 px with keyboard focus | No styled wrappers in views; a custom layout reaches its parts by child paths; nothing clips focus |
| Open the screen at 320 px, 768 px and wide | Nothing scrolls sideways; panes collapse or float as the layout says |
