const BOOKMARKS_KEY = "scamgym_bookmarks";

export function getBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(drillId: string): boolean {
  return getBookmarks().includes(drillId);
}

export function toggleBookmark(drillId: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(drillId);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return false; // now unbookmarked
  } else {
    bookmarks.push(drillId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true; // now bookmarked
  }
}
