import { Card } from '../compounds/Card';
import { ChatMessage } from '../compounds/ChatMessage';
import { CodeBlock } from '../compounds/CodeBlock';
import { Code } from '../fundamentals/Code';
import { Heading } from '../fundamentals/Heading';
import { Image } from '../fundamentals/Image';
import { Link } from '../fundamentals/Link';
import { List } from '../fundamentals/List';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const tokenCode = `{
  "c": {
    "field": {
      "ring-width": { "$type": "dimension", "$value": "{size.focus-width}" }
    }
  }
}`;

export default {
  component: 'ChatMessage',
  tier: 'compound',
  summary: 'One message in a conversation with an assistant: a person’s bubble, or a full-width reply holding any content.',
  stories: [
    {
      title: 'A person and the assistant',
      description: 'The person’s message is a tinted bubble at the end of the line, at most about three quarters of the column; the reply is full width with no enclosure, so it reads as a document. Each is an article named “You said” or “Assistant said” for screen readers.',
      code: `<ChatMessage from="person" author="You">How do I change the focus ring colour?</ChatMessage>
<ChatMessage from="assistant" author="Assistant">
  <Text as="p">Change <Code>c.field.ring-color</Code> in the tokens, then run <Code>npm run tokens</Code>.</Text>
</ChatMessage>`,
      render: () => (
        <Stack gap="group">
          <ChatMessage from="person" author="You">
            How do I change the focus ring colour for text fields only?
          </ChatMessage>
          <ChatMessage from="assistant" author="Assistant">
            <Text as="p">
              Change <Code>c.field.ring-color</Code> in the token source, then run <Code>npm run tokens</Code>. Every text-entry box reads it, so they all change together; buttons keep the page’s focus colour.
            </Text>
          </ChatMessage>
        </Stack>
      ),
    },
    {
      title: 'Rich content in a reply',
      description: 'A reply holds any component, one gap between blocks: a heading, paragraphs, a list, a code block with its Copy, and links to its sources.',
      code: `<ChatMessage from="assistant" author="Assistant">
  <Heading level={4} size={4}>Three steps</Heading>
  <List variant="numbered" items={steps} />
  <CodeBlock label="tokens.json" code={code} />
  <Text as="p" variant="body-sm" tone="muted">Source: <Link href="…">Colour model</Link></Text>
</ChatMessage>`,
      render: () => (
        <ChatMessage from="assistant" author="Assistant">
          <Heading level={4} size={4}>
            Change the ring in three steps
          </Heading>
          <List
            variant="numbered"
            items={[
              { id: '1', content: 'Open packages/core/tokens/tokens.json and find the field group.' },
              { id: '2', content: 'Set ring-width or point ring-color at another semantic colour.' },
              { id: '3', content: 'Run npm run tokens and reload the library.' },
            ]}
          />
          <CodeBlock label="tokens.json" code={tokenCode} />
          <Text as="p" variant="body-sm" tone="muted">
            Source: <Link href="http://127.0.0.1:8765/#foundation.md">Foundation, colour model</Link>
          </Text>
        </ChatMessage>
      ),
    },
    {
      title: 'Pictures and files sent',
      description: 'Sent pictures show as square thumbnails and files as tiles with a type icon, the name and the type, above the person’s bubble. A long name ends in an ellipsis.',
      code: `<ChatMessage from="person" author="You" attachments={[
  { kind: 'image', name: 'hills.png', src, alt: 'Rolling green hills' },
  { kind: 'file', name: 'quarterly-review-notes-final.pdf', type: 'PDF' },
]}>Compare these with last quarter.</ChatMessage>`,
      render: () => (
        <ChatMessage
          from="person"
          author="You"
          attachments={[
            { kind: 'image', name: 'hills.png', src: scenes[0].src, alt: scenes[0].alt },
            { kind: 'file', name: 'quarterly-review-notes-final-version.pdf', type: 'PDF' },
            { kind: 'file', name: 'budget.xlsx', type: 'Spreadsheet' },
          ]}
        >
          Compare these notes with last quarter’s and list what changed.
        </ChatMessage>
      ),
    },
    {
      title: 'A picture and a card in a reply',
      description: 'A generated or found picture sits in the reply at the column’s width; a card offers one or two actions, as in an app’s inline result.',
      code: `<ChatMessage from="assistant" author="Assistant">
  <Text as="p">Here is the evening version.</Text>
  <Image src={src} alt="…" ratio="wide" rounded />
  <Card title="Desert evening" description="…" actions={…} />
</ChatMessage>`,
      render: () => (
        <ChatMessage from="assistant" author="Assistant">
          <Text as="p">Here is the evening version, with the sun lower and warmer.</Text>
          <Image src={scenes[1].src} alt={scenes[1].alt} ratio="wide" rounded />
          <Card title="Desert evening" eyebrow="Picture" description="640 × 360, drawn for these examples." headingLevel={4} />
        </ChatMessage>
      ),
    },
  ],
} satisfies StoryFile;
