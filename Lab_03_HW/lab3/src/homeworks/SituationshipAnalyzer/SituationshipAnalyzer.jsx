import { useEffect, useId, useReducer, useRef, useState } from "react";
import { waitForReplyTimeout } from "./messageSimulation.js";
import {
  INITIAL_STATE,
  getEffortError,
  situationshipReducer,
} from "./situationshipReducer.js";
import "./SituationshipAnalyzer.css";
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

const ACTOR_LABELS = {
  EM: "Em",
  AI_DO: "Ai Đó",
};

export default function SituationshipAnalyzer() {
  const [state, dispatch] = useReducer(
    situationshipReducer,
    INITIAL_STATE,
  );

  const [actor, setActor] = useState("EM");
  const [steps, setSteps] = useState("100");
  const [weight, setWeight] = useState("0.1");
  const [formError, setFormError] = useState("");
  const [pendingMessage, setPendingMessage] = useState(null);
  const [messageFeedback, setMessageFeedback] = useState(
    "Chưa có tin nhắn đang chờ.",
  );

  const activeRequestIdRef = useRef(null);

  const baseId = useId();
  const titleId = `${baseId}-title`;
  const statusLabelId = `${baseId}-status-label`;
  const descriptionId = `${baseId}-description`;
  const formTitleId = `${baseId}-form-title`;
  const actorId = `${baseId}-actor`;
  const stepsId = `${baseId}-steps`;
  const weightId = `${baseId}-weight`;
  const formHelpId = `${baseId}-form-help`;
  const formErrorId = `${baseId}-form-error`;
  const logTitleId = `${baseId}-log-title`;
  const scoresTitleId = `${baseId}-scores-title`;
  const warningLabelId = `${baseId}-warning-label`;
  const messageTitleId = `${baseId}-message-title`;
  const messageStatusId = `${baseId}-message-status`;

  const { phase, signals } = state;
  const { label, description } = PHASE_DETAILS[phase];

  const canStart = phase === "STRANGERS";
  const canCommit = phase === "DATING_NO_LOVE";
  const canStop = phase !== "SELF_RESPECT_EXIT";

  const { emScore, rivalScore } = signals.reduce(
    (scores, signal) => {
      const contribution = signal.steps * signal.weight;

      return signal.actor === "EM"
        ? { ...scores, emScore: scores.emScore + contribution }
        : { ...scores, rivalScore: scores.rivalScore + contribution };
    },
    { emScore: 0, rivalScore: 0 },
  );

  const isRedFlag =
    phase === "DATING_NO_LOVE" && emScore < rivalScore;

  const redFlagWarning = isRedFlag
    ? "Red Flag: Đang hẹn hò nhưng chưa có cam kết, điểm nỗ lực của Em thấp hơn Ai Đó."
    : "Hiện không có cảnh báo theo điều kiện đang xét.";

  const scoreFormatter = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    if (!pendingMessage || phase !== "DATING_NO_LOVE") {
      return undefined;
    }

    const controller = new AbortController();
    const requestId = pendingMessage.id;
    let active = true;

    waitForReplyTimeout(controller.signal)
      .then(() => {
        if (!active || activeRequestIdRef.current !== requestId) {
          return;
        }

        activeRequestIdRef.current = null;
        setPendingMessage(null);
        setMessageFeedback("Đã hết 5 giây nhưng chưa nhận được phản hồi.");
        dispatch({ type: "MESSAGE_TIMEOUT" });
      })
      .catch((error) => {
        if (
          !active ||
          controller.signal.aborted ||
          activeRequestIdRef.current !== requestId
        ) {
          return;
        }

        activeRequestIdRef.current = null;
        setPendingMessage(null);
        setMessageFeedback(
          error.name === "AbortError"
            ? "Đã hủy chờ phản hồi."
            : "Không thể tiếp tục chờ phản hồi.",
        );
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [pendingMessage, phase]);

  function handlePhaseEvent(type) {
    activeRequestIdRef.current = null;
    setPendingMessage(null);
    setMessageFeedback("Đã kết thúc chờ phản hồi.");
    dispatch({ type });
  }

  function handleSendMessage() {
    if (
      phase !== "DATING_NO_LOVE" ||
      activeRequestIdRef.current !== null
    ) {
      return;
    }

    const id = crypto.randomUUID();

    activeRequestIdRef.current = id;
    setPendingMessage({ id });
    setMessageFeedback("Đã gửi tin nhắn. Đang chờ phản hồi trong 5 giây.");
  }

  function handleReceiveReply() {
    if (activeRequestIdRef.current === null) {
      return;
    }

    activeRequestIdRef.current = null;
    setPendingMessage(null);
    setMessageFeedback("Đã nhận được phản hồi. Đã kết thúc chờ.");
  }

  function handleSwitchToAiDo() {
    if (phase !== "DATING_NO_LOVE") {
      return;
    }

    handlePhaseEvent("SWITCH_TO_AI_DO");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!canStop) {
      return;
    }

    const effort = {
      actor,
      steps: steps.trim() === "" ? NaN : Number(steps),
      weight: weight.trim() === "" ? NaN : Number(weight),
    };

    const error = getEffortError(effort);

    if (error) {
      setFormError(error);
      return;
    }

    dispatch({
      type: "ADD_SIGNAL",
      payload: {
        id: crypto.randomUUID(),
        ...effort,
      },
    });

    setFormError("");
  }

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
          onClick={() => handlePhaseEvent("CONFIRM_COMMITMENT")}
        >
          Xác nhận cam kết từ cả hai
        </button>

        <button
          type="button"
          disabled={!canStop}
          onClick={() => handlePhaseEvent("STOP")}
        >
          Dừng Lại
        </button>
      </fieldset>

      <section aria-labelledby={messageTitleId}>
        <h3 id={messageTitleId}>Tin nhắn và phản hồi</h3>

        <p>Chỉ gửi tin nhắn khi đang ở trạng thái hẹn hò chưa cam kết.</p>

        <fieldset>
          <legend>Mô phỏng tương tác</legend>

          <button
            type="button"
            disabled={phase !== "DATING_NO_LOVE" || pendingMessage !== null}
            onClick={handleSendMessage}
          >
            Gửi tin nhắn
          </button>

          <button
            type="button"
            disabled={phase !== "DATING_NO_LOVE" || pendingMessage === null}
            onClick={handleReceiveReply}
          >
            Mô phỏng nhận phản hồi
          </button>

          <button
            type="button"
            disabled={phase !== "DATING_NO_LOVE"}
            onClick={handleSwitchToAiDo}
          >
            Chuyển sang Ai Đó
          </button>
        </fieldset>

        <p id={messageStatusId}>Trạng thái tin nhắn</p>

        <output
          aria-live="polite"
          aria-atomic="true"
          aria-labelledby={messageStatusId}
        >
          {messageFeedback}
        </output>
      </section>

      <section aria-labelledby={formTitleId}>
        <h3 id={formTitleId}>Ghi nhận nỗ lực</h3>

        <p id={formHelpId}>
          Số lần là số nguyên không âm. Trọng số là số không âm,
          có thể nhập số thập phân.
        </p>

        <form
          aria-labelledby={formTitleId}
          aria-describedby={`${formHelpId} ${formErrorId}`}
          onSubmit={handleSubmit}
          noValidate
        >
          <fieldset disabled={!canStop}>
            <legend>Thông tin nỗ lực</legend>

            <p>
              <label htmlFor={actorId}>Người thực hiện</label>
              <select
                id={actorId}
                name="actor"
                value={actor}
                onChange={(event) => setActor(event.target.value)}
                required
              >
                <option value="EM">Em</option>
                <option value="AI_DO">Ai Đó</option>
              </select>
            </p>

            <p>
              <label htmlFor={stepsId}>Số lần</label>
              <input
                id={stepsId}
                name="steps"
                type="number"
                min="0"
                step="1"
                value={steps}
                onChange={(event) => setSteps(event.target.value)}
                required
              />
            </p>

            <p>
              <label htmlFor={weightId}>Trọng số</label>
              <input
                id={weightId}
                name="weight"
                type="number"
                min="0"
                step="any"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                required
              />
            </p>

            <button type="submit">Thêm nỗ lực</button>
          </fieldset>

          <p id={formErrorId} role="alert" aria-atomic="true">
            {formError}
          </p>
        </form>

        {!canStop && (
          <p>Mối quan hệ đã kết thúc. Không thể thêm nỗ lực mới.</p>
        )}
      </section>

      <section aria-labelledby={scoresTitleId}>
        <h3 id={scoresTitleId}>Điểm nỗ lực</h3>

        <dl>
          <dt>Điểm của Em</dt>
          <dd>{scoreFormatter.format(emScore)}</dd>

          <dt>Điểm của Ai Đó</dt>
          <dd>{scoreFormatter.format(rivalScore)}</dd>
        </dl>

        <p id={warningLabelId}>Đánh giá chênh lệch nỗ lực</p>

        <output
          aria-live="polite"
          aria-atomic="true"
          aria-labelledby={warningLabelId}
        >
          {redFlagWarning}
        </output>
      </section>

      <section aria-labelledby={logTitleId}>
        <h3 id={logTitleId}>Nhật ký nỗ lực</h3>

        <p role="status" aria-live="polite" aria-atomic="true">
          Đã ghi nhận {signals.length} nỗ lực.
        </p>

        {signals.length === 0 ? (
          <p>Chưa có nỗ lực nào được ghi nhận.</p>
        ) : (
          <ol>
            {signals.map((signal) => (
              <li key={signal.id}>
                <dl>
                  <dt>Người thực hiện</dt>
                  <dd>{ACTOR_LABELS[signal.actor]}</dd>

                  <dt>Số lần</dt>
                  <dd>{signal.steps}</dd>

                  <dt>Trọng số</dt>
                  <dd>{signal.weight}</dd>
                </dl>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
