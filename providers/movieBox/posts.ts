import { getBaseUrl } from "../getBaseUrl";
import { Post, ProviderContext } from "../types";
import { absoluteUrl, parseNuxtData, providerValue } from "./utils";

type SubjectPreview = {
  detailPath?: string;
  title?: string;
  coverUrl?: string;
  hasResource?: boolean;
};

type SubjectListResponse = {
  code?: number;
  message?: string;
  data?: {
    subjectList?: Array<{
      detailPath?: string;
      title?: string;
      cover?: { url?: string };
      hasResource?: boolean;
    }>;
  };
};

const pageSize = 18;
const requestHeaders = {
  Accept: "application/json",
  "x-client-info": JSON.stringify({ timezone: "Asia/Colombo" }),
  "x-source": "",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

function collectSubjectPreviews(value: unknown): Map<string, SubjectPreview> {
  const subjects = new Map<string, SubjectPreview>();
  const visited = new Set<object>();

  function visit(current: unknown): void {
    if (!current || typeof current !== "object" || visited.has(current)) return;
    visited.add(current);

    if ("detailPath" in current && typeof current.detailPath === "string") {
      const cover = "cover" in current ? current.cover : undefined;
      subjects.set(current.detailPath, {
        title:
          "title" in current && typeof current.title === "string"
            ? current.title
            : undefined,
        coverUrl:
          cover &&
          typeof cover === "object" &&
          "url" in cover &&
          typeof cover.url === "string"
            ? cover.url
            : undefined,
        hasResource:
          "hasResource" in current && typeof current.hasResource === "boolean"
            ? current.hasResource
            : undefined,
      });
    }
    Object.values(current).forEach(visit);
  }

  visit(value);
  return subjects;
}

function mapSubjects(subjects: SubjectPreview[]): Post[] {
  return subjects
    .filter(
      (subject) =>
        Boolean(subject.detailPath && subject.title) &&
        subject.hasResource !== false,
    )
    .map((subject) => ({
      title: subject.title?.replace(/\s*\[.*?\]\s*$/, "") || "",
      link: `/moviesDetail/${subject.detailPath}`,
      image: subject.coverUrl || "",
    }));
}

async function fetchCatalogPage(
  filter: string,
  page: number,
  signal: AbortSignal,
): Promise<Post[]> {
  const baseUrl = (await getBaseUrl(providerValue)) || "https://officialmoviebox.com";
  const params = new URLSearchParams({
    page: String(Math.max(1, page)),
    perPage: String(pageSize),
  });
  if (filter === "/newWeb/movie") {
    params.set("tabId", "ONEROOM_MOVIE");
  }

  const response = await fetch(
    absoluteUrl(
      baseUrl,
      `/wefeed-h5api-bff/subject/trending?${params.toString()}`,
    ),
    { headers: requestHeaders, signal },
  );
  if (!response.ok) throw new Error(`MovieBox Web returned ${response.status}`);

  const payload = (await response.json()) as SubjectListResponse;
  if (payload.code !== 0) {
    throw new Error(payload.message || "MovieBox Web catalog request failed");
  }
  return mapSubjects(
    (payload.data?.subjectList || []).map((subject) => ({
      detailPath: subject.detailPath,
      title: subject.title,
      coverUrl: subject.cover?.url,
      hasResource: subject.hasResource,
    })),
  );
}

export const getPosts = async function ({
  filter,
  page,
  signal,
}: {
  filter: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const path = filter || "/";
  return fetchCatalogPage(path, page, signal);
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
  if (page > 1 || !searchQuery.trim()) return [];
  const baseUrl = (await getBaseUrl(providerValue)) || "https://officialmoviebox.com";
  const url = `${baseUrl}/newWeb/searchResult?keyword=${encodeURIComponent(searchQuery.trim())}`;

  const response = await fetch(url, { signal, headers: requestHeaders });
  if (!response.ok) return [];

  const html = await response.text();
  const $ = providerContext.cheerio.load(html);
  const subjects = collectSubjectPreviews(
    parseNuxtData(html, providerContext.cheerio),
  );
  const posts: Post[] = [];
  const seen = new Set<string>();

  $('a[href^="/moviesDetail/"]').each((_, element) => {
    const card = $(element);
    const href = card.attr("href") || "";
    if (!href.startsWith("/moviesDetail/") || seen.has(href)) return;
    const detailP = href.replace("/moviesDetail/", "");
    const subject = subjects.get(detailP);

    const title =
      subject?.title?.trim() ||
      card.find("h2, h3").first().text().trim() ||
      card.find("img").attr("alt")?.trim() ||
      "";
    if (!title) return;

    seen.add(href);
    posts.push({
      title,
      link: href,
      image: subject?.coverUrl || card.find("img").attr("src") || "",
    });
  });

  return posts;
};
