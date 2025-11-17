export const normalizeUrl = (raw: string, base: string) => {
  const url = new URL(raw, base);

  url.search = "";
  url.hash = "";

  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
};
