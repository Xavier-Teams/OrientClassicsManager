from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, PaymentCategoryConfigViewSet

router = DefaultRouter()
router.register(r'categories', PaymentCategoryConfigViewSet, basename='payment-category')
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
