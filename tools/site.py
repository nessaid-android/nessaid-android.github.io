#!/usr/bin/env python3
"""
Small helpers for the Nessaid Android Studio site. Python 3, standard library only.

Run from the repository root:

  python tools/site.py product  <apps|cards|games> <slug> "<Name>" "<short description>"
      Creates /<section>/<slug>/index.html, help/index.html and videos/index.html
      from /templates. Then add the product to assets/js/catalog.js.

  python tools/site.py topic    <apps|cards|games> <slug> <topic-slug> "<Title>"
      Creates /<section>/<slug>/help/<topic-slug>.html. Then add
      { slug, title, summary } to that product's "help" array in catalog.js.

  python tools/site.py privacy  <apps|cards|games> <slug>
      Creates /<section>/<slug>/privacy.html from the template. Fill it in, then
      set privacy: true for the product in catalog.js.

  python tools/site.py sitemap
      Rewrites sitemap.xml from every published page.

  python tools/site.py published
      Rewrites assets/data/published.json from catalog.js. The Android apps
      fetch it once a day to learn which products are on Play, so a product
      going live is one commit here rather than a re-release of every app.
      The file also carries tools/house_settings.json as its "settings" - how
      the apps' house ads behave - which is the one part edited by hand.

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
import json
import os
import re
import socketserver
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_URL = "https://nessaid-android.github.io"
SECTIONS = {"apps": "Apps", "cards": "Card games", "games": "Games"}
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


def catalog_play():
    """Each product's slug and its Play package, or None - read loosely from catalog.js."""
    text = read(os.path.join(ROOT, "assets", "js", "catalog.js"))
    out = []
    for block in re.split(r"\n    \{\n", text)[1:]:
        slug = re.search(r"^\s*slug: '([^']+)'", block, re.M)
        if not slug:
            continue
        play = re.search(r"^\s*play: (null|'([^']*)')", block, re.M)
        out.append((slug.group(1), play.group(2) if play and play.group(2) else None))
    return out


# What tools/house_settings.json may say, and within what. The apps clamp the
# numbers to the same ranges (HouseSettings in nessaid_ads) and ignore a value
# of the wrong type, so a mistake that got past here would be harmless there -
# but it would also be silent, and the place to hear about a typo is the
# command that publishes it, not a phone.
HOUSE_SETTINGS = {
    "house_ads": (bool, None),
    "show_unpublished": (bool, None),
    "share_percent": (int, (0, 50)),
    "share_cooloff_minutes": (int, (1, 24 * 60)),
    "hidden": (list, None),
}


def house_settings():
    """tools/house_settings.json, checked. None when there is no such file.

    Hand-edited, unlike everything else in published.json: which products are
    on Play is a fact catalog.js already records, but whether the apps
    advertise the ones that are not is a decision, and a decision needs
    somewhere to be written down.

    A key left out of the file is left out of published.json, and the apps
    then use whatever they were built with - so removing a line hands that
    setting back to each app rather than switching it off.
    """
    path = os.path.join(ROOT, "tools", "house_settings.json")
    if not os.path.exists(path):
        return None
    settings = json.loads(read(path))
    if not isinstance(settings, dict):
        sys.exit("house_settings.json: must be an object")
    slugs = set(slug for slug, _ in catalog_play())
    for key, value in settings.items():
        if key not in HOUSE_SETTINGS:
            sys.exit("house_settings.json: unknown key '%s' - the apps would ignore it" % key)
        kind, limits = HOUSE_SETTINGS[key]
        # bool is an int in Python, so 'true' would pass for a percentage.
        if not isinstance(value, kind) or (kind is int and isinstance(value, bool)):
            sys.exit("house_settings.json: %s must be %s" % (key, kind.__name__))
        if limits and not limits[0] <= value <= limits[1]:
            sys.exit("house_settings.json: %s must be %d..%d" % (key, limits[0], limits[1]))
    for slug in settings.get("hidden", []):
        if slug not in slugs:
            sys.exit("house_settings.json: hidden names '%s', which is not a slug in catalog.js" % slug)
    return settings


def cmd_published():
    """Writes assets/data/published.json, which the Android apps read.

    Why this file exists: a house ad decides between a Play link and this
    site's product page from a value compiled into the app. So the day a
    product goes live, every app already on a phone keeps sending people to
    the website until that app is itself rebuilt and re-released - which
    means shipping one product would mean re-shipping all of them.

    The apps fetch this once a day instead and cache it. The list here wins
    over the compiled-in one whenever it has been fetched; a fetch that fails
    leaves the last good copy in place, and an app that has never managed one
    falls back to what it shipped with. So a product going live is one commit
    here and no release at all.

    Generated, never hand-edited: catalog.js is where a product's Play package
    is written down, and a second hand-maintained copy is the one that goes
    stale.
    """
    entries = [(slug, play) for slug, play in catalog_play() if play]
    lines = ['{',
             '  "_comment": "Generated by tools/site.py published - do not edit. Sources: assets/js/catalog.js, tools/house_settings.json",',
             '  "updated": "%s",' % datetime.date.today().isoformat()]
    # Before "apps", and that order is only for whoever reads the file: the
    # apps look both up by name. Builds from before 8 Oct 2026 read "apps"
    # alone and never notice this block - which also means they go on
    # advertising unpublished products until they are themselves re-released.
    settings = house_settings()
    if settings is not None:
        lines.append('  "settings": {')
        keys = [key for key in HOUSE_SETTINGS if key in settings]
        for n, key in enumerate(keys):
            lines.append('    "%s": %s%s' % (key, json.dumps(settings[key]),
                                             '' if n == len(keys) - 1 else ','))
        lines.append('  },')
    lines.append('  "apps": {')
    for n, (slug, play) in enumerate(sorted(entries)):
        lines.append('    "%s": "%s"%s' % (slug, play, '' if n == len(entries) - 1 else ','))
    lines += ['  }', '}']
    path = os.path.join(ROOT, "assets", "data", "published.json")
    directory = os.path.dirname(path)
    if not os.path.isdir(directory):
        os.makedirs(directory)
    with io.open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write("\n".join(lines) + "\n")
    print("published.json: %d live of %d products" % (len(entries), len(catalog_play())))
    print("settings: %s" % (json.dumps(settings) if settings is not None
                            else "none - no tools/house_settings.json"))


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
    "published": (cmd_published, 0),
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
