import { AvatarGroup, type AvatarGroupMember } from '../fundamentals/AvatarGroup';
import type { Presence } from '../fundamentals/Badge';
import { people, portrait } from './people';
import type { StoryFile } from './story';

const roles = ['Design lead', 'Engineer', 'Product manager', 'Researcher', 'Engineer', 'Content designer', 'Engineer', 'Data scientist', 'Accessibility specialist', 'Engineer'];
const presences: Presence[] = ['available', 'busy', 'away', 'available', 'offline', 'do-not-disturb', 'available', 'away', 'busy', 'available'];
const team: AvatarGroupMember[] = people.map((name, i) => ({ name, secondary: roles[i], presence: presences[i], src: i === 2 ? portrait : undefined }));

export default {
  component: 'AvatarGroup',
  tier: 'fundamental',
  summary: 'Several people or teams in one row, overlapping or side by side, with a "+n" that lists everyone hidden.',
  stories: [
    {
      title: 'A stack with “+n”',
      description: 'At most max faces, the “+n” counting as one, so the row never grows past its width. Each face has a surface-coloured cut; later ones sit on top. “+n” opens the rest with their names and roles; Escape returns to it.',
      code: `<AvatarGroup label="Assignees" members={team} max={4} />`,
      render: () => <AvatarGroup label="Assignees" members={team} max={4} />,
    },
    {
      title: 'Sizes',
      description: '24 in table cells and chips, 32 (default) in rows and headers, 48 on cards. Each face hides a fifth of its size under the next, at every size.',
      code: `<AvatarGroup size={24} … />
<AvatarGroup … />
<AvatarGroup size={48} … />`,
      render: () => (
        <>
          <AvatarGroup label="Reviewers" members={team.slice(0, 6)} size={24} />
          <AvatarGroup label="Reviewers" members={team.slice(0, 6)} />
          <AvatarGroup label="Reviewers" members={team.slice(0, 6)} size={48} />
        </>
      ),
    },
    {
      title: 'Spread, with presence',
      description: 'layout="spread" sets faces side by side when each should be easy to pick out (who is in this call); showPresence adds each person’s presence.',
      code: `<AvatarGroup label="In this call" layout="spread" showPresence members={team} max={6} size={40} />`,
      render: () => <AvatarGroup label="In this call" layout="spread" showPresence members={team} max={6} size={40} />,
    },
    {
      title: 'Everyone fits',
      description: 'With no more members than max, every face shows and there is no “+n”. Teams and organisations keep their squares inside a group.',
      code: `<AvatarGroup label="Owners" members={[ana, { name: 'Design systems', kind: 'team' }, { name: 'Contoso', kind: 'organisation' }]} />`,
      render: () => (
        <AvatarGroup
          label="Owners"
          members={[team[0], { name: 'Design systems', kind: 'team' }, { name: 'Contoso', kind: 'organisation' }]}
        />
      ),
    },
  ],
} satisfies StoryFile;
