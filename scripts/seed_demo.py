import os, sys
from pathlib import Path
sys.path.insert(0, str(Path('backend').resolve()))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tecnoaula.settings')
import django
django.setup()
from users.models import User
from products.models import Category, Product
for email, matricula, password, admin in [('admin@tecnoaula.local','ADM001','AdminDemo!8246',True),('alumno@tecnoaula.local','IDGS9001','AlumnoDemo!4926',False)]:
    u, _ = User.objects.get_or_create(email=email, defaults={'matricula':matricula})
    u.matricula=matricula; u.is_staff=admin; u.is_superuser=admin; u.first_name='Administrador' if admin else 'Uriel'; u.last_name='' if admin else 'Estudiante'; u.set_password(password); u.save()
c, _ = Category.objects.get_or_create(name='Electronica')
Product.objects.get_or_create(name='Teclado para laboratorio',defaults={'category':c,'description':'Teclado USB para estudiantes','price':'450.00'})
print('Cuentas sinteticas y producto local preparados.')
