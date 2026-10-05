import { EpisodeLink, ProviderContext } from "../types";
import { commonHeaders } from "../headers";

const WEB_API = "https://api.mxplayer.in/v1/web";
const IMAGE_CDN = "https://qqcdnpictest.mxplay.com";
const CDN = "https://d3sgzbosmwirao.cloudfront.net";
const MAIN_URL = "https://www.mxplayer.in";

export const getEpisodes = async function ({
  url,
  providerContext,
}: {
  url: string;
  providerContext: ProviderContext;
}): Promise<EpisodeLink[]> {
  const { axios } = providerContext;
  let seasonId = url;
  try {
    const parsed = JSON.parse(url);
    seasonId = parsed.seasonId || parsed.id || url;
  } catch {}

  try {
    const epUrl = `${WEB_API}/detail/tab/tvshowepisodes?type=season&id=${seasonId}&sortOrder=0&device-density=2&platform=com.mxplay.desktop`;
    const epRes = await axios.get(epUrl, {
      headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
    });

    const items: any[] = epRes.data?.items || [];
    const episodes: EpisodeLink[] = [];

    items.forEach((ep: any, idx: number) => {
      const hls =
        ep.stream?.thirdParty?.hlsUrl ||
        ep.stream?.hls?.high ||
        ep.stream?.hls?.base ||
        ep.stream?.hls?.main;

      if (hls) {
        const fullUrl = hls.startsWith("http")
          ? hls
          : `${CDN}/${hls.replace(/^\/+/, "")}`;

        let image = "";
        const infoList: any[] = ep.imageInfo || [];
        const p = infoList.find(
          (x) =>
            x.type === "portrait_large" ||
            x.type === "portrait" ||
            x.type === "landscape" ||
            x.type === "bigpic",
        );
        if (p?.url) {
          image = `${IMAGE_CDN}/${p.url.replace(/^\/+/, "")}`;
        }

        episodes.push({
          title: ep.title ? `E${idx + 1}: ${ep.title}` : `Episode ${idx + 1}`,
          link: fullUrl,
          description: ep.description || undefined,
          image: image || undefined,
        });
      }
    });

    return episodes;
  } catch (err) {
    return [];
  }
};
