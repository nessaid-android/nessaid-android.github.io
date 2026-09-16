#!/usr/bin/env python3
"""
Small helpers for the Nessaid Android Studio site. Python 3, standard library only.

Run from the repository root:

  python tools/site.py product  <apps|games> <slug> "<Name>" "<short description>"
      Creates /<section>/<slug>/index.html, help/index.html and videos/index.html
      from /templates. Then add the product to assets/js/catalog.js.

  python tools/site.py topic    <apps|games> <slug> <topic-slug> "<Title>"
      Creates /<section>/<slug>/help/<topic-slug>.html. Then add
      { slug, title, summary } to that product's "help" array in catalog.js.

  python tools/site.py privacy  <apps|games> <slug>
      Creates /<section>/<slug>/privacy.html from the template. Fill it in, then
      set privacy: true for the product in catalog.js.

  python tools/site.py sitemap
      Rewrites sitemap.xml from every published page.

  python tools/site.py check
      Reports products whose folders, help pages or privacy pages disagree with
      catalog.js.

  python tools/site.py serve [port]
      Previews the site at http://localhost:8000. Root-relative links
      (/assets/...) need a server; opening the files directly will not work.

Existing files are never overwritten.
"""
import datetime
import http.server
import io
import os
import re
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_URL = "https://nessaid-android.github.io"
SECTIONS = {"apps": "Apps", "games": "Games"}
EXCLUDED_DIRS = {"templates", "tools", "assets", ".git"}
EXCLUDED_FILES = {"404.html"}


def die(message):
    sys.stderr.write(message + "\n")
    sys.exit(1)


def read(path):
    with io.open(path, encoding="utf-8", newline="") as f:
        return f.read()


def write_new(path, text):
    if os.path.exists(path):
        print("exists, left alone: " + os.path.relpath(path, ROOT))
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    print("created: " + os.path.relpath(path, ROOT).replace(os.sep, "/"))


