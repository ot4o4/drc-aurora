from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PAGES = {
    "app/index.html": (".nav", "32px"),
    "g-kfx9ivqmk4i8/index.html": (".nav", "32px"),
    "l-nfuu496asvoo/index.html": ("#drcNav", "16px"),
}


class IphoneNavigationTest(unittest.TestCase):
    def test_iphone_navigation_is_compact_without_shrinking_touch_targets(self):
        for relative, (selector, margin_token) in PAGES.items():
            with self.subTest(page=relative):
                html = (ROOT / relative).read_text(encoding="utf-8")
                self.assertIn('<style id="iphone-compact-nav">', html)
                block = html.split('<style id="iphone-compact-nav">', 1)[1].split("</style>", 1)[0]
                self.assertIn("@media(max-width:600px)", block)
                self.assertIn("max-width:360px", block)
                self.assertIn(margin_token, block)
                self.assertIn(selector, block)
                self.assertNotIn("width:46px", block)
                self.assertNotIn("height:46px", block)
    def test_client_nav_shine_is_kept_only_on_red_button(self):
        html = (ROOT / "app/index.html").read_text(encoding="utf-8")
        self.assertIn('<style id="client-nav-shine">', html)
        block = html.split('<style id="client-nav-shine">', 1)[1].split("</style>", 1)[0]
        self.assertIn(".nav button:not(.scan)::after", block)
        self.assertIn("animation:none!important", block)
        self.assertIn(".nav button.on:not(.scan)::after", block)
        self.assertIn("background:var(--acc)!important", block)
        self.assertIn("opacity:1!important", block)


if __name__ == "__main__":
    unittest.main()
