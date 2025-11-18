from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TranslationWorkViewSet, TranslationPartViewSet

router = DefaultRouter()
router.register(r'parts', TranslationPartViewSet, basename='part')
router.register(r'', TranslationWorkViewSet, basename='work')

urlpatterns = [
    path('', include(router.urls)),
]

