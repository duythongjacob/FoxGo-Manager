# Bảo trì — FoxGo Manager

Các việc hay gặp, làm theo từng bước. Xong việc nào cũng chạy `npm run check` + `npm run build`
và ghi `CHANGELOG.md`. Luồng tổng thể: [LUONG_CODE.md](LUONG_CODE.md).

## Thêm / sửa một app trong danh sách
1. `src/data/apps.ts`: thêm 1 mục `FoxApp` (mã 2 chữ, tên `Fox.<Tên>`, `status`, `accent`, `url` nếu đã chạy).
   Chỉ mô tả chung — **không** số liệu cá nhân (bundle công khai).
2. Linh vật: thêm phụ kiện trong `../Fox.Files/tools/gen_fox.py` → sinh lại → chép `fox-<app>.svg`
   và `fox-<app>-toan-than.svg` sang `public/fox/`.
3. `../docs/MA_APP.md`: thêm dòng (mã, thư mục, cổng, web, trạng thái).
4. App chuyển từ "kế hoạch" sang "đang chạy": đổi `status: 'live'`, thêm `url`, `version`.
5. Cập nhật `docs/features/danh-sach-app.md` (mục Lịch sử).

## Thêm một trang mới
1. `src/lib/route.ts`: thêm id vào `RouteId` + 1 dòng `ROUTES` (path tiếng Việt không dấu) + test trong `route.test.ts`.
2. `src/features/<ten>/<Ten>Page.tsx` + `<ten>.css` (tiền tố class riêng, màu qua biến CSS).
3. `src/app/Root.tsx`: thêm nhánh chọn trang.
4. Thư mục mới → `docs/CAU_TRUC_THU_MUC.md` (cây + bảng). Tài liệu `docs/features/<ten>.md` + mục lục.

## Thêm thành phố thời tiết
`src/lib/weather.ts` → `VN_CITIES`: `{ name, lat, lon }`, tọa độ làm tròn 2 chữ số (~1 km).
Không thêm dịch vụ tìm địa danh (cần anh duyệt dịch vụ ngoài mới).

## Dịch vụ ngoài trục trặc
| Dấu hiệu | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Giá vàng/Bitcoin "Chưa tải được" lúc có lúc không | CoinGecko miễn phí trả 429 (gọi quá nhiều) | Bình thường — app tự thử lại sau 1 phút, đệm 10 phút. Không giảm thời gian đệm |
| Một ô luôn "Chưa tải được" | API đổi định dạng → hàm `parse…` trả `null` | Mở URL trong `data/external.ts` trên trình duyệt, so với `lib/weather.ts` / `lib/market.ts`, sửa hàm parse **và thêm test** với mẫu phản hồi mới |
| Số liệu cũ không đổi | Đang dùng đệm (`stale`) do mất mạng | Kiểm tra mạng; xóa khóa `foxdots.ext.*` trong DevTools → Application → Local Storage để ép tải lại |
| Dịch vụ ngừng hẳn / đổi điều khoản | — | Tìm nguồn thay thế → **hỏi anh duyệt** → sửa `external.ts`, CLAUDE.md, tooltip nguồn |

## Đổi màu / token giao diện
`src/styles/global.css` là **bản token chuẩn** của cả hệ sinh thái. Đổi token → cập nhật `../docs/DESIGN_SYSTEM.md`,
kiểm tra sáng/tối. Màu chủ đạo cũng khai báo trong `src/app/Root.tsx` (AntD cần mã màu thật) — đổi cả hai.

## Đổi khóa localStorage
Khóa `foxdots.theme` nằm ở **hai nơi**: `src/lib/theme.ts` và script đầu `index.html`. Đổi tên khóa nào cũng phải
đọc khóa cũ một lần rồi ghi sang khóa mới, nếu không người dùng mất cài đặt. Bảng khóa: LUONG_CODE.md mục 5.

## Nâng cấp thư viện
1. `npm outdated` → nâng từng nhóm (React/AntD riêng, công cụ build riêng), không nâng major hàng loạt.
2. `npm run check` + `npm run build` + xem tay trang chủ và Giới thiệu (sáng/tối, 375px).
3. Ghi CHANGELOG mục "Đổi".

## Deploy & GitHub
Quy trình đầy đủ + kiểm tra sau phát hành + hoàn tác: [QUY_TRINH.md](QUY_TRINH.md) mục 5.
```bash
npm run release -- patch   # (hoặc minor) fuel:update + check + build → tăng version, chốt CHANGELOG, tag fd-vX.Y.Z
npm run deploy             # chốt chặn (master, cây sạch, có tag) → build → Hosting https://foxgo.web.app
```
Đẩy GitHub (repo công khai `duythongjacob/FoxGo-Manager`): xem CLAUDE.md → *Lệnh*. Chỉ thư mục này được đẩy.
Site mặc định `foxgo-aed1f.web.app` để trống — không deploy lên đó.

## Sự cố thường gặp khi chạy trên máy
| Lỗi | Cách xử lý |
|---|---|
| Vitest báo không tìm thấy file / lỗi đường dẫn | Chạy từ đường dẫn `C:\…` chữ hoa (Windows), không phải `c:\…` |
| `check:tree` báo thiếu ghi chú | Vừa tạo thư mục mới → thêm dòng vào `docs/CAU_TRUC_THU_MUC.md` (cây + bảng) |
| Cổng 5170 bị chiếm | Đã có cửa sổ `start_manager.bat` đang chạy — dùng luôn hoặc đóng nó |
| Trang trắng sau deploy | Mở DevTools → Console; thường do build cũ trong cache → tải lại cứng (Ctrl+F5) |
