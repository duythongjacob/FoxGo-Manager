/**
 * Nội dung chữ của trang Giới thiệu — xem docs/features/gioi-thieu.md.
 * Bám sản phẩm thật (anh duyệt 16/11/2026): mỗi tính năng gắn với app Fox tương ứng + trạng thái thật trong data/apps.ts;
 * không hứa tính năng chưa có, không nút giả. Số liệu trong giao diện minh họa là số MẪU, không phải dữ liệu của ai.
 */

/** id các mục — dùng cho link `#/gioi-thieu/<id>` trên thanh trên và chân trang. */
export const SECTION = {
  connected: 'he-sinh-thai',
  features: 'tinh-nang',
  overview: 'tong-quan',
  workflow: 'quy-trinh',
  experience: 'trai-nghiem',
} as const

/** Mục trên thanh điều hướng của trang Giới thiệu (Layout đọc). */
export const LANDING_NAV: { id: string; label: string }[] = [
  { id: SECTION.connected, label: 'Hệ sinh thái' },
  { id: SECTION.features, label: 'Tính năng' },
  { id: SECTION.experience, label: 'Về FoxGo' },
]

/** Chữ đầu mục Hệ sinh thái — giọng thương hiệu chuyên nghiệp (anh yêu cầu 17/11/2026), vẫn xưng "bạn". */
export const CONNECTED_INTRO = {
  title: 'Mọi thứ đều liên quan.',
  lead: [
    'Công việc, tài chính, sức khỏe và học tập không tồn tại tách biệt — mỗi quyết định ở một lĩnh vực đều tác động đến những lĩnh vực còn lại. Vậy mà phần lớn công cụ hiện nay buộc bạn quản lý chúng ở những nơi riêng rẽ.',
    'FoxGo xây dựng một hệ sinh thái thống nhất: mỗi ứng dụng chuyên sâu cho một lĩnh vực, cùng chung một trang chủ. Bước tiếp theo trong lộ trình là kết nối dữ liệu giữa các ứng dụng — thông tin chỉ cần nhập một lần và được sử dụng ở mọi nơi cần đến.',
  ],
}

/**
 * Câu chuyện mục Hệ sinh thái — MỘT câu chuyện xuyên suốt (một tháng của "bạn", anh yêu cầu 17/11/2026; giọng chuyên nghiệp), mỗi app là
 * một chương theo thứ tự trên sơ đồ (sortApps): `when` = mốc thời gian của chương; `moment` = điều xảy ra, app giúp gì;
 * `link` = app này sẽ nối với app khác ra sao; `with` = mã các app được nhắc trong `link` — sơ đồ vẽ đường cong nối
 * đúng các cặp này (phải khớp hai chiều: A có B thì B có A). `link` là LỘ TRÌNH giai đoạn 3 (../docs/TAM_NHIN.md):
 * không còn nhãn "Sắp tới" nên câu luôn viết ở thì tương lai ("sẽ") + đường nét đứt — không trình bày như đã có.
 * Số liệu trong truyện (3 triệu, 12 giờ…) là số minh họa.
 */
export const APP_STORY: Record<string, { when: string; moment: string; link: string; with: string[] }> = {
  FF: {
    when: 'Ngày 1',
    moment: 'Thiết lập mục tiêu tiết kiệm 3 triệu đồng cho chuyến đi Đà Lạt cuối tháng.',
    link: 'Chi phí học tập, sức khỏe và giải trí sẽ được tự động ghi nhận vào ngân sách, giúp bạn theo dõi tiến độ mục tiêu theo thời gian thực.',
    with: ['FL', 'FE', 'FH'],
  },
  FW: {
    when: 'Ngày 2',
    moment:
      'Ba ưu tiên hàng đầu của ngày được sắp xếp sẵn, giúp bạn tập trung vào những việc tạo ra giá trị lớn nhất.',
    link: 'Lịch tập luyện, lịch học và kế hoạch chuyến đi sẽ được đồng bộ vào lịch làm việc, tránh trùng với các cuộc họp.',
    with: ['FH', 'FL', 'FE'],
  },
  FH: {
    when: 'Ngày 7',
    moment: 'Một tuần duy trì 30 phút vận động mỗi ngày — chuỗi thói quen lành mạnh tiếp tục được ghi nhận.',
    link: 'Lịch tập sẽ được chuyển thành công việc cụ thể; chi phí liên quan được cập nhật vào ngân sách.',
    with: ['FW', 'FF'],
  },
  FL: {
    when: 'Ngày 15',
    moment: 'Mỗi ngày ôn mười thẻ từ vựng, được hệ thống lặp lại ngắt quãng đề xuất đúng thời điểm.',
    link: 'Học phí sẽ được ghi nhận vào ngân sách, thời gian học đưa vào lịch, khóa học hoàn thành được tính vào hồ sơ kỹ năng.',
    with: ['FF', 'FW', 'FS'],
  },
  FE: {
    when: 'Ngày 22',
    moment: 'Lịch trình chuyến đi được hoàn thiện từ danh sách trải nghiệm bạn đã lưu.',
    link: 'Ngân sách chuyến đi sẽ được lấy từ mục tiêu tiết kiệm, ngày khởi hành tự động đưa vào lịch.',
    with: ['FF', 'FW'],
  },
  FS: {
    when: 'Ngày 30',
    moment:
      'Tổng kết tháng: 12 giờ luyện tập tiếng Anh, tăng một cấp độ — và mục tiêu tiết kiệm đã hoàn thành.',
    link: 'Khóa học hoàn thành bên Học tập sẽ được ghi nhận là một cấp độ tiến bộ.',
    with: ['FL'],
  },
}

