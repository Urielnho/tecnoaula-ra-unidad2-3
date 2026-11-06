from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
@admin.register(User)
class TecnoAulaUserAdmin(UserAdmin):
    ordering = ('email',)
    list_display = ('email', 'matricula', 'first_name', 'last_name', 'is_staff', 'is_active')
    search_fields = ('email', 'matricula', 'first_name')
    fieldsets = ((None, {'fields': ('email', 'password')}), ('Datos personales', {'fields': ('first_name', 'last_name', 'matricula')}), ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}), ('Fechas', {'fields': ('last_login', 'date_joined')}))
    add_fieldsets = ((None, {'classes': ('wide',), 'fields': ('email', 'matricula', 'password1', 'password2')}),)
