/**
 * Sơ đồ lợi ích dưới nút "Bắt đầu với FoxGo" (mục Kêu gọi cuối) — dạng khối, có trật tự (anh chọn 16/11/2026):
 * từ đáy nút một trục chấm đi xuống, rẽ thành thanh ngang rồi tách 4 nhánh vuông góc (bo góc mềm chỗ rẽ) xuống 4 thẻ
 * lợi ích (BENEFITS). Chấm sáng chạy ngược từ từng lợi ích lên nút (CSS .ld-tree-pulse, tắt khi giảm chuyển động).
 * SVG hệ tọa độ 1000×100 kéo giãn theo bề ngang (`preserveAspectRatio="none"` + `vector-effect` giữ nét đều); 4 cột
 * thẻ chia đều nên tâm cột ở x = 125 / 375 / 625 / 875 khớp đầu nhánh. Màn ≤ 960px: ẩn sơ đồ, thẻ xếp 2 cột.
 * Tài liệu: docs/features/gioi-thieu.md.
 */
import { CheckOutlined } from '@ant-design/icons'
import { BENEFITS } from '../content'
import { Reveal } from '../kit'

/** Tâm cột của 4 thẻ (đơn vị SVG). */
const XS = [125, 375, 625, 875]
/** Thanh ngang ở y = 50; bán kính bo góc chỗ rẽ = 12. */
const BUS = 50
const R = 12

/** Đường của một nhánh, đi từ thẻ lên nút (hướng chạy của chấm sáng). */
const branch = (x: number) => {
  const dir = x < 500 ? 1 : -1
  return `M${x} 100 V${BUS + R} Q${x} ${BUS} ${x + dir * R} ${BUS} H${500 - dir * R} Q500 ${BUS} 500 ${BUS - R} V0`
}

/** Nét chấm tĩnh của cả cây: vẽ từng đoạn không chồng nhau để các chấm thẳng hàng, không lệch nhịp. */
const TREE = [
  `M500 0 V${BUS}`,
  `M${XS[0]} 100 V${BUS + R} Q${XS[0]} ${BUS} ${XS[0] + R} ${BUS} H${XS[3] - R} Q${XS[3]} ${BUS} ${XS[3]} ${BUS + R} V100`,
  `M${XS[1]} ${BUS} V100`,
  `M${XS[2]} ${BUS} V100`,
]

export default function BenefitTree() {
  return (
    <div className="ld-tree">
      <svg className="ld-tree-svg" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden>
        {TREE.map((d) => (
          <path key={d} d={d} className="ld-tree-line" vectorEffect="non-scaling-stroke" />
        ))}
        {XS.map((x, i) => (
          <path
            key={x}
            d={branch(x)}
            pathLength={100}
            className="ld-tree-pulse"
            vectorEffect="non-scaling-stroke"
            style={{ animationDelay: `${-i * 0.7}s` }}
          />
        ))}
      </svg>
      <ul className="ld-tree-nodes">
        {BENEFITS.map((b, i) => (
          <li key={b}>
            <Reveal delay={0.35 + i * 0.08} y={10}>
              <span className="ld-tree-node">
                <i aria-hidden>
                  <CheckOutlined />
                </i>
                {b}
              </span>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  )
}
