# browsah

Portable browser-privacy hardening, applied in one command. Built for the
author's own rig, shared in the hope that a couple of distro maintainers read
the README and steal the good bits.

Targets:

- **Firefox** — via a `user.js` dropped into the profile directory (applies on
  every startup, so `about:config` experiments get reverted; edit `user.js` to
  make changes permanent).
- **Helium** — a Chromium fork, hardened by patching `Default/Preferences` +
  `Local State` and shadowing the binary with a launcher wrapper.

No telemetry, no phone-home, no Google Optimization leaks. DNS is DoH-strict
via NextDNS (no fallback to plain DNS, no exclusions). Passwords/autofill are
off by design — pair with KeePassXC + the browser add-on.

## Quickstart

    git clone https://github.com/rabmach/browsah
    cd browsah
    ./install.sh          # menu: firefox, helium, or both

Per-browser, if you prefer:

    ./firefox/configure-firefox.sh                     # auto-detects default profile
    ./firefox/configure-firefox.sh /path/to/profile    # or point it somewhere
    ./helium/configure-helium.sh

Both scripts:

1. Refuse to run while the browser is open.
2. Back up everything they touch (`*.browsah-<timestamp>`).
3. Apply the hardening.
4. Open the recommended extension pages for a one-click install each.
5. End with "Enjoy not being remembered."

## File layout

    install.sh                  menu entry point (firefox | helium | all)
    firefox/
      user.js                   the whole Firefox hardening, documented section-by-section
      search.py                 sets DuckDuckGo as default (patches search.json.mozlz4 +
                                recomputes Firefox's tamper-detection hash)
      ui.py                     puts the search bar at the right of the toolbar, after a
                                flexible space (patches browser.uiCustomization.state)
      configure-firefox.sh      detect profile, back up, install user.js, DDG default,
                                search-bar placement, ramdisk check, prompt for extensions
    helium/
      helium                    launcher wrapper -> --disable-features=OptimizationGuideModelDownloads,OptimizationHints
      configure-helium.sh       patch Preferences + Local State, install wrapper, prompt for extensions

## What gets hardened

**Firefox (`firefox/user.js`)**
1. Telemetry / health reports / usage ping off; Shield + Normandy disabled
   (no remote experiments, no pref-flipping, empty Normandy API URL).
2. DNS over HTTPS, mode 3 (strict — no plain-DNS fallback), NextDNS endpoint
   with a Quad9 fallback URI (still DoH), no excluded domains, DNS prefetch off.
3. No speculative/prefetch/preconnect traffic; no search suggestions.
4. Global Privacy Control on; ETP standard; fingerprinting protection on;
   sites can't read clipboard events; shutdown sanitization.

5. New-tab page: no sponsored top sites, no discovery stream, no CFR nudges.
6. Search: no suggestions, no query echo in the address bar; search results
   open in a new tab.
7. No saved passwords, no password generation, no breach alerts, no Firefox
   Relay, no form autofill (use KeePassXC-Browser instead).
8. HTTPS-only mode.
9. Downloads: always ask where; delete history in private windows.
10. Safe Browsing **on** — malware + phishing protection. Lookups are
    hash-prefix based over HTTPS (full URLs never leave the browser), catching
    brand-new bad URLs that static blocklists miss.
11. Disk cache lives on a tmpfs ramdisk (`/mnt/ramdisk/firefox_cache`), so no
    cache trace survives a reboot. Installer warns if the mount is missing or
    isn't actually tmpfs.
12. Look & feel: vertical tabs, dark theme, no Ctrl+Q "are you sure" nag,
    minimum font size 10 (pages still pick their own fonts). No Firefox
    logo on the new-tab page. Ctrl+Tab cycles tabs in recently-used order.
    Bookmarks open in tabs; middle-click opens links in a background tab.
    The search bar sits at the right of the toolbar, after a flexible
    space (enforced by `ui.py` on the saved `browser.uiCustomization.state`).
13. Default search engine set to DuckDuckGo (normal + private windows) by
    patching `search.json.mozlz4` — the default stopped being a plain pref in
    Firefox 128. The tamper-detection hash is recomputed exactly as Firefox
    computes it, so the change survives restarts.
14. **AI/ML: everything off.** Chatbot sidebar, link-preview key points, smart
    tab groups, PDF alt-text generation, visual search, model downloads
    (`browser.ml.*`, `browser.ai.*`). Also **remote
    improvements** disabled (`nimbus.rollouts.enabled = false`) — Firefox
    stops live-patching features between updates; you still get regular
    monthly releases.

**Helium (`helium/configure-helium.sh`)**
- `network_prediction_options = 0` (no speculative networking).
- Password leak-detection off; `credentials_enable_service = false`.
- `enterprise_profile_guid` removed; `updateclientdata` `pf`/`fp` fingerprint
  GUIDs stripped (kills the updater's device fingerprint).
- Helium services (updates/bangs/ext proxy/spellcheck feed) disabled.
- DoH `secure` via NextDNS.
- Launcher wrapper disables `OptimizationGuideModelDownloads,OptimizationHints`
  so no Google "Optimization Guide" hint/model traffic. uBlock Origin is
  **built into Helium**; no install needed.

## Safe Browsing

`browser.safebrowsing.*` is **on**. Firefox checks URLs against Google/Mozilla
malware and phishing lists using **hash prefixes** sent over HTTPS — full URLs
never leave the browser. The cache plus rate-limiting keeps the actual
disclosure tiny, and it catches brand-new phishing URLs that static lists
(NextDNS, uBlock) lag behind on. Those two layers still sit on top.

## Caveats / gotchas

- **Run each browser once first.** Helium's installer needs an existing
  profile; Firefox's needs `profiles.ini` (both created on first launch).
- **Extensions need one click each.** The scripts open the addon pages; the
  browser refuses silent installs by design. uBlock Origin for Firefox,
  ClearURLs, SponsorBlock, Multi-Account Containers, KeePassXC-Browser.
- **`~/bin` must precede the browser's directory on `PATH`** for the Helium
  wrapper to take effect. The installer detects and warns.
- **Do NOT sign into a Firefox Account / Sync** while using this config —
  Sync is a deliberate data path this setup avoids.

## Uninstall

Every change the scripts make is either (a) a file you can delete
(`user.js`, `~/bin/helium`) or (b) covered by a `*.browsah-<timestamp>` backup
in the affected profile directories. Restoring = delete the applied file and
rename the backup back.

## License

Do whatever you want with it — it's config and shell, steal it all.
