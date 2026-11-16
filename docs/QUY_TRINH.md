# Quy trình code — FoxGo Manager

Áp quy trình chung [`../../docs/QUY_TRINH.md`](../../docs/QUY_TRINH.md) vào app này, theo đúng cách Fox.TàiChính đang chạy
(ý tưởng → PRD → nhánh → QA → release có tag → deploy có chốt chặn). Luồng code chi tiết: [LUONG_CODE.md](LUONG_CODE.md) mục 6.

```text
 Ý tưởng ─► PRD ─► Nhánh feature/FD-xxx ─► Code + tài liệu ─► QA (DoD) ─► Gộp master ─► Release (tag) ─► Deploy ─► Theo dõi
 ROADMAP    (nếu cần,   (repo gốc            (cùng commit)     npm run check  --no-ff      npm run release   npm run deploy
 gốc FD     anh duyệt)   FoxdotsProject)                       + xem tay
```

## Vai trò
| Vai trò | Ai | Việc |
|---|---|---|
| Product Owner | Anh | Ý tưởng, duyệt PRD, nghiệm thu, quyết định phát hành |
| Engineer / QA | Claude | PRD nháp, code, test, tài liệu tính năng, CHANGELOG, chạy release + deploy khi anh đồng ý |

## 1. Ý tưởng → ROADMAP
Mọi việc của Manager vào [`../../docs/ROADMAP.md`](../../docs/ROADMAP.md) với mã `FD-xxx` (Now / Next / Later).
Ưu tiên = giá trị × cấp thiết ÷ công sức (thang 1–3).

## 2. PRD — khi nào bắt buộc
Đổi dữ liệu lưu trữ (khóa localStorage mới, đồng bộ cloud), bảo mật, **thêm dịch vụ ngoài**, hoặc > 1 trang giao diện
→ PRD `docs/prd/NNN-ten.md` theo [`../../docs/templates/PRD.md`](../../docs/templates/PRD.md), anh duyệt rồi mới code
(PRD đầu tiên tạo thư mục `docs/prd/` → nhớ thêm vào [CAU_TRUC_THU_MUC.md](CAU_TRUC_THU_MUC.md)).
Sửa giao diện nhỏ / sửa lỗi → chỉ cần CHANGELOG + tài liệu tính năng.

## 3. Nhánh & commit (repo gốc `FoxdotsProject`)
- Nhánh chính: `master` — luôn phát hành được. Mỗi việc một nhánh: `feature/FD-xxx-ten`, `fix/FD-xxx-ten`, `chore/…`.
- Conventional Commits kèm mã: `feat(FD-005): …`, `fix(FD-002): …`, `docs: …`, `chore(release): FD vX.Y.Z`.
- Mỗi commit tính năng gồm **code + tài liệu tính năng + CHANGELOG** (không tách commit tài liệu riêng).
- Gộp: `git switch master && git merge --no-ff feature/FD-xxx-ten` khi đạt DoD.

## 4. QA — Definition of Done
DoD chung [`../../docs/DEFINITION_OF_DONE.md`](../../docs/DEFINITION_OF_DONE.md), cộng thêm riêng cho Manager:
- [ ] `npm run check` sạch (tsc + eslint + vitest + check:tree) và `npm run build` thành công.
- [ ] Xem tay bằng `npm run dev` (http://localhost:5170): **trang chủ ở cả Sáng và Tối** (đổi trong Cài đặt → Giao diện),
      trang Giới thiệu, màn **375px**, màn **≥ 1080px** (thanh thông số thu/mở), popup Cài đặt.
- [ ] Không số liệu cá nhân trong code / bundle — repo GitHub và web đều **công khai**.
- [ ] Không gọi dịch vụ ngoài ngoài danh sách đã duyệt trong `CLAUDE.md` (mọi lệnh gọi mạng chỉ ở `src/data/external.ts`).
- [ ] Màu qua biến CSS (`global.css`, `--lc-*` cho trang chủ), không mã màu cứng trong component.
- [ ] Tài liệu: `docs/features/<ten>.md` + mục lục, CHANGELOG mục *Chưa phát hành*; đổi luồng → `LUONG_CODE.md`;
      việc bảo trì mới → `BAO_TRI.md`; thư mục mới → `CAU_TRUC_THU_MUC.md`.

Manager không có dữ liệu thật (chỉ thiết lập trên trình duyệt) → môi trường Test = `npm run dev` trên máy;
Production = https://foxgo.web.app.

## 5. Release & deploy
SemVer: tính năng mới → `minor`, sửa lỗi / chỉnh giao diện nhỏ → `patch`, đổi khóa lưu trữ không tương thích → `major`.

```bash
npm run release -- minor   # chặn nếu: không ở master/main, FoxGo_Manager còn thay đổi chưa commit, CHANGELOG trống
                           # → fuel:update (lỗi mạng thì giữ bản cũ) → check → build
                           # → tăng version, chốt CHANGELOG "## [x.y.z] — ngày" → commit + tag fd-vX.Y.Z
npm run deploy             # chặn nếu không ở master/main, cây bẩn, HEAD chưa có tag fd-v<version>
                           # → build → firebase deploy --only hosting --project foxgo-aed1f
```
Script: [`scripts/release.mjs`](../scripts/release.mjs), [`scripts/guard-deploy.mjs`](../scripts/guard-deploy.mjs)
(giống `FoxGo_Finance/app/scripts/`). Tag có tiền tố `fd-` vì repo gốc dùng chung cho tài liệu cả hệ sinh thái.

Sau deploy — đẩy GitHub công khai (chỉ thư mục này): lệnh `git subtree split` trong [`../CLAUDE.md`](../CLAUDE.md) → *Lệnh*.

### Kiểm tra sau phát hành (trên https://foxgo.web.app, tab ẩn danh)
- [ ] Trang chủ hiện đủ ô app, thanh thông số tải được giờ / thời tiết / giá.
- [ ] Cài đặt → đổi Sáng/Tối → Lưu → trang đổi màu đúng; tải lại vẫn giữ.
- [ ] Trang Giới thiệu mở được, số phiên bản mới hiển thị đúng.
- [ ] ROADMAP chuyển mục sang *Đã xong*, PRD (nếu có) → *Đã phát hành (vX.Y.Z)*.

### Hoàn tác
Firebase Console → Hosting (site `foxgo`) → Release history → **Rollback**; hoặc `git checkout fd-vX.Y.(Z-1)` →
`npm run build && npx firebase-tools deploy --only hosting --project foxgo-aed1f` (bỏ qua chốt chặn — ghi lý do vào CHANGELOG).

## 6. Theo dõi
Anh dùng 1–3 ngày → phản hồi → lỗi thành `fix/FD-xxx-…` (patch), ý tưởng mới vào ROADMAP.
