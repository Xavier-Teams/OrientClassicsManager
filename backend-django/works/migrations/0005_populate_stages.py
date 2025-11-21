# Generated migration to populate Stage table with default stages

from django.db import migrations


def populate_stages(apps, schema_editor):
    """Populate Stage table with default stages"""
    Stage = apps.get_model('works', 'Stage')
    
    default_stages = [
        {'name': 'Giai đoạn 1', 'code': 'STAGE_1', 'order': 1, 'description': 'Giai đoạn đầu tiên của dự án dịch thuật'},
        {'name': 'Giai đoạn 2', 'code': 'STAGE_2', 'order': 2, 'description': 'Giai đoạn thứ hai của dự án dịch thuật'},
        {'name': 'Giai đoạn 3', 'code': 'STAGE_3', 'order': 3, 'description': 'Giai đoạn thứ ba của dự án dịch thuật'},
        {'name': 'Giai đoạn 4', 'code': 'STAGE_4', 'order': 4, 'description': 'Giai đoạn thứ tư của dự án dịch thuật'},
        {'name': 'Giai đoạn 5', 'code': 'STAGE_5', 'order': 5, 'description': 'Giai đoạn thứ năm của dự án dịch thuật'},
    ]
    
    for stage_data in default_stages:
        Stage.objects.get_or_create(
            code=stage_data['code'],
            defaults=stage_data
        )


def reverse_populate_stages(apps, schema_editor):
    """Reverse migration - remove default stages"""
    Stage = apps.get_model('works', 'Stage')
    Stage.objects.filter(code__in=['STAGE_1', 'STAGE_2', 'STAGE_3', 'STAGE_4', 'STAGE_5']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('works', '0004_stage_translationwork_idx_works_part_stage_and_more'),
    ]

    operations = [
        migrations.RunPython(populate_stages, reverse_populate_stages),
    ]

