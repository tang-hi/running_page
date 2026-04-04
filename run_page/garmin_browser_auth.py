#!/usr/bin/env python3
"""
Get Garmin OAuth tokens via real browser login (Playwright).
Bypasses the 429-blocked SSO programmatic login endpoint.

This outputs a secret_string compatible with garth (used by garmin_sync.py).

Usage:
    # First time: install browser
    python -m playwright install chromium

    # Run auth (international):
    python run_page/garmin_browser_auth.py

    # Run auth (China):
    python run_page/garmin_browser_auth.py --is-cn

Then update your GARMIN_SECRET_STRING GitHub secret with the output.
"""

import argparse
import base64
import json
import os
import re
import time
from urllib.parse import parse_qs

import requests
from playwright.sync_api import sync_playwright

OAUTH_CONSUMER_URL = "https://thegarth.s3.amazonaws.com/oauth_consumer.json"
ANDROID_UA = "com.garmin.android.apps.connectmobile"


def get_oauth_consumer():
    resp = requests.get(OAUTH_CONSUMER_URL, timeout=10)
    resp.raise_for_status()
    return resp.json()


def get_oauth1_token(ticket, consumer, domain="garmin.com"):
    from requests_oauthlib import OAuth1Session

    sess = OAuth1Session(
        consumer["consumer_key"],
        consumer["consumer_secret"],
    )
    base_url = f"https://connectapi.{domain}/oauth-service/oauth"
    login_url = f"https://sso.{domain}/sso/embed"
    url = (
        f"{base_url}/preauthorized?ticket={ticket}"
        f"&login-url={login_url}"
        f"&accepts-mfa-tokens=true"
    )
    for attempt in range(5):
        resp = sess.get(url, headers={"User-Agent": ANDROID_UA}, timeout=15)
        if resp.status_code == 429:
            wait = 2 ** (attempt + 2)  # 4, 8, 16, 32, 64s
            print(f"OAuth1 exchange rate limited (429), retrying in {wait}s... ({attempt + 1}/5)")
            time.sleep(wait)
            continue
        resp.raise_for_status()
        parsed = parse_qs(resp.text)
        token = {k: v[0] for k, v in parsed.items()}
        token["domain"] = domain
        return token
    resp.raise_for_status()


def exchange_oauth2(oauth1, consumer, domain="garmin.com"):
    from requests_oauthlib import OAuth1Session

    sess = OAuth1Session(
        consumer["consumer_key"],
        consumer["consumer_secret"],
        resource_owner_key=oauth1["oauth_token"],
        resource_owner_secret=oauth1["oauth_token_secret"],
    )
    url = f"https://connectapi.{domain}/oauth-service/oauth/exchange/user/2.0"
    data = {}
    if oauth1.get("mfa_token"):
        data["mfa_token"] = oauth1["mfa_token"]
    for attempt in range(5):
        resp = sess.post(
            url,
            headers={
                "User-Agent": ANDROID_UA,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data=data,
            timeout=15,
        )
        if resp.status_code == 429:
            wait = 2 ** (attempt + 2)  # 4, 8, 16, 32, 64s
            print(f"OAuth2 exchange rate limited (429), retrying in {wait}s... ({attempt + 1}/5)")
            time.sleep(wait)
            continue
        resp.raise_for_status()
        token = resp.json()
        token["expires_at"] = int(time.time() + token["expires_in"])
        token["refresh_token_expires_at"] = int(
            time.time() + token["refresh_token_expires_in"]
        )
        return token
    resp.raise_for_status()


def _wait_for_ticket(page, max_wait):
    """Poll page URL and content for SSO ticket."""
    start = time.time()
    while time.time() - start < max_wait:
        try:
            url = page.url
            if "ticket=" in url:
                m = re.search(r"ticket=(ST-[A-Za-z0-9\-]+)", url)
                if m:
                    print("Got ticket from URL.")
                    return m.group(1)

            content = page.content()
            m = re.search(r"ticket=(ST-[A-Za-z0-9\-]+)", content)
            if m:
                print("Got ticket.")
                return m.group(1)
        except Exception:
            pass
        page.wait_for_timeout(500)
    return None


def _build_sso_url(domain="garmin.com"):
    sso_domain = f"sso.{domain}"
    return (
        f"https://{sso_domain}/sso/embed"
        "?id=gauth-widget"
        "&embedWidget=true"
        f"&gauthHost=https://{sso_domain}/sso"
        "&clientId=GarminConnect"
        "&locale=en_US"
        f"&redirectAfterAccountLoginUrl=https://{sso_domain}/sso/embed"
        f"&service=https://{sso_domain}/sso/embed"
    )


def browser_login(domain="garmin.com"):
    """Open a real browser, let user log in manually, capture the SSO ticket."""
    ticket = None

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto(_build_sso_url(domain))

        print()
        print("=" * 50)
        print("  Browser opened — log in with your Garmin")
        print("  credentials. The window will close")
        print("  automatically when done.")
        print("=" * 50)
        print()

        ticket = _wait_for_ticket(page, max_wait=300)
        browser.close()

    if not ticket:
        print("ERROR: Timed out waiting for login (5 min). Try again.")
        raise SystemExit(1)

    return ticket


def browser_login_auto(email, password, domain="garmin.com"):
    """Automated browser login with email/password (headed mode via Xvfb in CI).

    Garmin blocks headless browsers (error 427), so this must run in headed mode.
    In CI, use xvfb-run to provide a virtual display.
    """
    ticket = None

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto(_build_sso_url(domain))

        print("Waiting for login form...")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)

        # Fill email
        email_input = page.locator("#email, input[name='username']").first
        email_input.click()
        page.wait_for_timeout(300)
        email_input.fill(email)

        # Fill password
        page.wait_for_timeout(500)
        password_input = page.locator("#password, input[name='password']").first
        password_input.click()
        page.wait_for_timeout(300)
        password_input.fill(password)

        # Submit
        page.wait_for_timeout(500)
        page.locator("#login-btn-signin, button[type='submit']").first.click()

        print("Credentials submitted, waiting for SSO ticket...")
        ticket = _wait_for_ticket(page, max_wait=60)
        browser.close()

    if not ticket:
        raise Exception(
            "Automated browser login timed out — could not capture SSO ticket. "
            "Check your email/password, or try manual login: "
            "python run_page/garmin_browser_auth.py"
        )

    return ticket


