# Luồng code — FoxGo Manager

Đọc file này để hiểu **code chạy theo thứ tự nào, dữ liệu đi đâu, và một thay đổi đi từ ý tưởng tới web thế nào**.
Bản đồ thư mục: [CAU_TRUC_THU_MUC.md](CAU_TRUC_THU_MUC.md) · Từng tính năng: [features/](features/README.md) ·
Việc bảo trì: [BAO_TRI.md](BAO_TRI.md).

## 1. Kiến trúc theo lớp

```text
 ┌──────────────────────────── trình duyệt ────────────────────────────┐
 │ index.html  script đặt data-theme (sáng/tối) TRƯỚC khi vẽ → không nháy │
 │     │                                                                │
 │ src/main.tsx  font + global.css → <Root/>                            │
 │     │                                                                │
 │ src/app/      Root ── theme AntD, nghe hệ thống đổi sáng/tối         │
 │               │  └─ useRoute() ── đọc location.hash                  │
 │               Layout ── nền + thanh trên/chân trang (trang Giới thiệu)│
 │     │                                                                │
 │ src/features/ launcher/ (#/)            landing/ (#/gioi-thieu)      │
 │               LauncherPage + InfoDock   LandingPage                  │
 │     │              │                         │                       │
 │ src/data/     apps.ts (danh sách app)  external.ts (API + đệm)       │
 │     │                                        │                       │
 │ src/lib/      hàm thuần có test: route, theme, apps, greeting,       │
 │               weather (mã WMO, phân tích API), market (giá, quy đổi) │
 └──────────────────────────────────────────────┼───────────────────────┘
                                                ▼  chỉ GET dữ liệu công khai
                         Open-Meteo · CoinGecko · ExchangeRate-API
```

Quy tắc chiều phụ thuộc (trên gọi dưới, không ngược lại):
`app/` → `features/` → `components/`, `data/` → `lib/`.
`lib/` **không** import React/antd/trình duyệt → test bằng Vitest môi trường node.
Chỉ `data/external.ts` được gọi mạng.

## 2. Luồng khởi động

1. Trình duyệt tải `index.html`. Script đầu file đọc `localStorage['foxdots.theme']` → đặt `data-theme="dark|light"`
   lên `<html>` (tránh nháy màu khi trang chưa có React).
2. `src/main.tsx` nạp font Be Vietnam Pro (từ node_modules) + `styles/global.css` (token màu theo `data-theme`), vẽ `<Root/>`.
3. `app/Root.tsx`:
   - `readMode()` (themeStore) → chế độ đã lưu; `resolveDark(mode, hệ thống tối?)` (lib/theme) → sáng hay tối.
   - `useRoute()` → `parseRoute(location.hash)` (lib/route) → `{ id: 'home' | 'about', anchor? }`.
   - Bọc `ConfigProvider` (locale vi_VN, màu chủ đạo) → `Layout` → trang tương ứng.
4. Trang hiện ra; với trang chủ, `InfoDock` bắt đầu tải thời tiết/giá (mục 4).

## 3. Luồng điều hướng

```text
 bấm link href('about','ff') = "#/gioi-thieu/ff"
   → trình duyệt đổi hash → sự kiện hashchange
   → useRoute: parseRoute → { id: 'about', anchor: 'ff' }
   → Root vẽ LandingPage; Layout đổi key → hiệu ứng vào trang
   → sau 30 ms cuộn tới phần tử id="ff" (không có anchor → cuộn lên đầu)
```
Đường dẫn lạ → trang chủ. Hash route chạy trên mọi hosting tĩnh, không cần cấu hình server.

## 4. Luồng dữ liệu ngoài (thanh thông số)

