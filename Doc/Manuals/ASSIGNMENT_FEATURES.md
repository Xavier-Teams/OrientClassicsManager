# Chức năng Giao việc - Orient Classics Manager

## Tổng quan

Hệ thống đã được bổ sung các chức năng giao việc, giám sát và đánh giá chất lượng công việc theo yêu cầu:

### 🎯 Các tính năng chính

1. **Giao việc (Task Assignment)**
   - Người dùng có thể giao việc cho người khác
   - Chỉ định ngày bắt đầu và hạn hoàn thành
   - Chỉ định người giám sát (Supervisor)
   - Người được giao việc (Assignee) không thể chỉnh sửa ngày bắt đầu và hạn hoàn thành

2. **Hệ thống thông báo (Notification System)**
   - Thông báo tự động khi được giao việc mới
   - Bao gồm: Tên task, người giao việc, ngày bắt đầu, hạn hoàn thành
   - Hiển thị số lượng thông báo chưa đọc
   - Đánh dấu đã đọc/chưa đọc

3. **Yêu cầu điều chỉnh (Assignment Requests)**
   - Assignee có thể gửi yêu cầu điều chỉnh thông tin
   - Lựa chọn thông tin cần điều chỉnh: ngày bắt đầu, hạn hoàn thành, tiêu đề, mô tả, ưu tiên, nhóm công việc
   - Nhập thông tin thay thế và lý do yêu cầu
   - Assigner có thể chấp nhận hoặc từ chối yêu cầu

4. **Người giám sát (Supervisor)**
   - Mỗi công việc có thể có người giám sát
   - Nếu công việc được giao, người giám sát mặc định là Assigner
   - Người giám sát có trách nhiệm đánh giá chất lượng công việc

5. **Đánh giá chất lượng (Quality Evaluation)**
   - Người giám sát đánh giá bằng thang điểm 5 sao
   - Ghi lại bình luận đánh giá về chất lượng công việc
   - Chỉ có thể đánh giá khi công việc đã hoàn thành

## 🔧 Cấu trúc kỹ thuật

### Backend (Django)

#### Models mới:
- **WorkTask** (đã cập nhật):
  - `assigned_by`: Người giao việc (Assigner)
  - `supervisor`: Người giám sát
  - `is_assigned`: Đã được giao việc hay chưa
  - `assignment_date`: Ngày giao việc
  - `supervisor_rating`: Đánh giá của supervisor (1-5 sao)
  - `supervisor_comment`: Bình luận đánh giá
  - `evaluation_date`: Ngày đánh giá

- **TaskAssignmentRequest**: Yêu cầu điều chỉnh
  - `task`: Công việc liên quan
  - `requester`: Người yêu cầu (Assignee)
  - `approver`: Người xử lý (Assigner)
  - `request_type`: Loại yêu cầu
  - `current_value`: Giá trị hiện tại
  - `requested_value`: Giá trị yêu cầu
  - `reason`: Lý do yêu cầu
  - `status`: Trạng thái (pending/approved/rejected/cancelled)

- **TaskNotification**: Thông báo
  - `recipient`: Người nhận
  - `sender`: Người gửi
  - `task`: Công việc liên quan
  - `notification_type`: Loại thông báo
  - `title`: Tiêu đề thông báo
  - `message`: Nội dung thông báo
  - `is_read`: Đã đọc hay chưa

#### API Endpoints mới:
- `POST /api/v1/works/tasks/{id}/assign_task/`: Giao việc
- `POST /api/v1/works/tasks/{id}/evaluate_task/`: Đánh giá công việc
- `GET /api/v1/works/tasks/my_assigned_tasks/`: Công việc được giao cho tôi
- `GET /api/v1/works/tasks/my_supervised_tasks/`: Công việc tôi giám sát
- `GET /api/v1/works/assignment-requests/`: Danh sách yêu cầu điều chỉnh
- `POST /api/v1/works/assignment-requests/`: Tạo yêu cầu điều chỉnh
- `POST /api/v1/works/assignment-requests/{id}/approve/`: Chấp nhận yêu cầu
- `POST /api/v1/works/assignment-requests/{id}/reject/`: Từ chối yêu cầu
- `GET /api/v1/works/notifications/`: Danh sách thông báo
- `POST /api/v1/works/notifications/{id}/mark_as_read/`: Đánh dấu đã đọc
- `GET /api/v1/works/notifications/unread_count/`: Số thông báo chưa đọc

### Frontend (React + TypeScript)

