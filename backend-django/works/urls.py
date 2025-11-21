from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TranslationWorkViewSet, 
    TranslationPartViewSet, 
    StageViewSet,
    WorkTaskViewSet,
    WorkTaskStatisticsView,
    WorkTaskPersonalStatisticsView
)

router = DefaultRouter()
router.register(r'parts', TranslationPartViewSet, basename='part')
router.register(r'stages', StageViewSet, basename='stage')
router.register(r'tasks', WorkTaskViewSet, basename='task')
router.register(r'', TranslationWorkViewSet, basename='work')

urlpatterns = [
    # Custom statistics endpoints - must be before router.urls to avoid conflicts
    path('tasks/statistics/', WorkTaskStatisticsView.as_view(), name='task-statistics'),
    path('tasks/statistics/personal/', WorkTaskPersonalStatisticsView.as_view(), name='task-statistics-personal'),
    path('tasks/statistics/personal/<int:user_id>/', WorkTaskPersonalStatisticsView.as_view(), name='task-statistics-personal-user'),
    # Router URLs (includes /tasks/, /parts/, /stages/, etc.)
    path('', include(router.urls)),
]

