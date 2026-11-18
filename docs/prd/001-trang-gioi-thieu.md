# PRD-001: Trang Giới thiệu FoxGo

| | |
|---|---|
| Mã | FD-002 (trang Giới thiệu của FoxGo_Manager) |
| Trạng thái | Đã phát hành (v0.4.0) — anh duyệt 17/11/2026 |
| Người duyệt | Anh (Product Owner) |
| Ngày | 2026-11-17 |

> PRD viết bù: trang đã được làm theo từng yêu cầu của anh từ 15/11/2026; tài liệu này gom toàn bộ phạm vi, quyết định
> và tiêu chí nghiệm thu về một chỗ. Hành vi chi tiết từng mục: [`../features/gioi-thieu.md`](../features/gioi-thieu.md).

## 1. Vấn đề
FoxGo là một bộ app cá nhân (Tài chính, Công việc, Tư duy, Sức khỏe, Học tập, Giải trí) nhưng trang chủ chỉ là lưới
link — người lần đầu ghé (hoặc chính anh khi giới thiệu cho người khác) không thấy được FoxGo là gì, các app gắn với
nhau ra sao, app nào đã dùng được, và FoxGo cam kết gì về dữ liệu. Cần một trang giới thiệu chuyên nghiệp, cùng
"gia đình" giao diện với các app, nói đúng sự thật về sản phẩm.

## 2. Mục tiêu & chỉ số thành công
- Người xem hiểu FoxGo trong ~10 giây đầu (Hero) — đo bằng: anh đưa cho 2–3 người xem, họ nói lại được "FoxGo là gì".
- Hiểu được quan hệ giữa các app và lộ trình — mục Hệ sinh thái kể đủ 6 app + 3 giai đoạn lộ trình.
- Trang chủ (trang mở đầu trình duyệt) **không chậm đi**: thư viện hoạt ảnh chỉ nằm trong file JS riêng của trang này.
- Không một câu/nút nào trình bày thứ chưa có như đã có (kiểm tra theo §6).

## 3. Phạm vi
**Trong phạm vi:**
- Trang `#/gioi-thieu` (vào từ nút "Giới thiệu" trên trang chủ), mục con `#/gioi-thieu/<id>` nhảy thẳng tới mục.
- 8 mục: Hero · Hệ sinh thái · Tính năng · Tổng quan · Quy trình · Về FoxGo · Kêu gọi cuối · Chân trang.
- Thanh trên riêng (logo chữ, sáng/tối, "Mở trang chủ"), vạch tiến độ cuộn, màn chờ khi tải.
- Chuyển động kể chuyện bằng thư viện `motion` (anh duyệt 16/11/2026), tôn trọng "giảm chuyển động".
- Sáng/tối, màn 375px → 1440px+.

**Ngoài phạm vi (không làm lần này):**
- Đăng nhập, đăng ký, bảng giá, form liên hệ, trang Chính sách/Điều khoản.
- Số liệu thật của người dùng (chờ FD-008 có PRD) — mọi con số trên trang là số mẫu.
- Liên kết dữ liệu giữa các app (FD-009) — chỉ được nói tới như **lộ trình**.
- Analytics, font/CDN ngoài, ảnh chụp/ảnh stock.
- Đa ngôn ngữ (chỉ tiếng Việt).

## 4. User stories
- Là người lần đầu ghé, tôi muốn đọc một câu là hiểu FoxGo làm gì để quyết định có thử không.
- Là người xem, tôi muốn thấy các app gắn với nhau trong một ngày/tháng thật để hiểu vì sao nên dùng chung một nơi.
- Là người xem, tôi muốn biết rõ app nào đã dùng được, cái nào đang trong lộ trình để không bị hứa suông.
- Là người quan tâm riêng tư, tôi muốn biết dữ liệu của tôi ở đâu và có bị theo dõi không.
- Là anh (chủ dự án), tôi muốn gửi một link duy nhất để giới thiệu FoxGo với người khác.
- Là người dùng bật "giảm chuyển động", tôi vẫn muốn đọc đủ nội dung mà không bị chóng mặt.

## 5. Yêu cầu chi tiết & thiết kế