def html_escape(value):
    return (value.replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def fill(template, values):
    text = read(os.path.join(ROOT, "templates", template))
    for key, value in values.items():
        text = text.replace("{{" + key + "}}", html_escape(value))
    return text


def check_section(section):
    if section not in SECTIONS:
        die("section must be one of: " + ", ".join(SECTIONS))


def check_slug(slug):
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", slug):
        die("slug must be lowercase letters, digits and hyphens: " + slug)


def product_name(section, slug):
    """The name from the product's own page, so topic pages match it."""
    index = os.path.join(ROOT, section, slug, "index.html")
    if not os.path.exists(index):
        die("no product page at /%s/%s/ - create it with 'product' first" % (section, slug))
    match = re.search(r"<h1>(.*?)</h1>", read(index))
    return match.group(1) if match else slug


def cmd_product(section, slug, name, short):
    check_section(section)
    check_slug(slug)
    values = {"SECTION": section, "SECTION_TITLE": SECTIONS[section], "SLUG": slug,
              "NAME": name, "SHORT": short}
    base = os.path.join(ROOT, section, slug)
    write_new(os.path.join(base, "index.html"), fill("product.html", values))
    write_new(os.path.join(base, "help", "index.html"), fill("help-index.html", values))
    write_new(os.path.join(base, "videos", "index.html"), fill("videos.html", values))


def cmd_topic(section, slug, topic, title):
    check_section(section)
    check_slug(slug)
    check_slug(topic)
    values = {"SECTION": section, "SLUG": slug, "NAME": product_name(section, slug), "TITLE": title}
    write_new(os.path.join(ROOT, section, slug, "help", topic + ".html"), fill("help-topic.html", values))


def cmd_privacy(section, slug):
    check_section(section)
    check_slug(slug)
    values = {"SECTION": section, "SLUG": slug, "NAME": product_name(section, slug)}
    write_new(os.path.join(ROOT, section, slug, "privacy.html"), fill("privacy.html", values))


def published_pages():
    for folder, dirs, files in os.walk(ROOT):
        rel = os.path.relpath(folder, ROOT).replace(os.sep, "/")
        dirs[:] = [d for d in dirs if not (rel == "." and d in EXCLUDED_DIRS) and not d.startswith(".")]
        for name in sorted(files):
            if not name.endswith(".html") or (rel == "." and name in EXCLUDED_FILES):
                continue
            path = name if rel == "." else rel + "/" + name
            yield "/" + (path[: -len("index.html")] if name == "index.html" else path)


def cmd_sitemap():
    today = datetime.date.today().isoformat()
    urls = sorted(published_pages(), key=lambda u: (u.count("/"), u))
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in urls:
        lines.append("  <url><loc>%s%s</loc><lastmod>%s</lastmod></url>" % (SITE_URL, url, today))
    lines.append("</urlset>")
    with io.open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    print("sitemap.xml: %d pages" % len(urls))


def catalog_products():
    """Each product's section, slug, privacy flag and help topic slugs, read loosely from catalog.js."""
    text = read(os.path.join(ROOT, "assets", "js", "catalog.js"))
    products = []
    for block in re.split(r"\n    \{\n", text)[1:]:
        slug = re.search(r"^\s*slug: '([^']+)'", block, re.M)
        section = re.search(r"^\s*section: '([^']+)'", block, re.M)
        if not slug or not section:
            continue
        privacy = re.search(r"^\s*privacy: (true|false)", block, re.M)
        help_block = re.search(r"help: \[(.*?)\]", block, re.S)
        topics = re.findall(r"slug: '([^']+)'", help_block.group(1)) if help_block else []
        products.append((section.group(1), slug.group(1), bool(privacy and privacy.group(1) == "true"), topics))
    return products


def cmd_check():
    problems = []
    known = set()
    for section, slug, privacy, topics in catalog_products():
        known.add((section, slug))
        base = os.path.join(ROOT, section, slug)
        for page in ("index.html", "help/index.html", "videos/index.html"):
            if not os.path.exists(os.path.join(base, page)):
                problems.append("%s/%s: missing %s" % (section, slug, page))
        has_privacy = os.path.exists(os.path.join(base, "privacy.html"))
        if privacy and not has_privacy:
            problems.append("%s/%s: catalog says privacy: true but privacy.html is missing" % (section, slug))
        if has_privacy and not privacy:
            problems.append("%s/%s: privacy.html exists but catalog says privacy: false (not linked)" % (section, slug))
        for topic in topics:
            if not os.path.exists(os.path.join(base, "help", topic + ".html")):
                problems.append("%s/%s: help topic '%s' has no page" % (section, slug, topic))
    for section in SECTIONS:
        folder = os.path.join(ROOT, section)
        for name in sorted(os.listdir(folder)) if os.path.isdir(folder) else []:
            if os.path.isdir(os.path.join(folder, name)) and (section, name) not in known:
                problems.append("%s/%s: folder exists but is not in catalog.js" % (section, name))
    print("\n".join(problems) if problems else "Everything in catalog.js has its pages.")
    sys.exit(1 if problems else 0)


def cmd_serve(port="8000"):
    os.chdir(ROOT)

    class NoCache(http.server.SimpleHTTPRequestHandler):
        # A preview must show the file as it is now. Without this a browser can
        # keep an old site.js for minutes and an edit appears not to work.
        def end_headers(self):
            self.send_header("Cache-Control", "no-store")
            super().end_headers()

    handler = NoCache
    with socketserver.TCPServer(("", int(port)), handler) as httpd:
        print("Serving %s at http://localhost:%s (Ctrl+C to stop)" % (ROOT, port))
        httpd.serve_forever()


COMMANDS = {
    "product": (cmd_product, 4),
    "topic": (cmd_topic, 4),
    "privacy": (cmd_privacy, 2),
    "sitemap": (cmd_sitemap, 0),
    "check": (cmd_check, 0),
    "serve": (cmd_serve, None),
}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        print(__doc__)
        sys.exit(1)
    function, count = COMMANDS[sys.argv[1]]
    args = sys.argv[2:]
    if count is not None and len(args) != count:
        die("'%s' takes %d arguments; see python tools/site.py" % (sys.argv[1], count))
    function(*args)
