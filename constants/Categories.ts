// constants/Categories.ts

import { catColors, CatSoft } from "./CateColors";


const newsCategoryList = [
  { id: 1, title: 'All',          slug: '',              selected: false },
  { id: 2, title: 'Politics',     slug: 'politics',      selected: false },
  { id: 3, title: 'Science',      slug: 'science',       selected: false },
  { id: 4, title: 'Entertainment',slug: 'entertainment', selected: false },
  { id: 5, title: 'Sports',       slug: 'sports',        selected: false },
  { id: 6, title: 'Technology',   slug: 'technology',    selected: false },
  { id: 7, title: 'Business',     slug: 'business',      selected: false },
];

export default newsCategoryList;

/** Tuỳ chọn: danh sách kèm palette để dùng trực tiếp khi render chip/card */
export const categoriesWithPalette: Array<
  (typeof newsCategoryList)[number] & { palette: CatSoft }
> = newsCategoryList.map(c => ({
  ...c,
  palette: catColors(c.slug || 'general'),
}));
