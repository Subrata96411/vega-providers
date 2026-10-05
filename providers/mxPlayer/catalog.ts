import { Catalog } from "../types";

export const catalog: Catalog[] = [
  { title: "Hindi Movies", filter: "browseLangFilterIds=hi&type=1" },
  { title: "Trending Movies", filter: "type=1" },
  { title: "Action Movies", filter: "genreFilterIds=7fa3e873a6e48291f69e9fae2a7c1f38&type=1" },
  { title: "Drama Movies", filter: "genreFilterIds=b413dff55bdad743c577a8bea3b65044&type=1" },
  { title: "Comedy Movies", filter: "genreFilterIds=2e3c42ebf0cd77059fc5f6b8e72d5892&type=1" },
  { title: "Crime & Thriller", filter: "genreFilterIds=48efa872f6f17facebf6149dfc536ee1&type=1" },
  { title: "Romance Movies", filter: "genreFilterIds=c7d9f3e1b8a4c2f6e5b1d9a7c3f8e2b4&type=1" },
  { title: "Telugu (Hindi Dub)", filter: "browseLangFilterIds=te&type=1" },
  { title: "Tamil (Hindi Dub)", filter: "browseLangFilterIds=ta&type=1" },
];
