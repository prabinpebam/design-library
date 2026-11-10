/** Harbour Books' home, drawn from packages/templates/harbour/content/home.json by the core renderer (guide Step 2, "Render it"). */
import { Notifications } from '@design-library/core/components';
import { TemplateView } from '@design-library/core/render';
import harbour from '@design-library/templates/harbour';

export function App() {
  return (
    <>
      <TemplateView template={harbour} layout="home" hrefFor={(_template, layout) => `#/${layout}`} />
      <Notifications />
    </>
  );
}
