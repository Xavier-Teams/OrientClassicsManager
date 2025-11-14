# 🚀 HƯỚNG DẪN SETUP DJANGO PROJECT

## 📋 BƯỚC 1: TẠO PROJECT STRUCTURE

### **1.1. Tạo thư mục mới**

```bash
# Tạo thư mục project mới (song song với project cũ)
cd D:\2. Vincent\DEV
mkdir HRMS_Django
cd HRMS_Django
```

### **1.2. Tạo virtual environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### **1.3. Install Django**

```bash
pip install django==4.2.7
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.0
pip install psycopg2-binary==2.9.9
pip install djangorestframework-simplejwt==5.3.0
pip install django-fsm==2.8.1
pip install django-storages==1.14.2
pip install reportlab==4.0.7
pip install python-dotenv==1.0.0
```

### **1.4. Tạo Django project**

```bash
django-admin startproject config .
cd config
python manage.py startapp core
python manage.py startapp translation
python manage.py startapp documents
python manage.py startapp users
```

---

## 📁 BƯỚC 2: CẤU TRÚC THƯ MỤC

Tạo cấu trúc như sau:

```
HRMS_Django/
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── core/
│   ├── translation/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── work.py
│   │   │   ├── contract.py
│   │   │   └── ...
│   │   ├── serializers/
│   │   ├── views/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── documents/
│   ├── users/
│   │
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/  # Giữ nguyên React project
```

---

## ⚙️ BƯỚC 3: CẤU HÌNH SETTINGS

### **config/settings.py**

```python
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_fsm',
    
    # Local apps
    'core',
    'translation',
    'documents',
    'users',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'translation_db'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'vi'
TIME_ZONE = 'Asia/Ho_Chi_Minh'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

---

## 🗄️ BƯỚC 4: TẠO MODELS

### **translation/models/work.py**

```python
from django.db import models
from django_fsm import FSMField, transition
from django.contrib.auth.models import User

class TranslationWork(models.Model):
    """Tác phẩm dịch thuật"""
    
    STATE_CHOICES = [
        ('draft', 'Dự kiến'),
        ('approved', 'Đã duyệt'),
        ('translator_assigned', 'Đã gán dịch giả'),
        ('trial_translation', 'Dịch thử'),
        ('trial_reviewed', 'Đã thẩm định dịch thử'),
        ('contract_signed', 'Đã ký hợp đồng'),
        ('in_progress', 'Đang dịch'),
        ('progress_checked', 'Đã kiểm tra tiến độ'),
        ('final_translation', 'Dịch hoàn thiện'),
        ('expert_reviewed', 'Đã thẩm định chuyên gia'),
        ('project_accepted', 'Đã nghiệm thu Dự án'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]
    
    PRIORITY_CHOICES = [
        ('0', 'Bình thường'),
        ('1', 'Cao'),
        ('2', 'Khẩn'),
    ]
    
    # Basic info
    name = models.CharField(max_length=500, verbose_name='Tên tác phẩm')
    author = models.CharField(max_length=200, blank=True, verbose_name='Tác giả')
    source_language = models.CharField(max_length=50, default='Hán văn', verbose_name='Ngôn ngữ nguồn')
    target_language = models.CharField(max_length=50, default='Tiếng Việt', verbose_name='Ngôn ngữ đích')
    
    # Details
    page_count = models.IntegerField(default=0, verbose_name='Số trang cơ sở')
    word_count = models.IntegerField(default=0, verbose_name='Số từ')
    description = models.TextField(blank=True, verbose_name='Mô tả')
    
    # Relationships
    translation_part = models.ForeignKey(
        'TranslationPart',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='works',
        verbose_name='Hợp phần dịch thuật'
    )
    translator = models.ForeignKey(
        'users.Translator',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='works',
        verbose_name='Dịch giả'
    )
    contract = models.OneToOneField(
        'TranslationContract',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='work',
        verbose_name='Hợp đồng'
    )
    
    # State (using django-fsm)
    state = FSMField(
        default='draft',
        choices=STATE_CHOICES,
        protected=True,
        verbose_name='Trạng thái'
    )
    
    # Other fields
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, default='0')
    notes = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_works')
    
    class Meta:
        verbose_name = 'Tác phẩm dịch thuật'
        verbose_name_plural = 'Tác phẩm dịch thuật'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    # Workflow transitions
    @transition(field=state, source='draft', target='approved')
    def approve(self):
        """Duyệt tác phẩm"""
        pass
    
    @transition(field=state, source='approved', target='translator_assigned')
    def assign_translator(self):
        """Gán dịch giả"""
        if not self.translator:
            raise ValueError('Vui lòng chọn dịch giả trước khi gán')
    
    @transition(field=state, source='translator_assigned', target='trial_translation')
    def start_trial(self):
        """Bắt đầu dịch thử"""
        pass
    
    # ... more transitions
    
    @property
    def progress(self):
        """Tính tiến độ dựa trên state"""
        progress_map = {
            'draft': 0,
            'approved': 10,
            'translator_assigned': 15,
            'trial_translation': 20,
            'trial_reviewed': 30,
            'contract_signed': 40,
            'in_progress': 50,
            'progress_checked': 60,
            'final_translation': 70,
            'expert_reviewed': 85,
            'project_accepted': 95,
            'completed': 100,
            'cancelled': 0,
        }
        return progress_map.get(self.state, 0)
