"""
URL configuration for OrientClassicsManager project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root(request):
    """API root endpoint - provides API information"""
    return JsonResponse({
        'message': 'OrientClassicsManager API',
        'version': 'v1',
        'endpoints': {
            'works': '/api/v1/works/',
            'works_board': '/api/v1/works/board/',
            'works_parts': '/api/v1/works/parts/',
            'auth': '/api/v1/auth/',
            'translators': '/api/v1/translators/',
            'contracts': '/api/v1/contracts/',
            'contract_templates': '/api/v1/contract-templates/',
            'reviews': '/api/v1/reviews/',
            'editing': '/api/v1/editing/',
            'administration': '/api/v1/administration/',
            'documents': '/api/v1/documents/',
            'ai': '/api/v1/ai/',
            'payments': '/api/v1/payments/',
            'admin': '/admin/',
        },
        'documentation': 'API documentation coming soon. Use /api/v1/works/board/ to test.'
    })


urlpatterns = [
    path('', api_root, name='api-root'),  # Root endpoint
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/translators/', include('translators.urls')),
    path('api/v1/works/', include('works.urls')),  # Includes /parts/ and /works/
    path('api/v1/contracts/', include('contracts.urls')),
    path('api/v1/contract-templates/', include('contracts.template_urls')),
    path('api/v1/reviews/', include('reviews.urls')),
    path('api/v1/editing/', include('editing.urls')),
    path('api/v1/administration/', include('administration.urls')),
    path('api/v1/documents/', include('documents.urls')),
    path('api/v1/ai/', include('ai.urls')),
    path('api/v1/payments/', include('payments.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
