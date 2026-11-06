import json, time
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
OUT = Path('output/evidencias'); OUT.mkdir(parents=True, exist_ok=True)
FRONT = 'http://127.0.0.1:5173'
API = 'http://127.0.0.1:8001'
results = {}
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width':1440, 'height':1100}, device_scale_factor=1)
    errors = []; console = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda msg: console.append(msg.text))
    page.goto(FRONT + '/dashboard')
    page.wait_for_url('**/login')
    results['protected_redirect'] = True
    page.screenshot(path=str(OUT / '01_login.png'), full_page=True)
    page.locator('#email').fill('alumno@tecnoaula.local')
    page.locator('#password').fill('Incorrecta!123')
    page.get_by_role('button', name='Iniciar sesión', exact=True).click()
    expect(page.get_by_role('alert').first).to_contain_text('El correo o la contraseña no son correctos.')
    results['invalid_login_rejected'] = True
    page.locator('#password').fill('AlumnoDemo!4926')
    with page.expect_response(lambda r: '/auth/token/' in r.url and r.request.method == 'POST') as response:
        page.get_by_role('button', name='Iniciar sesión', exact=True).click()
    tokens = response.value.json()
    assert response.value.status == 200 and tokens['access'] and tokens['refresh']
    page.wait_for_url('**/dashboard')
    expect(page.get_by_role('heading', name='Hola, Uriel.')).to_be_visible()
    page.get_by_test_id('weather-data').wait_for(timeout=30000)
    page.get_by_test_id('country-data').wait_for(timeout=35000)
    page.screenshot(path=str(OUT / '03_dashboard.png'), full_page=True)
    page.locator('.weather-card').screenshot(path=str(OUT / '04_api_clima.png'))
    page.locator('.country-card').screenshot(path=str(OUT / '05_soap_dashboard.png'))
    results['login_token_status'] = 200
    results['auth_context_name'] = 'Uriel'
    results['weather_live'] = True
    results['soap_live'] = True
    page.reload()
    expect(page.get_by_role('heading', name='Hola, Uriel.')).to_be_visible()
    results['session_survives_reload'] = True
    # Se altera SOLO el access del navegador de prueba: el refresh válido debe recuperarlo.
    page.evaluate("""() => { const key='TECNOAULA_RA23'; const t=JSON.parse(localStorage.getItem(key)); t.access='invalido'; localStorage.setItem(key, JSON.stringify(t)); }""")
    with page.expect_response(lambda r: '/auth/token/refresh/' in r.url) as refresh:
        page.reload()
    assert refresh.value.status == 200
    expect(page.get_by_role('heading', name='Hola, Uriel.')).to_be_visible()
    results['session_refresh_status'] = 200
    page.locator('#country-code').select_option('CA')
    expect(page.get_by_test_id('country-data')).to_contain_text('Canada', timeout=35000)
    results['country_selection_live'] = 'Canada'
    page.locator('#weather-city').select_option('cdmx')
    page.get_by_test_id('weather-data').wait_for(timeout=30000)
    results['weather_selection_live'] = True
    # Consumo SOAP desde Django, visible en Swagger con respuesta real.
    soap_page = browser.new_page(viewport={'width':1440,'height':1100})
    soap_page.goto(API + '/swagger/'); soap_page.wait_for_selector('.opblock')
    soap_page.get_by_role('button',name='Authorize',exact=False).first.click()
    soap_page.locator('.dialog-ux input').fill('Bearer ' + tokens['access'])
    soap_page.locator('.dialog-ux').get_by_role('button',name='Apply credentials',exact=True).click()
    soap_page.locator('.dialog-ux').get_by_role('button',name='Close',exact=True).click()
    block = soap_page.locator('.opblock').filter(has_text='/integrations/country/').first
    block.locator('.opblock-summary').click()
    block.get_by_role('button',name='Try it out',exact=True).click()
    block.locator('input').first.fill('MX')
    with soap_page.expect_response(lambda r: '/api/v1/integrations/country/' in r.url) as soap_response:
        block.get_by_role('button',name='Execute',exact=True).click()
    assert soap_response.value.status == 200
    soap = soap_response.value.json(); assert soap['protocol']=='SOAP' and soap['code']=='MX'
    block.locator('.live-responses-table').wait_for();soap_page.wait_for_timeout(500)
    bounds=block.bounding_box(); live=block.locator('.live-responses-table').bounding_box()
    soap_page.screenshot(path=str(OUT/'06_soap_django.png'), full_page=True, clip={'x':bounds['x'],'y':bounds['y']+soap_page.evaluate('window.scrollY'),'width':bounds['width'],'height':live['y']+live['height']-bounds['y']+20})
    results['soap_response'] = soap
    # Salir y volver a intentar la ruta protegida.
    page.get_by_role('button',name='Cerrar sesión',exact=True).click()
    page.wait_for_url('**/login');page.goto(FRONT+'/dashboard');page.wait_for_url('**/login')
    results['logout_protects_dashboard'] = True
    page.goto(FRONT+'/register')
    page.screenshot(path=str(OUT/'07_registro.png'),full_page=True)
    # Registro real mediante el formulario, con email y matrícula únicos por ejecución.
    unique = str(int(time.time()))
    for key,value in {'first_name':'Estudiante','last_name':'Prueba','matricula':'RA'+unique,'email':'prueba'+unique+'@tecnoaula.local','password':'RegistroSeguro!823','confirm_password':'RegistroSeguro!823'}.items():
        page.locator('#'+key).fill(value)
    with page.expect_response(lambda r:'/auth/register/' in r.url) as register:
        page.get_by_role('button',name='Crear mi cuenta',exact=True).click()
    assert register.value.status==201
    page.wait_for_url('**/login')
    expect(page.get_by_role('status').first).to_contain_text('Tu cuenta está lista.')
    results['register_status']=201
    page.screenshot(path=str(OUT/'08_registro_exitoso.png'),full_page=True)
    # Vista móvil auténtica del login y Dashboard.
    mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    mobile.goto(FRONT+'/login');mobile.locator('#email').fill('alumno@tecnoaula.local');mobile.locator('#password').fill('AlumnoDemo!4926');mobile.get_by_role('button',name='Iniciar sesión',exact=True).click();mobile.wait_for_url('**/dashboard');mobile.get_by_test_id('weather-data').wait_for(timeout=30000);mobile.get_by_test_id('country-data').wait_for(timeout=35000)
    assert mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    mobile.screenshot(path=str(OUT/'09_dashboard_movil.png'),full_page=True)
    results['mobile_no_horizontal_overflow']=True
    results['browser_errors']=errors
    assert not errors
    results['console_token_received']=any('JWT obtenido' in line for line in console)
    assert results['console_token_received']
    (OUT/'console_real.txt').write_text('\n'.join(line for line in console if 'JWT obtenido' in line),encoding='utf-8')
    browser.close()
(OUT/'resultados.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print('Verificación completa. Capturas reales y resultados guardados.')
