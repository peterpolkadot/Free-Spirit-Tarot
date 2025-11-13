
export default function handler(req, res) {
  const content = `User-agent: *
Allow: /

Sitemap: https://fstarot.com/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(content);
}
