/** The AI chat template's registry (Q64): its one layout, ChatLayout, bound to the record in content/chat.json; its states (New chat, Reply failed) inherit the record and name the chat to open on (`settings.open`). */
import type { Template } from '@design-library/core/render';
import { ChatApp } from './ChatApp';
import type { ChatAppView } from './types';

export const registry: Template['registry'] = {
  layouts: {
    ChatLayout: ({ content, ctx }) => <ChatApp view={content.record as unknown as ChatAppView} picture={ctx.picture} open={typeof content.settings?.open === 'string' ? content.settings.open : undefined} height="screen" />,
  },
};
