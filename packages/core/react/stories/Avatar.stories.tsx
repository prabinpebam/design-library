import { Avatar, type AvatarSize } from '../fundamentals/Avatar';
import type { Presence } from '../fundamentals/Badge';
import { Cluster } from '../fundamentals/Cluster';
import { people, portrait, portraits } from './people';
import type { StoryFile } from './story';

const sizes: AvatarSize[] = [16, 20, 24, 32, 36, 40, 44, 48, 56, 64, 80, 96, 128];
const presences: Presence[] = ['available', 'busy', 'do-not-disturb', 'away', 'offline'];

export default {
  component: 'Avatar',
  tier: 'fundamental',
  summary: 'A person, organisation, team or bot as a picture, initials or an icon, at 13 sizes from 16 to 128 px, with presence, a state, a count or an activity ring.',
  stories: [
    {
      title: 'Picture, then initials, then an icon',
      description: 'The picture covers the initials once it loads; a picture that fails leaves the initials; with no letters to show, the kind’s icon. The box is never empty.',
      code: `<Avatar name="Ana Ruiz" src={photo} size={64} />
<Avatar name="Kenji Watanabe" src="/no-such-picture.png" size={64} />
<Avatar name="Unknown guest" initials="" size={64} />`,
      arrangement: 'row',
      render: () => (
        <>
          <Avatar name="Ana Ruiz" src={portrait} size={64} />
          <Avatar name="Kenji Watanabe" src="/no-such-picture.png" size={64} />
          <Avatar name="Unknown guest" initials="" size={64} />
        </>
      ),
    },
    {
      title: 'Sizes',
      description: '16 and 20 inline in text (one initial), 24 to 80 level with the control sizes xs to xxl (24, 36, 44, 48, 56, 64, 80), 96 and 128 for profile headers and editors. Default 32.',
      code: `<Avatar name="Priya Natarajan" size={16} />
…
<Avatar name="Priya Natarajan" size={128} />`,
      arrangement: 'row',
      render: () => (
        <>
          {sizes.map((s) => (
            <Avatar key={s} name="Priya Natarajan" size={s} />
          ))}
        </>
      ),
    },
    {
      title: 'Colour from the name',
      description: 'The name picks one of the 8 category colours, the same wherever that name appears; the initials keep 4.5:1 on each in every context. Colour only tells people apart; it never means anything.',
      code: `<Avatar name="Ana Ruiz" size={40} />   // always the same colour for "Ana Ruiz"`,
      arrangement: 'row',
      render: () => (
        <>
          {people.map((n) => (
            <Avatar key={n} name={n} size={40} />
          ))}
        </>
      ),
    },
    {
      title: 'People are circles; organisations, teams and bots are squares',
      description: 'kind="organisation", "team" or "bot" draws a rounded square whose corner grows with the size, so people and the things they belong to never read the same. With no letters, each kind has its own icon.',
      code: `<Avatar name="Ana Ruiz" size={48} />
<Avatar kind="organisation" name="Contoso" size={48} />
<Avatar kind="team" name="Design systems" size={48} />
<Avatar kind="bot" name="Build agent" size={48} />`,
      arrangement: 'row',
      render: () => (
        <>
          <Avatar name="Ana Ruiz" size={48} />
          <Avatar kind="organisation" name="Contoso" size={48} />
          <Avatar kind="team" name="Design systems" size={48} />
          <Avatar kind="bot" name="Build agent" size={48} />
          <Avatar name="Guest" initials="" size={48} />
          <Avatar kind="organisation" name="Contoso" initials="" size={48} />
          <Avatar kind="team" name="Design systems" initials="" size={48} />
          <Avatar kind="bot" name="Build agent" initials="" size={48} />
        </>
      ),
    },
    {
      title: 'Presence',
      description: 'Badge’s presence shapes at the bottom-end corner, sized with the avatar: the shape alone up to 40 px (say the state in words nearby, as Fluent advises), with its glyph from 44 px, larger from 96 px. Read as part of the name: “Ana Ruiz, Busy”.',
      code: `<Avatar name="Ana Ruiz" presence="busy" size={48} />`,
      render: () => (
        <>
          {([32, 48, 96] as AvatarSize[]).map((s) => (
            <Cluster key={s}>
              {presences.map((p, i) => (
                <Avatar key={p} name={people[i]} presence={p} size={s} src={i === 0 ? portrait : undefined} />
              ))}
            </Cluster>
          ))}
        </>
      ),
    },
    {
      title: 'State and count',
      description: 'status shows a state at the same corner and replaces presence: verified, approved, declined, needs attention (each with its own glyph). count pins a number of new things to the top-end corner.',
      code: `<Avatar name="Contoso" kind="organisation" status="verified" size={48} />
<Avatar name="Lena Fischer" status="approved" size={48} />
<Avatar name="Kwame Mensah" count={3} countLabel="3 unread messages" presence="available" size={48} />`,
      arrangement: 'row',
      render: () => (
        <>
          <Avatar name="Contoso" kind="organisation" status="verified" size={48} />
          <Avatar name="Lena Fischer" status="approved" size={48} />
          <Avatar name="Sofia Rossi" status="declined" size={48} />
          <Avatar name="Mei Lin" status="warning" size={48} />
          <Avatar name="Kwame Mensah" count={3} countLabel="3 unread messages" presence="available" size={48} />
          <Avatar name="Yusuf Demir" count={120} size={64} src={portraits['Yusuf Demir']} presence="away" />
        </>
      ),
    },
    {
      title: 'Activity ring',
      description: 'activity names what someone is doing now (speaking in a call, typing, a new story): an accent ring outside a surface-coloured gap, and the words join the name. The box never changes size.',
      code: `<Avatar name="Hana Kim" activity="Speaking" size={56} />`,
      arrangement: 'row',
      render: () => (
        <>
          <Avatar name="Hana Kim" activity="Speaking" size={32} />
          <Avatar name="Hana Kim" activity="Speaking" size={56} presence="available" />
          <Avatar name="Ana Ruiz" activity="New story" size={80} src={portrait} />
        </>
      ),
    },
    {
      title: 'Loading',
      description: 'While the person is still loading, a placeholder of the same size and shape shimmers a few times, then holds still; nothing moves when they arrive.',
      code: `<Avatar name="" loading size={48} />`,
      arrangement: 'row',
      render: () => (
        <>
          <Avatar name="Loading" loading size={32} />
          <Avatar name="Loading" loading size={48} />
          <Avatar name="Loading" kind="organisation" loading size={48} />
        </>
      ),
    },
    {
      title: 'Opens something, or sits beside the name',
      description: 'onClick makes it a button and href a link, named by the person (and their presence); the focus ring follows the shape, outside any activity ring. decorative hides it from assistive technology when the name is written beside it.',
      code: `<Avatar name="Ana Ruiz" presence="available" onClick={openProfile} size={40} />
<Avatar name="Contoso" kind="organisation" href="#/avatar" size={40} />
<Avatar name="Kenji Watanabe" decorative size={24} /> Kenji Watanabe`,
      arrangement: 'row',
      render: () => (
        <>
          <Avatar name="Ana Ruiz" presence="available" onClick={() => undefined} size={40} />
          <Avatar name="Hana Kim" activity="Speaking" onClick={() => undefined} size={40} />
          <Avatar name="Contoso" kind="organisation" href="#/avatar" size={40} />
          <Cluster gap="pair">
            <Avatar name="Kenji Watanabe" decorative size={24} />
            <span>Kenji Watanabe</span>
          </Cluster>
        </>
      ),
    },
    {
      title: 'Initials from any name',
      description: 'First and last words’ first letters; one letter at 16 and 20 px; bracketed parts and email domains ignored; a Chinese, Japanese or Korean name gives its first character; initials overrides.',
      code: `<Avatar name="Priya Natarajan (she/her)" />   // PN
<Avatar name="mei.lin@contoso.com" />         // ML
<Avatar name="王小明" />                       // 王
<Avatar name="Seán" initials="SÓ" />`,
      arrangement: 'row',
      render: () => (
        <>
          <Avatar name="Priya Natarajan (she/her)" size={40} />
          <Avatar name="mei.lin@contoso.com" size={40} />
          <Avatar name="王小明" size={40} />
          <Avatar name="김민준" size={40} />
          <Avatar name="Seán" initials="SÓ" size={40} />
        </>
      ),
    },
  ],
} satisfies StoryFile;
