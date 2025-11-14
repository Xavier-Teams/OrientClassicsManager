from django.urls import path
from .views import SmartQueryView, TranslationCheckView

urlpatterns = [
    path('query/', SmartQueryView.as_view(), name='ai_query'),
    path('translation/check/', TranslationCheckView.as_view(), name='translation_check'),
]

