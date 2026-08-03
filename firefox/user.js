// browsah - Firefox privacy hardening
// Drop this file into a Firefox profile directory (e.g. ~/.config/mozilla/firefox/<profile>/user.js)
// Firefox applies it on every startup, so changes made in about:config are reverted on restart.
// To change a preference permanently, edit THIS file instead.
//
// NOTE: Firefox will write these values into prefs.js on first run. That's expected.

/**********************************************************************
 * 1. TELEMETRY / MOZILLA CHECK-INS
 *  Kill the phone-home channels. Nothing leaves the machine.
 **********************************************************************/
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("datareporting.usage.uploadEnabled", false);

// No remote experiments / pref-flipping (Shield + Normandy).
user_pref("app.shield.optoutstudies.enabled", false);
user_pref("app.normandy.enabled", false);
user_pref("app.normandy.api_url", "");

// No "recommended extensions" discovery feed.
user_pref("browser.discovery.enabled", false);

/**********************************************************************
 * 2. DNS - encrypted, strict, no ISP peeking
 *  NextDNS over HTTPS, DoH-only (no fallback to plain DNS).
 *  Change network.trr.uri to your own resolver if you use one.
 **********************************************************************/
user_pref("network.trr.mode", 3);                       // 3 = DoH only
user_pref("network.trr.uri", "https://firefox.dns.nextdns.io/");
user_pref("network.trr.excluded-domains", "");          // no bypasses
user_pref("network.dns.disablePrefetch", true);
user_pref("network.dns.disableIPv6", true);

/**********************************************************************
 * 3. UNASKED-FOR CONNECTIONS
 *  No speculative/prefetch/preconnect traffic.
 **********************************************************************/
user_pref("network.prefetch-next", false);
user_pref("network.http.speculative-parallel-limit", 0);
user_pref("browser.urlbar.suggest.searches", false);

/**********************************************************************
 * 4. TRACKING & COOKIES
 **********************************************************************/
// Global Privacy Control: tell sites "don't sell/share my data".
user_pref("privacy.globalprivacycontrol.enabled", true);

// Tracking protection level. "standard" is a good default; "strict" blocks
// more (including some fingerprinters). Pick what breaks nothing.
user_pref("browser.contentblocking.category", "standard");

// GPC + tracking protection exceptions stay off (no silent "allowed" list).
// user_pref("privacy.trackingprotection.allow_list", "");

// Clear what little we can on shutdown (matches the manual setting).
user_pref("privacy.sanitize.sanitizeOnShutdown", true);
user_pref("privacy.clearOnShutdown_v2.formdata", true);

/**********************************************************************
 * 5. NEW TAB - no sponsored content, no discovery stream
 **********************************************************************/
user_pref("browser.newtabpage.activity-stream.feeds.topsites", false);
user_pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
user_pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
user_pref("browser.newtabpage.activity-stream.showSponsoredCheckboxes", false);
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons", false);
user_pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features", false);

/**********************************************************************
 * 6. SEARCH - no suggestions, no query echo
 **********************************************************************/
user_pref("browser.search.suggest.enabled", false);
user_pref("browser.urlbar.suggest.engines", false);
user_pref("browser.urlbar.suggest.history", false);
user_pref("browser.urlbar.suggest.openpage", false);
user_pref("browser.urlbar.suggest.quickactions", false);
user_pref("browser.urlbar.suggest.recentsearches", false);
user_pref("browser.urlbar.suggest.topsites", false);
user_pref("browser.urlbar.suggest.trending", false);
user_pref("browser.urlbar.showSearchSuggestionsFirst", false);

/**********************************************************************
 * 7. PASSWORDS & FORMS - don't let the browser remember you
 *  (use KeePassXC-Browser instead)
 **********************************************************************/
user_pref("signon.rememberSignons", false);
user_pref("signon.generation.enabled", false);
user_pref("signon.management.page.breach-alerts.enabled", false);
user_pref("signon.firefoxRelay.feature", "disabled");
user_pref("browser.formfill.enable", false);
user_pref("extensions.formautofill.addresses.enabled", false);
user_pref("extensions.formautofill.creditCards.enabled", false);

/**********************************************************************
 * 8. HTTPS - always upgrade where possible
 **********************************************************************/
user_pref("dom.security.https_only_mode", true);

/**********************************************************************
 * 9. DOWNLOADS - ask where, forget in private
 **********************************************************************/
user_pref("browser.download.useDownloadDir", false);
user_pref("browser.download.deletePrivate", true);

/**********************************************************************
 * 10. SAFE BROWSING - OFF (by choice)
 *  We opt out: the browser sends NO URL hashes to Google/Mozilla.
 *  Malicious-domain protection is handled by your DNS resolver
 *  (e.g. NextDNS security filters). uBlock covers the rest.
 **********************************************************************/
user_pref("browser.safebrowsing.malware.enabled", false);
user_pref("browser.safebrowsing.phishing.enabled", false);

/**********************************************************************
 * 11. RAM CACHE - disk cache lives on a tmpfs, dies with the reboot
 **********************************************************************/
// Requires a RAM disk mounted at /mnt/ramdisk (see install.sh; it warns
// if the mount isn't actually tmpfs). Leaves no cache trace on the SSD.
user_pref("browser.cache.disk.parent_directory", "/mnt/ramdisk/firefox_cache");

// Privacy is a lifestyle, not a setting.
// Do NOT sign into a Firefox Account / Sync while using this config.
