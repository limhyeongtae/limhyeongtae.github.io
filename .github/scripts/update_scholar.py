"""Refresh assets/data/scholar.json from the public Google Scholar profile.

Run by .github/workflows/update-scholar.yml every week. Standard library only.
If Scholar blocks the request or the page layout changes, the file is left untouched,
so the website keeps showing the last good numbers and the date they were checked.

    python update_scholar.py [path/to/scholar.json]
"""
import datetime
import json
import os
import re
import sys
import urllib.request

USER = "sMn53iEAAAAJ"
PROFILE = f"https://scholar.google.com/citations?user={USER}"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0 Safari/537.36")


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join("assets", "data", "scholar.json")
    old = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            old = json.load(f)

    req = urllib.request.Request(PROFILE + "&hl=en", headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    try:
        html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    except Exception as e:                       # blocked, timeout, network error
        print("Scholar fetch failed, keeping previous values:", e)
        return

    # citation table: [citations all, since, h-index all, since, i10 all, since]
    nums = [int(n) for n in re.findall(r'class="gsc_rsb_std">(\d+)<', html)]
    if len(nums) < 6:
        print("Could not read the citation table (CAPTCHA or layout change), keeping previous values.")
        return
    cites, h, i10 = nums[0], nums[2], nums[4]
    if cites <= 0 or h <= 0 or (old.get("citations") and cites < 0.8 * old["citations"]):
        print("Numbers look wrong, keeping previous values:", nums)
        return

    new = dict(citations=cites, h_index=h, i10_index=i10,
               updated=datetime.date.today().isoformat(), source="Google Scholar", profile=PROFILE)
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(new, f, indent=2)
        f.write("\n")
    print("Updated:", new)


if __name__ == "__main__":
    main()
