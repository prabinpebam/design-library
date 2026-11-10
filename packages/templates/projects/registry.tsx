/**
 * The Project management template's registry (Q64): AppLayout bound to the project (content/shared.json, read by every
 * layout) and the issue in full (content/issue.json); the layout's id says which screen.
 */
import type { Template } from '@design-library/core/render';
import { ProjectsApp, type ProjectsScreen } from './ProjectsApp';
import type { IssueDetail, ProjectRecord } from './types';

export const registry: Template['registry'] = {
  layouts: {
    // Editing (issue-edit) is a state of Issue (Q65 TP4): the same screen, so changing between them morphs in place.
    AppLayout: ({ shared, contentOf, ctx }) => (
      <ProjectsApp
        view={{ ...(shared?.record as unknown as ProjectRecord), detail: contentOf('issue')?.record as unknown as IssueDetail }}
        screen={(ctx.layout === 'issue-edit' ? 'issue' : ctx.layout) as ProjectsScreen}
        state={ctx.state}
        at={ctx.href}
        height="screen"
      />
    ),
  },
};

/** MP4: the template's own app, for a site that places it in its own views (`@design-library/templates/projects/registry`: no content or pictures). */
export { ProjectsApp };
