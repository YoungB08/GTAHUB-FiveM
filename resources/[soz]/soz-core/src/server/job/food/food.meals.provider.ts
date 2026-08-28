import { InventoryFactory } from '@public/server/inventory/inventory.factory';

import { OnEvent } from '../../../core/decorators/event';
import { Inject } from '../../../core/decorators/injectable';
import { Provider } from '../../../core/decorators/provider';
import { ClientEvent, ServerEvent } from '../../../shared/event';
import { ADD_ERROR_MESSAGE } from '../../../shared/inventory';
import { BankService } from '../../bank/bank.service';
import { Notifier } from '../../notifier';
import { ProgressService } from '../../player/progress.service';

@Provider()
export class FoodMealsProvider {
    private readonly LIMIT_OF_ORDERS = 12;

    private readonly MEAL_BOXES_PER_ORDER = 12;

    private readonly MEAL_BOX_ITEM = 'meal_box';

    private readonly ORDER_PRICE = 3000;

    private orderedMeals = 0;

    private orderInProgress = false;

    private orderReadyDate: Date;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(BankService)
    private bankService: BankService;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @OnEvent(ServerEvent.FOOD_RETRIEVE_STATE)
    onRetrieveState(source: number) {
        TriggerClientEvent(ClientEvent.FOOD_UPDATE_ORDER, source, this.orderInProgress);
    }

    @OnEvent(ServerEvent.FOOD_ORDER_MEALS)
    public async onOrderMeals(source: number) {
        if (this.orderedMeals >= this.LIMIT_OF_ORDERS) {
            this.notifier.notify(source, `Xin lỗi, các đầu bếp của chúng tôi hôm nay đã kín lịch. Vui lòng quay lại vào ~r~ngày mai~s~.`);
            return;
        }
        if (this.orderInProgress) {
            this.notifier.notify(source, 'Đang có một đơn hàng đang được xử lý.');
            return;
        }

        const { completed } = await this.progressService.progress(
            source,
            'food_meal',
            'Đang đặt hàng món ăn...',
            10000,
            {
                name: 'base',
                dictionary: 'missheistdockssetup1clipboard@base',
                flags: 1,
            },
            {
                disableMovement: true,
                disableCarMovement: true,
                disableMouse: false,
                disableCombat: true,
                firstProp: {
                    model: 'prop_notepad_01',
                    bone: 18905,
                    coords: { x: 0.1, y: 0.02, z: 0.08 },
                    rotation: { x: -80.0, y: 0.0, z: 0.0 },
                },
                secondProp: {
                    model: 'prop_pencil_01',
                    bone: 58866,
                    coords: { x: 0.12, y: -0.02, z: 0.001 },
                    rotation: { x: -150.0, y: 0.0, z: 0.0 },
                },
            }
        );

        if (!completed) {
            return false;
        }

        const transferred = await this.bankService.transferFarmMoney(
            source,
            'farm_food',
            'food',
            this.ORDER_PRICE,
            'money',
            true
        );
        if (transferred) {
            const date = new Date();
            date.setTime(date.getTime() + 60 * 60 * 1000); // One hour later...
            this.orderReadyDate = date;
            this.orderedMeals++;

            this.updateOrderInProgress(true);

            this.notifier.notify(
                source,
                `Cảm ơn bạn đã đặt hàng! Tổng chi phí là ~r~$${this.ORDER_PRICE.toLocaleString()}~s~. Đơn hàng sẽ sẵn sàng trong ~g~1 giờ nữa~s~.`
            );
        } else {
            this.notifier.notify(
                source,
                `Tài khoản doanh nghiệp còn thiếu ~r~$${this.ORDER_PRICE.toLocaleString()}~s~.`
            );
        }
    }

    @OnEvent(ServerEvent.FOOD_RETRIEVE_ORDER)
    public async onRetrieveOrder(source: number) {
        if (!this.orderInProgress) {
            this.notifier.notify(source, 'Không có đơn hàng nào đang chờ nhận.');
            return;
        }

        const { completed } = await this.progressService.progress(
            source,
            'food_meal',
            'Đang nhận đơn hàng...',
            10000,
            {
                dictionary: 'oddjobs@bailbond_hobohang_out_street_b',
                name: 'idle_b',
                options: { repeat: true },
            },
            {
                disableMovement: true,
                disableCarMovement: true,
                disableMouse: false,
                disableCombat: true,
            }
        );

        if (!completed) {
            return false;
        }

        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (this.orderReadyDate.getTime() > new Date().getTime()) {
            const minutesLeft = Math.round(
                ((this.orderReadyDate.getTime() - (new Date().getTime() % 86400000)) % 3600000) / 60000
            );
            this.notifier.notify(
                source,
                `Đơn hàng của bạn chưa sẵn sàng! Vui lòng quay lại sau ~r~${minutesLeft} phút~s~ nữa.`
            );
            return;
        } else if (!inventory.canCarryItem(this.MEAL_BOX_ITEM, this.MEAL_BOXES_PER_ORDER)) {
            this.notifier.notify(source, ADD_ERROR_MESSAGE['not_enough_space']);
            return;
        }
        inventory.add(this.MEAL_BOX_ITEM, this.MEAL_BOXES_PER_ORDER);
        this.notifier.notify(source, `Bạn đã ~g~nhận~s~ đơn hàng thành công. Chúc ngon miệng !`);

        this.updateOrderInProgress(false);
    }

    private updateOrderInProgress(newValue: boolean) {
        this.orderInProgress = newValue;
        TriggerClientEvent(ClientEvent.FOOD_UPDATE_ORDER, -1, this.orderInProgress);
    }
}
