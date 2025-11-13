
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function safeString(str) {
  if (!str) return "";
  return str.replace(/[\\"']/g, "").trim();
}

export function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function shortId() {
  return Math.random().toString(36).substring(2, 8);
}
