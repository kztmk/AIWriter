import type { PostsFilterArguments } from '../../../components/PostsFilter';

const expansionRecord = (records: Record<string, unknown>): string => {
  let searchParams = '';
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const record in records) {
    searchParams += `${record},`;
  }

  // delete last comma
  if (searchParams.length > 0) {
    searchParams = searchParams.slice(0, -1);
  }

  return searchParams;
};

/* search parameters use only
 * search
 *  search?: string;
 *  tags?: Record<string, unknown>;
 *  categories?: Record<string, unknown>;
 * sort/filter
 *  order?: 'asc' | 'desc';
 *  orderby?: 'author' | 'date' | 'id' | 'include' | 'modified'
 * | 'parent' | 'relevance' | 'slug' | 'include_slugs' | 'title'
 *  offset?: number;
 */
const generateGetPostsEndpoint = (data: PostsFilterArguments): string => {
  type QueryParam = {
    [key: string]: string;
  };
  const queryParams: QueryParam = {};
  if (data.search.length > 0) {
    queryParams.search = data.search;
  }

  if (data.category) {
    queryParams.categories = data.category.id.toString();
  }

  if (data.tags.length > 0) {
    let tagParams = '';
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < data.tags.length; i++) {
      tagParams += `${data.tags[i].id},`;
    }
    if (tagParams.length > 0) {
      queryParams.tags = tagParams.replace(/,$/, '');
    }
  }

  if (data.from) {
    queryParams.after = data.from.toISO();
  }

  if (data.to) {
    queryParams.before = data.to.toISO();
  }

  if (!data.order) {
    queryParams.order = 'asc';
  }

  if (data.orderby !== 'date') {
    queryParams.orderby = data.orderby;
  }

  if (data.page > 1) {
    queryParams.page = data.page.toString();
  }

  return new URLSearchParams(queryParams).toString();
};

export default generateGetPostsEndpoint;