/** Đoạn kết mục Hệ sinh thái (khép câu chuyện): 3 giai đoạn lộ trình (../docs/TAM_NHIN.md); giai đoạn 1 = hiện tại. */
export const FINALE = {
  title: 'Hướng tới một hệ sinh thái liền mạch',
  story:
    'Dữ liệu được nhập một lần và sử dụng ở mọi nơi cần thiết. Bạn tập trung vào mục tiêu — FoxGo đảm nhận phần còn lại.',
  phases: [
    'Trang chủ hợp nhất, truy cập nhanh mọi ứng dụng',
    'Một tài khoản cho toàn bộ hệ sinh thái',
    'Đồng bộ dữ liệu giữa các ứng dụng',
  ],
}

/** Tên giao diện minh họa của từng tính năng (mocks/FeatureMocks.tsx). */
export type FeatureMockId = 'task' | 'finance' | 'goal' | 'habit' | 'notes' | 'reminder'

export interface Feature {
  /** id trên trang (mã app chữ thường khi tính năng thuộc một app → `#/gioi-thieu/ff` cuộn tới đây) */
  id: string
  title: string
  desc: string
  points: string[]
  /** Mã app trong data/apps.ts — app thật làm tính năng này */
  apps: string[]
  mock: FeatureMockId
}

/** 6 tính năng — 4 hàng lớn xen kẽ chữ/hình, 2 tính năng cuối đứng cạnh nhau. */
export const FEATURES: Feature[] = [
  {
    id: 'fw',
    title: 'Quản lý công việc',
    desc: 'Ghi việc bằng một câu tiếng Việt, chọn 3 việc quan trọng nhất mỗi ngày và theo dõi tiến độ dự án.',
    points: ['Hạn, mức ưu tiên, việc con, checklist', 'Hôm nay & Big 3', 'Dùng được khi mất mạng'],
    apps: ['FW'],
    mock: 'task',
  },
  {
    id: 'ff',
    title: 'Tài chính cá nhân',
    desc: 'Theo dõi thu chi, ngân sách và mục tiêu tiết kiệm — gõ “cà phê 35k” là xong một dòng sổ.',
    points: ['Ngân sách theo danh mục', 'Mục tiêu tiết kiệm, quỹ dự phòng', 'Nhập sao kê Excel'],
    apps: ['FF'],
    mock: 'finance',
  },
  {
    id: 'fs',
    title: 'Mục tiêu & kế hoạch',
    desc: 'Chia mục tiêu lớn thành cấp độ nhỏ, luyện tập có chủ đích và nhìn thấy mình tiến lên từng bậc.',
    points: ['Cây kỹ năng, cấp độ 1–5 kèm bằng chứng', 'Thử thách 30 ngày'],
    apps: ['FS'],
    mock: 'goal',
  },
  {
    id: 'fh',
    title: 'Thói quen',
    desc: 'Ngủ, vận động, nước uống — ghi nhanh mỗi ngày, giữ chuỗi và xem xu hướng theo tuần, tháng.',
    points: ['Chuỗi ngày đạt mục tiêu', 'Biểu đồ xu hướng tuần/tháng'],
    apps: ['FH'],
    mock: 'habit',
  },
  {
    id: 'fl',
    title: 'Ghi chú & kiến thức',
    desc: 'Ghi chú gắn với khóa học, thẻ ôn tập ngắt quãng để nhớ lâu.',
    points: ['Ghi chú Markdown', 'Thẻ ôn tập SM-2'],
    apps: ['FL'],
    mock: 'notes',
  },
  {
    id: 'nhac-nho',
    title: 'Nhắc nhở đúng lúc',
    desc: '“Thứ 6 9h” thành lịch nhắc; lịch khám định kỳ không bị quên.',
    points: ['Hiểu ngày giờ trong câu', 'Nhắc lịch khám định kỳ'],
    apps: ['FW', 'FH'],
    mock: 'reminder',
  },
]

