# 🔐 Hướng dẫn đăng nhập Django Admin

## 📋 Thông tin tài khoản Admin

Từ SQL seed data, có một admin user đã được tạo với:

- **Username**: `admin`
- **Email**: `admin@orientclassics.vn`
- **Password**: ⚠️ **Password hash là placeholder, không thể đăng nhập được!**

## ⚠️ Vấn đề

Password trong SQL seed data là hash dummy (`pbkdf2_sha256$600000$dummy$dummy=`), không thể dùng để đăng nhập.

## ✅ Giải pháp: Tạo hoặc Reset Password

### Cách 1: Tạo Superuser mới (Khuyến nghị)

Mở terminal và chạy:

```bash
cd backend-django
python manage.py createsuperuser
```

Bạn sẽ được hỏi:
```
Username: admin
Email address: admin@orientclassics.vn
Password: [nhập password của bạn]
Password (again): [nhập lại password]
```

**Lưu ý**: Nếu username `admin` đã tồn tại, bạn có thể:
- Dùng username khác (ví dụ: `admin2`)
- Hoặc reset password cho user `admin` hiện có (xem Cách 2)

---

### Cách 2: Reset Password cho Admin User hiện có

#### Option A: Sử dụng Django Shell (Khuyến nghị)

```bash
cd backend-django
python manage.py shell
```

Trong Django shell, chạy:

```python
from users.models import User

# Lấy admin user
admin_user = User.objects.get(username='admin')

# Set password mới
admin_user.set_password('your-new-password-here')

# Lưu
admin_user.save()

# Kiểm tra
print(f"Password đã được reset cho user: {admin_user.username}")
print(f"Email: {admin_user.email}")
print(f"Is superuser: {admin_user.is_superuser}")
print(f"Is staff: {admin_user.is_staff}")

# Thoát shell
exit()
```

#### Option B: Sử dụng Django Management Command

Tạo file `backend-django/users/management/commands/reset_admin_password.py`:

```python
from django.core.management.base import BaseCommand
from users.models import User

class Command(BaseCommand):
    help = 'Reset password for admin user'

    def add_arguments(self, parser):
        parser.add_argument('--password', type=str, help='New password for admin')

    def handle(self, *args, **options):
        password = options.get('password')
        if not password:
            password = input('Enter new password for admin: ')
        
        try:
            admin_user = User.objects.get(username='admin')
            admin_user.set_password(password)
            admin_user.is_superuser = True
            admin_user.is_staff = True
            admin_user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully reset password for admin user')
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Admin user does not exist')
            )
```

Sau đó chạy:

```bash
python manage.py reset_admin_password --password your-new-password
```

---

### Cách 3: Sử dụng Django Admin (Nếu đã có tài khoản khác)

1. Đăng nhập bằng tài khoản admin khác
2. Vào **Users** → Tìm user `admin`
3. Click vào user `admin`
4. Scroll xuống phần **Password**, click **Change password**
5. Nhập password mới và lưu

---

## 🚀 Quick Start - Tạo Superuser ngay

**Cách nhanh nhất:**

```bash
cd backend-django
python manage.py createsuperuser
```

Nhập thông tin:
- Username: `admin` (hoặc username khác)
- Email: `admin@orientclassics.vn` (hoặc email khác)
- Password: [nhập password bạn muốn]

---

## 🔍 Kiểm tra User đã tồn tại chưa

Nếu muốn kiểm tra xem user `admin` đã tồn tại chưa:

```bash
cd backend-django
python manage.py shell
```

```python
from users.models import User

# Kiểm tra user admin
try:
    admin = User.objects.get(username='admin')
    print(f"User 'admin' đã tồn tại!")
    print(f"Email: {admin.email}")
    print(f"Is superuser: {admin.is_superuser}")
    print(f"Is staff: {admin.is_staff}")
except User.DoesNotExist:
    print("User 'admin' chưa tồn tại. Cần tạo mới.")

exit()
```

---

## 📝 Tài khoản mặc định đề xuất

Sau khi tạo/reset password, bạn có thể đăng nhập với:

- **URL**: http://127.0.0.1:8000/admin/
- **Username**: `admin`
- **Password**: [password bạn vừa tạo]

---

## ⚠️ Lưu ý bảo mật

1. **Không dùng password yếu** trong production
2. **Đổi password định kỳ**
3. **Không commit password vào Git**
4. **Sử dụng environment variables** cho production

---

## 🆘 Troubleshooting

### Lỗi: `User matching query does not exist`

**Nguyên nhân**: User `admin` chưa được tạo

**Giải pháp**: Chạy `python manage.py createsuperuser`

### Lỗi: `That username is already taken`

**Nguyên nhân**: Username `admin` đã tồn tại

**Giải pháp**: 
- Dùng username khác
- Hoặc reset password cho user hiện có (Cách 2)

### Lỗi: `Please enter a valid email address`

**Giải pháp**: Nhập email hợp lệ (có định dạng `user@domain.com`)

---

## ✅ Checklist

- [ ] Đã tạo/reset password cho admin user
- [ ] Có thể đăng nhập vào http://127.0.0.1:8000/admin/
- [ ] Có thể thấy Django Admin interface
- [ ] Có thể truy cập các models (Works, Users, etc.)

---

**Sau khi hoàn thành, bạn có thể đăng nhập vào Django Admin và quản lý dữ liệu!** 🎉

