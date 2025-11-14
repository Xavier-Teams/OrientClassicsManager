from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TranslationContractViewSet

router = DefaultRouter()
router.register(r'', TranslationContractViewSet, basename='contract')

urlpatterns = [
    path('', include(router.urls)),
]

