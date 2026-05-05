# PixelCompress - Hướng dẫn chạy Offline trên PC

PixelCompress là công cụ nén ảnh chuyên nghiệp sử dụng thuật toán Huffman. Bạn có thể chạy ứng dụng này hoàn toàn offline trên máy tính cá nhân.

## 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18.0 trở lên (Khuyên dùng bản LTS). Tải tại [nodejs.org](https://nodejs.org/).

## 2. Các bước cài đặt

### Cách 1: Sử dụng tệp tự động (Khuyên dùng)
- **Windows**: Nhấp đúp vào tệp `start_windows.bat`.
- **macOS/Linux**: Chạy tệp `start_unix.sh` (Bạn có thể cần cấp quyền chạy: `chmod +x start_unix.sh`).

Các tệp này sẽ tự động kiểm tra Node.js, cài đặt thư viện nếu thiếu và khởi chạy ứng dụng cho bạn.

### Cách 2: Cài đặt thủ công
1. Mở terminal tại thư mục dự án.
2. Chạy `npm install` để cài đặt thư viện.
3. Chạy `npm run dev` để khởi động.
Ứng dụng sẽ khởi chạy tại địa chỉ mặc định là `http://localhost:3000`. Bạn có thể mở trình duyệt và truy cập vào địa chỉ này.

## 3. Cách chạy ổn định nhất (Build Production)
Nếu bạn muốn ứng dụng chạy nhanh và ổn định hơn, hãy biên dịch nó:

1. Biên dịch:
   ```bash
   npm run build
   ```
2. Chạy bản đã biên dịch:
   ```bash
   npm run preview
   ```

## 4. Sử dụng Offline hoàn toàn
Sau khi đã thực hiện `npm install` thành công một lần, bạn không cần kết nối internet nữa. Bạn chỉ cần mở terminal và chạy `npm run dev` mỗi khi muốn sử dụng.

---
**Tác giả:** [Đào Văn Phương - 198 - 2000](https://beacons.ai/phuong_desginer)
**Bảo mật:** Hệ thống bảo mật 3 lớp (v5.0 Ready)
**Công nghệ:** React, Vite, Tailwind CSS, Huffman Coding.
