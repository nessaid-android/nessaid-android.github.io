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
      the apps' house ads behave, and whether they ask an ad network at all -
      and tools/running_ads.json as its "running_ads", the dialogs the apps
      put up; those two are the parts edited by hand.

  python tools/site.py runningad <id> <app|greeting|notification|tip>
      Starts assets/data/running_ads/<id>.json, a running ad's content. Fill it
      in, add its entry to tools/running_ads.json, then 'published'. See
      "Running ads" in README.md.

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
    # Slug to weight in the house-ad pick, 0..10, an app not named weighing 1:
    # 3 is about three times as often - for a launch. 0 is as good as hidden.
    "weights": (dict, None),
    # true: a house banner standing in for an ad network that could not fill
    # stays up through the slot's reload wait, instead of a dark slot. The
    # network is asked exactly when it would have been. Absent is off.
    "house_hold_on_fail": (bool, None),
    # More house ads for a while, ending by itself on every phone after
    # "until" - see PROMO below and HousePromo in nessaid_ads.
    "promo": (dict, None),
    # The network switch (1 Nov 2026, with the AdMob account suspended for
    # invalid traffic): false, a slug listed, or a build below its slug's
    # versionCode, and those apps ask no ad network - house ads go on. It
    # reaches builds already on phones, and an off is cached there until a
    # later file says otherwise. Absent is "as built", which is on.
    "network_ads": (bool, None),
    "network_ads_off": (list, None),
    "network_ads_min_version": (dict, None),
    # One network at a time (4 Nov 2026, with Yandex beside AdMob): "networks"
    # is each network on or off for every app, {"admob": false}, and
    # "network_overrides" an app's own, {"location-alarm": {"admob": true}},
    # over it either way. Checked after the three above, which still switch
    # every network off and still win. Read only by builds with the library
    # of 4 Nov 2026 or later; older ones obey the three above alone.
    "networks": (dict, None),
    "network_overrides": (dict, None),
    # How often a running ad is shown, for every ad that does not say itself
    # (RATE below; running_ads, 25 Nov 2026).
    "running_ads_rate": (dict, None),
}

# How often a running ad is shown: "running_ads_rate" in house_settings.json is
# every ad's default, and "rate" in an ad's own content is its own, key by key.
# The apps clamp to the same ranges (RunningRate in nessaid_ads), and with
# neither they use after_days 2, per_day 1, every_hours 72, times 0, gap_hours 4.
RATE = {
    "after_days": (int, (0, 90)),          # days since the app was installed
    "per_day": (int, (1, 10)),             # showings of the ad in a day
    "every_hours": (int, (1, 60 * 24)),    # from one showing of it to the next
    "times": (int, (0, 100)),              # showings of it in all; 0 is no limit
    "gap_hours": (int, (0, 30 * 24)),      # from any other running ad
}

# tools/running_ads.json. "type" is what kind of ad it is: "app" advertises
# "apps", one that is not on the phone each time; the others are messages. An
# app too old to know a type takes it for a message, so a new one is safe.
RUNNING_AD = {
    "id": (str, None),
    "from": (str, None),
    "to": (str, None),
    "region": ((str, list), None),
    "receiver": ((str, list), None),
    "type": (str, None),
    "apps": ((str, list), None),
    "when": ((str, list), None),
    "priority": (int, None),
}
RUNNING_AD_NEEDS = ("id", "from", "to", "receiver", "type")
RUNNING_AD_TYPES = ("app", "greeting", "notification", "tip")
RUNNING_AD_WHEN = ("on_start", "on_interstitial")
RUNNING_AD_MOST = 50

# assets/data/running_ads/<id>.json
RUNNING_AD_CONTENT = {
    "_comment": (str, None),
    "id": (str, None),
    "picture": (str, None),
    "color": (str, None),
    "operation": (dict, None),
    "rate": (dict, None),
    "texts": (dict, None),
    "apps": (dict, None),
}
RUNNING_AD_TEXT = {
    "title": (str, None),
    "description": (str, None),
    "ok": (str, None),
    "cancel": (str, None),
    "never": (str, None),
    "picture": (str, None),
}
RUNNING_AD_OPERATIONS = ("none", "play", "open", "url")
RUNNING_ADS_DIR = os.path.join("assets", "data", "running_ads")
PICTURE_MOST = 1024 * 1024

