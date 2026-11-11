/** The IKEA store template's record (owner Q137): the shop's catalogue, rooms, delivery and payment choices, and its words (content/shared.json). */

export interface Product {
  id: string;
  /** The product's name, set in capitals as the shop does. */
  name: string;
  /** What it is, in a few words: "3-seat sofa, light grey". */
  kind: string;
  category: string;
  /** The price in the store's currency, in whole units. */
  price: number;
  /** A lower earlier price, shown struck through when the product is on offer. */
  was?: number;
  rating: number;
  reviews: number;
  /** The asset id of its picture. */
  picture: string;
  /** Its colours or finishes; the first is the one shown. */
  finishes: string[];
  description: string;
  measurements: { label: string; value: string }[];
  /** A badge such as "New" or "Lower price". */
  tag?: string;
  /** One of the lowest prices: the price sits in the box of the brand's second colour. */
  lowest?: boolean;
}

export interface Room {
  id: string;
  title: string;
  description: string;
  picture: string;
  /** The category its "See all" opens on the products page. */
  category: string;
  /** The products seen in the room's picture, shown under it. */
  products: string[];
}

export interface Choice {
  id: string;
  label: string;
  description: string;
  /** The delivery price in whole units; 0 is free. */
  price?: number;
}

export interface StoreRecord {
  store: string;
  currency: string;
  categories: { id: string; label: string }[];
  products: Product[];
  rooms: Room[];
  /** The product the product page opens on before anything is chosen. */
  featured: string;
  /** The products on the home page's "Popular right now". */
  popular: string[];
  delivery: Choice[];
  payment: Choice[];
  footer: { heading: string; links: string[] }[];
  /** The home page's services and support: a semantic icon name, a title and one line. */
  services: { icon: string; title: string; text: string }[];
  strings: StoreStrings;
}

export interface StoreStrings {
  servicePhone: string;
  logIn: string;
  navLabel: string;
  navOffers: string;
  navIdeas: string;
  navSupport: string;
  saleTitle: string;
  saleText: string;
  saleNote: string;
  memberPrice: string;
  offerBedLinen: string;
  offerDinnerware: string;
  offerDecor: string;
  offerLiving: string;
  storeTitle: string;
  storeText: string;
  familyPanelTitle: string;
  familyPanelText: string;
  rewardsHeading: string;
  rewardsLead: string;
  rewardApp: string;
  rewardOnline: string;
  rewardWorkshops: string;
  rewardPlanning: string;
  joinTitle: string;
  joinText: string;
  joinAction: string;
  seeMore: string;
  businessTitle: string;
  businessText: string;
  businessAction: string;
  cookieSettings: string;
  chatTitle: string;
  chatText: string;
  chatStart: string;
  chatMinimise: string;
  chatClose: string;
  ticketTitle: string;
  ticketText: string;
  ticketClose: string;
  offersHeading: string;
  trendingHeading: string;
  newInTitle: string;
  newInText: string;
  newInLead: string;
  inStorePrice: string;
  newTag: string;
  seeOffers: string;
  places: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  shopProducts: string;
  shopRooms: string;
  roomsHeading: string;
  roomsIntro: string;
  popularHeading: string;
  popularIntro: string;
  familyHeading: string;
  familyText: string;
  familyAction: string;
  bag: string;
  bagCount: string;
  products: string;
  productsIntro: string;
  rooms: string;
  roomProducts: string;
  roomSeeAll: string;
  moreRooms: string;
  all: string;
  sort: string;
  sortPopular: string;
  sortLow: string;
  sortHigh: string;
  count: string;
  wasPrice: string;
  undo: string;
  addToBag: string;
  addToBagNamed: string;
  addedTo: string;
  viewBag: string;
  reviews: string;
  finish: string;
  quantity: string;
  details: string;
  measurements: string;
  deliveryInfo: string;
  deliveryInfoText: string;
  related: string;
  home: string;
  bagHeading: string;
  bagEmptyTitle: string;
  bagEmptyText: string;
  removeNamed: string;
  removed: string;
  summary: string;
  subtotal: string;
  deliveryLine: string;
  deliveryLater: string;
  total: string;
  toCheckout: string;
  keepShopping: string;
  checkout: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  firstName: string;
  lastName: string;
  street: string;
  postcode: string;
  city: string;
  deliveryHeading: string;
  paymentHeading: string;
  deliveryChoice: string;
  paymentChoice: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  placeOrder: string;
  placing: string;
  placed: string;
  fixThese: string;
  required: string;
  free: string;
  confirmedTitle: string;
  confirmedLead: string;
  orderNumber: string;
  deliveryTo: string;
  deliveryBy: string;
  paidWith: string;
  items: string;
  nothingOrdered: string;
  notReal: string;
  storeServices: string;
  language: string;
  enterPostcode: string;
  selectStore: string;
  account: string;
  favourites: string;
  saveFavourite: string;
  menu: string;
  shopByCategory: string;
  allProducts: string;
  notice: string;
  previousPrice: string;
  dealsHeading: string;
  dealsLabel: string;
  dealsLower: string;
  dealsNew: string;
  lowerHeading: string;
  lowerBrowse: string;
  servicesHeading: string;
  overview: string;
  aboutProduct: string;
  howToGet: string;
  returnsTitle: string;
  returnsText: string;
}
