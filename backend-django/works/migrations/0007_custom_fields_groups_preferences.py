# Generated manually for Custom Fields, Custom Groups, and View Preferences

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('works', '0006_worktask'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomField',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Tên trường')),
                ('field_type', models.CharField(choices=[('text', 'Text'), ('textarea', 'Text Area (Long Text)'), ('number', 'Number'), ('date', 'Date'), ('dropdown', 'Dropdown'), ('checkbox', 'Checkbox'), ('money', 'Money'), ('website', 'Website'), ('email', 'Email'), ('phone', 'Phone'), ('labels', 'Labels'), ('formula', 'Formula')], max_length=50, verbose_name='Loại trường')),
                ('description', models.TextField(blank=True, verbose_name='Mô tả')),
                ('options', models.JSONField(blank=True, default=list, help_text='Danh sách các giá trị cho dropdown/labels', verbose_name='Tùy chọn')),
                ('is_required', models.BooleanField(default=False, verbose_name='Bắt buộc')),
                ('is_visible', models.BooleanField(default=True, verbose_name='Hiển thị')),
                ('order', models.IntegerField(default=0, verbose_name='Thứ tự')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_custom_fields', to=settings.AUTH_USER_MODEL, verbose_name='Người tạo')),
            ],
            options={
                'verbose_name': 'Trường tùy chỉnh',
                'verbose_name_plural': 'Trường tùy chỉnh',
                'db_table': 'custom_fields',
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='CustomGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Tên nhóm')),
                ('color', models.CharField(default='#6366f1', help_text='Màu hex (ví dụ: #6366f1)', max_length=7, verbose_name='Màu sắc')),
                ('order', models.IntegerField(default=0, verbose_name='Thứ tự')),
                ('is_default', models.BooleanField(default=False, help_text='Nhóm mặc định (ví dụ: TO DO, IN PROGRESS, DONE)', verbose_name='Mặc định')),
                ('is_active', models.BooleanField(default=True, verbose_name='Hoạt động')),
                ('status_mapping', models.JSONField(blank=True, default=list, help_text='Danh sách các status values được map vào nhóm này', verbose_name='Ánh xạ trạng thái')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_custom_groups', to=settings.AUTH_USER_MODEL, verbose_name='Người tạo')),
            ],
            options={
                'verbose_name': 'Nhóm tùy chỉnh',
                'verbose_name_plural': 'Nhóm tùy chỉnh',
                'db_table': 'custom_groups',
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='ViewPreference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('view_type', models.CharField(choices=[('list', 'List'), ('board', 'Board/Kanban'), ('calendar', 'Calendar'), ('gantt', 'Gantt')], max_length=20, verbose_name='Loại view')),
                ('config', models.JSONField(default=dict, help_text='Cấu hình view (visible columns, grouping, sorting, etc.)', verbose_name='Cấu hình')),
                ('is_default', models.BooleanField(default=False, help_text='View mặc định cho user', verbose_name='Mặc định')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='view_preferences', to=settings.AUTH_USER_MODEL, verbose_name='Người dùng')),
            ],
            options={
                'verbose_name': 'Cấu hình view',
                'verbose_name_plural': 'Cấu hình view',
                'db_table': 'view_preferences',
            },
        ),
        migrations.CreateModel(
            name='CustomFieldValue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value_text', models.TextField(blank=True, null=True, verbose_name='Giá trị text')),
                ('value_number', models.DecimalField(blank=True, decimal_places=2, max_digits=20, null=True, verbose_name='Giá trị số')),
                ('value_date', models.DateField(blank=True, null=True, verbose_name='Giá trị ngày')),
                ('value_boolean', models.BooleanField(blank=True, null=True, verbose_name='Giá trị boolean')),
                ('value_json', models.JSONField(blank=True, null=True, verbose_name='Giá trị JSON')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('field', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='values', to='works.customfield', verbose_name='Trường')),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='custom_field_values', to='works.worktask', verbose_name='Công việc')),
            ],
            options={
                'verbose_name': 'Giá trị trường tùy chỉnh',
                'verbose_name_plural': 'Giá trị trường tùy chỉnh',
                'db_table': 'custom_field_values',
            },
        ),
        migrations.AddIndex(
            model_name='viewpreference',
            index=models.Index(fields=['user', 'view_type'], name='idx_view_pref_user_type'),
        ),
        migrations.AddIndex(
            model_name='viewpreference',
            index=models.Index(fields=['is_default'], name='idx_view_pref_default'),
        ),
        migrations.AddIndex(
            model_name='customgroup',
            index=models.Index(fields=['is_active'], name='idx_custom_group_active'),
        ),
        migrations.AddIndex(
            model_name='customgroup',
            index=models.Index(fields=['is_default'], name='idx_custom_group_default'),
        ),
        migrations.AddIndex(
            model_name='customfieldvalue',
            index=models.Index(fields=['task', 'field'], name='idx_custom_value_task_field'),
        ),
        migrations.AddIndex(
            model_name='customfield',
            index=models.Index(fields=['field_type'], name='idx_custom_field_type'),
        ),
        migrations.AddIndex(
            model_name='customfield',
            index=models.Index(fields=['is_visible'], name='idx_custom_field_visible'),
        ),
        migrations.AddConstraint(
            model_name='viewpreference',
            constraint=models.UniqueConstraint(fields=['user', 'view_type'], name='works_viewpreference_user_view_type_unique'),
        ),
        migrations.AddConstraint(
            model_name='customfieldvalue',
            constraint=models.UniqueConstraint(fields=['task', 'field'], name='works_customfieldvalue_task_field_unique'),
        ),
    ]