```text
 InfoDock (mỗi 10 phút, và khi đổi thành phố)
   → data/external.ts  fetchWeather(city) / fetchMarket() / fetchUsdVnd()
       → cached(key, ttl):
           đệm localStorage còn hạn?  ── có ──► trả ngay { value, stale: false }
                │ không
           getJson(url) (hẹn giờ 8 s, không cookie/referrer)
                │ ok → lib/*.parse…() chuẩn hóa → null = sai định dạng
                │       hợp lệ → ghi đệm → { value, stale: false }
                │ lỗi mạng / sai định dạng
           có đệm cũ? ── có ──► { value: bản cũ, stale: true }
                │ không
           ném lỗi → InfoDock hiện "Chưa tải được"
```

| Nguồn | Đệm | Khóa localStorage | Gửi đi |
|---|---|---|---|
| Open-Meteo (thời tiết) | 30 phút | `foxdots.ext.weather:<lat>,<lon>` | tọa độ thành phố chọn từ danh sách |
| CoinGecko (Bitcoin, PAX Gold) | 10 phút; lỗi → thử lại sau 1 phút | `foxdots.ext.market` | không gì ngoài URL cố định |
| ExchangeRate-API (USD/VND) | 6 giờ | `foxdots.ext.usdvnd` | không gì ngoài URL cố định |

Không gửi dữ liệu cá nhân. Nguồn ghi trong tooltip của thanh (bắt buộc theo giấy phép Open-Meteo/ExchangeRate-API).

## 5. Dữ liệu lưu trên máy (localStorage)

| Khóa | Giá trị | Ai đọc/ghi |
|---|---|---|
| `foxdots.theme` | `system` · `light` · `dark` | `lib/theme.ts` (THEME_KEY), `app/themeStore.ts`, script đầu `index.html` |
| `foxdots.dock` | `open` · `collapsed` | `features/launcher/LauncherPage.tsx` |
| `foxdots.city` | tên thành phố trong `VN_CITIES` | `data/external.ts` |
| `foxdots.ext.*` | `{ at, value }` đệm dữ liệu ngoài | `data/external.ts` |

Tên khóa giữ chữ `foxdots` cũ để người dùng không mất cài đặt; đổi tên phải kèm chuyển dữ liệu (FD-012).
Mọi lệnh đọc/ghi bọc `try/catch`: trình duyệt chặn lưu trữ thì vẫn chạy, chỉ không nhớ.

## 6. Luồng phát triển một thay đổi

Theo quy trình chung [`../docs/QUY_TRINH.md`](../../docs/QUY_TRINH.md), áp vào app này:

```text
 1. Ý tưởng      → ../docs/ROADMAP.md (mã FD-xxx)
 2. PRD          → chỉ khi đổi dữ liệu / bảo mật / dịch vụ ngoài / > 1 trang (anh duyệt)
 3. Nhánh        → git switch -c feature/FD-xxx-ten   (repo gốc FoxdotsProject)
 4. Code         → logic thuần vào src/lib/ + test; UI vào src/features/<trang>/
                   ghi chú: đầu file, JSDoc phần export, "vì sao" ở chỗ khó (../docs/QUY_UOC_CODE.md)
 5. Tài liệu     → docs/features/<tinh-nang>.md (mới hoặc sửa) + mục lục; thư mục mới → CAU_TRUC_THU_MUC.md;
                   CHANGELOG.md mục "Chưa phát hành"
 6. Kiểm tra     → npm run check (tsc + eslint + vitest + check:tree) · npm run build
                   xem tay: sáng/tối, 375px, desktop ≥ 1080px (../docs/DEFINITION_OF_DONE.md)
 7. Gộp          → git switch master && git merge --no-ff feature/FD-xxx-ten
 8. Phát hành    → tăng version trong package.json, chốt CHANGELOG
                   npm run build && npx firebase-tools deploy --only hosting --project foxgo-aed1f
 9. GitHub       → tách thư mục Manager, đẩy lên duythongjacob/FoxGo-Manager (lệnh trong CLAUDE.md)
10. Theo dõi     → mở https://foxgo.web.app kiểm tra; lỗi → fix/FD-xxx-…
```