### 5.1 Nguyên tắc (quyết định của anh)
| Quyết định | Ngày |
|---|---|
| Toàn trang tiếng Việt, xưng "bạn"; giọng thương hiệu chuyên nghiệp | 16–17/11/2026 |
| Nền trắng + nhấn xanh ngọc Fox, cam cáo dùng rất ít; màu chỉ qua token `global.css` | 16/11/2026 |
| **Bám sản phẩm thật:** mỗi tính năng ghi app làm nó; nút chỉ trỏ tới chỗ có thật; giao diện minh họa ghi "số liệu mẫu" | 16/11/2026 |
| Logo chữ "Fox.Go" thay logo hình cáo; **hạn chế hình cáo** (thương hiệu có thể đổi) — sơ đồ, thẻ app, Về FoxGo, kêu gọi cuối chỉ dùng chữ + nét | 16/11/2026 |
| Không hiện nhãn trạng thái chữ ("Đang chạy / Đang xây / Kế hoạch / Sắp ra mắt") ở bất kỳ đâu trong dự án; phân biệt đã có / sắp tới bằng **nét liền / nét đứt** và thì tương lai ("sẽ") | 17/11/2026 |
| Thư viện `motion` chỉ trong `src/features/landing/`, trang nạp lười | 16/11/2026 |
| "Hình" bằng nét kẻ (line-art), không ảnh minh họa chung chung | 17/11/2026 |
| Bỏ Fox.KỹNăng khỏi trang; FoxGo Mind (Tư duy) đứng thứ 3. Tính năng "Mục tiêu & kế hoạch" → "Tư duy & quyết định" (Mind), câu chuyện Hệ sinh thái có chương Mind — v0.7.4 | 18/11/2026 |

### 5.2 Các mục
1. **Hero** — "Một nền tảng. Connect the dots." (đổi 17/11/2026, sau v0.4.0; trước là "Kết nối cuộc sống.") + một đoạn mô tả FoxGo; 2 nút: "Bắt đầu hành trình" → trang chủ,
   "Khám phá FoxGo" → mục Hệ sinh thái. Nền line-art: khung kẻ kiểu bản vẽ (2 đường dọc, 2 đường ngang ôm tiêu đề, dấu +
   ở chỗ giao) + vòng đồng tâm mảnh. Dưới nút: **sơ đồ nhánh** từ một gốc tỏa xuống 6 lĩnh vực (chấm màu + tên lĩnh vực;
   nét liền + xung sáng = app đã có, nét đứt = kế hoạch). Rồi dashboard minh họa "đang chạy" + 3 mô-đun nổi.
2. **Hệ sinh thái** — "Mọi thứ đều liên quan.": sơ đồ ghim theo cuộn, FoxGo ở tâm, 6 app quanh tâm; nan liền = mở từ
   trang chủ (đang có), đường cong nét đứt app ↔ app = sẽ kết nối (lộ trình). Bên cạnh là câu chuyện "một tháng của bạn",
   mỗi app một chương. Đoạn kết: 3 bước lộ trình.
3. **Tính năng** — 6 tính năng, mỗi cái một giao diện minh họa riêng + app làm nó.
4. **Tổng quan** — dashboard tự lắp ghép theo cuộn; ghi rõ tóm tắt số liệu trên trang chủ là giai đoạn 2 lộ trình.
5. **Quy trình** — 4 bước Ghi lại / Sắp xếp / Hành động / Nhìn lại (tab, tự chuyển, dùng được bằng phím).
6. **Về FoxGo** — chữ lớn trôi ngang + đường line chuyển động; 5 cam kết (khớp `../../../docs/TAM_NHIN.md`).
7. **Kêu gọi cuối** — "Vì sao có Fox" (câu chuyện của anh) + hình line "rối → thẳng"; khẩu hiệu tự đổi; nút về trang
   chủ; sơ đồ 4 lợi ích.
8. **Chân trang** — dải mời, 4 cột (giới thiệu + liên hệ công khai anh duyệt 16/11/2026, Sản phẩm, Khám phá, Trạng
   thái), dải "Vận hành trên" (đúng hạ tầng Firebase Hosting, không phải nhà tài trợ), số phiên bản.

### 5.3 Dữ liệu
- **Không lưu gì.** Không khóa localStorage mới. Đọc `src/data/apps.ts` (tên, lĩnh vực, màu, trạng thái) — đổi
  trạng thái app ở đó thì trang tự đổi (nét liền/đứt).