/** 4 bước làm việc (mục "Bớt rối. Thêm rõ."). */
export const STEPS = [
  { key: 'capture', title: 'Ghi lại', desc: 'Mọi thứ quan trọng vào một chỗ, chỉ bằng một câu.' },
  { key: 'organize', title: 'Sắp xếp', desc: 'Tự xếp vào hôm nay, tuần này hay để sau.' },
  { key: 'act', title: 'Hành động', desc: 'Tập trung từng việc một, xong là đánh dấu.' },
  { key: 'review', title: 'Nhìn lại', desc: 'Cuối tuần xem tiến độ, chỉnh nhịp cho tuần sau.' },
] as const

export type StepKey = (typeof STEPS)[number]['key']

/** Cam kết trải nghiệm (rút từ nguyên tắc sản phẩm ../docs/TAM_NHIN.md — đổi một bên thì đổi cả hai). */
export const PROMISES = [
  {
    title: 'Tinh gọn',
    desc: 'Mỗi ứng dụng giải quyết trọn vẹn một nhu cầu. Tính năng chỉ được thêm khi thực sự cần thiết, giữ trải nghiệm luôn rõ ràng và dễ dùng.',
  },
  {
    title: 'Đa nền tảng',
    desc: 'Giao diện tối ưu cho máy tính, máy tính bảng và điện thoại, hỗ trợ chế độ sáng/tối và cài đặt như một ứng dụng (PWA).',
  },
  {
    title: 'Riêng tư',
    desc: 'Dữ liệu được lưu trên thiết bị hoặc tài khoản của chính bạn. Không quảng cáo, không công cụ theo dõi hành vi.',
  },
  {
    title: 'Minh bạch',
    desc: 'Mọi con số đều truy xuất được về dữ liệu gốc; các giá trị ước tính luôn được ghi chú rõ ràng.',
  },
  {
    title: 'Đồng hành',
    desc: 'Nhắc nhở vào thời điểm phù hợp, ghi nhận khi bạn giữ được nhịp và gợi ý bước tiếp theo — không áp đặt.',
  },
]

/**
 * Huy hiệu hạ tầng "Vận hành trên" ở chân trang (anh chọn 16/11/2026). Chỉ ghi điều có thật của bản deploy
 * Firebase Hosting (xem CLAUDE.md): chạy trên Google Cloud, phát qua CDN toàn cầu, HTTPS/TLS tự động.
 * KHÔNG phải nhà tài trợ — không ghi "tài trợ", không đặt logo tổ chức không liên quan. Đổi nơi deploy → sửa ở đây.
 */
export const INFRA_BADGES = [
  { key: 'cloud', name: 'Google Cloud', what: 'Lưu trữ trên Firebase Hosting', color: '#4285f4' },
  { key: 'cdn', name: 'CDN', what: 'Tải nhanh từ máy chủ gần bạn', color: '#f59e0b' },
  { key: 'tls', name: 'HTTPS/TLS', what: 'Kết nối được mã hóa đầu cuối', color: '#16a34a' },
] as const

export type InfraBadgeKey = (typeof INFRA_BADGES)[number]['key']

/**
 * Liên hệ ở chân trang (anh yêu cầu công khai 16/11/2026, thay link GitHub).
 * `phone` dạng quốc tế cho `tel:`, `phoneLabel` để hiển thị.
 */
export const CONTACT = {
  phone: '+84392993371',
  phoneLabel: '0392 993 371',
  email: 'thongruby94@gmail.com',
}

/**
 * Đoạn câu chuyện "Vì sao có Fox" ở phần kêu gọi cuối — lời anh viết 16/11/2026 (giữ nguyên chữ "Fox" theo bản gốc).
 * `key` = câu chốt in lớn (các đoạn 01–03 + câu kết đã bỏ theo anh 16/11/2026).
 */
export const MANIFESTO = {
  intro:
    'Mỗi ngày có quá nhiều việc phải nhớ, quá nhiều thứ cần quản lý. Công việc, tiền bạc, sức khỏe và những mục tiêu cá nhân đôi khi khiến chúng ta chẳng biết nên bắt đầu từ đâu.',
  key: ['Fox giúp bạn sắp xếp', 'mọi thứ vào đúng vị trí.'],
}

/** Khẩu hiệu đổi lần lượt dưới tiêu đề kêu gọi cuối (lời anh viết 16/11/2026 + "giảm stress"). */
export const TAGLINES = [
  'Gom mọi điều quan trọng về một nơi.',
  'Sắp xếp cuộc sống theo cách của bạn.',
  'Ít rối hơn, chủ động hơn, sống trọn vẹn hơn.',
  'Bớt áp lực, giảm stress mỗi ngày.',
  'Một nơi cho mọi kế hoạch của bạn.',
  'Làm chủ công việc, tài chính và cuộc sống.',
]

/** Lợi ích ngắn dưới nút kêu gọi cuối. */
export const BENEFITS = [
  'Giảm stress, bớt quá tải',
  'Không bỏ sót việc quan trọng',
  'Rõ tiền đi đâu mỗi tháng',
  'Tiến gần mục tiêu mỗi ngày',
]
