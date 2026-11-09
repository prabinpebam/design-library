/**
 * Source locations for the element picker. react-grab's primitives (MIT, react-grab 0.2.0) install React's DevTools
 * hook when imported, so this module is imported first in main.tsx, before react-dom. Only the primitives are used:
 * never react-grab's own overlay, toolbar or clipboard flow. Component stacks exist only on the dev server; a static
 * build falls back to selector and catalogue identity.
 */
export {
  freeze, getElementAtPoint, getElementContext, isElementGrabbable, isFreezeActive, unfreeze,
  type ReactGrabElementContext, type StackFrame,
} from 'react-grab/primitives';
