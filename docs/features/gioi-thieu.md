# Trang Giới thiệu

> Mã: `FD-002` · PRD: [PRD-001](../prd/001-trang-gioi-thieu.md) · Cập nhật: 17/11/2026 · Trạng thái: Đang chạy

## Mục đích
Landing page giới thiệu FoxGo — hệ sinh thái quản lý cuộc sống: các app, cách chúng gắn với nhau, cách dùng hằng ngày
và cam kết trải nghiệm. Phong cách: nền trắng chủ đạo, chữ lớn, nhấn xanh ngọc Fox, giao diện minh họa thay cho ảnh
minh họa chung chung; chuyển động kể chuyện sản phẩm chứ không trang trí.

## Quyết định của anh (16/11/2026)
- **Tiếng Việt** toàn trang (dịch tinh thần brief, xưng "bạn").
- **Trắng + xanh ngọc Fox**: dùng token có sẵn trong `global.css`, không thêm màu xanh dương — vẫn cùng gia đình với các app.
- **Bám sản phẩm thật**: mỗi tính năng ghi app Fox làm nó (thẻ chấm màu + tên app — bỏ nhãn trạng thái, anh chọn 16/11/2026);
  nút chỉ trỏ tới chỗ có thật (trang chủ, app đã có link); không Đăng nhập, không trang Chính sách/Điều khoản/Liên hệ.
  Giao diện minh họa dùng **số liệu mẫu** và có dòng ghi rõ.
