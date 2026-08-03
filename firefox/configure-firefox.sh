#!/usr/bin/env bash
# browsah - Firefox privacy installer
# Applies firefox/user.js to a Firefox profile and opens the extension pages.
#
#   usage: ./configure-firefox.sh [profile-directory]
#   (no argument = auto-detect the default profile)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---------------------------------------------------------------------------
detect_profile() {
  # Prefer the profile that the installed Firefox uses; fall back to Default=1.
  python3 - "$@" <<'PY'
import configparser, os, sys
for base in (os.path.expanduser("~/.config/mozilla/firefox"),
             os.path.expanduser("~/.mozilla/firefox")):
    ini = os.path.join(base, "profiles.ini")
    if not os.path.isfile(ini):
        continue
    cp = configparser.ConfigParser()
    cp.optionxform = str
    cp.read(ini)
    default_name = None
    for sec in cp.sections():
        if sec.lower().startswith("install") and cp.has_option(sec, "Default"):
            default_name = cp.get(sec, "Default")
    for sec in cp.sections():
        if not sec.lower().startswith("profile"):
            continue
        path = cp.get(sec, "Path")
        name = cp.get(sec, "Name") if cp.has_option(sec, "Name") else ""
        rel = cp.getboolean(sec, "IsRelative", fallback=True)
        if default_name and default_name in (name, path):
            print(os.path.join(base, path) if rel else path)
            sys.exit(0)
    for sec in cp.sections():
        if sec.lower().startswith("profile") and cp.getboolean(sec, "Default", fallback=False):
            path = cp.get(sec, "Path")
            rel = cp.getboolean(sec, "IsRelative", fallback=True)
            print(os.path.join(base, path) if rel else path)
            sys.exit(0)
sys.exit(1)
PY
}
# ---------------------------------------------------------------------------
banner() {
  echo "  █▀▄ █▀█ █▀█ █▀ █ █ ▀█▀ █ █ █"
  echo "  █▄▀ █▀█ ▀▀█ ▄█ ▀▄▀  █  █▀█ █"
  echo "  Firefox privacy installer"
  echo
}

PROFILE="${1:-}"
if [ -z "$PROFILE" ]; then
  if ! PROFILE="$(detect_profile)"; then
    echo "!! Could not find a Firefox profile automatically."
    echo "   Start Firefox once, or pass the profile directory as an argument."
    exit 1
  fi
fi
PROFILE="${PROFILE%/}"

if [ ! -d "$PROFILE" ]; then
  echo "!! Profile directory not found: $PROFILE"
  exit 1
fi

if pgrep -x firefox >/dev/null 2>&1 || pgrep -x firefox-esr >/dev/null 2>&1; then
  echo "!! Firefox is running. Close it first, then rerun this."
  exit 1
fi

banner
echo "  Profile: $PROFILE"

# Backup whatever is already there (only the files we touch).
for f in prefs.js user.js; do
  if [ -f "$PROFILE/$f" ]; then
    cp -a "$PROFILE/$f" "$PROFILE/$f.browsah-$(date +%Y%m%d-%H%M%S)"
  fi
done

cp -a "$DIR/user.js" "$PROFILE/user.js"
echo "  ✓ installed user.js -> $PROFILE/user.js"
echo "  ✓ backup made (prefs.js.browsah-* / user.js.browsah-*)"
echo "  Next launch, Firefox applies these. (about:config changes revert on"
echo "  restart - edit $DIR/user.js instead to keep them.)"

# RAM cache lives on /mnt/ramdisk - make sure it exists (and is a real tmpfs).
RAMDIR=/mnt/ramdisk
if ! mountpoint -q "$RAMDIR" 2>/dev/null; then
  echo
  echo "  !! $RAMDIR is not mounted - disk cache will stay on your SSD."
  echo "     Mount a tmpfs there (e.g. in /etc/fstab:"
  echo "     'tmpfs $RAMDIR tmpfs mode=1777,size=2G 0 0'), then rerun."
  echo "     Firefox will still work either way."
elif [ "$(findmnt -no FSTYPE "$RAMDIR" 2>/dev/null)" != "tmpfs" ]; then
  echo
  echo "  !! $RAMDIR is mounted but is $(findmnt -no FSTYPE "$RAMDIR") - not tmpfs."
  echo "     Cache there won't vanish on reboot. Mount a real tmpfs if you care."
else
  mkdir -p "$RAMDIR/firefox_cache"
  echo "  ✓ ramdisk cache: $RAMDIR/firefox_cache (tmpfs)"
fi

# ---------------------------------------------------------------------------
echo
echo "  Recommended extensions (privacy stack):"
ask() {
  local name="$1" url="$2"
  read -rp "  Open page for ${name}? [Y/n] " ans
  case "${ans:-y}" in
    y|Y|"") xdg-open "$url" >/dev/null 2>&1 || true ;;
    *) echo "  - skipped" ;;
  esac
}

ask "uBlock Origin"                  "https://addons.mozilla.org/firefox/addon/ublock-origin/"
ask "ClearURLs"                      "https://addons.mozilla.org/firefox/addon/clearurls/"
ask "SponsorBlock"                   "https://addons.mozilla.org/firefox/addon/sponsorblock/"
ask "Multi-Account Containers"       "https://addons.mozilla.org/firefox/addon/multi-account-containers/"
ask "KeePassXC-Browser"              "https://addons.mozilla.org/firefox/addon/keepassxc-browser/"

echo
echo "  Done. Enjoy not being remembered."
