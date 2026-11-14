# FoxdotsManager

Trang tổng hợp các app Fox — ghim làm trang chủ trình duyệt.

```bash
npm install
npm run dev      # http://localhost:5170
```
Hoặc bấm đúp `../start_manager.bat`.

**Ghim làm trang chủ** (Chrome/Edge): Cài đặt → *Khi khởi động* → *Mở một trang cụ thể* → `http://localhost:5170`;
và *Giao diện* → *Hiện nút Trang chủ* → cùng địa chỉ. Trang chỉ mở được khi `start_manager.bat` đang chạy —
bản luôn mở được sẽ có ở FD-004 (Firebase Hosting).

Thêm app: sửa `src/data/apps.ts` (và `../docs/MA_APP.md`).
