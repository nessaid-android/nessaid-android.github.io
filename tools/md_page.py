#!/usr/bin/env python3
"""
Turns an app's privacy policy, kept as Markdown in its own repo, into the article of its page here.

    python tools/md_page.py <policy.md> <section>/<slug>/privacy.html

Replaces what is between `<article class="doc">` and `</article>` in the page that
`site.py privacy` made, and leaves the rest of the page alone. The policy's own notes for
whoever publishes it (a section headed "Notes for whoever publishes this") are left out.

**Just the Markdown the policies use**: headings, paragraphs, lists, tables, bold, italics,
links and code. Python's standard library only, as site.py is; a page that comes out wrong
is read before it is pushed.
"""
import html
import re
import sys


def inline(text):
    text = html.escape(text, quote=False)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![*\w])\*([^*]+)\*(?![*\w])", r"<em>\1</em>", text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    return text


def convert(markdown):
    out, para, items, table = [], [], [], []

    def flush():
        if para:
            out.append("<p>%s</p>" % inline(" ".join(para)))
            para.clear()
        if items:
            out.append("<ul>\n%s\n</ul>" % "\n".join("<li>%s</li>" % inline(i) for i in items))
            items.clear()
        if table:
            rows = [[c.strip() for c in r.strip().strip("|").split("|")] for r in table]
            head, body = rows[0], [r for r in rows[2:]]
            out.append("<table>\n<thead><tr>%s</tr></thead>\n<tbody>\n%s\n</tbody>\n</table>" % (
                "".join("<th>%s</th>" % inline(c) for c in head),
                "\n".join("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in r)
                          for r in body)))
            table.clear()

    for line in markdown.split("\n"):
        stripped = line.strip()
        if stripped.startswith("|"):
            if not table:
                flush()
            table.append(stripped)
            continue
        if table:
            flush()
        if not stripped or stripped == "---":
            flush()
        elif stripped.startswith("#"):
            flush()
            level = len(stripped) - len(stripped.lstrip("#"))
            out.append("<h%d>%s</h%d>" % (level, inline(stripped.lstrip("# ")), level))
        elif stripped.startswith(("- ", "* ")):
            if para:
                flush()
            items.append(stripped[2:])
        elif items and line.startswith("  "):
            items[-1] += " " + stripped
        else:
            if items:
                flush()
            para.append(stripped)
    flush()
    return "\n".join(out)


def main():
    source, page = sys.argv[1], sys.argv[2]
    text = open(source, encoding="utf-8").read()
    text = re.split(r"\n## Notes for whoever publishes this", text)[0]
    title = re.search(r"^# (.+)$", text, re.M).group(1)
    updated = re.search(r"^\*Last updated: ([^*]+)\*", text, re.M).group(1)
    body = re.sub(r"^# .+\n", "", text, count=1, flags=re.M)
    body = re.sub(r"^\*Last updated: [^*]+\*\n", "", body, count=1, flags=re.M)
    article = ('<article class="doc">\n    <h1>%s</h1>\n    <p class="lede">Last updated %s</p>\n%s\n'
               '  </article>' % (html.escape(title.replace(" — privacy policy", "")
                                             .replace("privacy policy", "").strip(" —-"),
                                             quote=False) if False else
                                 "Privacy policy: " + html.escape(title.split(" — ")[0], quote=False),
                                 updated, convert(body)))
    current = open(page, encoding="utf-8").read()
    start, end = current.index('<article class="doc">'), current.index("</article>") + len("</article>")
    with open(page, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(current[:start] + article + current[end:])
    print("wrote", page)


if __name__ == "__main__":
    main()