# The languages the family's apps are in, as they spell them.
LANGUAGES = ("en", "ar", "bn", "de", "es", "fil", "fr", "hi", "in", "it", "ja", "ko", "ml", "nl",
             "pl", "pt", "pt-BR", "ru", "ta", "th", "tr", "uk", "ur", "vi", "zh", "zh-TW")

# The names "networks" and "network_overrides" may use: the networks the
# library knows. A typo would otherwise be a network nobody asks about.
AD_NETWORKS = ("admob", "yandex")

# What "promo" may say. A promotion raises the house ads past the ordinary
# ceilings, so it has to end: "until" is required, is the last day it applies
# by each phone's own date, and may be at most PROMO_MAX_DAYS after the day
# the file is generated - the apps hold it to the same from the file's
# "updated" date, so a mistyped year is two months there, and refused here.
# Every other key may be left out and is then the ordinary value. Nothing in
# it touches the ad network's own pacing: house ads only.
PROMO_MAX_DAYS = 62
PROMO = {
    "until": (str, None),
    "share_percent": (int, (0, 90)),
    "share_cooloff_minutes": (int, (1, 24 * 60)),
    # The house interstitial's close button and Back wait five seconds; a
    # promotion shows more of them and may make it three or four.
    "close_after_seconds": (int, (3, 5)),
    "interstitial": (dict, None),
}
# House interstitials' own allowance while it runs. Without this block they
# stay under each app's paid pacing; with it, they are counted apart, and no
# two full-screen ads of either kind come closer than min_gap_minutes.
PROMO_INTERSTITIAL = {
    "chance_percent": (int, (0, 80)),
    "min_gap_minutes": (int, (2, 24 * 60)),
    "daily_cap": (int, (0, 12)),
    "install_grace_hours": (int, (0, 7 * 24)),
}


def check_keys(where, values, known, name="house_settings.json"):
    """Each key of values known, of its type and in its range; exits otherwise."""
    for key, value in values.items():
        if key not in known:
            sys.exit("%s: unknown key '%s%s' - the apps would ignore it" % (name, where, key))
        kind, limits = known[key]
        # bool is an int in Python, so 'true' would pass for a percentage.
        if not isinstance(value, kind) or (kind is int and isinstance(value, bool)):
            kinds = kind if isinstance(kind, tuple) else (kind,)
            sys.exit("%s: %s%s must be %s"
                     % (name, where, key, " or ".join(k.__name__ for k in kinds)))
        if limits and not limits[0] <= value <= limits[1]:
            sys.exit("%s: %s%s must be %d..%d" % (name, where, key, limits[0], limits[1]))


