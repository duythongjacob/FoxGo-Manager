# Nhật ký thay đổi — FoxGo_Manager

Theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/), phiên bản theo SemVer.

## [Chưa phát hành]

### Đổi (16/11/2026)
- Trang chủ: ô app/link bỏ linh vật và khung kính, chỉ còn tên + mô tả, ngăn cách bằng đường kẻ dọc mảnh mờ dần hai đầu;
  rê chuột hiện gạch chân màu nhấn của app.
- Cài đặt → Ô trên trang chủ: bỏ icon và nhãn trạng thái (Đang chạy/Kế hoạch…). Thêm link riêng có trường **Mô tả**
  (không bắt buộc, tối đa 32 ký tự) — hiện dưới tên ô thay cho tên miền.
- Thanh thông số khi mở rộng: bóng đổ gọn hơn, lớp phủ nền (màn hẹp) nhạt hơn.

## [0.2.0] — 2026-11-16

### Đổi (16/11/2026)
- Trang Giới thiệu làm lại toàn bộ: nền trắng, chữ lớn, nhấn xanh ngọc Fox; 8 mục kể chuyện bằng chuyển động
  (thư viện `motion`) — hero có dashboard minh họa "đang chạy", sơ đồ hệ sinh thái nối dần theo cuộn, 6 tính năng mỗi
  cái một giao diện riêng, dashboard tự lắp ghép, quy trình 4 bước dạng tab tự chuyển, chữ trôi + đường line chuyển động,
  chân trang riêng. Mỗi tính năng ghi app thật + trạng thái thật; số liệu minh họa là số mẫu. Tôn trọng "giảm chuyển động".
- Logo chữ "Fox.Go" (Fox lớn, chấm cam, Go nhỏ) thay logo hình cáo trên trang Giới thiệu — tên thương hiệu chỉ vẽ ở
  `Wordmark` để sau này đổi dễ. Mục Hệ sinh thái kể câu chuyện từng app (khoảnh khắc đời thường + kết nối theo lộ trình).
- Thanh trên trang Giới thiệu: kính sáng, logo + sáng/tối + nút "Mở trang chủ" (viền mảnh, không icon, rê chuột đảo màu);
  không menu mục.
- Trang Giới thiệu bỏ hình cáo: sơ đồ Hệ sinh thái là vòng tròn chữ, đường nối có xung sáng chạy dọc; thẻ app chỉ chấm
  màu + tên (bỏ "Đang xây"/"Sắp có"); mục Về FoxGo thay 3 khung thiết bị bằng chữ lớn trôi ngang + đường line chuyển động;
  bỏ cáo vẫy tay ở phần kêu gọi cuối.
