import type { ReactNode } from 'react';
import { useState } from 'react';
import { Badge } from '../fundamentals/Badge';
import { Button } from '../fundamentals/Button';
import { ListItem } from '../fundamentals/ListItem';
import { Stack } from '../fundamentals/Stack';
import type { StoryFile } from './story';

/** A list as Select and MenuButton draw one: the role on the list, the items a pair gap apart so fills never touch. */
const Items = ({ children, ...list }: { children: ReactNode; role: string; 'aria-label': string; 'aria-multiselectable'?: 'true' }) => (
  <div {...list}>
    <Stack gap="pair">{children}</Stack>
  </div>
);

function Expandable() {
  const [open, setOpen] = useState(true);
  return (
    <Items role="menu" aria-label="Show">
      <ListItem role="menuitem" icon="comment" label="Comments" meta="3" expanded={open} onClick={() => setOpen(!open)} />
      {open && (
        <Items role="group" aria-label="Comments">
          <ListItem role="menuitem" inset label="Open" meta="2" />
          <ListItem role="menuitem" inset label="Addressed" meta="1" />
        </Items>
      )}
      <ListItem role="menuitem" icon="info" label="Details" expanded={false} />
    </Items>
  );
}
const picture = (sky: string, land: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${sky}"/><path d="M0 30l12-12 10 10 6-6 12 12v6H0z" fill="${land}"/></svg>`,
  )}`;

export default {
  component: 'ListItem',
  tier: 'fundamental',
  summary: 'One item of a list a person chooses from: the same item in every menu and select.',
  stories: [
    {
      title: 'Lazy thumbnails and kind-icon recovery',
      description: 'The picture is lazy and decorative. A missing picture keeps the same square slot and shows its supplied kind icon; changing the thumbnail address retries the new picture.',
      code: `<ListItem role="option" thumbnail={picture} icon="image" label="Picture" />
<ListItem role="option" thumbnail="/missing.jpg" icon="code" label="Source file" />`,
      render: () => (
        <Items role="listbox" aria-label="Media recovery">
          <ListItem role="option" thumbnail={picture('#bae6fd', '#0e7490')} icon="image" label="Picture" />
          <ListItem role="option" thumbnail="/missing-list-thumbnail.jpg" icon="code" label="Source file" />
        </Items>
      ),
    },
    {
      title: 'Mild proxy-focus tint',
      description: 'For an aria-activedescendant owner: hover and active use the same mild token fill, not a row outline. The optional fixed-slot chevron adds a non-border cue when the tint alone lacks 3:1. Native keyboard focus still has its ring; selection semantics are unchanged.',
      code: `<ListItem role="option" label="Talks" active activeAppearance="tint" activeIndicator />`,
      render: () => (
        <Items role="listbox" aria-label="Search destinations">
          <ListItem role="option" label="Talks" active activeAppearance="tint" activeIndicator />
          <ListItem role="option" label="Speakers" activeAppearance="tint" activeIndicator />
          <ListItem role="option" label="Editions" activeAppearance="tint" activeIndicator disabled />
        </Items>
      ),
    },
    {
      title: 'Options in a listbox',
      description: 'As a Select draws them: the chosen option is checked and tinted; the keyboard’s option has the focus ring. Items sit a gap apart, so fills never touch.',
      code: `<ListItem role="option" label="Button copy review" selected />
<ListItem role="option" label="Colour roles in dark" active />`,
      render: () => (
        <Items role="listbox" aria-label="Current revision">
          <ListItem role="option" label="Button copy review" selected />
          <ListItem role="option" label="Colour roles in dark" active />
          <ListItem role="option" label="Spacing on component pages" />
        </Items>
      ),
    },
    {
      title: 'Options when several can be chosen',
      description: 'In a listbox that allows several, each option shows a box at the start instead of the trailing check; the filled box is the one cue, so chosen rows take no tint.',
      code: `<div role="listbox" aria-multiselectable="true">
  <ListItem role="option" multiple selected label="Light" />
  <ListItem role="option" multiple label="Dark" />
</div>`,
      render: () => (
        <Items role="listbox" aria-multiselectable="true" aria-label="Contexts to export">
          <ListItem role="option" multiple selected label="Light" />
          <ListItem role="option" multiple selected label="Dark" />
          <ListItem role="option" multiple label="Light, more contrast" active />
          <ListItem role="option" multiple label="Dark, more contrast" disabled description="Turn on more contrast in the theme first." />
        </Items>
      ),
    },
    {
      title: 'Menu items: icons, shortcuts, submenus, a destructive action',
      description: 'Items without an icon keep the icon column (inset) so every name starts on one line. Shortcuts and the submenu chevron sit at the end, muted. A destructive action takes the danger colour beside its word.',
      code: `<ListItem role="menuitem" icon="copy" label="Copy" shortcut="Ctrl+C" />
