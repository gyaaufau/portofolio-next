type Block = { type: "heading" | "paragraph" | "list" | "code"; value: string | string[]; level?: number };

function blocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const result: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flush = () => { if (paragraph.length) result.push({ type: "paragraph", value: paragraph.join(" ") }); paragraph = []; if (list.length) result.push({ type: "list", value: list }); list = []; };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.startsWith("```")) { flush(); const code: string[] = []; index += 1; while (index < lines.length && !lines[index].trim().startsWith("```")) code.push(lines[index++]); result.push({ type: "code", value: code.join("\n") }); continue; }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) { flush(); result.push({ type: "heading", value: heading[2], level: heading[1].length }); continue; }
    if (/^[-*]\s+/.test(line)) { if (paragraph.length) flush(); list.push(line.replace(/^[-*]\s+/, "")); continue; }
    if (!line) { flush(); continue; }
    paragraph.push(line);
  }
  flush();
  return result;
}

export function MarkdownArticle({ body }: { body: string }) {
  return <div className="editorial-prose">{blocks(body).map((block, index) => {
    if (block.type === "heading") { const Tag = `h${block.level}` as "h1" | "h2" | "h3"; return <Tag key={index}>{block.value as string}</Tag>; }
    if (block.type === "list") return <ul key={index}>{(block.value as string[]).map((item) => <li key={item}>{item}</li>)}</ul>;
    if (block.type === "code") return <pre key={index}><code>{block.value as string}</code></pre>;
    return <p key={index}>{block.value as string}</p>;
  })}</div>;
}
