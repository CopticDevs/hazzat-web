"""Download a read-only, hashed snapshot of the entire published v5 catalog.

Usage: python scripts/download-content-audit.py OUTPUT_DIRECTORY [PUBLIC_BASE_URL] [RETAINED_INVENTORY]
Only HTTP GET requests are made. Nothing is published or edited remotely.
"""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import sys
import time
import urllib.request

root = Path(sys.argv[1]).resolve()
base = (sys.argv[2] if len(sys.argv) > 2 else "https://d1zhmhuei1bwco.cloudfront.net").rstrip("/")
manifest = {}


def read(key):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(base + "/" + key, timeout=60) as response:
                raw = response.read()
                value = json.loads(raw)
                details = {"sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw),
                           "etag": response.headers.get("ETag"), "lastModified": response.headers.get("Last-Modified")}
            target = (root / key).resolve()
            if not target.is_relative_to(root):
                raise ValueError("Inventory path escapes snapshot directory: " + key)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(raw)
            manifest[key] = details
            return value
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


names = ["seasons", "seasons.ar", "content-catalog", "hymn-catalog", "content-usage", "hymn-references"]
metadata = {name: read("v5/metadata/" + name + ".json") for name in names}
services = {f"{s['id']}/{sid}" for s in metadata["seasons"] for sid in s.get("serviceIds", [])}
services.update(path for hymn in metadata["hymn-references"].values() for path in hymn.get("services", []))
services.update(f"{use['seasonId']}/{use['serviceId']}" for uses in metadata["content-usage"].values() for use in uses)
keys = {"v5/content/" + entry["id"] + ".json" for entry in metadata["content-catalog"]}
keys.update("v5/hymns/" + entry["id"] + "/hymn.json" for entry in metadata["hymn-catalog"])
keys.update(f"v5/seasons/{path.split('/')[0]}/services/{path.split('/')[1]}.json" for path in services)
if len(sys.argv) > 3:
    # An optional prior snapshot locates retained, unlisted services too. Their
    # current bytes are still fetched from the public feed, never copied.
    inventory = Path(sys.argv[3])
    retained = json.loads(inventory.read_text(encoding="utf-8")) if inventory.is_file() else [stored.relative_to(inventory).as_posix() for stored in (inventory / "v5/seasons").glob("*/services/*.json")]
    for key in retained:
        stored = Path(key)
        keys.add(key)
        services.add(f"{stored.parents[1].name}/{stored.stem}")
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    for count, result in enumerate(pool.map(read, sorted(keys)), 1):
        if count % 100 == 0:
            print(f"Downloaded {count}/{len(keys)} objects", flush=True)

# Refuse to report a stable snapshot if its inventory changed during collection.
for name in names:
    key = "v5/metadata/" + name + ".json"
    previous = manifest[key]["sha256"]
    read(key)
    if previous != manifest[key]["sha256"]:
        raise RuntimeError("Published inventory changed during audit: " + key)
summary = {"baseUrl": base, "collectedAtUtc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
           "seasons": len(metadata["seasons"]), "services": len(services),
           "hymns": len(metadata["hymn-catalog"]), "contentRecords": len(metadata["content-catalog"]),
           "objects": manifest}
(root / "snapshot-manifest.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
print(json.dumps({key: value for key, value in summary.items() if key != "objects"}), flush=True)