<ListItem role="menuitem" inset label="Paste as plain text" shortcut="Ctrl+Shift+V" />
<ListItem role="menuitem" icon="external" label="Share" submenu />
<ListItem role="menuitem" icon="close" label="Delete revision" tone="danger" shortcut="Del" />`,
      render: () => (
        <Items role="menu" aria-label="Revision">
          <ListItem role="menuitem" icon="copy" label="Copy" shortcut="Ctrl+C" />
          <ListItem role="menuitem" inset label="Paste as plain text" shortcut="Ctrl+Shift+V" />
          <ListItem role="menuitem" icon="comment" label="Add a comment" shortcut="Ctrl+Alt+M" active />
          <ListItem role="menuitem" icon="external" label="Share" submenu />
          <ListItem role="menuitem" inset label="Export" submenu disabled description="Save the revision first." />
          <ListItem role="menuitem" icon="close" label="Delete revision" tone="danger" shortcut="Del" />
        </Items>
      ),
    },
    {
      title: 'Menu checkboxes and radios',
      description: 'A setting kept inside a menu (the platform’s menu pattern): a check shows what is on, a dot shows which one of a group is chosen. Outside menus, binary settings use Switch.',
      code: `<ListItem role="menuitemcheckbox" selected label="Show rulers" shortcut="Ctrl+R" />
<ListItem role="menuitemradio" selected label="Fit to width" />`,
      render: () => (
        <Items role="menu" aria-label="View">
          <ListItem role="menuitemcheckbox" selected label="Show rulers" shortcut="Ctrl+R" />
          <ListItem role="menuitemcheckbox" label="Show grid" shortcut="Ctrl+'" />
          <Items role="group" aria-label="Zoom">
            <ListItem role="menuitemradio" selected label="Fit to width" />
            <ListItem role="menuitemradio" label="Actual size" shortcut="Ctrl+0" />
            <ListItem role="menuitemradio" label="Fit to page" />
          </Items>
        </Items>
      ),
    },
    {
      title: 'One, two and three lines',
      description: 'The name alone; with one line of supporting words; with a longer description, which wraps to at most two lines (anything longer ends with an ellipsis).',
      code: `<ListItem role="option" label="Compact" />
<ListItem role="option" label="Normal" description="The default space between things." />
<ListItem role="option" label="Extra loose" description="…" />`,
      render: () => (
        <Items role="listbox" aria-label="Space">
          <ListItem role="option" label="Compact" />
          <ListItem role="option" label="Normal" description="The default space between things." selected />
          <ListItem
            role="option"
            label="Extra loose"
            description="The most space between things: for reading-first pages, presentations and large screens viewed from a distance, where density matters least."
          />
        </Items>
      ),
    },
    {
      title: 'People, pictures and meta',
      description: 'At size l: a round avatar (initials when there is no picture) or a square picture, the name and a supporting line, and trailing meta such as a count or a time.',
      code: `<ListItem size="l" role="option" avatar={{ name: 'Asha Rao' }} label="Asha Rao" description="Design lead" meta="Owner" />
<ListItem size="l" role="menuitem" thumbnail={src} label="Coastline.jpg" description="2.4 MB" meta="2 min ago" />`,
      render: () => (
        <Stack gap="group">
          <Items role="listbox" aria-label="Reviewers">
            <ListItem size="l" role="option" avatar={{ name: 'Asha Rao' }} label="Asha Rao" description="Design lead" meta="Owner" selected />
            <ListItem size="l" role="option" avatar={{ name: 'Tomás Ibarra' }} label="Tomás Ibarra" description="Engineering" meta="Editor" />
            <ListItem size="l" role="option" avatar={{ name: 'Mei Lin' }} label="Mei Lin" description="Away until Monday" meta="Viewer" disabled />
          </Items>
          <Items role="menu" aria-label="Recent files">
            <ListItem size="l" role="menuitem" thumbnail={picture('#bae6fd', '#0e7490')} label="Coastline.jpg" description="2.4 MB" meta="2 min ago" />
            <ListItem size="l" role="menuitem" thumbnail={picture('#fde68a', '#b45309')} label="Desert dunes.jpg" description="3.1 MB" meta="Yesterday" />
          </Items>
        </Stack>
      ),
    },
    {
      title: 'Static list: badges and row actions',
      description: 'Items of a plain list (role listitem) are not targets themselves: no hover fill and no Tab stop. A trailing Badge says a status; an icon-only Button is the row’s one action and its own Tab stop. Checklists use CheckboxGroup and settings lists use Switch label-first, not ListItem.',
      code: `<ListItem size="l" role="listitem" avatar={{ name: 'Asha Rao' }} label="Asha Rao" description="asha@example.com"
  trailing={<Button iconOnly icon="close" emphasis="quiet" size="s" label="Remove Asha Rao" />} />`,
      render: () => (
        <Items role="list" aria-label="Reviewers">
          <ListItem size="l" role="listitem" avatar={{ name: 'Asha Rao' }} label="Asha Rao" description="asha@example.com" trailing={<Badge>Owner</Badge>} />
          <ListItem
            size="l"
            role="listitem"
            avatar={{ name: 'Tomás Ibarra' }}
            label="Tomás Ibarra"
            description="tomas@example.com"
            trailing={<Button iconOnly icon="close" emphasis="quiet" size="s" label="Remove Tomás Ibarra" />}
          />
          <ListItem
            size="l"
            role="listitem"
            avatar={{ name: 'Mei Lin' }}
            label="Mei Lin"
            description="mei@example.com"
            trailing={<Button iconOnly icon="close" emphasis="quiet" size="s" label="Remove Mei Lin" />}
          />
        </Items>
      ),
    },
    {
      title: 'Inline description',
      description: 'A short qualifier beside the name rather than under it: a branch, a handle, a version.',
      code: `<ListItem role="option" label="Fix focus ring clipping" description="main" descriptionPosition="inline" />`,
      render: () => (
        <Items role="listbox" aria-label="Branch">
          <ListItem role="option" label="Fix focus ring clipping" description="main" descriptionPosition="inline" selected />
          <ListItem role="option" label="Slider marks" description="f15-slider" descriptionPosition="inline" />
        </Items>
      ),
    },
    {
      title: 'Unavailable, inactive, busy and unread',
      description: 'Unavailable is skipped by the keyboard (the reason is obvious). Inactive looks the same but stays reachable, so its reason is read. Busy shows the compact progress in place of its icon while its action runs. Unread is a heavier name and one dot; the name says “unread” to assistive technology.',
      code: `<ListItem role="menuitem" icon="copy" label="Duplicate" disabled />
