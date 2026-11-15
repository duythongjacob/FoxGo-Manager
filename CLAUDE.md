# FoxGo_Manager — quy ước khi code (mã FD)

Đọc cùng `../CLAUDE.md` và `../docs/` (quy trình, DoD, design system). File này chỉ nói về code trong `FoxGo_Manager/`.

## Mục đích
Trang tổng hợp các app Fox, ghim làm homepage trình duyệt. Hai trang (hash route, không thanh tab):
**Trang chủ** `#/` — tối giản kiểu màn khóa Fox.TàiChính: thanh thông số dọc bên trái (giờ, lời chào, thời tiết, vàng/USD/Bitcoin),
giữa là cáo + ô app, chân trang "FoxGo 2026 by Thong Duy";
**Giới thiệu** `#/gioi-thieu` — landing page (vào từ nút "Giới thiệu" góc trên trang chủ).

## Nguyên tắc
- **Chỉ link + mô tả chung.** Không đọc, không hiển thị số liệu cá nhân của app nào (cho tới FD-008 có PRD được duyệt).
  Bundle là công khai khi deploy.
- Không analytics, không tải font/CDN — font Be Vietnam Pro từ node_modules.
- **Dịch vụ ngoài được duyệt (anh duyệt 14/11/2026, giống Fox.TàiChính)** — chỉ trong `src/data/external.ts`:
  Open-Meteo (`api.open-meteo.com`, thời tiết — chỉ gửi tọa độ thành phố chọn từ danh sách), CoinGecko
  (`api.coingecko.com`, Bitcoin + PAX Gold ≈ vàng thế giới), ExchangeRate-API (`open.er-api.com`, USD/VND).
  Không gửi dữ liệu cá nhân, có đệm localStorage (`foxdots.ext.*`), ghi nguồn (tooltip của thanh thông số — bắt buộc theo giấy phép Open-Meteo/ExchangeRate-API). Thêm dịch vụ khác → hỏi anh.
- **Firebase project `foxgo-aed1f`** (anh tạo 15/11/2026): chỉ dùng **Hosting** (FD-004, site `foxgo` → https://foxgo.web.app; deploy: `npm run build` rồi `npx firebase-tools deploy --only hosting`) — trang tĩnh, không cần SDK `firebase`
  trong bundle. Không `getAnalytics`, không Firestore/Auth cho tới FD-007 có PRD.
- `src/styles/global.css` = **bản token chuẩn** của hệ sinh thái. Đổi token → cập nhật `../docs/DESIGN_SYSTEM.md`.
- Danh sách app: `src/data/apps.ts` (khớp `../docs/MA_APP.md`). Màu nhấn app chỉ dùng qua biến `--app-accent`.

## Kiến trúc
- `src/lib/` hàm thuần + test (`apps.ts`, `greeting.ts`, `theme.ts`, `route.ts` hash route, `weather.ts` + `market.ts`
  chép từ Fox.TàiChính — mã WMO, phân tích phản hồi API, quy đổi vàng đ/lượng).
- `src/data/` `apps.ts` danh sách app; `external.ts` gọi dịch vụ ngoài + đệm + thành phố đã chọn (`foxdots.city`).
- `src/app/` Root (ConfigProvider AntD, chọn trang), `Layout.tsx` (nền lưới; thanh trên kính tối chỉ ở Giới thiệu), `useRoute.ts`.
- `src/components/WxIcon.tsx` biểu tượng thời tiết SVG.
- `src/features/launcher/` LauncherPage + InfoDock (thời tiết, giá) + `launcher.css` (gốc `lock.css`);
  `src/features/landing/` LandingPage + `landing.css` (hero gốc `login.css`).
- Linh vật trong `public/fox/` (đầu, toàn thân `*-toan-than.svg`, `bieu-cam/`) chép từ `Fox.Files/svg/`.
- Khóa localStorage khác: `foxdots.dock` (thu nhỏ thanh thông số), `foxdots.city`, `foxdots.ext.*` (đệm dữ liệu ngoài).
- Khóa localStorage `foxdots.theme` dùng ở cả `src/lib/theme.ts` và script đầu `index.html` — đổi thì đổi cả hai.

## Lệnh
```bash
npm run dev        # http://localhost:5170
npm run check      # tsc + eslint + vitest — phải sạch
npm run build
```
GitHub (công khai, anh duyệt 15/11/2026): https://github.com/duythongjacob/FoxGo-Manager — chỉ thư mục này, tách từ repo gốc:
`git subtree split --prefix=FoxGo_Manager -b export` (chạy ở `..`) → `git push <url> export:main` → xóa nhánh `export`.
Repo công khai → không commit dữ liệu cá nhân, khóa, `.env`.
Windows: chạy từ đường dẫn `C:\…` chữ hoa (Vitest lỗi với `c:\`).

## Tài liệu tính năng & ghi chú
- Mỗi tính năng một file `docs/features/<ten>.md` (mẫu `../docs/templates/FEATURE.md`), mục lục `docs/features/README.md`.
  Viết cùng commit với code; đổi hành vi → sửa file. Thư mục này nằm trong repo GitHub công khai → không ghi dữ liệu cá nhân.
- Ghi chú code theo `../docs/QUY_UOC_CODE.md#ghi-chú-trong-code`: đầu file, JSDoc phần export, *vì sao* ở chỗ khó.

## Code style
Như `../docs/QUY_UOC_CODE.md`: TS strict, alias `@/`, Prettier (không chấm phẩy, nháy đơn, 110 cột), giao diện xưng "bạn",
không emoji làm icon, nút chỉ có icon có `aria-label`, kiểm tra sáng/tối và 375px.