- **Thư viện `motion`** (npm, ~45 kB gzip, chỉ nằm trong file JS riêng của trang này).
- **Logo chữ "Fox.Go"** (Fox lớn, chấm cam, Go nhỏ — `<Wordmark go />`) thay logo hình cáo; hạn chế dùng hình cáo
  (`public/icon.svg`) vì thương hiệu có thể đổi — tên thương hiệu chỉ vẽ ở `src/components/Wordmark.tsx`.
  Linh vật từng app vẫn giữ trong giao diện minh họa; **sơ đồ Hệ sinh thái, thẻ app, mục Về FoxGo, kêu gọi cuối dùng chữ,
  không hình cáo** (anh chọn 16/11/2026). Favicon / icon cài app = chữ "F." nền trong suốt, chấm cam `--fox` (#F97316, đổi từ vàng 17/11/2026) (`public/icon.svg`, viết tay — chữ, không phải linh vật; đổi 17/11/2026).

## Cách dùng / hành vi
Đường dẫn `#/gioi-thieu`; mục con `#/gioi-thieu/<id>` nhảy tới mục đó — id mục: `he-sinh-thai`, `tinh-nang`,
`tong-quan`, `quy-trinh`, `trai-nghiem`; tính năng theo mã app: `fw`, `ff`, `fs`, `fh`, `fl`, và `nhac-nho`.

**Thanh trên** (Layout): logo chữ Fox.Go (hiện dần khi vào trang), nút sáng/tối, nút "Mở trang chủ" (viền mảnh,
không icon; rê chuột thì đảo màu). Không menu mục (anh bỏ 16/11/2026) — các mục vẫn có ở chân trang. Trong suốt ở đỉnh trang, cuộn xuống thành kính mờ có viền + bóng rất nhẹ.
Vạch tiến độ cuộn mảnh màu xanh ở mép trên.

1. **Hero** — "Một nền tảng. Connect the dots." (giọng chuyên nghiệp, 17/11/2026): dòng nhỏ → tiêu đề từng dòng → mô tả → 2 nút
   ("Bắt đầu hành trình" → trang chủ, nút hút nhẹ theo chuột; "Khám phá FoxGo" → mục Hệ sinh thái) → **sơ đồ nhánh**
   (một gốc dưới nút, đường cong tỏa xuống 6 lĩnh vực app — chấm màu + tên lĩnh vực, không nhãn trạng thái (anh bỏ 17/11/2026); nét liền + xung
   sáng = app đã có, nét đứt = kế hoạch; màn hẹp chỉ còn lưới 3 cột) → dashboard
   minh họa phóng nhẹ + hiện dần. Dashboard "đang chạy": việc lần lượt được đánh dấu, khoản chi mới hiện ra, số dư
   cập nhật. 3 mô-đun nổi (mục tiêu, chuỗi thói quen, việc) trôi lên xuống. Cuộn: dashboard từ nghiêng 3D về phẳng,
   chữ lùi lên mờ dần, mô-đun nổi trôi theo độ sâu khác nhau.
   Nền: khung kẻ kiểu bản vẽ (2 đường dọc mép nội dung, 2 đường ngang ôm tiêu đề, dấu + ở chỗ giao) + vòng đồng tâm
   mảnh sau tiêu đề — "hình" bằng nét, không hình cáo; không chấm trôi qua chữ (trông như dấu tiếng Việt bị lạc).
   Hai dấu chấm cuối dòng tiêu đề (`HeroDot`) chuyển màu chậm qua cam Fox + màu nhấn các app (14 giây một vòng, hai
   chấm lệch nửa vòng), quầng mờ cùng màu; giảm chuyển động → đứng yên màu cam.
2. **Hệ sinh thái** — "Mọi thứ đều liên quan.": mục ghim (cao 320vh), sơ đồ tối giản (anh yêu cầu 17/11/2026: đơn
   giản, hiện đại, đường cong có logic). FoxGo ở tâm, 6 app chia đều quanh tâm, mỗi app một nhãn viên thuốc (chấm màu +
   tên mảng; chấm đặc = đang dùng, chấm rỗng = đang làm / sắp có). Hai loại đường (không có chú thích — anh bỏ 17/11/2026, phần chữ bên cạnh đã nói rõ):
   - **Nan cong nét liền** lõi → app, cùng xoáy một chiều = "mở từ trang chủ — đang có". Cuộn tới đâu nan vẽ tới app đó,
     nhãn app rõ dần; chấm sáng màu app chạy dọc nan về lõi.
   - **Đường cong nét đứt** app ↔ app (chuyển màu app A → B, nét đứt chảy) = "các app báo cho nhau — sắp tới" (lộ trình
     giai đoạn 3). Chỉ vẽ đúng các cặp trong `APP_STORY[*].with` (khớp hai chiều, khớp câu `link`). Đường chạy vòng trong
     dải giữa lõi và vòng app, đường càng dài càng vòng trong (`linkPath` trong `Connected.tsx`) → xếp lớp, không đâm lõi.
   App đang kể (cuộn tới hoặc rê chuột): nan đậm, nhãn viền màu app; hiện các đường nối của app đó tới app liên quan (nhãn
   viền nét đứt), rê chuột thì app không liên quan lùi lại. Phần chữ bên cạnh kể **một câu chuyện xuyên suốt** (một tháng của "bạn",
   anh yêu cầu 17/11/2026), mỗi app một chương: mốc thời gian · tên app, điều xảy ra, chip các app sẽ nối + câu nối
   viết ở thì tương lai ("sẽ") — không còn nhãn "Sắp tới", nét đứt + chữ "sẽ" giữ việc trình bày đúng là lộ trình. Đoạn kết: mọi đường nối cùng hiện, lõi rực hơn: "Hướng tới một hệ sinh thái
   liền mạch" + 3 bước lộ trình (bước 1 = "Đang có").
   Nội dung: `CONNECTED_INTRO`, `APP_STORY`, `FINALE` trong `content.ts`.
3. **Tính năng** — 4 hàng lớn xen kẽ chữ/giao diện (đổi bên mỗi hàng, giao diện trôi parallax ±40px), 2 tính năng cuối
   đứng cạnh nhau. Mỗi tính năng một giao diện riêng: gõ một câu thành việc (Công việc), biểu đồ + ngân sách + giao
   dịch mới (Tài chính), cây kỹ năng + thử thách 30 ngày (Mục tiêu), lịch nhiệt 12 tuần (Thói quen), thẻ ôn tập lật
   (Ghi chú), thông báo lần lượt trên màn khóa (Nhắc nhở). Số đếm lên khi vào màn.
4. **Tổng quan** — "Nhìn thấy bức tranh lớn.": màn rộng (> 960px) ghim lại (280vh, có đệm trên để đầu mục không sát thanh trên), các mảnh dashboard bay từ chỗ rải
   rác về đúng ô theo cuộn, đường biểu đồ tự vẽ. Ghi rõ: tóm tắt số liệu trên trang chủ là giai đoạn 2 của lộ trình.
5. **Quy trình** — "Bớt rối. Thêm rõ.": 4 tab Ghi lại / Sắp xếp / Hành động / Nhìn lại (bấm hoặc ←/→), tự chuyển
   mỗi 5 giây khi trong màn (vạch thời gian chạy dưới tab), rê chuột/tập trung bàn phím thì dừng. Mỗi bước là một trạng
   thái của cùng việc "Gửi báo cáo".
6. **Về FoxGo** — "Thiết kế quanh cuộc sống của bạn.": tràn hết bề ngang, 3 dòng chữ lớn trôi ngang ngược chiều theo
   cuộn (tên các mảng app · Máy tính / Máy tính bảng / Điện thoại / Sáng / Tối dạng chữ viền · Đơn giản / Riêng tư /
   Có nguồn / Đồng hành màu xanh), ngăn bằng chấm cam; phía sau 4 đường line uốn lượn (gradient xanh → cam) tự vẽ theo
   cuộn + xung sáng chạy dọc; mờ dần hai mép. Thay khung thiết bị (anh chọn 16/11/2026). Rồi 5 cam kết (Đơn giản, Mọi màn hình, Dữ liệu là của bạn, Số liệu có nguồn,
   Một chú cáo đồng hành).
7. **Kêu gọi cuối** — hai phần. (a) "Vì sao có Fox": câu chuyện anh viết (`MANIFESTO` trong `content.ts`) — đoạn mở
   + câu chốt chữ lớn "Fox giúp bạn sắp xếp mọi thứ vào đúng vị trí." (bỏ 3 đoạn 01–03 + câu kết, anh chọn 16/11/2026);
   bên phải hình line chuyển động (`SortLines.tsx`): 5 đường màu app rối đan nhau giữa 16 icon công cụ (lịch, ví, tim…) to nhỏ, nghiêng lệch, vị trí
   rải cố định (`SCATTER`); cuộn tới đâu đường tự vẽ tới đó rồi duỗi
   thẳng thành 5 hàng ngay ngắn trên lưới chấm, cuối mỗi hàng chấm màu + tên mảng app, vẽ xong có xung sáng chạy dọc; icon trôi sang phải và mờ dần khi đường vào hàng. (b) "Làm chủ cuộc sống của bạn." + khẩu hiệu "Fox — …" tự đổi mỗi 3,2 giây
   (`TAGLINES`, gồm "Bớt áp lực, giảm stress mỗi ngày."; chỉ chạy khi trong màn, đứng yên khi giảm chuyển động),
   nút "Bắt đầu với FoxGo" → trang chủ; dưới nút là sơ đồ khối có trật tự (`BenefitTree.tsx`): trục chấm từ đáy nút → thanh
   ngang → 4 nhánh vuông góc (bo góc) xuống 4 thẻ lợi ích (`BENEFITS`: giảm stress, không bỏ sót việc…), chấm sáng
   chạy từ từng lợi ích lên nút; sơ đồ rộng hơn khung nội dung (tối đa 1120px, chừa 24px mỗi mép); màn ≤ 960px bỏ sơ
   đồ, thẻ xếp 2 cột (≤ 480px: 1 cột). Không hình cáo (bỏ cáo vẫy tay 16/11/2026).
8. **Chân trang** — nền lưới chấm (như mặt bàn làm việc) đậm dần xuống đáy + vầng xanh nhạt góc phải. Dải mời
   (logo Fox.Go + "Gom mọi điều quan trọng về một nơi." + nút "Mở trang chủ FoxGo"); 4 cột: giới thiệu ngắn + liên hệ
   (SĐT `tel:`, email `mailto:` — `CONTACT` trong `content.ts`, anh yêu cầu công khai 16/11/2026), Sản phẩm (trang chủ, app đã có link), Khám phá (các mục), Trạng thái (chấm xanh "Đang hoạt động");
   chữ "Fox." rất lớn mờ dần ở đáy (trang trí); dòng cuối
   "© 2026 FoxGo · Thong Duy", dải "Vận hành trên" (3 huy hiệu icon vẽ inline: Google Cloud ·
   CDN toàn cầu · Mã hóa HTTPS/TLS — `INFRA_BADGES` trong `content.ts`, đúng với Firebase Hosting; **không** phải nhà
   tài trợ, không đặt logo tổ chức không liên quan), số phiên bản.

Màn ≤ 960px: các cột xếp dọc, Tổng quan không ghim; ≤ 760px: ẩn mô-đun nổi và thanh bên dashboard, tab Quy trình
thành 4 ô ngang; ≤ 640px: lề 16px.

### Màn chờ (preloader)
- Vào trang Giới thiệu: màn trắng (tối: nền surface) che toàn trang — logo "Fox.Go" + vạch tiến độ + "Đang chuẩn bị… n%"
  (anh yêu cầu 16/11/2026, không hình cáo). Vạch 0–15% lúc tải file JS (Suspense trong Root), 15–100% lúc tải font
  Be Vietnam Pro + ảnh linh vật (`usePreload` trong `hooks.ts`). Xong → mờ dần 0,5 giây.
- Các mục **chỉ dựng sau khi tải xong** — để hiệu ứng vào trang của Hero không chạy mất phía sau màn chờ. Hiện tối thiểu
  0,7 giây (tránh nháy), tối đa 8 giây (mạng chậm/ảnh lỗi vẫn mở trang). Khóa cuộn trong lúc chờ.

### Chuyển động
- Thư viện `motion` qua `LazyMotion` + `m.*` (chỉ gói `domAnimation`) — nhẹ hơn bản đầy đủ. Chỉ animate
  `transform`/`opacity` (riêng đường SVG dùng `pathLength`). Vòng lặp minh họa (`useLoop`) chỉ chạy khi phần tử trong màn.
- **Giảm chuyển động** (hệ điều hành): `MotionConfig reducedMotion="user"` bỏ dịch chuyển, chỉ giữ mờ/hiện; các vòng
  lặp dừng ở trạng thái đẹp nhất; Tổng quan không ghim, Quy trình không tự chuyển; nút không hút theo chuột; link mục
  nhảy thẳng thay vì cuộn mượt.
- **Điện thoại (≤ 760px) — cuộn mượt:** Hero không dựng 3 mô-đun nổi (không chạy vòng lặp trôi) và bỏ nghiêng 3D
  dashboard; xung sáng nét SVG bỏ quầng `drop-shadow`; dải mời chân trang bỏ kính mờ; nền chung (`global.css`) đốm mờ
  đứng yên, thanh trên mờ kính nhẹ hơn (8px).
- Trang **nạp lười** (`React.lazy` trong `Root.tsx`) → `motion` không làm nặng trang chủ (trang mở đầu trình duyệt).
  Vì vậy vào thẳng link có mục thì `LandingPage` tự nhảy tới mục khi dựng xong (nhảy lại ở 300/900 ms vì bố cục còn
  giãn; người dùng tự cuộn thì thôi).

## Quy tắc nghiệp vụ
- Trạng thái app đọc từ `src/data/apps.ts` — đổi trạng thái ở đó thì trang tự đổi.
- 5 cam kết (`PROMISES`), `APP_STORY.link` và `FINALE` (lộ trình) khớp `../docs/TAM_NHIN.md` — đổi một bên thì đổi cả hai.
- Chỉ mô tả chung + số liệu mẫu; không số liệu cá nhân. Không thêm nút/link tới chỗ chưa có.

## Dữ liệu
Không lưu gì. Đọc `src/data/apps.ts` và SVG trong `public/fox/`, `public/fox/bieu-cam/`, `public/icon.svg`.

## Mã nguồn
| File | Vai trò |
|---|---|
| `src/features/landing/LandingPage.tsx` | Ghép 8 mục, `LazyMotion` + `MotionConfig`, vạch tiến độ cuộn, nhảy tới mục khi vào thẳng link |
| `src/features/landing/content.ts` | Nội dung chữ: `SECTION` (id mục), `LANDING_NAV`, `CONNECTED_INTRO`, `APP_STORY`, `FINALE`, `FEATURES`, `STEPS`, `PROMISES`, `CONTACT`, `MANIFESTO`, `TAGLINES`, `BENEFITS` |
| `src/features/landing/kit.tsx` | Component dùng chung: `Reveal`, `Lines`, `SectionHead`, `Magnetic`, `Counter`, `AppChip`, `MockWindow` |
| `src/features/landing/hooks.ts` | `EASE`, `VIEW`, `WIDE`, `appByCode`, `vnd`, `useLoop`, `useMedia` |
| `src/features/landing/sections/*.tsx` | Mỗi mục một file: `Hero`, `Connected`, `Features`, `Overview`, `Workflow`, `Experience`, `FinalCta` (+ `SortLines` — hình line khối "Vì sao có Fox", `BenefitTree` — sơ đồ lợi ích), `Footer` |
| `src/features/landing/mocks/*.tsx` | Giao diện minh họa: `Dashboard`, `FeatureMocks`, `WorkflowPanel` |
| `src/features/landing/landing.css`, `mocks.css` | Bố cục các mục (`.ld-`) và giao diện minh họa (`.mk-`) |
| `src/lib/motion.ts` | `stepOf`, `clamp01` — đổi tiến độ cuộn thành bước (mục Hệ sinh thái) |
| `src/components/Preloader.tsx` | Màn chờ (dùng ở Suspense của Root + LandingPage); CSS `.pl-*` trong `global.css` |
| `src/components/Wordmark.tsx` | Logo chữ — `go` → "Fox.Go" (nơi duy nhất vẽ tên thương hiệu) |
| `src/app/Layout.tsx` | Thanh trên của trang Giới thiệu (logo, sáng/tối, Mở trang chủ, đổi dạng khi cuộn) |

## Kiểm thử
- Tự động: `src/lib/motion.test.ts` (chia bước), `src/lib/route.test.ts` (đường dẫn `#/gioi-thieu`, mục con).
- Tay: cuộn hết trang ở 1440px và 390px (sáng + tối); không tràn ngang; link mục ở chân trang;
  vào thẳng `#/gioi-thieu/ff` → mục Tài chính nằm ngay dưới thanh trên; tab Quy trình bằng chuột và phím ←/→;
  bật "giảm chuyển động" → đủ nội dung, không ghim Tổng quan.

## Giới hạn & việc còn lại
- Màn rộng nhưng thấp (< ~720px) thì mục Tổng quan khi ghim có thể chật.
- Bấm lại đúng link mục đang mở (hash không đổi) thì không cuộn lại.

## Lịch sử
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 15/11/2026 | chưa phát hành | Bản đầu; đổi tên thương hiệu FoxGo |
| 16/11/2026 | chưa phát hành | Làm lại toàn bộ theo brief "Premium Life Management": nền trắng, 8 mục kể chuyện bằng chuyển động (thư viện `motion`), giao diện minh họa số liệu mẫu, thanh trên có mục + nút về trang chủ, chân trang riêng; trang nạp lười. Sau đó: logo chữ "Fox.Go" thay logo hình cáo, mục Hệ sinh thái thêm câu chuyện từng app + 3 giai đoạn lộ trình; logo trong mockup thiết bị thành đường line trừu tượng |
| 16/11/2026 | chưa phát hành | Bỏ hình cáo: sơ đồ Hệ sinh thái thành vòng tròn chữ + xung sáng chạy dọc đường nối; thẻ app chỉ chấm màu + tên (bỏ nhãn trạng thái); mục Về FoxGo thay khung thiết bị bằng chữ trôi + đường line chuyển động; bỏ cáo vẫy tay; thanh trên bỏ menu mục, nút Mở trang chủ viền mảnh không icon; favicon chữ "Fox." |
| 16/11/2026 | chưa phát hành | Kêu gọi cuối thêm câu chuyện "Vì sao có Fox", khẩu hiệu "Fox — …" tự đổi (có giảm stress), hàng lợi ích; chân trang làm lại: nền lưới chấm, dải mời, cột Trạng thái, chữ "Fox." lớn, số phiên bản. Thanh trên bóng nhẹ hơn; tiêu đề chừa đủ chỗ cho dấu tiếng Việt hai tầng (không bị cắt) |
| 16/11/2026 | chưa phát hành | Màn chờ khi vào trang (logo + vạch tiến độ, tải xong font + ảnh mới dựng các mục); sơ đồ Hệ sinh thái làm lại kiểu trục bánh xe (nan về tâm, bỏ vòng quỹ đạo, app đặt lệch kiểu chòm sao, 3 vệ tinh phẳng, trạng thái app, rê chuột); chân trang bỏ khối đếm app |
| 17/11/2026 | chưa phát hành | Mục Hệ sinh thái làm lại tối giản: app chia đều, nhãn viên thuốc, nan cong nét liền (đang có) + đường cong nét đứt nối các app theo `APP_STORY.with` (sắp tới); bỏ vệ tinh icon + vòng màu xoay; viết lại chữ cho đời thường (`CONNECTED_INTRO`, đoạn kết); câu chuyện các app thành một tháng liền mạch (`APP_STORY.when`), bỏ nhãn "Sắp tới" + chú thích sơ đồ; chữ toàn mục chuyển sang giọng thương hiệu chuyên nghiệp (mốc "Ngày 1…30"). Hero: tiêu đề + mô tả mới, sơ đồ nhánh bỏ nhãn trạng thái (toàn dự án không còn hiện "Đang chạy / Đang xây / Kế hoạch / Sắp ra mắt") |
