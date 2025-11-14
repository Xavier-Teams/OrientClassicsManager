"""
URL configuration for OrientClassicsManager project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/works/', include('works.urls')),
    path('api/v1/contracts/', include('contracts.urls')),
    path('api/v1/reviews/', include('reviews.urls')),
    path('api/v1/editing/', include('editing.urls')),
    path('api/v1/administration/', include('administration.urls')),
    path('api/v1/documents/', include('documents.urls')),
    path('api/v1/ai/', include('ai.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
