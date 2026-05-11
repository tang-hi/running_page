import argparse
import time

import garth

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("email", nargs="?", help="email of garmin")
    parser.add_argument("password", nargs="?", help="password of garmin")
    parser.add_argument(
        "--is-cn",
        dest="is_cn",
        action="store_true",
        help="if garmin account is cn",
    )
    options = parser.parse_args()
    if options.is_cn:
        garth.configure(domain="garmin.cn", ssl_verify=False)
    max_retries = 5
    for attempt in range(max_retries):
        try:
            garth.login(options.email, options.password)
            break
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                wait = 2 ** (attempt + 2)  # 4, 8, 16, 32, 64 seconds
                print(
                    f"Rate limited (429), retrying in {wait}s... (attempt {attempt + 1}/{max_retries})"
                )
                time.sleep(wait)
            else:
                raise
    secret_string = garth.client.dumps()
    print(secret_string)
