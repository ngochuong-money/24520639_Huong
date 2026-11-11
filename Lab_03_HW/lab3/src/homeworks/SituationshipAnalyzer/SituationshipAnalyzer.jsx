import { useId, useReducer } from "react";
import {
  INITIAL_STATE,
  situationshipReducer,
} from "./situationshipReducer.js";

const PHASE_DETAILS = {
  STRANGERS: {
    label: "Chưa bắt đầu",
    description: "Hai người chưa bắt đầu hẹn hò.",
  },
  DATING_NO_LOVE: {
    label: "Hẹn hò nhưng không yêu",
    description: "Đang hẹn hò nhưng chưa có cam kết từ cả hai.",
  },
  COMMITTED: {
    label: "Đã cam kết",
    description: "Cả hai đã xác nhận mong muốn gắn bó.",
  },
  SELF_RESPECT_EXIT: {
    label: "Đã dừng lại",
    description: "Bạn đã kết thúc mối quan hệ để tôn trọng bản thân.",
  },
};

export default function SituationshipAnalyzer() {
  const [state, dispatch] = useReducer(
    situationshipReducer,
    INITIAL_STATE,
  );
  const titleId = useId();
  const statusLabelId = useId();
  const descriptionId = useId();

  const { phase } = state;
  const { label, description } = PHASE_DETAILS[phase];

  const canStart = phase === "STRANGERS";
  const canCommit = phase === "DATING_NO_LOVE";
  const canStop = phase !== "SELF_RESPECT_EXIT";

  return (
    <section
      className="situationship-analyzer"
      aria-labelledby={titleId}
      lang="vi"
    >
      <header>
        <h2 id={titleId}>Hẹn Hò Nhưng Không Yêu</h2>
        <p>
          Theo dõi mối quan hệ bằng các trạng thái và chuyển tiếp rõ ràng.
        </p>
      </header>

      <dl>
        <dt id={statusLabelId}>Trạng thái hiện tại</dt>
        <dd>
          <output
            aria-live="polite"
            aria-atomic="true"
            aria-labelledby={statusLabelId}
          >
            {label}
          </output>
        </dd>

        <dt>Mã trạng thái</dt>
        <dd>
          <code>{phase}</code>
        </dd>
      </dl>

      <p id={descriptionId}>{description}</p>

      <fieldset aria-describedby={descriptionId}>
        <legend>Điều khiển mối quan hệ</legend>

        <button
          type="button"
          disabled={!canStart}
          onClick={() => dispatch({ type: "START_DATING" })}
        >
          Bắt đầu hẹn hò
        </button>

        <button
          type="button"
          disabled={!canCommit}
          onClick={() => dispatch({ type: "CONFIRM_COMMITMENT" })}
        >
          Xác nhận cam kết từ cả hai
        </button>

        <button
          type="button"
          disabled={!canStop}
          onClick={() => dispatch({ type: "STOP" })}
        >
          Dừng Lại
        </button>
      </fieldset>
    </section>
  );
}
