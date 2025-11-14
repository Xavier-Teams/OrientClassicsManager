from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TranslationWorkViewSet

router = DefaultRouter()
router.register(r'', TranslationWorkViewSet, basename='work')

urlpatterns = [
    path('', include(router.urls)),
]

