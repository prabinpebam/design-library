/**
 * The installed templates, in the order the library lists them (Q62, Q64). Each is a folder with a manifest
 * (template.json), a content schema, content JSON per layout, pictures and any custom parts in its own namespace;
 * `npm run check:content` checks every one listed here. To add one, follow Foundation › Templates, content and
 * customization › Adding a template.
 */
import type { Template } from '@design-library/core/render';
import corporate from './corporate';
import portfolio from './portfolio';
import blog from './blog';
import conference from './conference';
import chat from './chat';
import design from './design';
import projects from './projects';
import harbour from './harbour';

export const templates: Template[] = [corporate, chat, portfolio, blog, conference, design, projects, harbour];

export const templateOf = (id: string) => templates.find((t) => t.manifest.id === id);
