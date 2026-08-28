import { Once, OnceStep, OnEvent } from '@core/decorators/event';
import { Inject } from '@core/decorators/injectable';
import { Provider } from '@core/decorators/provider';
import { InventoryFactory } from '@public/server/inventory/inventory.factory';
import { ItemService } from '@public/server/item/item.service';
import { Notifier } from '@public/server/notifier';
import { ProgressService } from '@public/server/player/progress.service';
import { ServerEvent } from '@public/shared/event';
import { JobType } from '@public/shared/job';

import { ADD_ERROR_MESSAGE, InventoryItem } from '../../../shared/inventory';
import { isOk } from '../../../shared/result';
import { FieldProvider } from '../../field/field.provider';

const EasterHarvestDrop: Record<string, number> = {
    golden_egg: 0.01,
    chocolat_egg: 0.5,
    chocolat_milk_egg: 1,
};

const EASTER_FIELD = 'easter_field';
@Provider()
export class FoodHarvestProvider {
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
            identifier: EASTER_FIELD,
            owner: JobType.Food,
            item: null,
            capacity: 200,
            maxCapacity: 200,
            refill: {
                delay: 5 * 60 * 1000,
                amount: 30,
            },
            harvest: {
                delay: 0,
                amount: 1,
            },
        });
    }

    @OnEvent(ServerEvent.FOOD_FISH_PREPARATION)
    async onFishPreparation(source: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        const inventoryFishes: InventoryItem[] = [];
        Object.values(inventory.items()).filter(item => {
            if (item.type === 'fish') {
                inventoryFishes.push(item);
            }
        });

        if (!inventoryFishes || !inventoryFishes[0] || !inventoryFishes[0].amount || inventoryFishes[0].amount < 1) {
            this.notifier.notify(source, `Bạn không có cá.`);
            return false;
        }

        this.notifier.notify(
            source,
            `Bạn bắt đầu sơ chế ~b~${this.itemService.getItem('fish_preparation').label}.`
        );

        while (
            await this.doPrepareFish(source, `Đang sơ chế ${this.itemService.getItem('fish_preparation').label}...`)
        ) {
            /* Empty*/
        }

        this.notifier.notify(
            source,
            `Bạn đã sơ chế xong ~b~${this.itemService.getItem('fish_preparation').label}.`,
            'success'
        );
    }

    async doPrepareFish(source: number, label: string) {
        const { completed } = await this.progressService.progress(source, 'food_easter_harvest', label, 5000, {
            dictionary: 'amb@prop_human_bbq@male@idle_a',
            name: 'idle_c',
            flags: 1,
        });

        if (!completed) {
            return false;
        }

        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        const inventoryFishes: InventoryItem[] = [];
        Object.values(inventory.items()).filter(item => {
            if (item.type === 'fish') {
                inventoryFishes.push(item);
            }
        });

        if (!inventoryFishes || !inventoryFishes[0] || !inventoryFishes[0].amount) {
            this.notifier.notify(source, `Bạn không có cá.`);
            return false;
        }

        const result = inventory.add('fish_preparation', 2);
        if (isOk(result)) {
            inventory.removeAtSlot(inventoryFishes[0].slot, 1);
            this.notifier.notify(
                source,
                `Bạn đã sơ chế được ~b~${this.itemService.getItem('fish_preparation').label}~s~.`
            );
        } else if (result.err == 'not_enough_space') {
            this.notifier.notify(source, 'Túi đồ của bạn đã đầy...', 'error');
            return false;
        } else {
            this.notifier.notify(
                source,
                `Đã xảy ra lỗi: ${'fish_preparation'} ${ADD_ERROR_MESSAGE[result.err]}`,
                'error'
            );
            return false;
        }
        return true;
    }

    @OnEvent(ServerEvent.FOOD_EASTER_HARVEST)
    async onHarvest(source: number) {
        this.notifier.notify(source, 'Bạn ~g~bắt đầu~s~ thu thập');

        while (await this.doHarvest(source, 'Đang thu thập trứng...')) {
            /* empty */
        }
        this.notifier.notify(source, 'Bạn đã ~r~hoàn tất~s~ thu thập.', 'success');
    }

    async doHarvest(source: number, label: string) {
        const { completed } = await this.progressService.progress(source, 'food_easter_harvest', label, 5000, {
            name: 'weed_stand_checkingleaves_kneeling_01_inspector',
            dictionary: 'anim@amb@business@weed@weed_inspecting_lo_med_hi@',
            flags: 1,
        });

        if (!completed) {
            this.notifier.notify(source, `Bạn đã ~r~dừng~s~ thu thập.`, 'error');
            return false;
        }

        if (!(await this.fieldService.harvestField(EASTER_FIELD, 1))) {
            this.notifier.notify(source, `Cánh đồng đã cạn kiệt vật phẩm.`);
            return false;
        }

        const rng = Math.random();
        let item: string = null;
        for (const [item_name, value] of Object.entries(EasterHarvestDrop)) {
            if (rng < value) {
                item = item_name;
                break;
            }
        }

        if (!item) {
            return true;
        }

        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.canCarryItem(item, 1)) {
            this.notifier.notify(
                source,
                `Túi đồ của bạn không có đủ chỗ trống để thu thập.`
            );
            return false;
        }

        const result = inventory.add(item, 1);
        if (isOk(result)) {
            this.notifier.notify(source, `Bạn đã thu thập được 1 ~b~${this.itemService.getItem(item).label}.`);
        } else if (result.err == 'not_enough_space') {
            this.notifier.notify(source, 'Túi đồ của bạn đã đầy...', 'error');
            return false;
        } else {
            this.notifier.notify(source, `Đã xảy ra lỗi: ${item} ${ADD_ERROR_MESSAGE[result.err]}`, 'error');
            return false;
        }
        return true;
    }
}
