from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
OUT=Path('output/pdf');OUT.mkdir(parents=True,exist_ok=True)
repo='https://github.com/Urielnho/tecnoaula-ra-unidad2-3'
font_dir=Path('C:/Windows/Fonts')
pdfmetrics.registerFont(TTFont('Arial',str(font_dir/'arial.ttf')))
pdfmetrics.registerFont(TTFont('Arial-Bold',str(font_dir/'arialbd.ttf')))
W,H=letter;M=50;number=0
c=canvas.Canvas(str(OUT/'Resultado_Aprendizaje_U2_U3.pdf'),pagesize=letter)
c.setTitle('Resultado de Aprendizaje Unidades 2 y 3 - TecnoAula')
c.setAuthor('Uriel')
def paragraph(text,y,bold=False):
    font='Arial-Bold' if bold else 'Arial';c.setFont(font,14)
    for source in text.split('\n'):
        line=''
        for word in source.split():
            candidate=(line+' '+word).strip()
            if pdfmetrics.stringWidth(candidate,font,14)>W-2*M and line:
                c.drawString(M,y,line);y-=20;line=word
            else:line=candidate
        if line:c.drawString(M,y,line);y-=20
    return y

def start(title):
    global number
    number+=1
    c.setFillColorRGB(0,0,0)
    return paragraph(title,H-M,True)-15

def finish():
    c.setFont('Arial',14);c.drawCentredString(W/2,25,str(number));c.showPage()

def screenshot(filename,y,max_h=510):
    path=Path('output/evidencias')/filename
    with Image.open(path) as im:
        iw,ih=im.size
        scale=min((W-2*M)/iw,max_h/ih)
        width,height=iw*scale,ih*scale
        c.drawImage(ImageReader(im),(W-width)/2,y-height,width=width,height=height)
    return y-height-28

y=start('Resultado de Aprendizaje - Unidades 2 y 3')
y=paragraph('Desarrollo Web Integral\nTecnoAula: Django + React con autenticación y APIs\n5 de noviembre de 2026',y)-15
y=paragraph('Repositorio de GitHub',y,True)
link_y=y;y=paragraph(repo,y);c.linkURL(repo,(M,link_y-4,W-M,link_y+16),relative=0);y-=15
for title,text in [
('Descripción','Se amplió el backend de la Práctica 4 con un frontend React, siguiendo las páginas 13 a 35 del manual del curso.'),
('Funcionalidad','Login y registro, rutas con React Router v6, Dashboard protegido, AuthContext y recuperación de sesión con JWT.'),
('Integraciones','El Dashboard consulta el clima con fetch a Open-Meteo. Django consume CountryInfoService por SOAP usando zeep y entrega los datos del país a React.'),
('Comprobación','Se aprobaron 24 pruebas del backend y la compilación del frontend. En Chrome se comprobaron registro, login, persistencia, refresh, logout y consultas externas reales.'),
('Evidencias','Las capturas provienen de la aplicación en ejecución y de Chrome DevTools. No se dibujaron ni fabricaron respuestas. Se utilizaron cuentas locales de demostración.')]:
    y=paragraph(title,y,True);y=paragraph(text,y)-12
finish()
items=[
('1. Pantalla de login','01_login.png','Figura 1. Formulario de React con correo y contraseña. El botón Iniciar sesión envía las credenciales al endpoint JWT de Django.'),
('2. Login exitoso: consola real','02_consola_token.png','Figura 2. Chrome DevTools muestra el mensaje emitido por AuthContext después de obtener el JWT y consultar al usuario. El token se imprime abreviado desde el código. El login redirige al Dashboard.'),
('3. Dashboard protegido y AuthContext','03_dashboard.png','Figura 3. El Dashboard muestra Hola, Uriel, su email y matrícula obtenidos de /auth/me/. La información corresponde al usuario autenticado. Al cerrar sesión se regresa al login.'),
('4. API de terceros en el Dashboard','04_api_clima.png','Figura 4. El widget consulta directamente Open-Meteo usando fetch. Muestra datos externos de temperatura, condición del cielo, humedad y viento. La ciudad se puede cambiar y la consulta se puede actualizar.'),
('5. Consumo SOAP desde Django','06_soap_django.png','Figura 5. Swagger ejecuta el endpoint protegido /api/v1/integrations/country/?code=MX. Django usa zeep para consumir FullCountryInfo. La respuesta HTTP 200 muestra México, capital, moneda, idioma, proveedor y protocolo SOAP.'),
('6. Registro de usuarios','07_registro.png','Figura 6. El formulario de registro permite crear una cuenta con nombre, apellidos, matrícula, email y contraseña. Se validan los campos y la confirmación de contraseña; el backend no permite otorgar privilegios administrativos.'),
('7. Confirmación del registro','08_registro_exitoso.png','Figura 7. Después de enviar el formulario, Django respondió HTTP 201. React redirigió al login y mostró que la cuenta estaba lista. Esta evidencia se obtuvo registrando una cuenta real de prueba en la base local.')]
for title,image,description in items:
    y=start(title)
    y=screenshot(image,y)
    paragraph(description,y)
    finish()
c.save()
print(OUT/'Resultado_Aprendizaje_U2_U3.pdf')