- Kêu gọi cuối trang Giới thiệu: thêm câu chuyện "Vì sao có Fox", khẩu hiệu "Fox — …" tự đổi lần lượt (gồm "Bớt áp lực,
  giảm stress mỗi ngày."), hàng lợi ích. Chân trang làm lại chuyên nghiệp hơn: nền lưới chấm, dải mời về trang chủ,
  cột Trạng thái (số app đang chạy / đang xây / kế hoạch), chữ "Fox." lớn mờ dần, số phiên bản.
- Mục Hệ sinh thái đổi tiêu đề thành "Kết nối.", mô tả viết lại thành 3 đoạn (chữ nhỏ hơn để vừa khung ghim).
  Hình "rối → thẳng" khối Vì sao có Fox thêm icon công cụ to nhỏ rải lộn xộn, mờ dần khi các đường vào hàng.
- Thanh trên trang Giới thiệu khi cuộn: bóng nhẹ hơn (trước hơi đậm, tạo dải tối). Tiêu đề hiện từng dòng không còn
  cắt dấu tiếng Việt hai tầng (ố, ộ, ẩ).
- Favicon / icon cài app: chữ "Fox." trắng, chấm cam trên nền xanh đậm (thay mặt cáo).
- Trang Giới thiệu nạp lười (file JS riêng) — trang chủ không phải tải thư viện hoạt ảnh.
- Trang chủ theo giao diện sáng/tối: **tối** giữ nền xanh đậm kiểu màn khóa; **sáng** nền trắng sạch + lưới ô vuông
  xanh nhạt, vầng màu rất nhạt, ô app thành thẻ trắng viền mảnh. Chọn chế độ trong Cài đặt → Giao diện.
- Popup Cài đặt làm lại: tiêu đề có icon, nội dung chia nhóm có nhãn (Giao diện / Khi mở ứng dụng / Ô trên trang chủ /
  Thêm link riêng), nhãn trạng thái từng ô, danh sách không cuộn riêng, nút "Lưu thay đổi" chỉ bật khi có thay đổi.
  Khi tối, popup AntD nền xanh đậm thay vì xám.
### Thêm (16/11/2026)
- Quy trình code như Fox.TàiChính: `npm run release -- <patch|minor|major>` (tag `fd-vX.Y.Z`), `npm run deploy` có
  chốt chặn (`scripts/guard-deploy.mjs`), tài liệu `docs/QUY_TRINH.md`.
### Đổi (15/11/2026)
- Logo FoxGo mới (favicon / icon cài app): mặt cáo tròn + đuôi cuộn chóp trắng trên nền tối — sinh bằng
  `Fox.Files/tools/gen_fox.py` (`svg/logo/foxgo-icon.svg`).
- Ô Fox.CôngViệc trỏ bản web https://foxgo-work.web.app (trước đó: link tạm bản trên máy, cổng 5175).
- `chay_local.bat`: nhấp đúp chạy trên máy (dev :5170 hoặc build + preview :4170).
- Thanh thông số luôn thu nhỏ khi mở trang (không nhớ lựa chọn mở nữa).
### Thêm
- Nút **Cài đặt** trên thanh thông số → popup: mở app/link trong tab mới, sắp xếp thứ tự ô, thêm/xóa link riêng
  (hiện thành ô trên trang chủ). Lưu trên máy (`foxdots.prefs`).
- Thanh thông số: dòng **Xăng RON95** (giá bán lẻ Petrolimex vùng 1, kỳ điều hành) — snapshot `src/data/fuel.json`
  tạo bằng `npm run fuel:update`, trình duyệt không gọi thêm dịch vụ nào.
- Trang chủ (`#/`) tối giản theo màn khóa Fox.TàiChính: nền lưới chấm + vầng sáng, cáo trong khung kính, ô app dạng kính
  (app kế hoạch: viền đứt, mờ); chân trang "FoxGo 2026 by Thong Duy".
- Thanh thông số dọc bên trái (màn hẹp: ngăn kéo trượt từ trái): giờ + lời chào, thời tiết (chọn thành phố, 3 ngày — Open-Meteo),
  vàng thế giới quy đổi đ/lượng + Bitcoin (CoinGecko), USD/VND (ExchangeRate-API); khung chờ khi tải, đệm,
  dùng bản cũ khi mất mạng, nguồn trong tooltip.
- Thanh thông số mặc định thu hẹp thành dải (giờ + nhiệt độ), mở rộng khi bấm và nhớ trên máy; ô chọn thành phố tối, tìm không dấu.
- Logo chữ "Fox." (chữ đậm khít + chấm cam) ở giữa trang chủ và thanh đầu trang Giới thiệu.
- "Giới thiệu" nằm ở đáy thanh thông số (thu hẹp: chỉ biểu tượng), gạch chia mảnh mờ hai đầu; chân trang "FoxDots® │ Thong Duy".
- Ô app có mô tả ngắn mờ bên dưới tên; rê chuột/Tab vào ô hiện thẻ 3 đầu mục nổi bật (vạch màu nhấn, viền mảnh); điện thoại: lưới 3 cột.
- Tên app tách chữ ("Tài Chính"); khối thời tiết gọn một hàng (nhiệt độ + thành phố); điện thoại: thanh thông số ẩn sau nút menu, mở thành ngăn kéo trượt trái.
- Thu/mở thanh thông số mượt: dựng sẵn một lần, máy tính giãn 64→280px đè lên nội dung (không đẩy bố cục), điện thoại trượt bằng transform; bỏ làm mờ kính trên ngăn kéo.
- Trang chủ không cho bôi đen chữ / kéo hình (như màn khóa); giá thị trường tự thử lại sau 1 phút khi lỗi (CoinGecko hay trả 429).
- Trang Giới thiệu (`#/gioi-thieu`): hero tràn viền (lưới + vầng sáng theo màn đăng nhập Fox.TàiChính) với cáo giữa quỹ đạo
  6 linh vật app, bento hệ sinh thái, 6 nguyên tắc, linh vật Fox (8 biểu cảm), lộ trình dạng bước, băng kêu gọi cuối.
- Định tuyến bằng hash (chạy trên hosting tĩnh); token `--grid-line`, `--h-*`.
### Đổi
- Bỏ ô tìm app, câu nhắc theo giờ và lưới thẻ app cũ (`AppCard`).
- Đổi tên thương hiệu Foxdots → **FoxGo** (FD-012): chân trang, tiêu đề tab, mô tả, manifest PWA, nhãn trợ năng.
- Cấu hình Firebase Hosting, project `foxgo-aed1f` (FD-004).
- Bộ tài liệu bảo trì: README chuẩn, `docs/LUONG_CODE.md` (kiến trúc + luồng), `docs/CAU_TRUC_THU_MUC.md` (cây thư mục,
  `npm run check:tree` tự kiểm tra), `docs/BAO_TRI.md`, `docs/features/` (6 tính năng). Ghi chú đầu file + JSDoc cho toàn bộ code.
- Fox.CôngViệc: trạng thái "Đang xây" v0.1, cập nhật tính năng chính.
- Bỏ hàm không còn dùng `filterApps`, `openable`, `countByStatus` và 2 SVG không dùng (`fox-foxdots`, `fox-vay-duoi`).

## [0.1.0] — 2026-11-14
### Thêm
- FD-002: trang tổng hợp các app Fox — lời chào theo giờ, đồng hồ, ngày tiếng Việt, câu nhắc nhỏ.
- Tìm app không dấu (phím `/` để tìm, Enter mở khi chỉ còn một app), trạng thái rỗng có nút xóa tìm kiếm.
- Lưới thẻ app: "Ứng dụng của bạn" (Fox.TàiChính: web + trên máy + Test) và "Sắp ra mắt" (5 app kế hoạch).
- Linh vật cáo theo từng app (từ Fox.Files) trên thẻ và phần chào.
- Giao diện sáng / tối / theo hệ thống, token màu Fox chuẩn, mobile 375px.
