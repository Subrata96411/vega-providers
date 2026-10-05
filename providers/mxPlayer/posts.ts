import { Post, ProviderContext } from "../types";
import { commonHeaders } from "../headers";

const WEB_API = "https://api.mxplayer.in/v1/web";
const IMAGE_CDN = "https://qqcdnpictest.mxplay.com";
const MAIN_URL = "https://www.mxplayer.in";

function getBestThumbnail(item: any): string {
  const infoList: any[] = item.imageInfo || [];
  // 1. Prefer portrait_large (2x3 aspect ratio)
  const pLarge = infoList.find((x) => x.type === "portrait_large");
  if (pLarge?.url) return `${IMAGE_CDN}/${pLarge.url.replace(/^\/+/, "")}`;

  // 2. Fallback to standard portrait
  const portrait = infoList.find((x) => x.type === "portrait");
  if (portrait?.url) return `${IMAGE_CDN}/${portrait.url.replace(/^\/+/, "")}`;

  // 3. Fallback to landscape (16x9)
  const landscape = infoList.find((x) => x.type === "landscape" || x.type === "bigpic");
  if (landscape?.url) return `${IMAGE_CDN}/${landscape.url.replace(/^\/+/, "")}`;

  // 4. Fallback to item.thumbnailUrl
  if (item.thumbnailUrl) {
    return item.thumbnailUrl.startsWith("http")
      ? item.thumbnailUrl
      : `${IMAGE_CDN}/${item.thumbnailUrl.replace(/^\/+/, "")}`;
  }

  // 5. Fallback placeholder
  return "https://www.mxplayer.in/favicon.ico";
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
  const queryFilter = filter || "browseLangFilterIds=hi&type=1";
  const url = `${WEB_API}/detail/browseItem?pageNum=${page}&pageSize=20&isCustomized=true&${queryFilter}&device-density=2&platform=com.mxplay.desktop&content-languages=hi,en&kids-mode-enabled=false`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
    signal,
  });

  const items: any[] = res.data?.items ?? [];
  return items.map((item: any): Post => {
    const hls =
      item.stream?.thirdParty?.hlsUrl ||
      item.stream?.hls?.high ||
      item.stream?.hls?.base ||
      item.stream?.hls?.main;

    const thumbnail = getBestThumbnail(item);

    return {
      title: item.title || item.name || "",
      link: JSON.stringify({
        id: item.id,
        title: item.title,
        hls: hls || null,
        description: item.description || "",
        rating: item.rating ? String(item.rating) : "",
        image: thumbnail,
      }),
      image: thumbnail,
      tag: "Movie",
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
      const hls =
        item.stream?.thirdParty?.hlsUrl ||
        item.stream?.hls?.high ||
        item.stream?.hls?.base;

      const thumbnail = getBestThumbnail(item);

      posts.push({
        title: item.title || "",
        link: JSON.stringify({
          id: item.id,
          title: item.title,
          hls: hls || null,
          description: item.description || "",
          rating: item.rating ? String(item.rating) : "",
          image: thumbnail,
        }),
        image: thumbnail,
        tag: sec.name || "Movie",
      });
    }
  }

  return posts;
};
