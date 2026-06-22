#!/usr/bin/env python3
"""
Quarterly feedback review for Essential Links.

Reads the LIVE shared like/dislike counts (from counterapi.dev) for every link in
index.html and prints a report, sorted so links with the most 👎 dislikes show first
— those are the ones to check/fix.

Usage:  python3 review_feedback.py
"""
import json, re, urllib.request, sys
from concurrent.futures import ThreadPoolExecutor

NS = "mp-essential-links"                       # same namespace as the page
BASE = f"https://api.counterapi.dev/v1/{NS}/"

def hash_key(u: str) -> str:
    """Replicates the page's hashKey(): djb2-xor, 32-bit unsigned, base36."""
    h = 5381
    for ch in u:
        h = ((h * 33) ^ ord(ch)) & 0xFFFFFFFF
    # base36
    if h == 0:
        return "0"
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while h:
        out = digits[h % 36] + out
        h //= 36
    return out

def read_counter(key: str) -> int:
    try:
        req = urllib.request.Request(BASE + key + "/",
                                     headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.load(r).get("count", 0)
    except Exception:
        return 0  # 400/404 = counter never created = 0 votes

def main():
    html = open("index.html", encoding="utf-8").read()
    objs = re.findall(r'\{"sheet":.*?"altLink": "[^"]*"(?:, "flag": "[^"]*")?\}', html)
    links = []
    seen = set()
    for o in objs:
        d = json.loads(o)
        u = d["link"]
        if u in seen:
            continue
        seen.add(u)
        links.append((d["resource"], d["sheet"], u))

    print(f"Reading live feedback for {len(links)} unique links from {BASE} ...\n")
    rows = []
    def fetch(item):
        name, sheet, u = item
        k = hash_key(u)
        return (name, sheet, u, read_counter("l" + k), read_counter("d" + k))
    with ThreadPoolExecutor(max_workers=12) as ex:
        rows = list(ex.map(fetch, links))

    voted = [r for r in rows if r[3] or r[4]]
    voted.sort(key=lambda r: (-r[4], -r[3]))   # most dislikes first

    if not voted:
        print("No votes recorded yet.")
        return
    print(f"{'👎':>3} {'👍':>3}  Resource / Section / URL")
    print("-" * 90)
    for name, sheet, u, likes, dis in voted:
        flag = "  <-- REVIEW" if dis > likes and dis > 0 else ""
        print(f"{dis:>3} {likes:>3}  {name}  [{sheet}]{flag}\n            {u}")
    print(f"\nTotal links with feedback: {len(voted)} | "
          f"flagged for review (dislikes > likes): {sum(1 for r in voted if r[4] > r[3] and r[4] > 0)}")

if __name__ == "__main__":
    main()
