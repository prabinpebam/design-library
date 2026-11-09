import { Heading, Link, type DataAttributes } from '@design-library/core/react';

export interface Sponsor {
  name: string;
  /** Their site. */
  href?: string;
  /** A few words under the name: what they support. */
  note?: string;
}

export interface SponsorLevel {
  id: string;
  /** The level's name: "Lead partner", "Partners", "Supporters". */
  title: string;
  /** How large its tiles and names are: the lead level large, the smallest small. */
  size: 'l' | 'm' | 's';
  sponsors: Sponsor[];
}

export interface SponsorWallProps extends DataAttributes {
  /** The levels, largest first. */
  levels: SponsorLevel[];
  /** The level headings' level, under the page's own heading. */
  headingLevel?: 2 | 3 | 4;
}

/**
 * The sponsors of an event by level, largest first: each level a heading, then its sponsors as tiles (the name set in
 * the display face, and a few words under it), larger tiles for higher levels. A tile is one quiet surface with no
 * border; a sponsor with a site has its name as the link. A Conference template part (Q64).
 * Not for logos of customers on a company's home page (a logo strip), or for people (use Persona).
 * @tier compound
 * @family conference
 * @a11y Each level is a section named by its heading, and its sponsors a list, so assistive technology says how many
 * there are. Names are text, never a picture of text; a linked name is an ordinary link with its focus ring.
 */
export function SponsorWall({ levels, headingLevel = 2, ...data }: SponsorWallProps) {
  return (
    <div {...data} data-dl="conference-sponsor-wall">
      {levels.map((level) => (
        <section key={level.id} data-dl-part="level" aria-labelledby={`sponsors-${level.id}`}>
          <Heading level={headingLevel} size={4} id={`sponsors-${level.id}`}>
            {level.title}
          </Heading>
          <ul data-dl-part="tiles" data-size={level.size}>
            {level.sponsors.map((s) => (
              <li key={s.name} data-dl-part="tile">
                <span data-dl-part="name">{s.href ? <Link href={s.href}>{s.name}</Link> : s.name}</span>
                {s.note && <span data-dl-part="note">{s.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
