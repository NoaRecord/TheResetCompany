import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright

PROTOTYPE_DIR = Path(__file__).resolve().parents[1]
INDEX_PATH = PROTOTYPE_DIR / "index.html"
CSS_PATH = PROTOTYPE_DIR / "reset-sequence.css"
JS_PATH = PROTOTYPE_DIR / "reset-sequence.js"
MOCK_PAYLOAD = {
    "activeUsers": 2_841_291,
    "exhaustedUsers": 428_193,
    "frustration": 87,
    "target": "PAID_USERS",
}


class ResetSequenceBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            headless=True,
            executable_path=cls.playwright.chromium.executable_path,
            args=["--no-sandbox"],
        )

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1024, "height": 800})
        self.page = self.context.new_page()
        self.page_errors = []
        self.page.on("pageerror", lambda exc: self.page_errors.append(str(exc)))
        html = INDEX_PATH.read_text(encoding="utf-8")
        css = CSS_PATH.read_text(encoding="utf-8") if CSS_PATH.exists() else ""
        js = JS_PATH.read_text(encoding="utf-8")
        html = html.replace(
            '<link rel="stylesheet" href="reset-sequence.css">',
            f"<style>{css}</style>",
        )
        html = html.replace(
            '<script src="reset-sequence.js"></script>',
            '<script>window.__RESET_SEQUENCE_SPEED__ = 0.05;</script>'
            f"<script>{js}</script>",
        )
        self.page.set_content(html, wait_until="domcontentloaded")

    def tearDown(self):
        self.context.close()

    def _start_sequence(self):
        self.page.evaluate(
            """
            (payload) => {
              window.__testTriggerCount = 0;
              window.__testCompleteCount = 0;
              window.__testRunPromise = window.runGlobalResetSequence(payload, {
                onTrigger: () => { window.__testTriggerCount += 1; }
              }).then(() => { window.__testCompleteCount += 1; });
            }
            """,
            MOCK_PAYLOAD,
        )

    def _advance_to_hold(self):
        self.page.locator("#release-safety-button").wait_for(state="visible")
        self.page.locator("#release-safety-button").click()
        self.page.locator("#open-cover-button").wait_for(state="visible")
        self.page.locator("#open-cover-button").click()
        self.page.locator("#hold-reset-button").wait_for(state="visible")

    def _complete_hold_with_pointer(self):
        button = self.page.locator("#hold-reset-button")
        box = button.bounding_box()
        self.assertIsNotNone(box)
        x = box["x"] + box["width"] / 2
        y = box["y"] + box["height"] / 2
        self.page.mouse.move(x, y)
        self.page.mouse.down()
        self.page.wait_for_function("window.__testTriggerCount === 1")
        self.page.mouse.up()

    def test_standalone_page_exposes_public_api_without_page_errors(self):
        self.assertEqual(self.page.evaluate("typeof window.runGlobalResetSequence"), "function")
        self.assertEqual(self.page_errors, [])

    def test_payload_is_rendered_during_target_acquisition(self):
        self._start_sequence()
        self.page.wait_for_function(
            "document.querySelector('#phase-label')?.textContent.includes('Target Acquisition')"
        )
        self.assertEqual(self.page.locator("#target-active-users").inner_text(), "2,841,291")
        self.assertEqual(self.page.locator("#target-exhausted-users").inner_text(), "428,193")
        self.assertEqual(self.page.locator("#target-frustration").inner_text(), "87%")
        self.assertEqual(self.page.locator("#target-scope").inner_text(), "PAID USERS")

    def test_releasing_hold_early_does_not_trigger_and_resets_progress(self):
        self._start_sequence()
        self._advance_to_hold()
        button = self.page.locator("#hold-reset-button")
        box = button.bounding_box()
        self.assertIsNotNone(box)
        self.page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        self.page.mouse.down()
        self.page.wait_for_timeout(80)
        self.page.mouse.up()
        self.page.wait_for_timeout(40)
        self.assertEqual(self.page.evaluate("window.__testTriggerCount"), 0)
        self.assertEqual(self.page.locator("#hold-progress").inner_text(), "0%")

    def test_trigger_occurs_once_and_promise_resolves_after_complete(self):
        self._start_sequence()
        self.assertEqual(self.page.locator("html").get_attribute("data-ui-state"), "RESET_SEQUENCE")
        self._advance_to_hold()
        self._complete_hold_with_pointer()
        self.assertEqual(self.page.evaluate("window.__testTriggerCount"), 1)
        self.assertEqual(self.page.evaluate("window.__testCompleteCount"), 0)
        self.page.wait_for_function("window.__testCompleteCount === 1")
        self.assertEqual(self.page.evaluate("window.__testTriggerCount"), 1)
        self.assertIn("GLOBAL RESET COMPLETE", self.page.locator("#sequence-status").inner_text())
        self.assertEqual(self.page.locator("#propagation-progress").inner_text(), "100%")
        self.assertEqual(self.page.locator("#propagation-regions p").count(), 6)
        self.assertEqual(self.page.locator("html").get_attribute("data-ui-state"), "NORMAL")

    def test_payload_is_not_mutated_before_trigger(self):
        original = dict(MOCK_PAYLOAD)
        self.page.evaluate(
            """
            (payload) => {
              window.__immutablePayload = Object.freeze({...payload});
              window.__testTriggerCount = 0;
              window.__testRunPromise = window.runGlobalResetSequence(window.__immutablePayload, {
                onTrigger: () => { window.__testTriggerCount += 1; }
              });
            }
            """,
            original,
        )
        self.page.locator("#release-safety-button").wait_for(state="visible")
        rendered = self.page.evaluate("JSON.parse(JSON.stringify(window.__immutablePayload))")
        self.assertEqual(rendered, original)
        self.assertEqual(self.page.evaluate("window.__testTriggerCount"), 0)

    def test_active_run_is_rejected_but_run_after_completion_succeeds(self):
        self._start_sequence()
        error_message = self.page.evaluate(
            """
            async (payload) => {
              try {
                await window.runGlobalResetSequence(payload, { onTrigger: () => {} });
                return '';
              } catch (error) {
                return String(error.message || error);
              }
            }
            """,
            MOCK_PAYLOAD,
        )
        self.assertIn("already running", error_message.lower())
        self._advance_to_hold()
        self._complete_hold_with_pointer()
        self.page.wait_for_function("window.__testCompleteCount === 1")

        self.page.evaluate(
            """
            (payload) => {
              window.__secondTriggerCount = 0;
              window.__secondCompleteCount = 0;
              window.runGlobalResetSequence(payload, {
                onTrigger: () => { window.__secondTriggerCount += 1; }
              }).then(() => { window.__secondCompleteCount += 1; });
            }
            """,
            MOCK_PAYLOAD,
        )
        self.page.locator("#release-safety-button").wait_for(state="visible")
        self.page.locator("#release-safety-button").click()
        self.page.locator("#open-cover-button").wait_for(state="visible")
        self.page.locator("#open-cover-button").click()
        button = self.page.locator("#hold-reset-button")
        button.wait_for(state="visible")
        box = button.bounding_box()
        self.page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        self.page.mouse.down()
        self.page.wait_for_function("window.__secondTriggerCount === 1")
        self.page.mouse.up()
        self.page.wait_for_function("window.__secondCompleteCount === 1")
        self.assertEqual(self.page.evaluate("window.__secondTriggerCount"), 1)
        self.assertEqual(self.page.evaluate("window.__secondCompleteCount"), 1)

    def test_safety_controls_are_buttons_and_cover_visibly_opens(self):
        self._start_sequence()
        release = self.page.locator("#release-safety-button")
        release.wait_for(state="visible")
        self.assertEqual(release.evaluate("el => el.tagName"), "BUTTON")
        release.press("Enter")

        open_cover = self.page.locator("#open-cover-button")
        open_cover.wait_for(state="visible")
        self.assertEqual(open_cover.evaluate("el => el.tagName"), "BUTTON")
        before = self.page.locator("#safety-cover").evaluate("el => getComputedStyle(el).transform")
        open_cover.press("Enter")
        self.page.locator("#hold-reset-button").wait_for(state="visible")
        self.page.wait_for_function(
            "before => getComputedStyle(document.querySelector('#safety-cover')).transform !== before",
            arg=before,
        )
        after = self.page.locator("#safety-cover").evaluate("el => getComputedStyle(el).transform")
        self.assertEqual(self.page.locator("#safety-cover").get_attribute("data-cover-state"), "open")
        self.assertNotEqual(before, after)

    def test_hold_control_can_complete_with_keyboard(self):
        self._start_sequence()
        self._advance_to_hold()
        button = self.page.locator("#hold-reset-button")
        button.focus()
        self.page.keyboard.down("Space")
        self.page.wait_for_function("window.__testTriggerCount === 1")
        self.page.keyboard.up("Space")
        self.page.wait_for_function("window.__testCompleteCount === 1")
        self.assertEqual(self.page.evaluate("window.__testTriggerCount"), 1)

    def test_mobile_320px_has_no_required_horizontal_scroll(self):
        self.page.set_viewport_size({"width": 320, "height": 760})
        self._start_sequence()
        self._advance_to_hold()
        metrics = self.page.evaluate(
            """() => ({
              scrollWidth: document.documentElement.scrollWidth,
              clientWidth: document.documentElement.clientWidth,
              button: document.querySelector('#hold-reset-button').getBoundingClientRect().toJSON()
            })"""
        )
        self.assertLessEqual(metrics["scrollWidth"], metrics["clientWidth"])
        self.assertGreaterEqual(metrics["button"]["x"], 0)
        self.assertLessEqual(metrics["button"]["right"], 320)

    def test_reduced_motion_css_exists_and_sequence_semantics_are_preserved(self):
        css = CSS_PATH.read_text(encoding="utf-8")
        self.assertIn("@media (prefers-reduced-motion: reduce)", css)
        self.page.emulate_media(reduced_motion="reduce")
        self.assertTrue(self.page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"))
        self._start_sequence()
        self._advance_to_hold()
        self._complete_hold_with_pointer()
        self.page.wait_for_function("window.__testCompleteCount === 1")
        self.assertEqual(self.page.evaluate("window.__testTriggerCount"), 1)

    def test_p2_visual_systems_are_not_present(self):
        text = self.page.locator("body").inner_text().lower()
        for forbidden in ["pneumatic", "punch card", "executive floor", "banked reset"]:
            self.assertNotIn(forbidden, text)


if __name__ == "__main__":
    unittest.main()
