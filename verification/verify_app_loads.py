from playwright.sync_api import sync_playwright

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            # Use domcontentloaded to be faster
            response = page.goto("http://localhost:3000/Agri-AI/", wait_until="domcontentloaded", timeout=60000)
            print(f"Response status: {response.status}")

            # Wait for the app title or key element
            try:
                page.wait_for_selector("h1", timeout=10000)
                print("Found h1")
            except:
                print("h1 not found, dumping content")
                print(page.content()[:500])

            print("Taking screenshot...")
            page.screenshot(path="verification/initial_load.png")
            print("Screenshot saved to verification/initial_load.png")

        except Exception as e:
            print(f"Error: {e}")
            try:
                page.screenshot(path="verification/error.png")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_loads()
