# FoxdotsManager — quy ước khi code (mã FD)

Đọc cùng `../CLAUDE.md` và `../docs/` (quy trình, DoD, design system). File này chỉ nói về code trong `FoxdotsManager/`.

## Mục đích
Trang tổng hợp các app Fox, ghim làm homepage trình duyệt: lời chào + đồng hồ, tìm nhanh, lưới thẻ app (đang chạy / sắp ra mắt).

## Nguyên tắc
- **Chỉ link + mô tả chung.** Không đọc, không hiển thị số liệu cá nhân của app nào (cho tới FD-008 có PRD được duyệt).
  Bundle là công khai khi deploy.
- Không gọi dịch vụ ngoài, không analytics, không tải font/CDN — font Be Vietnam Pro từ node_modules.
- `src/styles/global.css` = **bản token chuẩn** của hệ sinh thái. Đổi token → cập nhật `../docs/DESIGN_SYSTEM.md`.
- Danh sách app: `src/data/apps.ts` (khớp `../docs/MA_APP.md`). Màu nhấn app chỉ dùng qua biến `--app-accent`.

## Kiến trúc
- `src/lib/` hàm thuần + test (`apps.ts` lọc/sắp xếp, `greeting.ts` lời chào/ngày giờ, `theme.ts` sáng/tối).
- `src/app/` Root (ConfigProvider AntD, chế độ sáng/tối), `themeStore.ts` (localStorage, bọc try/catch).
- `src/features/home/` HomePage + AppCard.
- Khóa localStorage `foxdots.theme` dùng ở cả `src/lib/theme.ts` và script đầu `index.html` — đổi thì đổi cả hai.

## Lệnh
```bash
npm run dev        # http://localhost:5170
npm run check      # tsc + eslint + vitest — phải sạch
npm run build
```
Windows: chạy từ đường dẫn `C:\…` chữ hoa (Vitest lỗi với `c:\`).

## Code style
Như `../docs/QUY_UOC_CODE.md`: TS strict, alias `@/`, Prettier (không chấm phẩy, nháy đơn, 110 cột), giao diện xưng "bạn",
không emoji làm icon, nút chỉ có icon có `aria-label`, kiểm tra sáng/tối và 375px.
