import { Icon, type DataAttributes, type IconName } from '@design-library/core/components';

export interface NoticeProps extends DataAttributes {
  /** The icon in the disc, a semantic icon name. */
  icon: IconName;
  /** One line about a service: "Book assembly in store or online". */
  children: string;
  /** Where the line leads; the whole strip is the link. */
  href?: string;
}

/**
 * A quiet strip with one line about a service and an icon in a disc, across the page's width, under the header or above
 * a listing. An IKEA template part (owner Q138).
 * Not for something the reader must act on or a problem (use Alert), or for a sale (use PictureBanner).
 * @tier fundamental
 * @family ikea
 * @a11y The icon is decorative (the line says it all). With `href` the strip is one link with its focus ring.
 */
export function Notice({ icon, children, href, ...data }: NoticeProps) {
  const inner = (
    <>
      <span data-dl-part="disc">
        <Icon name={icon} size="sm" />
      </span>
      <span data-dl-part="text">{children}</span>
    </>
  );
  return href ? (
    <a {...data} data-dl="ikea-notice" href={href}>
      {inner}
    </a>
  ) : (
    <p {...data} data-dl="ikea-notice">
      {inner}
    </p>
  );
}
