from django.urls import path
from .views import CountryInfoView
urlpatterns = [path('integrations/country/', CountryInfoView.as_view(), name='soap-country')]