- Nội dung chữ tập trung ở `src/features/landing/content.ts`.
- Không gọi mạng; không dịch vụ ngoài mới.

### 5.4 Kỹ thuật
- Nạp lười (`React.lazy`), `LazyMotion` + `m.*` gói `domAnimation`; chỉ animate `transform`/`opacity`/`pathLength`.
- Màn chờ tới khi font + ảnh tải xong (tối thiểu 0,7 s, tối đa 8 s) để hiệu ứng vào trang không chạy mất.
- "Giảm chuyển động": bỏ dịch chuyển, dừng vòng lặp, không ghim, nhảy thẳng thay vì cuộn mượt.
- Responsive: ≤ 960px cột xếp dọc; ≤ 760px ẩn mô-đun nổi, sơ đồ nhánh Hero thành lưới 3 cột; ≤ 640px lề 16px.
- **Điện thoại cuộn mượt (≤ 760px):** không chạy hiệu ứng nặng với GPU — không dựng mô-đun nổi, không nghiêng 3D,
  không `drop-shadow` trên xung sáng, không kính mờ dải chân trang, đốm mờ nền đứng yên, thanh trên blur 8px.

## 6. Tiêu chí nghiệm thu
- [ ] Mở `#/gioi-thieu` từ nút "Giới thiệu" trên trang chủ → màn chờ → Hero hiện đủ tiêu đề, mô tả, 2 nút, sơ đồ nhánh.
- [ ] "Bắt đầu hành trình" về trang chủ; "Khám phá FoxGo" cuộn tới Hệ sinh thái; vào thẳng `#/gioi-thieu/ff` → đúng mục.
- [ ] Không có chữ "Đang chạy / Đang xây / Kế hoạch / Sắp ra mắt" trên trang (và trang chủ).
- [ ] App chưa có luôn vẽ nét đứt / viết ở thì "sẽ"; không nút/link nào trỏ tới chỗ chưa có.
- [ ] Mọi giao diện minh họa có dòng "số liệu mẫu"; không số liệu cá nhân trong code/bundle.
- [ ] Không hình cáo ở sơ đồ, thẻ app, Về FoxGo, kêu gọi cuối (linh vật chỉ trong giao diện minh họa).
- [ ] Sáng + tối, 375px + 1440px: không tràn ngang, chữ tiếng Việt không bị cắt dấu (ố, ộ, ẩ, ọ).
- [ ] Điện thoại (375px): cuộn hết trang không khựng; không còn đốm nền trôi, mô-đun nổi, nghiêng 3D.
- [ ] Bật "giảm chuyển động" → đủ nội dung, không ghim, không vòng lặp.
- [ ] Trang chủ không tải thư viện `motion` (kiểm tra tab Network: chỉ tải khi vào `#/gioi-thieu`).
- [ ] `npm run check` sạch, `npm run build` thành công.

## 7. Rủi ro & bảo mật
- **Hứa quá sự thật** (trình bày lộ trình như đã có) → quy ước nét đứt + thì tương lai, tiêu chí §6; nội dung lộ trình
  khớp `TAM_NHIN.md`.
- **Lộ dữ liệu cá nhân** — repo GitHub và web đều công khai → chỉ số mẫu; liên hệ chỉ gồm SĐT/email anh đã duyệt công khai.
- **Hiệu năng** — nhiều hoạt ảnh: vòng lặp chỉ chạy khi trong màn, chỉ animate thuộc tính rẻ, trang nạp lười.
- **Thương hiệu đổi** → tên chỉ vẽ ở `Wordmark.tsx`, hạn chế hình cáo.
- Không thêm dịch vụ ngoài → không rủi ro gửi dữ liệu ra ngoài.

## 8. Kế hoạch release
- Đợt chỉnh 17/11/2026 (Hero line-art + sơ đồ nhánh, Hệ sinh thái tối giản, bỏ nhãn trạng thái toàn dự án) →
  **v0.4.0** (minor). Thử trên `npm run dev` (:5170) theo §6 → anh nghiệm thu → gộp `--no-ff` vào master →
  `npm run release -- minor` → `npm run deploy`.
- Hoàn tác: Firebase Console → Hosting → Rollback, hoặc build lại từ tag `fd-v0.3.0`.