#### Components mới:
- **TaskActions**: Nút giao việc và đánh giá
- **AssignmentRequestForm**: Form yêu cầu điều chỉnh
- **AssignmentRequestsList**: Danh sách yêu cầu điều chỉnh
- **NotificationCenter**: Trung tâm thông báo

#### Trang demo:
- `/assignment-demo`: Trang demo đầy đủ các tính năng mới

## 🚀 Cách sử dụng

### 1. Giao việc
1. Tạo một công việc mới hoặc chọn công việc hiện có
2. Nhấn nút "Giao việc" 
3. Chọn người được giao việc và người giám sát
4. Chỉ định ngày bắt đầu và hạn hoàn thành (tùy chọn)
5. Nhập lời nhắn kèm theo (tùy chọn)
6. Nhấn "Giao việc"

### 2. Nhận thông báo
1. Kiểm tra biểu tượng chuông ở góc phải màn hình
2. Số đỏ hiển thị số thông báo chưa đọc
3. Nhấn vào để xem chi tiết thông báo
4. Nhấn vào thông báo để đánh dấu đã đọc

### 3. Yêu cầu điều chỉnh
1. Với công việc đã được giao, nhấn "Yêu cầu điều chỉnh"
2. Chọn thông tin cần thay đổi
3. Nhập giá trị mới và lý do yêu cầu
4. Nhấn "Gửi yêu cầu"
5. Chờ người giao việc phê duyệt

### 4. Xử lý yêu cầu điều chỉnh
1. Vào tab "Yêu cầu điều chỉnh" 
2. Xem chi tiết yêu cầu
3. Nhấn nút "Chấp nhận" hoặc "Từ chối"
4. Nhập phản hồi (tùy chọn cho chấp nhận, bắt buộc cho từ chối)
5. Xác nhận quyết định

### 5. Đánh giá chất lượng
1. Với công việc đã hoàn thành, người giám sát nhấn "Đánh giá"
2. Chọn số sao (1-5)
3. Nhập bình luận đánh giá (tùy chọn)
4. Nhấn "Đánh giá"

## 🔒 Phân quyền

### Quyền chỉnh sửa ngày:
- **Công việc tự tạo**: Người tạo và người được giao có thể chỉnh sửa
- **Công việc được giao**: Chỉ người giao việc (Assigner) có thể chỉnh sửa
- **Assignee**: Có thể gửi yêu cầu điều chỉnh thông qua hệ thống

### Quyền đánh giá:
- Chỉ người giám sát (Supervisor) mới có thể đánh giá
- Chỉ đánh giá được khi công việc đã hoàn thành

### Quyền xem thông báo:
- Mỗi người chỉ xem được thông báo của mình
- Tự động cập nhật số lượng thông báo chưa đọc

## 📊 Demo

Truy cập `/assignment-demo` để xem demo đầy đủ các tính năng:
- Danh sách công việc với thông tin giao việc và đánh giá
- Thống kê tổng quan
- Quản lý yêu cầu điều chỉnh
- Trung tâm thông báo

## 🔄 Migration

Để áp dụng các thay đổi database:

```bash
cd backend-django
python manage.py migrate
```

Migration `0008_add_assignment_features` sẽ tự động:
- Thêm các trường mới vào bảng `work_tasks`
- Tạo bảng `task_assignment_requests`
- Tạo bảng `task_notifications`
- Tạo các index cần thiết

## 🎨 UI/UX

### Thiết kế giao diện:
- **Badges và icons**: Phân biệt rõ ràng các trạng thái
- **Color coding**: 
  - Xanh lá: Hoàn thành, chấp nhận
  - Xanh dương: Đang tiến hành, thông tin
  - Cam: Chờ xử lý, cảnh báo
  - Đỏ: Quá hạn, từ chối, lỗi
- **Responsive**: Tương thích trên các thiết bị
- **Accessibility**: Hỗ trợ screen reader và keyboard navigation

### Trải nghiệm người dùng:
- **Real-time updates**: Thông báo cập nhật ngay lập tức
- **Validation**: Kiểm tra dữ liệu đầu vào chi tiết
- **Feedback**: Thông báo toast cho mọi hành động
- **Progressive disclosure**: Hiển thị thông tin theo từng cấp độ

## 🔮 Tương lai

Các tính năng có thể mở rộng:
- **Email notifications**: Gửi email khi có thông báo mới
- **Mobile app**: Ứng dụng di động cho thông báo push
- **Advanced analytics**: Báo cáo chi tiết về hiệu suất công việc
- **Workflow automation**: Tự động hóa quy trình giao việc
- **Integration**: Tích hợp với các hệ thống khác (Slack, Teams, etc.)
