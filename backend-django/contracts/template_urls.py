from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContractTemplateViewSet

router = DefaultRouter()
router.register(r'', ContractTemplateViewSet, basename='contract-template')

urlpatterns = [
    path('', include(router.urls)),
]