def check_promo(promo):
    """The promo block: its keys, and an end that is a date and not far off."""
    check_keys("promo.", promo, PROMO)
    check_keys("promo.interstitial.", promo.get("interstitial", {}), PROMO_INTERSTITIAL)
    if "until" not in promo:
        sys.exit("house_settings.json: promo needs \"until\", the last day it applies -"
                 " the apps ignore a promotion without one")
    try:
        until = datetime.date.fromisoformat(promo["until"])
    except ValueError:
        sys.exit("house_settings.json: promo.until must be a date, YYYY-MM-DD")
    today = datetime.date.today()
    if until > today + datetime.timedelta(days=PROMO_MAX_DAYS):
        sys.exit("house_settings.json: promo.until is %s, more than %d days from today;"
                 " the apps would end it on %s" % (until, PROMO_MAX_DAYS,
                                                    today + datetime.timedelta(days=PROMO_MAX_DAYS)))
    if until < today:
        print("note: promo.until (%s) has passed; the apps ignore the promotion" % until)


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
    check_keys("", settings, HOUSE_SETTINGS)
    if "promo" in settings:
        check_promo(settings["promo"])
    check_keys("running_ads_rate.", settings.get("running_ads_rate", {}), RATE)
    # The apps drop a weight that is not a whole number (the app then weighs
    # 1) and clamp one out of range: both refused here, where they are heard.
    for slug, weight in settings.get("weights", {}).items():
        if slug not in slugs:
            sys.exit("house_settings.json: weights names '%s', which is not a slug in"
                     " catalog.js" % slug)
        if not isinstance(weight, int) or isinstance(weight, bool) or not 0 <= weight <= 10:
            sys.exit("house_settings.json: weights for %s must be a whole number, 0..10" % slug)
    for key in ("hidden", "network_ads_off"):
        for slug in settings.get(key, []):
            if not isinstance(slug, str) or slug not in slugs:
                sys.exit("house_settings.json: %s names %r, which is not a slug in catalog.js"
                         % (key, slug))
    # The apps drop an entry that is not a whole number of at least 1, which
    # would leave that app's old builds asking the network: refused here.
    for slug, version in settings.get("network_ads_min_version", {}).items():
        if slug not in slugs:
            sys.exit("house_settings.json: network_ads_min_version names '%s', which is not"
                     " a slug in catalog.js" % slug)
        if not isinstance(version, int) or isinstance(version, bool) or version < 1:
            sys.exit("house_settings.json: network_ads_min_version for %s must be a"
                     " versionCode, a whole number of at least 1" % slug)
    # The apps drop a value that is not true or false, and a name they do not
    # know is a network nobody asks about: both refused here.
    def check_switches(where, switches):
        if not isinstance(switches, dict):
            sys.exit("house_settings.json: %s must be an object of network to true/false"
                     % where)
        for name, on in switches.items():
            if name not in AD_NETWORKS:
                sys.exit("house_settings.json: %s names network '%s'; known: %s"
                         % (where, name, ", ".join(AD_NETWORKS)))
            if not isinstance(on, bool):
                sys.exit("house_settings.json: %s.%s must be true or false" % (where, name))
    check_switches("networks", settings.get("networks", {}))
    for slug, own in settings.get("network_overrides", {}).items():
        if slug not in slugs:
            sys.exit("house_settings.json: network_overrides names '%s', which is not"
                     " a slug in catalog.js" % slug)
        check_switches("network_overrides." + slug, own)
    return settings


def words(value):
    """A list as the apps read one: text with commas, or an array of text."""
    items = value.split(",") if isinstance(value, str) else value
    return [item.strip() for item in items if isinstance(item, str) and item.strip()]


def check_targets(where, value):
    """"receiver" or "apps": categories, slugs and packages, each maybe after a "!"."""
    found = words(value)
    if not found:
        sys.exit("%s: is empty" % where)
    plays = dict(catalog_play())
    for word in found:
        bare = word.lstrip("!").strip()
        if bare in ("all", "games", "cards", "utilities", "apps") or bare in plays:
            continue
        if re.fullmatch(r"[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+", bare):
            if bare not in plays.values():
                print("note: %s names package %s, which catalog.js has no Play link for"
                      % (where, bare))
            continue
        sys.exit("%s names '%s', which is no category (all, games, cards, utilities), no slug in"
                 " catalog.js and no package" % (where, word))


def check_region(where, value):
    for word in words(value):
        if word.lower() != "all" and not re.fullmatch(r"!?[A-Za-z]{2}", word):
            sys.exit("%s names '%s'; a country is two letters, IN or !IN, or it is \"all\""
                     % (where, word))


