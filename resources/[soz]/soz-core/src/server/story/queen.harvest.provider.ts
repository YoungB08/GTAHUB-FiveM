import { Once, OnceStep, OnEvent } from '@core/decorators/event';
import { Inject } from '@core/decorators/injectable';
import { Provider } from '@core/decorators/provider';
import { ItemService } from '@public/server/item/item.service';
import { Notifier } from '@public/server/notifier';
import { ProgressService } from '@public/server/player/progress.service';
import { ServerEvent } from '@public/shared/event';

import { ADD_ERROR_MESSAGE } from '../../shared/inventory';
import { isOk } from '../../shared/result';
import { FieldProvider } from '../field/field.provider';
import { InventoryFactory } from '../inventory/inventory.factory';

const BLOOD_FIELD = 'blood_field';
const BLOOD_ITEM = 'halloween_pure_blood';
const BLOOD_ITEM_AMOUNT = 2;

@Provider()
export class QueenHarvestProvider {
    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(FieldProvider)
    private fieldService: FieldProvider;

    @Inject(ItemService)
    private itemService: ItemService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Once(OnceStep.RepositoriesLoaded)
    public async init() {
        await this.fieldService.createField({
            identifier: BLOOD_FIELD,
            owner: '',
            item: BLOOD_ITEM,
            capacity: 50_000,
            refill: {
                delay: 5 * 60 * 1000,
                amount: 500,
            },
            maxCapacity: 50_000,
            harvest: {
                delay: 0,
                amount: BLOOD_ITEM_AMOUNT,
            },
        });
    }

    @OnEvent(ServerEvent.HALLOWEEN_BLOOD_HARVEST)
    async onHarvest(source: number) {
        this.notifier.notify(source, 'Bạn ~g~bắt đầu~s~ thu thập máu');

        while (await this.doHarvest(source, 'Đang thu thập máu...')) {
            /* empty */
        }
        this.notifier.notify(source, 'Bạn đã ~r~hoàn thành~s~ thu thập máu.', 'success');
    }

    async doHarvest(source: number, label: string) {
        const { completed } = await this.progressService.progress(source, 'halloween_blood_harvest', label, 5000, {
            dictionary: 'mp_ped_interaction',
            name: 'kisses_guy_a',
            flags: 1,
        });

        if (!completed) {
            this.notifier.notify(source, `Bạn đã ~r~dừng~s~ thu thập máu.`, 'error');
            return false;
        }

        if (!(await this.fieldService.harvestField(BLOOD_FIELD, BLOOD_ITEM_AMOUNT))) {
            this.notifier.notify(source, `Nữ hoàng của chúng ta không còn máu để ban phát...`, 'error');
            return false;
        }

        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.canCarryItem(BLOOD_ITEM, BLOOD_ITEM_AMOUNT)) {
            this.notifier.notify(source, `Bạn không có đủ chỗ trống trong túi đồ.`);
            return false;
        }

        const result = inventory.add(BLOOD_ITEM, BLOOD_ITEM_AMOUNT);

        if (isOk(result)) {
            this.notifier.notify(
                source,
                `Bạn đã thu thập được hai lọ ~b~${this.itemService.getItem(BLOOD_ITEM).label}.`
            );
        } else if (result.err == 'not_enough_space') {
            this.notifier.notify(source, 'Túi đồ của bạn đã đầy...', 'error');
            return false;
        } else {
            this.notifier.notify(
                source,
                `Đã xảy ra lỗi: ${BLOOD_ITEM} ${ADD_ERROR_MESSAGE[result.err]}`,
                'error'
            );
            return false;
        }
        return true;
    }
}
