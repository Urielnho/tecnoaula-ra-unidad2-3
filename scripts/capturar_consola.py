from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=False,args=['--remote-debugging-port=9223','--auto-open-devtools-for-tabs','--start-maximized'])
 page=b.new_page(no_viewport=True);page.goto('http://127.0.0.1:5173/login');page.locator('#email').fill('alumno@tecnoaula.local');page.locator('#password').fill('AlumnoDemo!4926');page.locator('button[type=submit]').click();page.wait_for_url('**/dashboard');page.get_by_test_id('country-data').wait_for(timeout=35000);page.get_by_test_id('weather-data').wait_for(timeout=30000);page.bring_to_front()
 print('Chrome listo para capturar consola real.',flush=True)
 page.wait_for_timeout(600000)
