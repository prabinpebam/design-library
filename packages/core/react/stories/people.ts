/** Shared example data for the people stories (Avatar, AvatarGroup, Persona): made-up names, each with an illustrated portrait generated for this library (GPT Image 2.5; provenance in assets-src/library/people). */
import anaRuiz from './media/people/anaRuiz.webp?url';
import kenjiWatanabe from './media/people/kenjiWatanabe.webp?url';
import priyaNatarajan from './media/people/priyaNatarajan.webp?url';
import tomasOBriain from './media/people/tomasOBriain.webp?url';
import lenaFischer from './media/people/lenaFischer.webp?url';
import kwameMensah from './media/people/kwameMensah.webp?url';
import sofiaRossi from './media/people/sofiaRossi.webp?url';
import meiLin from './media/people/meiLin.webp?url';
import yusufDemir from './media/people/yusufDemir.webp?url';
import hanaKim from './media/people/hanaKim.webp?url';

export const portraits: Record<string, string> = {
  'Ana Ruiz': anaRuiz,
  'Kenji Watanabe': kenjiWatanabe,
  'Priya Natarajan': priyaNatarajan,
  'Tomás Ó Briain': tomasOBriain,
  'Lena Fischer': lenaFischer,
  'Kwame Mensah': kwameMensah,
  'Sofia Rossi': sofiaRossi,
  'Mei Lin': meiLin,
  'Yusuf Demir': yusufDemir,
  'Hana Kim': hanaKim,
};
export const people = Object.keys(portraits);
/** Ana Ruiz's portrait, used where a story shows one person. */
export const portrait = anaRuiz;
