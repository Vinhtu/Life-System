# Life System

Dashboard theo dõi tiến độ hàng ngày: Calendar (khung giờ, check-in, chi tiêu, lịch tháng), Mục tiêu 25 tỷ, Thống kê, Cấu trúc hệ thống, LEGD (vốn, lợi nhuận, doanh thu, phân tích, kết quả trade, tài khoản, quy định, lịch trade, tài liệu), Business (vốn, thu nhập, doanh thu, đơn hàng), English (học, chi phí), PageFly (KR), Cá nhân (thể trạng, thể lực), Tài chính (sổ thu chi), Tài khoản.

- Mở `index.html` trong trình duyệt (cần internet để tải Chart.js và font).
- Dữ liệu hiện là dữ liệu mẫu, tạo trong `app.js` (hàm `mk`). Khi nối Google Sheet, thay phần này bằng dữ liệu đọc từ Sheet.
- Lịch ở mục Calendar lưu trong localStorage của trình duyệt.

## Lưu dữ liệu trên Vercel (đồng bộ nhiều thiết bị)

Mặc định dữ liệu nằm trong trình duyệt (localStorage). Để lưu trên Vercel:

1. Push code này (có thư mục `api/`) lên GitHub để Vercel deploy.
2. Trong Vercel: mở project, vào **Storage**, chọn **Upstash Redis** (Marketplace), tạo và **Connect** vào project. Vercel tự thêm biến môi trường `KV_REST_API_URL` và `KV_REST_API_TOKEN`.
3. Vào **Settings, Environment Variables**, thêm `SYNC_PASSWORD` với một chuỗi bí mật do bạn tự đặt (đây là mã đồng bộ).
4. **Redeploy** project để các biến có hiệu lực.
5. Mở web đã deploy, vào **Cài đặt, Đồng bộ dữ liệu lên Vercel**, nhập mã đồng bộ, tick bật và bấm **Lưu và kết nối**.

Lưu ý: toàn bộ dữ liệu được lưu thành một bản ghi, giới hạn khoảng 900KB. Ảnh tải lên trong phần Phân tích chiếm nhiều dung lượng, nên ưu tiên dán URL ảnh. Mã đồng bộ chỉ lưu trong trình duyệt từng thiết bị.