def build_secret_string(oauth1_dict, oauth2_dict):
    """Build a garth-compatible secret_string (base64 encoded JSON)."""
    # garth expects: [oauth1_dict, oauth2_dict]
    # Convert mfa_expiration_timestamp to None if missing
    oauth1_clean = {
        "oauth_token": oauth1_dict["oauth_token"],
        "oauth_token_secret": oauth1_dict["oauth_token_secret"],
        "mfa_token": oauth1_dict.get("mfa_token"),
        "mfa_expiration_timestamp": oauth1_dict.get("mfa_expiration_timestamp"),
        "domain": oauth1_dict.get("domain"),
    }
    oauth2_clean = {
        "scope": oauth2_dict.get("scope", ""),
        "jti": oauth2_dict.get("jti", ""),
        "token_type": oauth2_dict.get("token_type", "Bearer"),
        "access_token": oauth2_dict["access_token"],
        "refresh_token": oauth2_dict["refresh_token"],
        "expires_in": oauth2_dict["expires_in"],
        "expires_at": oauth2_dict["expires_at"],
        "refresh_token_expires_in": oauth2_dict["refresh_token_expires_in"],
        "refresh_token_expires_at": oauth2_dict["refresh_token_expires_at"],
    }
    data = json.dumps([oauth1_clean, oauth2_clean])
    return base64.b64encode(data.encode()).decode()


def main():
    parser = argparse.ArgumentParser(
        description="Get Garmin tokens via browser login (bypass 429)"
    )
    parser.add_argument(
        "--is-cn",
        dest="is_cn",
        action="store_true",
        help="Use garmin.cn (China) instead of garmin.com",
    )
    parser.add_argument(
        "--email",
        help="Garmin email for automated login (no manual interaction needed)",
    )
    parser.add_argument(
        "--password",
        help="Garmin password for automated login",
    )
    options = parser.parse_args()
    domain = "garmin.cn" if options.is_cn else "garmin.com"

    print("Garmin Browser Auth")
    print("=" * 50)

    print("Fetching OAuth consumer credentials...")
    consumer = get_oauth_consumer()

    print("Launching browser...")
    if options.email and options.password:
        print("Using automated login with provided credentials...")
        ticket = browser_login_auto(options.email, options.password, domain)
    else:
        ticket = browser_login(domain)

    print("Exchanging ticket for OAuth1 token...")
    oauth1 = get_oauth1_token(ticket, consumer, domain)
    print(f"  OAuth1 token obtained")

    print("Exchanging OAuth1 for OAuth2 token...")
    oauth2 = exchange_oauth2(oauth1, consumer, domain)
    print(f"  OAuth2 access_token obtained")
    print(f"  Expires in: {oauth2['expires_in']}s")
    print(f"  Refresh expires in: {oauth2['refresh_token_expires_in']}s")

    # Verify tokens work
    print("Verifying tokens...")
    verify_resp = requests.get(
        f"https://connectapi.{domain}/userprofile-service/socialProfile",
        headers={
            "User-Agent": "GCM-iOS-5.7.2.1",
            "Authorization": f"Bearer {oauth2['access_token']}",
        },
        timeout=15,
    )
    verify_resp.raise_for_status()
    profile = verify_resp.json()
    print(f"  Authenticated as: {profile.get('displayName', 'unknown')}")

    # Build garth-compatible secret_string
    secret_string = build_secret_string(oauth1, oauth2)

    print()
    print("=" * 50)
    print("SUCCESS!")
    if os.environ.get("CI"):
        print("Running in CI — secret_string not printed.")
        print(f"::add-mask::{secret_string}")
    else:
        print("Copy the secret_string below and update")
        print("your GARMIN_SECRET_STRING GitHub secret:")
        print("=" * 50)
        print()
        print(secret_string)
    print()


if __name__ == "__main__":
    main()
