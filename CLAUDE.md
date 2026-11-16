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
  **Giá xăng Petrolimex (anh yêu cầu 15/11/2026, giống Fox.TàiChính FF-075):** trình duyệt không gọi — `npm run fuel:update`
  (GET `giaxanghomnay.com` từ máy) → `src/data/fuel.json` đóng gói; chạy trước mỗi lần deploy.
  Không gửi dữ liệu cá nhân, có đệm localStorage (`foxdots.ext.*`), ghi nguồn (tooltip của thanh thông số — bắt buộc theo giấy phép Open-Meteo/ExchangeRate-API). Thêm dịch vụ khác → hỏi anh.
- **Firebase project `foxgo-aed1f`** (anh tạo 15/11/2026): chỉ dùng **Hosting** (FD-004, site `foxgo` → https://foxgo.web.app; deploy: `npm run build` rồi `npx firebase-tools deploy --only hosting`) — trang tĩnh, không cần SDK `firebase`
  trong bundle (deploy qua `npm run deploy`, có chốt chặn). Không `getAnalytics`, không Firestore/Auth cho tới FD-007 có PRD.
- `src/styles/global.css` = **bản token chuẩn** của hệ sinh thái. Đổi token → cập nhật `../docs/DESIGN_SYSTEM.md`.
- Danh sách app: `src/data/apps.ts` (khớp `../docs/MA_APP.md`). Màu nhấn app chỉ dùng qua biến `--app-accent`.

## Kiến trúc & tài liệu
Đọc trước khi sửa: `docs/LUONG_CODE.md` (kiến trúc, luồng), `docs/CAU_TRUC_THU_MUC.md` (bản đồ thư mục),
`docs/BAO_TRI.md` (việc bảo trì), `docs/QUY_TRINH.md` (quy trình code, release), `docs/features/` (từng tính năng). Tóm tắt:
- `src/lib/` hàm thuần + test (không import React/antd); `src/data/` danh sách app + **mọi lệnh gọi mạng** (`external.ts`);
  `src/app/` Root, Layout, điều hướng, theme; `src/features/<trang>/` mỗi trang một thư mục; `src/components/` dùng chung ≥ 2 nơi.
- Chiều phụ thuộc: `app/` → `features/` → `components/`, `data/` → `lib/` (không ngược lại).
- Linh vật trong `public/fox/` chép từ `../Fox.Files/svg/` (sinh bằng `gen_fox.py`, không vẽ tay).
- Khóa localStorage (giữ tên `foxdots.*` cũ — FD-012): `foxdots.theme` (ở **cả** `src/lib/theme.ts` và script `index.html`),
  `foxdots.city`, `foxdots.ext.*`, `foxdots.prefs` (thiết lập trang chủ — FD-005).

## Tài liệu tính năng & ghi chú (bắt buộc)
- Mỗi tính năng một file `docs/features/<ten>.md` (mẫu `../docs/templates/FEATURE.md`) + mục lục `docs/features/README.md`.
  Viết cùng commit với code; đổi hành vi → sửa file. Repo GitHub công khai → không ghi dữ liệu cá nhân.
- Thêm/đổi/xóa thư mục → `docs/CAU_TRUC_THU_MUC.md` (cây + bảng) cùng commit; `npm run check:tree` kiểm tra.
- Ghi chú code theo `../docs/QUY_UOC_CODE.md#ghi-chú-trong-code`: đầu file (làm gì + link tài liệu tính năng),
  JSDoc phần export, *vì sao* ở chỗ khó, hằng số có đơn vị/nguồn.

## Lệnh
```bash
npm run dev        # http://localhost:5170
npm run check      # tsc + eslint + vitest + check:tree — phải sạch
npm run build
npm run release -- <patch|minor|major>   # trên master, cây sạch → tăng version, chốt CHANGELOG, tag fd-vX.Y.Z
npm run deploy     # chốt chặn (master + tag) → build → Firebase Hosting
```
**Quy trình code** (như Fox.TàiChính): `docs/QUY_TRINH.md` — nhánh `feature/FD-xxx-…` → DoD → gộp `--no-ff` → release → deploy.
GitHub (công khai, anh duyệt 15/11/2026): https://github.com/duythongjacob/FoxGo-Manager — chỉ thư mục này, tách từ repo gốc:
`git subtree split --prefix=FoxGo_Manager -b export` (chạy ở `..`) → `git push <url> export:main` → xóa nhánh `export`.
Repo công khai → không commit dữ liệu cá nhân, khóa, `.env`.
Windows: chạy từ đường dẫn `C:\…` chữ hoa (Vitest lỗi với `c:\`).

## Code style
Như `../docs/QUY_UOC_CODE.md`: TS strict, alias `@/`, Prettier (không chấm phẩy, nháy đơn, 110 cột), giao diện xưng "bạn",
không emoji làm icon, nút chỉ có icon có `aria-label`, kiểm tra sáng/tối và 375px.