def check_picture(where, picture):
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,79}\.(png|webp|jpg|jpeg)", picture):
        sys.exit("%s: '%s' is not a .png, .webp or .jpg beside the content" % (where, picture))
    path = os.path.join(ROOT, RUNNING_ADS_DIR, picture)
    if not os.path.exists(path):
        sys.exit("%s: there is no %s" % (where, os.path.relpath(path, ROOT).replace(os.sep, "/")))
    size = os.path.getsize(path)
    if size > PICTURE_MOST:
        sys.exit("%s: %s is %d KB, and the apps take %d" % (where, picture, size // 1024,
                                                           PICTURE_MOST // 1024))
    if size > 300 * 1024:
        print("note: %s is %d KB; every phone it is for fetches it" % (picture, size // 1024))


def check_operation(where, operation):
    kind = operation.get("type")
    if kind not in RUNNING_AD_OPERATIONS:
        sys.exit("%s.type must be one of: %s" % (where, ", ".join(RUNNING_AD_OPERATIONS)))
    known = {"type": (str, None)}
    if kind == "url":
        known["url"] = (str, None)
        if not str(operation.get("url", "")).startswith("https://"):
            sys.exit("%s.url must start with https:// - the apps open nothing else" % where)
    elif kind in ("play", "open"):
        known["package"] = (str, None)
    check_keys("operation.", operation, known, where)


def check_part(where, part, slug):
    """The top of a content file, or one app's own under "apps"."""
    if "picture" in part:
        check_picture(where, part["picture"])
    if "color" in part and not re.fullmatch(r"#[0-9A-Fa-f]{6}", part["color"]):
        sys.exit("%s: color must be #RRGGBB" % where)
    if "operation" in part:
        check_operation(where + ": operation", part["operation"])
    for language, texts in part.get("texts", {}).items():
        if not isinstance(texts, dict):
            sys.exit("%s: texts.%s must be an object" % (where, language))
        if not re.fullmatch(r"[a-z]{2,3}(-[A-Z]{2})?", language):
            sys.exit("%s: texts.%s is not a language as the apps spell them" % (where, language))
        check_keys("texts.%s." % language, texts, RUNNING_AD_TEXT, where)
        if "picture" in texts:
            check_picture(where + ": texts." + language, texts["picture"])


def check_content(ad):
    """assets/data/running_ads/<id>.json, for the entry ad; exits on anything the apps would drop."""
    name = "%s.json" % ad["id"]
    path = os.path.join(ROOT, RUNNING_ADS_DIR, name)
    if not os.path.exists(path):
        sys.exit("running_ads.json: %s has no %s - start it with: python tools/site.py runningad"
                 " %s %s" % (ad["id"], os.path.relpath(path, ROOT).replace(os.sep, "/"),
                             ad["id"], ad["type"]))
    try:
        content = json.loads(read(path))
    except ValueError as e:
        sys.exit("%s: is not JSON: %s" % (name, e))
    if not isinstance(content, dict):
        sys.exit("%s: must be an object" % name)
    if os.path.getsize(path) > 128 * 1024:
        sys.exit("%s: is over the 128 KB the apps take" % name)
    check_keys("", content, RUNNING_AD_CONTENT, name)
    if content.get("id") != ad["id"]:
        sys.exit("%s: its id must be \"%s\"" % (name, ad["id"]))
    check_keys("rate.", content.get("rate", {}), RATE, name)
    check_part(name, content, None)
    slugs = set(slug for slug, _ in catalog_play())
    for slug, own in content.get("apps", {}).items():
        if slug not in slugs:
            sys.exit("%s: apps names '%s', which is not a slug in catalog.js" % (name, slug))
        if not isinstance(own, dict):
            sys.exit("%s: apps.%s must be an object" % (name, slug))
        check_keys("apps.%s." % slug, own,
                   {k: RUNNING_AD_CONTENT[k] for k in ("picture", "color", "operation", "texts")},
                   name)
        check_part("%s: apps.%s" % (name, slug), own, slug)
    texts = content.get("texts", {})
    if ad["type"] != "app":
        if "apps" in content:
            sys.exit("%s: \"apps\" is for type app" % name)
        for language, own in texts.items():
            if not (own.get("title", "").strip() or own.get("description", "").strip()):
                sys.exit("%s: texts.%s has no title and no description; fill it in or take the"
                         " language out, and it is in English there" % (name, language))
        if not texts:
            sys.exit("%s: a %s needs texts" % (name, ad["type"]))
    if texts and "en" not in texts and ad["type"] != "app":
        print("note: %s has no English, so it is shown in %s alone" % (name, ", ".join(texts)))
    elif texts:
        missing = [language for language in LANGUAGES if language not in texts
                   and not (language == "pt-BR" and "pt" in texts)
                   and not (language == "zh-TW" and "zh" in texts)]
        if missing:
            print("note: %s is in English for: %s" % (name, ", ".join(missing)))


def running_ads():
    """tools/running_ads.json, checked with the content of each; those that are over left out."""
    path = os.path.join(ROOT, "tools", "running_ads.json")
    if not os.path.exists(path):
        return []
    entries = json.loads(read(path))
    if not isinstance(entries, list):
        sys.exit("running_ads.json: must be an array")
    today = datetime.date.today()
    out, seen = [], set()
    for n, ad in enumerate(entries):
        if not isinstance(ad, dict):
            sys.exit("running_ads.json: entry %d must be an object" % (n + 1))
        name = "running_ads.json: %s" % ad.get("id", "entry %d" % (n + 1))
        check_keys("", ad, RUNNING_AD, name)
        for key in RUNNING_AD_NEEDS:
            if key not in ad:
                sys.exit("%s: has no \"%s\" - the apps ignore an ad without it" % (name, key))
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,63}", ad["id"]):
            sys.exit("%s: an id is lowercase letters, digits and hyphens" % name)
        if ad["id"] in seen:
            sys.exit("%s: is there twice" % name)
        seen.add(ad["id"])
        dates = []
        for key in ("from", "to"):
            try:
                dates.append(datetime.date.fromisoformat(ad[key]))
            except ValueError:
                sys.exit("%s: %s must be a date, YYYY-MM-DD" % (name, key))
        if dates[0] > dates[1]:
            sys.exit("%s: ends before it begins" % name)
        if ad["type"] not in RUNNING_AD_TYPES:
            sys.exit("%s: type must be one of: %s" % (name, ", ".join(RUNNING_AD_TYPES)))
        if ad["type"] == "app" and "apps" not in ad:
            sys.exit("%s: type app needs \"apps\", whose ads to show" % name)
        if ad["type"] != "app" and "apps" in ad:
            sys.exit("%s: \"apps\" is for type app; a %s is not about any" % (name, ad["type"]))
        check_targets(name + ": receiver", ad["receiver"])
        if "apps" in ad:
            check_targets(name + ": apps", ad["apps"])
        check_region(name + ": region", ad.get("region", "all"))
        for word in words(ad.get("when", "on_start")):
            if word not in RUNNING_AD_WHEN:
                sys.exit("%s: when must be of: %s" % (name, ", ".join(RUNNING_AD_WHEN)))
        check_content(ad)
        if dates[1] < today:
            print("note: %s ended on %s; left out" % (ad["id"], dates[1]))
            continue
        out.append(ad)
    if len(out) > RUNNING_AD_MOST:
        sys.exit("running_ads.json: %d ads, and the apps read %d" % (len(out), RUNNING_AD_MOST))
    return out


def cmd_runningad(ad_id, kind):
    """A content file to fill in: every language's place for a message, English alone for an app."""
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,63}", ad_id):
        die("an id is lowercase letters, digits and hyphens: " + ad_id)
    if kind not in RUNNING_AD_TYPES:
        die("type must be one of: " + ", ".join(RUNNING_AD_TYPES))
    if kind == "app":
        # Nothing in it: the apps' own words, icons and Play links, in every
        # language, are in the catalogue the apps carry.
        content = {"id": ad_id, "texts": {}}
    else:
        content = {"id": ad_id, "operation": {"type": "none"}, "texts": {
            language: {"title": "", "description": "", "ok": "", "cancel": ""}
            for language in LANGUAGES}}
    write_new(os.path.join(ROOT, RUNNING_ADS_DIR, ad_id + ".json"),
              json.dumps(content, indent=2, ensure_ascii=False) + "\n")
    print("then add it to tools/running_ads.json, for example:")
    print(json.dumps({"id": ad_id, "from": datetime.date.today().isoformat(),
                      "to": (datetime.date.today() + datetime.timedelta(days=30)).isoformat(),
                      "region": "all", "receiver": "all", "type": kind,
                      **({"apps": "cards"} if kind == "app" else {}), "when": "on_start"}))


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
             '  "_comment": "Generated by tools/site.py published - do not edit. Sources: assets/js/catalog.js, tools/house_settings.json, tools/running_ads.json",',
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
    # Read by builds with the library of 25 Nov 2026 or later; older ones never
    # look. Enough of each ad for a phone to know it is not for it, and no more:
    # what it says is in running_ads/<id>.json, fetched by those it is for.
    ads = running_ads()
    lines.append('  "running_ads": [')
    for n, ad in enumerate(ads):
        lines.append('    %s%s' % (json.dumps(ad), '' if n == len(ads) - 1 else ','))
    lines.append('  ],')
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
    # The apps read no more than 64 KB of it, and drop the whole file past that.
    size = os.path.getsize(path)
    if size > 48 * 1024:
        sys.exit("published.json is %d KB; the apps take 64. Take out running ads." % (size // 1024))
    print("running ads: %s" % (", ".join(ad["id"] for ad in ads) or "none"))
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
    "runningad": (cmd_runningad, 2),
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
