export const getFileUrl = (path: string): string => {
  const url = new URL(path, window.location.href);
  return url.href;
};

const filesCache: Map<string, string> = new Map();

export const getFileSource = async (url: string): Promise<string> => {
  if(filesCache.has(url)) {
    return filesCache.get(url);
  }
  const response = await fetch(url);
  if(response.ok) {
    const source = await response.text();
    filesCache.set(url, source);
    return source;
  }
  throw new Error("file response not ok");
};
