from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TranslatorViewSet

router = DefaultRouter()
router.register(r'translators', TranslatorViewSet, basename='translator')

urlpatterns = [
    path('', include(router.urls)),
]

