import { NodeHtmlMarkdown } from "node-html-markdown";

export function htmlToMarkdown(html: string) {
  return NodeHtmlMarkdown.translate(html);
}
