import { Post, ProviderContext } from "../types";
import { commonHeaders } from "../headers";

const WEB_API = "https://api.mxplayer.in/v1/web";
const IMAGE_CDN = "https://qqcdnpictest.mxplay.com";
const MAIN_URL = "https://www.mxplayer.in";

const GENRE_IDS: Record<string, string> = {
  drama: "b413dff55bdad743c577a8bea3b65044",
  crime: "48efa872f6f17facebf6149dfc536ee1",
  thriller: "48efa872f6f17facebf6149dfc536ee1",
  action: "7fa3e873a6e48291f69e9fae2a7c1f38",
};

const FILTER_TYPE: Record<string, { type: number }> = {
  hindi_movies: { type: 1 },
  hindi_web_series: { type: 2 },
};

function buildImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${IMAGE_CDN}${path}`;
}

export const getPosts = async function ({
  filter,
  page,
  signal,
  providerContext,
}: {
  filter: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const { axios } = providerContext;
  const genreId = GENRE_IDS[filter];
  const typeInfo = FILTER_TYPE[filter];
  const type = typeInfo?.type ?? 1;

  const url = `${WEB_API}/detail/browseItem?&pageNum=${page}&pageSize=20&isCustomized=true${genreId ? `&genreFilterIds=${genreId}` : ""}&type=${type}&device-density=2&platform=com.mxplay.desktop&content-languages=hi,en&kids-mode-enabled=false`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
    signal,
  });

  const items: any[] = res.data?.items ?? [];
  return items.map((item: any): Post => {
    const hls = item.stream?.thirdParty?.hlsUrl || item.stream?.hls?.high || item.stream?.hls?.base;
    const itemType = item.type === "movie" ? "movie" : "series";

    return {
      title: item.title || item.name || "",
      link: JSON.stringify({
        id: item.id,
        type: itemType,
        title: item.title,
        hls: hls || null,
        shareUrl: item.shareUrl,
      }),
      image: buildImageUrl(
        item.imageInfo?.find((x: any) => x.type === "portrait_large")?.url ||
          item.thumbnailUrl ||
          "",
      ),
      tag: itemType === "movie" ? "Movie" : "Series",
      cornerTag: item.languages?.[0] || undefined,
    };
  });
};

export const getSearchPosts = async function ({
  searchQuery,
  page,
  signal,
  providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const { axios } = providerContext;
  const url = `${WEB_API}/search/result?query=${encodeURIComponent(searchQuery)}&pageNum=${page}&pageSize=20&device-density=2&platform=com.mxplay.desktop&content-languages=hi,en&kids-mode-enabled=false`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
    signal,
  });

  const posts: Post[] = [];
  const sections: any[] = res.data?.sections || [];

  for (const sec of sections) {
    const items: any[] = sec.items || [];
    for (const item of items) {
      if (!item?.id || !item?.title) continue;
      const hls = item.stream?.thirdParty?.hlsUrl || item.stream?.hls?.high || item.stream?.hls?.base;
      const itemType = item.type === "movie" ? "movie" : "series";

      posts.push({
        title: item.title || "",
        link: JSON.stringify({
          id: item.id,
          type: itemType,
          title: item.title,
          hls: hls || null,
          shareUrl: item.shareUrl,
        }),
        image: buildImageUrl(
          item.imageInfo?.find((x: any) => x.type === "portrait_large")?.url ||
            item.thumbnailUrl ||
            "",
        ),
        tag: sec.name || undefined,
      });
    }
  }

  return posts;
};
