import { Icon, Rail, type DataAttributes, type IconName } from '@design-library/core/components';

export interface RailChip {
  id: string;
  label: string;
  href: string;
  /** A small picture of what's inside; drawn decorative, since the words say it. */
  picture?: string;
  /** An icon instead of a picture: "arrow-up" for the level above. */
  icon?: IconName;
  /** The page shown now: a strong outline. */
  current?: boolean;
}

export interface ChipRailProps extends DataAttributes {
  /** The rail's name for assistive technology: "Shop by category". */
  label: string;
  chips: RailChip[];
}

/**
 * A row of pill links to categories, each with a small picture and a bold name, that scrolls sideways when it doesn't
 * fit. The page shown now has a strong outline. An IKEA template part (owner Q138).
 * Not for filtering a list in place (use ChipGroup), or for tabs over panels (use Tabs).
 * @tier compound
 * @family ikea
 * @a11y A `nav` named by `label`, its links a list, so assistive technology says how many there are; the current link
 * has `aria-current="page"`. The row is a core Rail (Q139 R3), whose ScrollArea keeps focused links in view.
 */
export function ChipRail({ label, chips, ...data }: ChipRailProps) {
  return (
    <nav {...data} data-dl="ikea-chip-rail" aria-label={label}>
      <Rail item="auto" gap="group">
        {chips.map((c) => (
          <a key={c.id} data-dl="ikea-chip-rail-chip" data-category={c.id} href={c.href} aria-current={c.current ? 'page' : undefined}>
            {c.picture ? <img data-dl-part="picture" src={c.picture} alt="" /> : c.icon ? <Icon name={c.icon} size="sm" /> : null}
            <span>{c.label}</span>
          </a>
        ))}
      </Rail>
    </nav>
  );
}