```

---

## 🔌 BƯỚC 5: TẠO API

### **translation/serializers/work.py**

```python
from rest_framework import serializers
from translation.models import TranslationWork

class TranslationWorkSerializer(serializers.ModelSerializer):
    progress = serializers.ReadOnlyField()
    translator_name = serializers.CharField(source='translator.name', read_only=True)
    
    class Meta:
        model = TranslationWork
        fields = [
            'id', 'name', 'author', 'source_language', 'target_language',
            'page_count', 'word_count', 'description',
            'translation_part', 'translator', 'contract',
            'state', 'priority', 'notes', 'active',
            'progress', 'translator_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
```

### **translation/views/work.py**

```python
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from translation.models import TranslationWork
from translation.serializers import TranslationWorkSerializer

class TranslationWorkViewSet(viewsets.ModelViewSet):
    queryset = TranslationWork.objects.filter(active=True)
    serializer_class = TranslationWorkSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'author']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Duyệt tác phẩm"""
        work = self.get_object()
        try:
            work.approve()
            work.save()
            return Response({'status': 'approved'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=True, methods=['post'])
    def assign_translator(self, request, pk=None):
        """Gán dịch giả"""
        work = self.get_object()
        translator_id = request.data.get('translator_id')
        # ... logic
        return Response({'status': 'translator_assigned'})
```

### **translation/urls.py**

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from translation.views import TranslationWorkViewSet

router = DefaultRouter()
router.register(r'works', TranslationWorkViewSet, basename='work')

urlpatterns = [
    path('', include(router.urls)),
]
```

### **config/urls.py**

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/translation/', include('translation.urls')),
    path('api/v1/auth/', include('users.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## 🗄️ BƯỚC 6: DATABASE MIGRATIONS

```bash
# Tạo migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Tạo superuser
python manage.py createsuperuser
```

---

## 🧪 BƯỚC 7: TEST API

```bash
# Run server
python manage.py runserver

# Test API (trong terminal khác)
curl http://localhost:8000/api/v1/translation/works/
```

---

## 📝 BƯỚC 8: TẠO .env FILE

```bash
# .env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=translation_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

---

## ✅ CHECKLIST

- [ ] Django project created
- [ ] Apps created (core, translation, documents, users)
- [ ] Settings configured
- [ ] Models created
- [ ] Migrations applied
- [ ] API endpoints working
- [ ] CORS configured
- [ ] Authentication setup
- [ ] Admin panel accessible

---

**Bạn đã sẵn sàng để bắt đầu migration!** 🚀

