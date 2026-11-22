from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.csp: str = ""

    def handle_starttag(self, tag, attrs):
        if tag != "meta":
            return
        values = dict(attrs)
        if (values.get("http-equiv") or "").lower() == "content-security-policy":
            self.csp = values.get("content") or ""


class ApiCspTest(unittest.TestCase):
    def test_configured_api_is_allowed_by_connect_src(self):
        for relative in ("g-kfx9ivqmk4i8/index.html", "l-nfuu496asvoo/index.html"):
            with self.subTest(page=relative):
                html = (ROOT / relative).read_text(encoding="utf-8")
                parser = HeadParser()
                parser.feed(html)
                api = re.search(r"const DEFAULT_API = '([^']+)'", html)
                assert api is not None, "DEFAULT_API missing"
                directives = parser.csp.split(";")
                connect = next((d.split() for d in directives if d.strip().startswith("connect-src")), [])
                expected_source = api.group(1).rstrip("/") + "/"
                self.assertIn(expected_source, connect, f"{expected_source} blocked by connect-src")


if __name__ == "__main__":
    unittest.main()
