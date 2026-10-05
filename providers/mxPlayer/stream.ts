import { ProviderContext, Stream } from "../types";

export const getStream = async function ({
  link,
}: {
  link: string;
  type: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
  isDownload?: boolean;
}): Promise<Stream[]> {
  const streamUrl = link.startsWith("http")
    ? link
    : `https://d3sgzbosmwirao.cloudfront.net/${link}`;

  return [
    {
      server: "MX Player CloudFront HLS",
      link: streamUrl,
      type: "m3u8",
      headers: {
        Referer: "https://www.mxplayer.in/",
        Origin: "https://www.mxplayer.in",
      },
    },
  ];
};
