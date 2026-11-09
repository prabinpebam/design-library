import { Persona } from '../fundamentals/Persona';
import { portrait, portraits } from './people';
import type { StoryFile } from './story';

export default {
  component: 'Persona',
  tier: 'fundamental',
  summary: 'An avatar with the name beside or under it and up to two more lines: role, status, location.',
  stories: [
    {
      title: 'Sizes and lines',
      description: '24: the name alone, for tables and chips. 32 and 40: name and one line (a role). 56 and up: a third line. From 64 the name takes the heading-4 style.',
      code: `<Persona name="Ana Ruiz" size={24} />
<Persona name="Ana Ruiz" secondary="Design lead" size={40} />
<Persona name="Ana Ruiz" secondary="Design lead" tertiary="Lisbon · 22:14 local time" size={56} />`,
      render: () => (
        <>
          <Persona name="Ana Ruiz" size={24} />
          <Persona name="Ana Ruiz" secondary="Design lead" size={32} />
          <Persona name="Ana Ruiz" secondary="Design lead" size={40} src={portrait} />
          <Persona name="Ana Ruiz" secondary="Design lead" tertiary="Lisbon · 22:14 local time" size={56} src={portrait} />
          <Persona name="Ana Ruiz" secondary="Design lead" tertiary="Lisbon · 22:14 local time" size={80} src={portrait} />
        </>
      ),
    },
    {
      title: 'Presence, state and activity',
      description: 'The avatar is hidden from assistive technology because the name is beside it; its presence, state or activity is read after the name (“Kenji Watanabe, Busy”). Put the status in the second line too when it matters, as Fluent advises for small avatars.',
      code: `<Persona name="Kenji Watanabe" secondary="Busy · In a meeting until 15:00" presence="busy" />
<Persona name="Contoso" kind="organisation" secondary="Verified organisation" status="verified" />
<Persona name="Hana Kim" secondary="Speaking" activity="Speaking" />`,
      render: () => (
        <>
          <Persona name="Kenji Watanabe" secondary="Busy · In a meeting until 15:00" presence="busy" src={portraits['Kenji Watanabe']} />
          <Persona name="Contoso" kind="organisation" secondary="Verified organisation" status="verified" />
          <Persona name="Build agent" kind="bot" secondary="Runs every push" presence="available" />
          <Persona name="Hana Kim" secondary="Speaking" activity="Speaking" src={portraits['Hana Kim']} />
        </>
      ),
    },
    {
      title: 'Text below',
      description: 'textPosition="below" centres the words under the avatar, for people grids and profile cards.',
      code: `<Persona name="Priya Natarajan" secondary="Product manager" textPosition="below" size={64} />`,
      arrangement: 'row',
      render: () => (
        <>
          <Persona name="Priya Natarajan" secondary="Product manager" textPosition="below" size={64} src={portraits['Priya Natarajan']} />
          <Persona name="Kwame Mensah" secondary="Engineer" textPosition="below" size={64} presence="away" />
          <Persona name="Mei Lin" secondary="Data scientist" textPosition="below" size={64} src={portraits['Mei Lin']} />
        </>
      ),
    },
    {
      title: 'Your own profile: edit the photo',
      description: 'onPhotoChange and onPhotoRemove add an Edit photo menu: Upload a new photo, and Remove photo while there is one (the initials show instead).',
      code: `<Persona name="Ana Ruiz" secondary="ana.ruiz@contoso.com" src={photo} size={96} onPhotoChange={pickFile} onPhotoRemove={removePhoto} />`,
      render: () => <Persona name="Ana Ruiz" secondary="ana.ruiz@contoso.com" tertiary="Design lead" src={portrait} size={96} onPhotoChange={() => undefined} onPhotoRemove={() => undefined} />,
    },
    {
      title: 'Loading',
      description: 'The avatar’s placeholder and text lines of the same shape, so nothing moves when the person arrives.',
      code: `<Persona name="" loading size={40} />`,
      render: () => <Persona name="" loading size={40} />,
    },
  ],
} satisfies StoryFile;
