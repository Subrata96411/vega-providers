import { Info, Link, ProviderContext } from "../types";
import { commonHeaders } from "../headers";

const MAIN_URL = "https://www.mxplayer.in";
const WEB_API = "https://api.mxplayer.in/v1/web";
const CDN = "https://d3sgzbosmwirao.cloudfront.net";
const IMAGE_CDN = "https://qqcdnpictest.mxplay.com";

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  const { axios, cheerio } = providerContext;
  let parsed: any = {};
  try {
    parsed = JSON.parse(link);
  } catch {
    parsed = { id: link, type: "movie", title: "Video" };
  }

  const isSeries = parsed.type === "series" || parsed.shareUrl?.includes("tvshow");
  const linkList: Link[] = [];

  if (isSeries) {
    try {
      // 1. Fetch web detail page to parse all Season tabs
      const showPageUrl = `${MAIN_URL}${parsed.shareUrl || `/detail/tvshow/${parsed.id}`}`;
      const pageRes = await axios.get(showPageUrl, {
        headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
      });
      const $ = cheerio.load(pageRes.data as string);

      const seasonTabs: Array<{ seasonNum: number; seasonId: string; title: string }> = [];
      $("div.hs__items-container > div").each((_: number, el: any) => {
        const text = $(el).text().trim() || "";
        const dataId = $(el).attr("data-id") || "";
        const dataTab = $(el).attr("data-tab") || "";
        const seasonNum =
          parseInt(dataTab, 10) ||
          (text.match(/Season\s*(\d+)/i) ? parseInt(text.match(/Season\s*(\d+)/i)![1], 10) : 1);

        if (dataId) {
          seasonTabs.push({
            seasonNum,
            seasonId: dataId,
            title: text || `Season ${seasonNum}`,
          });
        }
      });

      // If no tabs found from container, fallback to show ID
      if (seasonTabs.length === 0 && parsed.id) {
        seasonTabs.push({
          seasonNum: 1,
          seasonId: parsed.id,
          title: "Season 1",
        });
      }

      // Sort seasons ascending (Season 1, Season 2...)
      seasonTabs.sort((a, b) => a.seasonNum - b.seasonNum);

      // 2. Fetch episodes for each season and build both episodesLink and directLinks
      for (const season of seasonTabs) {
        try {
          const epUrl = `${WEB_API}/detail/tab/tvshowepisodes?type=season&id=${season.seasonId}&sortOrder=0&device-density=2&platform=com.mxplay.desktop`;
          const epRes = await axios.get(epUrl, {
            headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
          });

          const items: any[] = epRes.data?.items || [];
          const directLinks: Link["directLinks"] = [];

          items.forEach((ep: any, idx: number) => {
            const hls =
              ep.stream?.thirdParty?.hlsUrl ||
              ep.stream?.hls?.high ||
              ep.stream?.hls?.base ||
              ep.stream?.hls?.main;

            if (hls) {
              const fullUrl = hls.startsWith("http") ? hls : `${CDN}/${hls.replace(/^\/+/, "")}`;
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

              directLinks.push({
                title: ep.title ? `E${idx + 1}: ${ep.title}` : `Episode ${idx + 1}`,
                link: fullUrl,
                type: "series" as const,
                description: ep.description || undefined,
                image: image || undefined,
              });
            }
          });

          linkList.push({
            title: season.title,
            episodesLink: JSON.stringify({
              seasonId: season.seasonId,
              seasonNum: season.seasonNum,
              title: season.title,
            }),
            directLinks: directLinks.length > 0 ? directLinks : undefined,
          });
        } catch {
          // If fetching episodes failed upfront, still offer episodesLink so getEpisodes can fetch it
          linkList.push({
            title: season.title,
            episodesLink: JSON.stringify({
              seasonId: season.seasonId,
              seasonNum: season.seasonNum,
              title: season.title,
            }),
          });
        }
      }
    } catch {
      /* fallback below */
    }
  }

  // Fallback for movies or single stream
  if (linkList.length === 0) {
    const streamLink = parsed.hls
      ? parsed.hls.startsWith("http")
        ? parsed.hls
        : `${CDN}/${parsed.hls.replace(/^\/+/, "")}`
      : `${CDN}/video/${parsed.id}/2/hls/h264_high.m3u8`;

    linkList.push({
      title: "Watch",
      directLinks: [
        {
          title: "Play Movie",
          link: streamLink,
          type: "movie" as const,
        },
      ],
    });
  }

  return {
    title: parsed.title || "MX Player",
    image: parsed.image || "",
    synopsis: parsed.description || "",
    type: isSeries ? "series" : "movie",
    rating: parsed.rating || undefined,
    linkList,
  };
};
