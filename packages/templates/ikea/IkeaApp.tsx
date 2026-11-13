/**
 * The IKEA store template's app (owner Q137): one shop, from the home page to a placed order. The catalogue and every
 * word come from content/shared.json; the bag, the product being looked at and the last order live in one store
 * (store.ts), so they hold across screens. Laid out after the real store's pages (owner Q138: its structure and
 * patterns adapted, never its logo, photos or words) with the template's own parts (StoreHeader, ChipRail, Notice,
 * PictureBanner, ProductTile) and core Price, Rail, SiteLayout, Section, Grid, Card, Image, Rating, ChipGroup,
 * MenuButton, Tabs, RadioGroup, NumberField, TextField, DescriptionList, EmptyState, Alert and Footer. No styles: the
 * look is the template's theme (tokens/theme.json) and its parts' tokens (tokens/tokens.json).
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  ChipGroup,
  Cluster,
  DescriptionList,
  EmptyState,
  Footer,
  Grid,
  Heading,
  Link,
  Image,
  MenuButton,
  NumberField,
  Price,
  RadioGroup,
  Rail,
  Rating,
  Section,
  SiteLayout,
  Stack,
  Tabs,
  Text,
  TextField,
  notify,
  useRouter,
} from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import { fill } from '@design-library/core/render';
import { ChatPanel } from './parts/compounds/ChatPanel';
import { ChipRail, type RailChip } from './parts/compounds/ChipRail';
import { OfferMosaic } from './parts/compounds/OfferMosaic';
import { OfferTicket } from './parts/compounds/OfferTicket';
import { PictureBanner } from './parts/compounds/PictureBanner';
import { ProductTile } from './parts/compounds/ProductTile';
import { StoreHeader } from './parts/compounds/StoreHeader';
import { Notice } from './parts/fundamentals/Notice';
import { store, useStore, type Order } from './store';
import type { Product, StoreRecord } from './types';

export type StoreScreen = 'home' | 'products' | 'room' | 'product' | 'bag' | 'checkout' | 'confirmation';

type Picture = (id: string) => { src: string; alt: string };

export interface IkeaAppProps {
  view: StoreRecord;
  screen: StoreScreen;
  at: (layout: string) => string;
  picture: Picture;
}

export function IkeaApp({ view, screen, at, picture, ...data }: IkeaAppProps) {
  const w = view.strings;
  const s = useStore();
  const router = useRouter();
  const go = (layout: string) => (router ? router.navigate(at(layout)) : window.location.assign(at(layout)));
  const money = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: view.currency, maximumFractionDigits: 0 }).format(n);
  const productOf = (id: string) => view.products.find((p) => p.id === id);
  const count = s.bag.reduce((n, l) => n + l.quantity, 0);
  const subtotal = s.bag.reduce((n, l) => n + (productOf(l.product)?.price ?? 0) * l.quantity, 0);

  // The template's face (the IKEA look's Noto Sans), loaded once whatever the library's own type choice is.
  useEffect(() => void loadFace('noto-sans'), []);
  // A page the replica doesn't have (Gift cards, Careers…) links to `soon(label)`: the click gives the honest note
  // instead of reloading the page it's on (Q156). Without scripts the link still goes home.
  const soon = (label: string) => `${at('home')}?soon=${encodeURIComponent(label)}`;
  const notBuilt = (label: string) => notify({ subject: 'ikea-replica', message: fill(w.notInReplica, { label }) });
  // A product or room card names what it opens in data attributes; the click that follows the link records it first.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const stub = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="?soon="]');
      if (stub) {
        e.preventDefault();
        e.stopPropagation();
        notBuilt(decodeURIComponent(stub.getAttribute('href')!.split('?soon=')[1]));
        return;
      }
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-product], [data-room], [data-category]');
      if (el?.dataset.product) store.look(el.dataset.product);
      else if (el?.dataset.room) store.visit(el.dataset.room);
      else if (el?.dataset.category) store.browse(el.dataset.category);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  const add = (p: Product, finish = p.finishes[0], quantity = 1) => {
    store.add(p.id, finish, quantity);
    notify({ subject: 'bag', tone: 'success', message: fill(w.addedTo, { name: p.name, count: quantity }), action: { label: w.viewBag, onAction: () => go('bag') } });
  };

  const [deal, setDeal] = useState('all');
  const [faves, setFaves] = useState<string[]>([]);
  // binary-setting: a favourite is a per-product mark toggled in place over its picture, like the eye and lock toggles
  // (Q125); a Switch with a label doesn't fit on a picture, and the heart is how shops show it.
  const favourite = (p: Product) => (
    <Button
      label={fill(w.saveFavourite, { name: p.name })}
      icon="heart"
      iconOnly
      emphasis="default"
      pressed={faves.includes(p.id)}
      onClick={() => setFaves((f) => (f.includes(p.id) ? f.filter((x) => x !== p.id) : [...f, p.id]))}
    />
  );

  const priceOf = (p: Product, size: 'm' | 'l' = 'm') => (
    <Price value={p.price} currency={view.currency} was={p.was} wasLabel={p.was ? fill(w.previousPrice, { price: money(p.was) }) : undefined} highlight={p.lowest} size={size} />
  );

  const tile = (p: Product, level: 2 | 3 | 4 = 3) => (
    <ProductTile
      key={p.id}
      data-product={p.id}
      name={p.name}
      kind={p.kind}
      href={at('product')}
      picture={picture(p.picture)}
      tag={p.tag}
      tagTone={p.was ? 'offer' : 'new'}
      price={priceOf(p)}
      rating={
        <Rating label={fill(w.reviews, { rating: p.rating, count: p.reviews })} hideLabel value={p.rating} precision={0.5} readOnly size="s" count={p.reviews} countLabel="" />
      }
      favourite={favourite(p)}
      action={<Button label={fill(w.addToBagNamed, { name: p.name })} icon="bag-add" iconOnly emphasis="primary" onClick={() => add(p)} />}
      headingLevel={level}
    />
  );

  const roomBanner = (r: StoreRecord['rooms'][number], caption: 'over' | 'below' = 'below', ratio: 'classic' | 'portrait' = 'portrait') => (
    <PictureBanner key={r.id} data-room={r.id} title={r.title} href={at('room')} picture={picture(r.picture)} caption={caption} ratio={ratio} />
  );

  const categoryChips = (current?: string): RailChip[] =>
    view.categories.map((c) => {
      const first = view.products.find((p) => p.category === c.id);
      return { id: c.id, label: c.label, href: at('products'), picture: first ? picture(first.picture).src : undefined, current: current === c.id };
    });

  const header = (
    <StoreHeader
      name={view.store}
      href={at('home')}
      current={screen === 'home'}
      barLabel={w.storeServices}
      start={[{ label: w.language, icon: 'globe', href: soon(w.languageChoice) }]}
      end={[
        { label: w.enterPostcode, icon: 'delivery', href: at('checkout') },
        { label: w.selectStore, icon: 'store', href: soon(w.selectStore) },
      ]}
      search={
        <TextField
          label={w.products}
          hideLabel
          type="search"
          icon="search"
          placeholder={w.productsIntro}
          value={s.query}
          mode="form"
          onChange={(q) => store.search(q)}
          onCommit={() => go('products')}
          clearable
        />
      }
      actions={
        <>
          <Button label={w.account} icon="person" iconOnly emphasis="quiet" onClick={() => notBuilt(w.account)} />
          <MenuButton
            label={w.favourites}
            icon="heart"
            iconOnly
            emphasis="quiet"
            items={
              faves.length
                ? faves.map(productOf).filter((p): p is Product => !!p).map((p) => ({ value: p.id, label: p.name, description: p.kind }))
                : [{ value: 'products', label: w.products, description: w.favouritesEmpty }]
            }
            onSelect={(id) => {
              if (id === 'products') go('products');
              else {
                store.look(id);
                go('product');
              }
            }}
          />
          <Badge kind="count" count={count} label={fill(w.bagCount, { count })} anchor={<Button label={w.bag} icon="bag" iconOnly emphasis="quiet" href={at('bag')} />} />
        </>
      }
      navLabel={w.navLabel}
      links={[
        { label: w.products, href: at('products'), current: screen === 'products' && s.category === 'all' && !s.query, onClick: () => store.browse('all') },
        { label: w.rooms, href: at('room'), current: screen === 'room' },
        { label: w.navOffers, href: at('products'), current: screen === 'products' && s.category === 'offers', onClick: () => store.browse('offers') },
        { label: w.navIdeas, href: soon(w.navIdeas) },
        { label: w.navSupport, href: soon(w.navSupport) },
      ]}
    />
  );

  // The footer's links that have a page in the replica go there; the rest give the note.
  const footerHref = (label: string) =>
    label === w.products ? at('products') : label === w.rooms ? at('room') : label === w.navOffers ? at('products') : label === w.navSupport ? soon(label) : label === w.trackOrder ? at('confirmation') : soon(label);
  const footer = (
    <Footer
      arrangement="identity"
      identity={
        <Stack gap="section">
          {[
            [w.joinTitle, w.joinText, w.joinAction],
            [w.businessTitle, w.businessText, w.businessAction],
          ].map(([title, text, action]) => (
            <Stack key={title} gap="item">
              <Heading level={2} size={4}>{title}</Heading>
              <Text as="p">{text}</Text>
              <Link href={soon(title)}>{w.seeMore}</Link>
              <Cluster gap="item">
                <Button label={action} emphasis="strong" href={soon(action)} />
              </Cluster>
            </Stack>
          ))}
        </Stack>
      }
      sections={view.footer.map((f, i) => ({ id: `f${i}`, heading: f.heading, links: f.links.map((label) => ({ label, href: footerHref(label) })) }))}
      tools={
        <Cluster gap="item">
          <Button label={w.cookieSettings} icon="settings" onClick={() => notBuilt(w.cookieSettings)} />
          <Button label={w.language} icon="globe" onClick={() => notBuilt(w.languageChoice)} />
        </Cluster>
      }
      legal={w.notReal}
    />
  );

  let body: ReactNode;
  if (screen === 'home') {
    const popular = view.popular.map(productOf).filter((p): p is Product => !!p);
    const deals = popular.filter((p) => (deal === 'lower' ? p.was || p.lowest : deal === 'new' ? p.tag && !p.was : true));
    const lower = view.products.filter((p) => p.was || p.lowest).slice(0, 3);
    type Tag = 'brand' | 'new' | 'feature' | 'offer';
    const tagWord = (t: Tag) => (t === 'brand' ? w.memberPrice : t === 'feature' ? w.inStorePrice : t === 'new' ? w.newTag : w.dealsLower);
    const tileOver = (title: string, id: string, ratio: 'square' | 'tall', tag: Tag, priority = false) => (
      <PictureBanner title={title} href={at('products')} picture={picture(id)} caption="over" ratio={ratio} tag={tagWord(tag)} tagTone={tag} priority={priority} />
    );
    const offersChip: RailChip = { id: 'offers', label: w.navOffers, href: at('products'), picture: picture('bedsheets').src };
    body = (
      <Stack gap="section">
        <ChipRail label={w.shopByCategory} chips={[offersChip, ...categoryChips()]} />
        <OfferMosaic
          lead={<PictureBanner title={w.saleTitle} text={w.saleText} note={w.saleNote} href={at('products')} surface="feature" titleSize="display" ratio="tall" />}
          columns={[
            [tileOver(w.offerBedLinen, 'bedsheets', 'square', 'brand', true), tileOver(w.offerDinnerware, 'dinnerware', 'tall', 'new')],
            [tileOver(w.offerDecor, 'decorCandle', 'tall', 'feature', true), tileOver(w.offerLiving, 'roomLiving', 'square', 'brand')],
          ]}
        />
        <Section heading={w.offersHeading}>
          <Rail label={w.offersHeading} bar="line">
            {view.categories.map((c) => {
              const first = view.products.find((p) => p.category === c.id);
              return first ? (
                <PictureBanner key={c.id} data-category={c.id} title={c.label} href={at('products')} picture={picture(first.picture)} caption="below" ratio="portrait" tag={w.memberPrice} tagTone="brand" />
              ) : null;
            })}
          </Rail>
        </Section>
        <PictureBanner title={w.storeTitle} text={w.storeText} href={soon(w.selectStore)} picture={picture('storeBand')} caption="side" surface="feature" ratio="wide" />
        <Section heading={w.trendingHeading} tone="sunken" bleed>
          <Rail label={w.trendingHeading} bar="line">
            {[...view.rooms.map((r) => ({ id: r.id, title: r.title, picture: r.picture, href: at('room') })), { id: 'decor', title: w.offerDecor, picture: 'decorCandle', href: at('products') }, { id: 'dinner', title: w.offerDinnerware, picture: 'dinnerware', href: at('products') }].map((x, i, all) => (
              <PictureBanner key={x.id} title={x.title} href={x.href} picture={picture(x.picture)} caption="below" ratio="portrait" tag={i === 0 ? w.newTag : i === all.length - 1 ? w.inStorePrice : undefined} tagTone={i === 0 ? 'new' : 'feature'} />
            ))}
          </Rail>
        </Section>
        <OfferMosaic
          lead={<PictureBanner title={w.newInLead} href={at('room')} picture={picture('roomBedroom')} caption="over" ratio="fill" />}
          columns={[
            [
              <PictureBanner key="newin" title={w.newInTitle} text={w.newInText} href={at('products')} surface="promo" ratio="square" />,
              tileOver(w.rooms, 'roomDining', 'tall', 'new'),
            ],
            [tileOver(w.offerLiving, 'roomWorkspace', 'tall', 'brand'), tileOver(w.offerDecor, 'plantPot', 'square', 'offer')],
          ]}
        />
        <Section heading={w.dealsHeading}>
          <Stack gap="group">
            <ChipGroup
              label={w.dealsLabel}
              hideLabel
              selection="single"
              chips={[
                { id: 'all', label: w.all },
                { id: 'lower', label: w.dealsLower },
                { id: 'new', label: w.dealsNew },
              ]}
              value={[deal]}
              onChange={(v) => setDeal(v[0] ?? 'all')}
              size="l"
            />
            <Grid ratio="aside-end">
              <Rail label={w.dealsHeading} item="l" bar="line">
                {deals.map((p) => tile(p))}
              </Rail>
              <PictureBanner title={w.familyPanelTitle} text={w.familyPanelText} href={at('products')} picture={picture('familyCafe')} caption="panel" ratio="square" />
            </Grid>
          </Stack>
        </Section>
        <Section heading={w.rewardsHeading}>
          <Rail label={w.rewardsHeading} bar="line">
            <PictureBanner title={w.rewardsLead} href={soon(w.joinTitle)} surface="band" ratio="portrait" />
            {(
              [
                [w.rewardApp, 'rewardPhone'],
                [w.rewardOnline, 'rewardLaptop'],
                [w.rewardWorkshops, 'rewardEvents'],
                [w.rewardPlanning, 'rewardPlanning'],
              ] as const
            ).map(([title, id]) => (
              <PictureBanner key={id} title={title} href={soon(title)} picture={picture(id)} caption="below" ratio="portrait" />
            ))}
          </Rail>
        </Section>
        <Section heading={w.lowerHeading}>
          <Grid max={4}>
            <PictureBanner title={w.lowerBrowse} href={at('products')} ratio="tall" />
            {lower.map((p) => (
              <PictureBanner key={p.id} data-product={p.id} title={p.kind.split(',')[0]} href={at('product')} picture={picture(p.picture)} caption="below" ratio="tall" tag={p.was ? w.dealsLower : undefined} tagTone="offer" />
            ))}
          </Grid>
        </Section>
        <Section heading={w.roomsHeading} intro={w.roomsIntro} anchor="rooms">
          <Grid max={4}>{view.rooms.map((r) => roomBanner(r))}</Grid>
        </Section>
        <Section heading={w.servicesHeading}>
          <Grid max={4}>
            {view.services.map((sv) => (
              <Card key={sv.title} title={sv.title} description={sv.text} href={sv.icon === 'delivery' ? at('checkout') : soon(sv.title)} variant="outlined" headingLevel={3} />
            ))}
          </Grid>
        </Section>
        <OfferTicket title={w.ticketTitle} text={w.ticketText} href={at('products')} closeLabel={w.ticketClose} />
      </Stack>
    );
  } else if (screen === 'products') {
    body = <Products view={view} tile={tile} chips={categoryChips} at={at} />;
  } else if (screen === 'room') {
    const room = view.rooms.find((r) => r.id === s.room) ?? view.rooms[0];
    const category = view.categories.find((c) => c.id === room.category);
    body = (
      <Stack gap="section">
        <Stack gap="item">
          <Heading level={1} size="display">{room.title}</Heading>
          <Breadcrumbs label={w.places} items={[{ label: w.home, href: at('home') }, { label: w.rooms, href: `${at('home')}#rooms` }, { label: room.title }]} />
        </Stack>
        <Stack gap="group">
          <Image {...picture(room.picture)} ratio="wide" priority />
          <Text as="p" variant="lead">{room.description}</Text>
        </Stack>
        <Section heading={w.roomProducts}>
          <Stack gap="group">
            <Grid max={4} min="s">{room.products.map(productOf).filter((p): p is Product => !!p).map((p) => tile(p))}</Grid>
            {category ? (
              <Cluster gap="item">
                <Button data-category={category.id} label={fill(w.roomSeeAll, { category: category.label.toLowerCase() })} href={at('products')} />
              </Cluster>
            ) : null}
          </Stack>
        </Section>
        <Section heading={w.moreRooms}>
          <Grid max={3}>{view.rooms.filter((r) => r.id !== room.id).map((r) => roomBanner(r))}</Grid>
        </Section>
      </Stack>
    );
  } else if (screen === 'product') {
    body = <ProductPage view={view} product={productOf(s.product ?? view.featured) ?? view.products[0]} money={money} picture={picture} at={at} add={add} tile={tile} price={priceOf} favourite={favourite} />;
  } else if (screen === 'bag') {
    body = (
      <Stack gap="section">
        <Breadcrumbs label={w.places} items={[{ label: w.home, href: at('home') }, { label: w.bagHeading }]} />
        <Heading level={1} size="display">{w.bagHeading}</Heading>
        {s.bag.length === 0 ? (
          <EmptyState reason="first-use" scope="view" title={w.bagEmptyTitle} actions={<Button label={w.keepShopping} emphasis="primary" href={at('products')} />}>
            {w.bagEmptyText}
          </EmptyState>
        ) : (
          <Grid ratio="2:1" gap="section">
            <Stack gap="group">
              {s.bag.map((l, i) => {
                const p = productOf(l.product);
                if (!p) return null;
                return (
                  <Card
                    key={`${l.product}-${l.finish}`}
                    data-product={p.id}
                    layout="beside"
                    variant="plain"
                    title={p.name}
                    href={at('product')}
                    description={`${p.kind.split(',')[0]} · ${l.finish}`}
                    media={<Image {...picture(p.picture)} ratio="square" />}
                    ratio="square"
                    meta={<Price value={p.price * l.quantity} currency={view.currency} />}
                    actions={
                      <Cluster gap="item" align="center">
                        <NumberField label={w.quantity} value={l.quantity} min={1} max={20} step={1} steppers mode="form" onCommit={(n) => store.quantity(i, n)} />
                        <Button
                          label={fill(w.removeNamed, { name: p.name })}
                          icon="close"
                          iconOnly
                          emphasis="quiet"
                          onClick={() => {
                            const undo = store.remove(i);
                            notify({ subject: 'bag', message: fill(w.removed, { name: p.name }), action: { label: w.undo, onAction: undo } });
                          }}
                        />
                      </Cluster>
                    }
                  />
                );
              })}
            </Stack>
            <Summary view={view} money={money} subtotal={subtotal} delivery={undefined}>
              <Button label={w.toCheckout} emphasis="primary" size="l" href={at('checkout')} />
              <Button label={w.keepShopping} href={at('products')} />
            </Summary>
          </Grid>
        )}
      </Stack>
    );
  } else if (screen === 'checkout') {
    body = <Checkout view={view} money={money} subtotal={subtotal} at={at} go={go} />;
  } else {
    const o = s.order;
    body = (
      <Stack gap="section">
        {o ? (
          <>
            <Alert tone="success" placement="page" title={fill(w.confirmedTitle, { name: o.name })} headingLevel={2}>
              {fill(w.confirmedLead, { email: o.email })}
            </Alert>
            <Heading level={1} size="display">{fill(w.orderNumber, { number: o.number })}</Heading>
            <Grid ratio="2:1" gap="section">
              <DescriptionList
                items={[
                  { term: w.deliveryTo, details: o.address },
                  { term: w.deliveryBy, details: o.delivery },
                  { term: w.paidWith, details: o.payment },
                  { term: w.items, details: o.lines.map((l) => `${l.quantity} × ${productOf(l.product)?.name ?? l.product} (${l.finish})`).join(', ') },
                  { term: w.total, details: money(o.total) },
                ]}
              />
              <Cluster gap="item">
                <Button label={w.keepShopping} emphasis="primary" href={at('products')} />
              </Cluster>
            </Grid>
          </>
        ) : (
          <EmptyState reason="first-use" scope="view" title={w.nothingOrdered} actions={<Button label={w.keepShopping} emphasis="primary" href={at('products')} />}>
            {w.bagEmptyText}
          </EmptyState>
        )}
      </Stack>
    );
  }

  return (
    <SiteLayout {...data} header={header} footer={footer} width="wide" opening="flush">
      {body}
      <ChatPanel title={w.chatTitle} text={w.chatText} start={w.chatStart} openLabel={w.chatTitle} minimiseLabel={w.chatMinimise} closeLabel={w.chatClose} />
    </SiteLayout>
  );
}

function Products({ view, tile, chips, at }: { view: StoreRecord; tile: (p: Product, level?: 2 | 3 | 4) => ReactNode; chips: (current?: string) => RailChip[]; at: (l: string) => string }) {
  const w = view.strings;
  const s = useStore();
  const [sort, setSort] = useState('popular');
  const q = s.query.trim().toLowerCase();
  const category = s.category === 'offers' ? { id: 'offers', label: w.navOffers } : view.categories.find((c) => c.id === s.category);
  const list = view.products
    .filter((p) => (s.category === 'all' || p.category === s.category || (s.category === 'offers' && !!(p.was || p.lowest))) && (!q || `${p.name} ${p.kind}`.toLowerCase().includes(q)))
    .sort((a, b) => (sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : b.reviews - a.reviews));
  const sorts = [
    { value: 'popular', label: w.sortPopular },
    { value: 'low', label: w.sortLow },
    { value: 'high', label: w.sortHigh },
  ];
  const rail: RailChip[] = [{ id: 'all', label: w.allProducts, href: at('products'), current: s.category === 'all' }, ...chips(s.category)];
  return (
    <Stack gap="section">
      <Stack gap="group">
        <Stack gap="item">
          <Heading level={1} size={1}>{q ? `“${s.query}”` : category?.label ?? w.products}</Heading>
          <Breadcrumbs label={w.places} items={[{ label: w.home, href: at('home') }, { label: w.products, href: at('products') }, ...(category ? [{ label: category.label }] : [])]} />
        </Stack>
        <Notice icon="tag" href={at('checkout')}>{w.notice}</Notice>
        <ChipRail label={w.shopByCategory} chips={rail} />
      </Stack>
      <Stack gap="group">
        <Cluster gap="group" justify="between" align="center">
          <MenuButton label={`${w.sort}: ${sorts.find((o) => o.value === sort)?.label ?? ''}`} items={sorts} onSelect={setSort} />
          <Text as="p" tone="muted">{fill(w.count, { count: list.length })}</Text>
        </Cluster>
        {list.length ? (
          <Grid max={4} min="s">{list.map((p) => tile(p, 2))}</Grid>
        ) : (
          <EmptyState reason="no-results" scope="section" title={fill(w.count, { count: 0 })} actions={<Button label={w.all} onClick={() => store.browse('all')} />}>
            {w.bagEmptyText}
          </EmptyState>
        )}
      </Stack>
    </Stack>
  );
}

function ProductPage({
  view,
  product: p,
  picture,
  at,
  add,
  tile,
  price,
  favourite,
}: {
  view: StoreRecord;
  product: Product;
  money: (n: number) => string;
  picture: Picture;
  at: (l: string) => string;
  add: (p: Product, finish?: string, quantity?: number) => void;
  tile: (p: Product, level?: 2 | 3 | 4) => ReactNode;
  price: (p: Product, size?: 'm' | 'l') => ReactNode;
  favourite: (p: Product) => ReactNode;
}) {
  const w = view.strings;
  const [finish, setFinish] = useState(p.finishes[0]);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('overview');
  const [shown, setShown] = useState(p.id);
  if (shown !== p.id) {
    setShown(p.id);
    setFinish(p.finishes[0]);
    setQuantity(1);
  }
  const category = view.categories.find((c) => c.id === p.category);
  const related = view.products.filter((x) => x.category === p.category && x.id !== p.id).concat(view.products.filter((x) => x.category !== p.category)).slice(0, 6);
  return (
    <Stack gap="section">
      <Breadcrumbs label={w.places} items={[{ label: w.products, href: at('products') }, { label: category?.label ?? w.all, href: at('products') }, { label: p.name }]} />
      <Grid ratio="3:2" gap="section">
        <Stack gap="group">
          <Image {...picture(p.picture)} ratio="square" priority />
          <Tabs
            label={w.aboutProduct}
            selected={tab}
            onChange={setTab}
            items={[
              { id: 'overview', label: w.overview, panel: <Text as="p">{p.description}</Text> },
              { id: 'measurements', label: w.measurements, panel: <DescriptionList items={p.measurements.map((m) => ({ term: m.label, details: m.value }))} /> },
              { id: 'delivery', label: w.deliveryInfo, panel: <Text as="p">{w.deliveryInfoText}</Text> },
            ]}
          />
        </Stack>
        <Stack gap="group">
          <Stack gap="pair">
            {p.tag ? <Text as="p" variant="body-sm" tone={p.was ? 'danger' : 'warning'}>{p.tag}</Text> : null}
            <Cluster gap="item" justify="between" align="start">
              <Stack gap="pair">
                <Heading level={1} size={2}>{p.name}</Heading>
                <Text as="p" tone="muted">{p.kind}</Text>
              </Stack>
              {favourite(p)}
            </Cluster>
          </Stack>
          {price(p, 'l')}
          <Rating label={fill(w.reviews, { rating: p.rating, count: p.reviews })} hideLabel value={p.rating} precision={0.5} readOnly showValue />
          {p.finishes.length > 1 ? (
            <RadioGroup label={w.finish} options={p.finishes.map((f) => ({ value: f, label: f }))} value={finish} onChange={setFinish} orientation="inline" appearance="tile" />
          ) : null}
          <Stack gap="item">
            <Notice icon="delivery">{w.howToGet}</Notice>
            <Notice icon="store">{w.returnsText}</Notice>
          </Stack>
          <Cluster gap="item" align="center">
            <NumberField label={w.quantity} value={quantity} min={1} max={20} step={1} steppers mode="form" onCommit={setQuantity} />
            <Button label={w.addToBag} icon="bag-add" emphasis="primary" size="l" onClick={() => add(p, finish, quantity)} />
          </Cluster>
        </Stack>
      </Grid>
      <Section heading={w.related}>
        <Rail label={w.related}>{related.map((x) => tile(x))}</Rail>
      </Section>
    </Stack>
  );
}

function Summary({ view, money, subtotal, delivery, children }: { view: StoreRecord; money: (n: number) => string; subtotal: number; delivery?: number; children?: ReactNode }) {
  const w = view.strings;
  return (
    <Section heading={w.summary} level={2} size={3} tone="sunken">
      <Stack gap="group">
        <DescriptionList
          items={[
            { term: w.subtotal, details: money(subtotal) },
            { term: w.deliveryLine, details: delivery === undefined ? w.deliveryLater : delivery === 0 ? w.free : money(delivery) },
            { term: w.total, details: <Text as="span" variant="lead">{money(subtotal + (delivery ?? 0))}</Text> },
          ]}
        />
        <Stack gap="item">{children}</Stack>
      </Stack>
    </Section>
  );
}

const FIELDS = ['email', 'firstName', 'lastName', 'street', 'postcode', 'city', 'cardNumber', 'expiry', 'cvc'] as const;
type FieldId = (typeof FIELDS)[number];

function Checkout({ view, money, subtotal, at, go }: { view: StoreRecord; money: (n: number) => string; subtotal: number; at: (l: string) => string; go: (l: string) => void }) {
  const w = view.strings;
  const s = useStore();
  const [form, setForm] = useState<Record<FieldId, string>>({ email: '', firstName: '', lastName: '', street: '', postcode: '', city: '', cardNumber: '', expiry: '', cvc: '' });
  const [phone, setPhone] = useState('');
  const [delivery, setDelivery] = useState(view.delivery[0].id);
  const [payment, setPayment] = useState(view.payment[0].id);
  const [tried, setTried] = useState(false);
  const fee = view.delivery.find((d) => d.id === delivery)?.price ?? 0;
  const needed = FIELDS.filter((f) => payment === 'card' || !['cardNumber', 'expiry', 'cvc'].includes(f));
  const missing = needed.filter((f) => !form[f].trim());
  const field = (id: FieldId, type: 'text' | 'email' | 'tel' = 'text', inputMode?: 'numeric') => (
    <TextField label={w[id]} type={type} inputMode={inputMode} value={form[id]} mode="form" onChange={(v) => setForm((f) => ({ ...f, [id]: v }))} error={tried && !form[id].trim() ? w.required : undefined} />
  );

  if (s.bag.length === 0)
    return (
      <EmptyState reason="first-use" scope="view" title={w.bagEmptyTitle} actions={<Button label={w.keepShopping} emphasis="primary" href={at('products')} />}>
        {w.bagEmptyText}
      </EmptyState>
    );

  const place = async () => {
    setTried(true);
    if (missing.length) {
      notify({ subject: 'checkout', tone: 'error', message: fill(w.fixThese, { count: missing.length }) });
      throw new Error('missing');
    }
    await new Promise((r) => setTimeout(r, 900));
    const order: Order = {
      number: String(Math.floor(100000000 + Math.random() * 899999999)),
      name: form.firstName.trim(),
      email: form.email.trim(),
      address: `${form.firstName} ${form.lastName}, ${form.street}, ${form.postcode} ${form.city}`,
      delivery: ((d) => (d ? `${d.label}. ${d.description}` : delivery))(view.delivery.find((d) => d.id === delivery)),
      payment: view.payment.find((p) => p.id === payment)?.label ?? payment,
      lines: s.bag,
      total: subtotal + fee,
    };
    store.place(order);
    go('confirmation');
  };

  return (
    <Stack gap="section">
      <Breadcrumbs label={w.places} items={[{ label: w.bagHeading, href: at('bag') }, { label: w.checkout }]} />
      <Heading level={1} size="display">{w.checkout}</Heading>
      <Grid ratio="2:1" gap="section">
        <Stack gap="section">
          <Section heading={w.contact} level={2} size={3}>
            <Grid max={2}>
              {field('email', 'email')}
              <TextField label={w.phone} type="tel" value={phone} mode="form" onChange={setPhone} optional />
            </Grid>
          </Section>
          <Section heading={w.address} level={2} size={3}>
            <Stack gap="item">
              <Grid max={2}>
                {field('firstName')}
                {field('lastName')}
              </Grid>
              {field('street')}
              <Grid max={2}>
                {field('postcode', 'text', 'numeric')}
                {field('city')}
              </Grid>
            </Stack>
          </Section>
          <Section heading={w.deliveryHeading} level={2} size={3}>
            <RadioGroup
              label={w.deliveryChoice}
              appearance="tile"
              value={delivery}
              onChange={setDelivery}
              options={view.delivery.map((d) => ({ value: d.id, label: d.label, description: d.description, meta: d.price ? money(d.price) : w.free }))}
            />
          </Section>
          <Section heading={w.paymentHeading} level={2} size={3}>
          <RadioGroup
            label={w.paymentChoice}
            appearance="tile"
            value={payment}
            onChange={setPayment}
            options={view.payment.map((p) => ({
              value: p.id,
              label: p.label,
              description: p.description,
              reveals:
                p.id === 'card' ? (
                  <Stack gap="item">
                    {field('cardNumber', 'text', 'numeric')}
                    <Grid max={2}>
                      {field('expiry')}
                      {field('cvc', 'text', 'numeric')}
                    </Grid>
                  </Stack>
                ) : undefined,
            }))}
          />
          </Section>
        </Stack>
        <Summary view={view} money={money} subtotal={subtotal} delivery={fee}>
          <Button label={w.placeOrder} emphasis="primary" size="l" pendingLabel={w.placing} doneLabel={w.placed} onCommit={place} onError={() => undefined} />
          <Text as="p" variant="caption" tone="muted">{w.notReal}</Text>
        </Summary>
      </Grid>
    </Stack>
  );
}
