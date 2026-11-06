from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from .models import User
class PasswordField(serializers.CharField):
    def get_value(self, dictionary):
        # DRF trata un campo HTML opcional vacio como omitido; aqui se rechaza.
        if self.field_name in dictionary:
            return dictionary[self.field_name]
        return super().get_value(dictionary)
class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'matricula', 'is_active', 'is_staff']
class UserSerializer(UserReadSerializer):
    password = PasswordField(write_only=True, required=False, allow_blank=False, trim_whitespace=False, style={'input_type': 'password'}, help_text='Solo escritura. Obligatoria al crear; omitir al editar para conservarla.')
    class Meta(UserReadSerializer.Meta):
        fields = UserReadSerializer.Meta.fields + ['password']
        read_only_fields = ['id']
    def validate_email(self, value):
        value = User.objects.normalize_email(value).lower()
        existing = User.objects.filter(email__iexact=value)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError('Este email ya esta registrado.')
        return value
    def validate(self, attrs):
        if self.instance is None and 'password' not in attrs:
            raise serializers.ValidationError({'password': 'Obligatoria al crear un usuario.'})
        if 'password' in attrs:
            candidate = User(email=attrs.get('email', getattr(self.instance, 'email', '')), first_name=attrs.get('first_name', getattr(self.instance, 'first_name', '')), last_name=attrs.get('last_name', getattr(self.instance, 'last_name', '')))
            try:
                validate_password(attrs['password'], candidate)
            except ValidationError as exc:
                raise serializers.ValidationError({'password': exc.messages})
        return attrs
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for name, value in validated_data.items():
            setattr(instance, name, value)
        # Se conserva el hash del usuario editado cuando no viene password (PUT y PATCH).
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

class RegisterUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = ['id', 'email', 'first_name', 'last_name', 'matricula', 'password']
        read_only_fields = ['id']
