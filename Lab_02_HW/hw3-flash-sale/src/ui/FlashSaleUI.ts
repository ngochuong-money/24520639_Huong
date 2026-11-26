
import { InventoryManager } from '../inventory/InventoryManager';
import { createPurchaseFlow } from '../flash-sale/PurchaseFlow';
import './flashSale.css';

const SALE_DURATION_MS = 15 * 60 * 1000;
const LOCK_DURATION_MS = 30 * 1000;
const INITIAL_STOCK = 3;

const product = {
    id: 'redmi-buds-6-lite-demo',
    name: 'Tai nghe Bluetooth Redmi Buds 6 Lite',
    price: 299000,
    originalPrice: 599000,
};

function formatTime(ms: number): string {
    const seconds = Math.ceil(Math.max(0, ms) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
        remainingSeconds
    ).padStart(2, '0')}`;
}

function money(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
}

function element<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className = '',
    content = ''
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = content;
    return node;
}

export function mountFlashSaleUI(root: HTMLElement): () => void {
    let previousSaleActive = true;
    const inventory = new InventoryManager(
        product.id,
        INITIAL_STOCK
    );

    // Demo sale window starts when this page is mounted.
    const saleEndAt = Date.now() + SALE_DURATION_MS;

    const main = element('main', 'flash-page');
    main.id = 'main-content';

    const header = element('header', 'flash-header');
    const heading = element('h1', '', 'Flash Sale 11.11');
    const subtitle = element(
        'p',
        'muted',
        'Siêu sale Việt Nam — mô phỏng mua hàng giới hạn thời gian'
    );

    header.append(heading, subtitle);

    const layout = element('div', 'flash-layout');
    const productCard = element('article', 'flash-card');

    const productHeading = element(
        'h2',
        'product-title',
        product.name
    );

    const productVisual = element('div', 'product-visual');
    productVisual.setAttribute('aria-hidden', 'true');
    productVisual.textContent = '🎧';

    const pricing = element('div', 'pricing');
    const currentPrice = element(
        'strong',
        'current-price',
        money(product.price)
    );

    const originalPrice = element(
        'del',
        'original-price',
        money(product.originalPrice)
    );

    pricing.append(currentPrice, originalPrice);

    const stockText = element('p', 'stock-text');
    const stockBar = element('progress', 'stock-progress');

    const stockDetails = element('p', 'stock-details');

    stockDetails.id = 'inventory-details';
    stockBar.setAttribute('aria-describedby', stockDetails.id);

    const stockNotice = element('p', 'stock-notice');
    stockNotice.id = 'stock-notice';

    stockBar.max = INITIAL_STOCK;
    stockBar.value = INITIAL_STOCK;
    stockBar.setAttribute('aria-label', 'Số lượng hàng còn lại');

    const salePanel = element('section', 'timer-panel');
    salePanel.setAttribute('aria-labelledby', 'sale-timer-heading');

    const saleHeading = element(
        'h3',
        '',
        'Thời gian flash sale còn lại'
    );
    saleHeading.id = 'sale-timer-heading';

    const saleClock = element('time', 'timer-value', '15:00');
    const saleDescription = element(
        'p',
        'muted',
        'Phiên sale demo kéo dài 15 phút kể từ khi mở trang.'
    );

    salePanel.append(saleHeading, saleClock, saleDescription);

    productCard.append(
        productVisual,
        productHeading,
        pricing,
        stockText,
        stockBar,
        stockDetails,
        stockNotice,
        salePanel
    );

    const purchaseCard = element('section', 'flash-card purchase-card');
    purchaseCard.setAttribute('aria-labelledby', 'purchase-heading');

    const purchaseHeading = element(
        'h2',
        '',
        'Đặt giữ và thanh toán'
    );
    purchaseHeading.id = 'purchase-heading';

    const saleStatus = element('p', 'state-label');
    const reservationStatus = element('p', 'reservation-status');
    const purchaseState = element('p', 'purchase-state');
    purchaseState.id = 'purchase-state';

    const lockHeading = element(
        'h3',
        'lock-heading',
        'Thời gian giữ hàng'
    );
    const lockClock = element('time', 'timer-value', '--:--');
    lockClock.setAttribute(
        'aria-label',
        'Thời gian giữ hàng còn lại'
    );

    const quantityLabel = element(
        'label',
        'field-label',
        'Số lượng sản phẩm'
    );
    quantityLabel.htmlFor = 'flash-quantity';

    const quantityInput = element('input', 'quantity-input');
    quantityInput.id = 'flash-quantity';
    quantityInput.type = 'number';
    quantityInput.min = '1';
    quantityInput.max = String(INITIAL_STOCK);
    quantityInput.step = '1';
    quantityInput.value = '1';
    quantityInput.required = true;
    quantityInput.setAttribute(
        'aria-describedby',
        'purchase-action-hint'
    );

    const controls = element('div', 'purchase-controls');

    function makeButton(
        label: string,
        action: string,
        className: string
    ): HTMLButtonElement {
        const button = element('button', className, label);
        button.type = 'button';
        button.dataset.action = action;
        return button;
    }

    const reserveButton = makeButton(
        'Giữ hàng',
        'reserve',
        'button-primary'
    );

    const cancelButton = makeButton(
        'Hủy giữ hàng',
        'cancel',
        'button-secondary'
    );

    const checkoutButton = makeButton(
        'Thanh toán',
        'checkout',
        'button-success'
    );

    const actionHint = element('p', 'muted');
    actionHint.id = 'purchase-action-hint';

    reserveButton.setAttribute('aria-describedby', actionHint.id);
    cancelButton.setAttribute('aria-describedby', actionHint.id);
    checkoutButton.setAttribute('aria-describedby', actionHint.id);


    controls.append(reserveButton, cancelButton, checkoutButton);

    // Announce important changes, not every countdown tick.
    const feedback = element('p', 'feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.setAttribute('aria-atomic', 'true');

    const error = element('p', 'error-message');
    error.setAttribute('role', 'alert');

    const note = element(
        'p',
        'muted',
        'Dữ liệu giả lập. Không phát sinh giao dịch hay thanh toán thật.'
    );

    purchaseCard.append(
        purchaseHeading,
        saleStatus,
        reservationStatus,
        purchaseState,
        lockHeading,
        lockClock,
        quantityLabel,
        quantityInput,
        controls,
        actionHint,
        feedback,
        error,
        note
    );

    layout.append(productCard, purchaseCard);
    main.append(header, layout);
    root.replaceChildren(main);

    function announce(message: string): void {
        feedback.textContent = message;
    }

    function showError(message: string): void {
        error.textContent = message;
    }

    const flow = createPurchaseFlow(
        inventory,
        'demo-user',
        (snapshot) => {
            render();

            if (snapshot.reservation.status === 'expired') {
                announce(
                    'Giữ hàng đã hết hạn. Sản phẩm đã được trả về kho.'
                );
            }
        }
    );


    function render(): void {
        const state = inventory.getState();
        const snapshot = flow.getSnapshot();

        const saleRemainingMs = Math.max(
            0,
            saleEndAt - Date.now()
        );

        const saleActive = saleRemainingMs > 0;
        if (previousSaleActive && !saleActive) {
            announce(
                'Flash sale đã kết thúc. Không thể tạo thêm lượt giữ hàng.'
            );
        }

        previousSaleActive = saleActive;
        const reservationActive =
            snapshot?.reservation.status === 'reserved';

        const status = snapshot?.reservation.status;

        // 1. Sale countdown
        saleClock.textContent = formatTime(saleRemainingMs);

        // 2. Inventory counters
        stockText.textContent =
            `Còn ${state.availableStock}/${INITIAL_STOCK} sản phẩm có thể đặt`;

        stockDetails.textContent =
            `Đang giữ: ${state.reservedStock} · ` +
            `Đã bán: ${state.soldStock} · ` +
            `Còn lại: ${state.availableStock}`;

        stockBar.value = state.availableStock;
        stockBar.setAttribute(
            'aria-valuetext',
            `${state.availableStock} trên ${INITIAL_STOCK} sản phẩm còn có thể đặt`
        );

        // 3. Sale and stock availability
        const completelySoldOut =
            state.availableStock === 0 &&
            state.reservedStock === 0 &&
            state.soldStock === INITIAL_STOCK;

        const temporarilyUnavailable =
            state.availableStock === 0 &&
            state.reservedStock > 0;

        if (!saleActive) {
            saleStatus.textContent = 'Flash sale đã kết thúc';
            stockNotice.textContent =
                'Chương trình không nhận thêm lượt giữ hàng mới.';
            stockNotice.dataset.state = 'ended';
        } else if (completelySoldOut) {
            saleStatus.textContent = 'Đã bán hết';
            stockNotice.textContent =
                'Tất cả sản phẩm đã được thanh toán.';
            stockNotice.dataset.state = 'sold-out';
        } else if (temporarilyUnavailable) {
            saleStatus.textContent = 'Tạm hết lượt đặt';
            stockNotice.textContent =
                'Toàn bộ hàng còn lại đang được giữ. ' +
                'Sản phẩm có thể được mở lại nếu có lượt hủy hoặc hết hạn.';
            stockNotice.dataset.state = 'reserved';
        } else {
            saleStatus.textContent = 'Flash sale đang diễn ra';
            stockNotice.textContent =
                'Sản phẩm còn hàng và đang nhận lượt đặt giữ.';
            stockNotice.dataset.state = 'available';
        }

        // 4. Reservation state
        switch (status) {
            case 'reserved':
                reservationStatus.textContent = 'Đang giữ hàng';
                purchaseState.textContent =
                    `Đang giữ ${snapshot?.reservation.quantity ?? 0} sản phẩm.`;
                lockClock.textContent = formatTime(
                    snapshot?.remainingMs ?? 0
                );
                break;

            case 'expired':
                reservationStatus.textContent = 'Giữ hàng đã hết hạn';
                purchaseState.textContent =
                    'Sản phẩm đã được trả về kho. Đơn chưa được thanh toán.';
                lockClock.textContent = '00:00';
                break;

            case 'cancelled':
                reservationStatus.textContent = 'Đã hủy giữ hàng';
                purchaseState.textContent =
                    'Lượt giữ hàng đã được hủy thành công.';
                lockClock.textContent = '--:--';
                break;

            case 'checked_out':
                reservationStatus.textContent = 'Thanh toán thành công';
                purchaseState.textContent =
                    'Giao dịch mô phỏng đã hoàn tất. Hàng đã được ghi nhận là đã bán.';
                lockClock.textContent = '--:--';
                break;

            default:
                reservationStatus.textContent = 'Chưa giữ hàng';
                purchaseState.textContent =
                    'Bạn chưa có lượt giữ hàng đang hoạt động.';
                lockClock.textContent = '--:--';
        }

        // 5. Available controls
        const canReserve =
            saleActive &&
            state.availableStock > 0 &&
            !reservationActive;

        reserveButton.disabled = !canReserve;
        cancelButton.disabled = !reservationActive;
        checkoutButton.disabled = !reservationActive;
        quantityInput.disabled = !canReserve;

        quantityInput.max = String(
            Math.max(1, state.availableStock)
        );

        // 6. Explain available actions
        if (reservationActive) {
            actionHint.textContent =
                'Bạn có thể thanh toán trước khi thời gian giữ hàng kết thúc, ' +
                'hoặc hủy để trả sản phẩm về kho.';
        } else if (status === 'expired') {
            actionHint.textContent =
                'Giữ hàng đã hết hạn. Hãy đặt lại nếu chương trình còn diễn ra và còn hàng.';
        } else if (status === 'checked_out') {
            actionHint.textContent =
                'Thanh toán thành công. Bạn có thể tiếp tục mua nếu còn hàng.';
        } else if (!saleActive) {
            actionHint.textContent =
                'Flash sale đã kết thúc. Không thể giữ hàng mới.';
        } else if (completelySoldOut) {
            actionHint.textContent =
                'Sản phẩm đã bán hết.';
        } else if (temporarilyUnavailable) {
            actionHint.textContent =
                'Hiện không còn hàng có thể đặt. Hãy kiểm tra lại sau.';
        } else {
            actionHint.textContent =
                'Nhập số lượng và chọn Giữ hàng để bắt đầu thời gian giữ 30 giây.';
        }
    }




    function handleAction(action: string): void {
        showError('');

        let succeeded = false;

        try {
            switch (action) {
                case 'reserve': {
                    if (Date.now() >= saleEndAt) {
                        throw new Error('Flash sale đã kết thúc.');
                    }

                    const quantity = Number(quantityInput.value);
                    const availableStock = inventory.getState().availableStock;

                    if (
                        quantityInput.value.trim() === '' ||
                        !Number.isSafeInteger(quantity) ||
                        quantity <= 0
                    ) {
                        throw new Error(
                            'Vui lòng nhập số lượng nguyên lớn hơn 0.'
                        );
                    }

                    if (quantity > availableStock) {
                        throw new Error(
                            'Số lượng yêu cầu vượt quá tồn kho.'
                        );
                    }

                    const reservation = flow.reserve(
                        quantity,
                        LOCK_DURATION_MS
                    );

                    announce(
                        `Đã giữ ${reservation.quantity} sản phẩm. ` +
                        'Vui lòng thanh toán trong 30 giây.'
                    );

                    succeeded = true;
                    break;
                }

                case 'cancel': {
                    flow.cancel();
                    announce(
                        'Đã hủy giữ hàng. Sản phẩm được trả về kho.'
                    );
                    succeeded = true;
                    break;
                }

                case 'checkout': {
                    const reservation = flow.checkout();

                    announce(
                        `Thanh toán thành công ${reservation.quantity} sản phẩm. ` +
                        `Tổng tiền: ${money(
                            reservation.quantity * product.price
                        )}.`
                    );

                    succeeded = true;
                    break;
                }

                default:
                    return;
            }
        } catch (caught: unknown) {
            const message =
                caught instanceof Error
                    ? caught.message
                    : 'Không thể thực hiện thao tác.';

            if (flow.getSnapshot()?.reservation.status === 'expired') {
                showError(
                    'Thời gian giữ hàng đã hết. Vui lòng đặt lại nếu còn hàng.'
                );
            } else {
                showError(message);
            }

            announce('Thao tác không thành công.');
        }

        // Update disabled states before managing focus.
        render();

        if (!succeeded) {
            // Preserve focus on failure when possible.
            if (action === 'checkout' && checkoutButton.disabled) {
                if (!reserveButton.disabled) {
                    reserveButton.focus();
                } else {
                    error.setAttribute('tabindex', '-1');
                    error.focus();
                }
            }

            return;
        }

        if (action === 'reserve') {
            if (!checkoutButton.disabled) {
                checkoutButton.focus();
            }
        } else if (
            action === 'cancel' ||
            action === 'checkout'
        ) {
            if (!reserveButton.disabled) {
                reserveButton.focus();
            } else {
                feedback.setAttribute('tabindex', '-1');
                feedback.focus();
            }
        }
    }



    // Event delegation: native buttons support Enter and Space.
    function handleClick(event: MouseEvent): void {
        if (!(event.target instanceof Element)) return;

        const button = event.target.closest<HTMLButtonElement>(
            'button[data-action]'
        );

        if (!button || button.disabled || !controls.contains(button)) {
            return;
        }

        const action = button.dataset.action;
        if (action) handleAction(action);
    }

    controls.addEventListener('click', handleClick);

    // Sale deadline, stock and status remain fresh.
    const uiTimer = setInterval(render, 250);
    render();

    return () => {
        clearInterval(uiTimer);
        controls.removeEventListener('click', handleClick);
        flow.dispose();
        root.replaceChildren();
    };
}