<ListItem role="menuitem" icon="external" label="Publish" inactive description="Publishing is down; try again in a few minutes." />
<ListItem role="menuitem" icon="external" label="Export as PDF" busy />
<ListItem role="option" label="Spacing review" description="2 new comments" unread meta="09:41" />`,
      render: () => (
        <Stack gap="group">
          <Items role="menu" aria-label="Page">
            <ListItem role="menuitem" icon="copy" label="Duplicate" disabled />
            <ListItem role="menuitem" icon="external" label="Publish" inactive description="Publishing is down; try again in a few minutes." />
            <ListItem role="menuitem" icon="external" label="Export as PDF" busy />
          </Items>
          <Items role="listbox" aria-label="Revisions">
            <ListItem role="option" label="Spacing review" description="2 new comments" unread meta="09:41" />
            <ListItem role="option" label="Button copy" description="Read" meta="Yesterday" />
          </Items>
        </Stack>
      ),
    },
    {
      title: 'Expandable',
      description: 'An item that shows or hides the items one level below it; the chevron points down while closed and up while open (never sideways, which means a submenu), and aria-expanded follows. One level only: deeper nesting is a tree.',
      code: `<ListItem role="option" icon="comment" label="Comments" meta="3" expanded={open} onClick={() => setOpen(!open)} />`,
      render: () => <Expandable />,
    },
    {
      title: 'Sizes',
      description: 's (32 px) for dense desktop menus, a written target exception that returns to 44 px on touch; normal (44 px); l (56 px) for avatars and pictures. Each list uses one size.',
      code: `<ListItem size="s" role="menuitem" icon="copy" label="Copy" shortcut="Ctrl+C" />
<ListItem role="menuitem" icon="copy" label="Copy" shortcut="Ctrl+C" />
<ListItem size="l" role="menuitem" avatar={{ name: 'Asha Rao' }} label="Asha Rao" />`,
      render: () => (
        <Stack gap="group">
          {(['s', 'normal', 'l'] as const).map((size) => (
            <Items key={size} role="menu" aria-label={`Size ${size}`}>
              {size === 'l' ? (
                <ListItem size={size} role="menuitem" avatar={{ name: 'Asha Rao' }} label="Asha Rao" description="Design lead" meta="Owner" />
              ) : (
                <ListItem size={size} role="menuitem" icon="copy" label="Copy" shortcut="Ctrl+C" />
              )}
              <ListItem size={size} role="menuitem" icon="search" label="Find" shortcut="Ctrl+F" active />
            </Items>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Palettes',
      description: 'As a MenuButton of colour presets draws them: a palette strip with square inner colours, and a line that tells items apart.',
      code: `<ListItem role="menuitem" label="Ocean" description="Calm: deep teal, sky and coral." preview={['#0e7490', '#38bdf8', '#f97316']} />`,
      render: () => (
        <Items role="menu" aria-label="Presets">
          <ListItem role="menuitem" label="Ocean" description="Calm: deep teal, sky and coral." preview={['#0e7490', '#38bdf8', '#f97316']} />
          <ListItem role="menuitem" label="Forest" description="Earthy: moss, bark and fern." preview={['#166534', '#a16207', '#65a30d', '#f5f5f4']} />
        </Items>
      ),
    },
  ],
} satisfies StoryFile;


