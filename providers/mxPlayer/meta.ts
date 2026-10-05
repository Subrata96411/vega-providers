import { Info, ProviderContext } from "../types";

export const getMeta = async function ({
  link,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  let parsed: any = {};
  try {
    parsed = JSON.parse(link);
  } catch {
    parsed = { id: link, type: "movie", title: "Video" };
  }

  const directLinks = [];
  if (parsed.hls) {
    directLinks.push({
      title: "Play Movie (HLS)",
      link: parsed.hls,
      type: "movie" as const,
    });
  } else {
    directLinks.push({
      title: "Play Stream",
      link: `https://d3sgzbosmwirao.cloudfront.net/video/${parsed.id}/2/hls/h264_high.m3u8`,
      type: "movie" as const,
    });
  }

  return {
    title: parsed.title || "MX Player",
    image: "",
    synopsis: "",
    type: parsed.type || "movie",
    linkList: [
      {
        title: "Watch",
        directLinks,
      },
    ],
  };
};
