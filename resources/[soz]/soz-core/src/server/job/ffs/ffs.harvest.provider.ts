import { InventoryFactory } from '@public/server/inventory/inventory.factory';

import { OnEvent } from '../../../core/decorators/event';
import { Inject } from '../../../core/decorators/injectable';
import { Provider } from '../../../core/decorators/provider';
import { ServerEvent } from '../../../shared/event';
import { SewingRawMaterial } from '../../../shared/job/ffs';
import { toVector3Object, Vector3 } from '../../../shared/polyzone/vector';
import { Inventory } from '../../inventory/inventory';
import { Monitor } from '../../monitor/monitor';
import { Notifier } from '../../notifier';
import { ProgressService } from '../../player/progress.service';

@Provider()
export class FightForStyleHarvestProvider {
    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(Monitor)
    private monitor: Monitor;

    async doHarvest(source: number, inventory: Inventory, label: string) {
        const { completed } = await this.progressService.progress(source, 'ffs_harvest', label, 5000, {
            name: 'base',
            dictionary: 'amb@prop_human_bum_bin@base',
            flags: 1,
        });

        if (!completed) {
            return false;
        }

        inventory.add(SewingRawMaterial.COTTON_BALE, 1);

        return true;
    }

    @OnEvent(ServerEvent.FFS_HARVEST)
    async onHarvest(source: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory) {
            return;
        }

        if (!inventory.canCarryItem(SewingRawMaterial.COTTON_BALE, 1)) {
            this.notifier.notify(
                source,
                `Túi đồ của bạn không có đủ chỗ trống để thu hoạch.`
            );
            return;
        }

        this.notifier.notify(source, 'Bạn ~g~bắt đầu~s~ thu hoạch');

        while (inventory.canCarryItem(SewingRawMaterial.COTTON_BALE, 1, {})) {
            const hasHarvested = await this.doHarvest(source, inventory, 'Đang thu hoạch kiện bông gòn...');
            if (!hasHarvested) {
                this.notifier.notify(source, `Bạn đã ~r~dừng~s~ thu hoạch.`, 'error');
                return;
            }

            this.monitor.traceEvent('job_ffs_harvest', {
                item_id: SewingRawMaterial.COTTON_BALE,
                player_source: source,
                amount: 1,
                position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
            });

            this.notifier.notify(source, `Bạn đã thu hoạch được 1 kiện bông gòn.`);
        }
        this.notifier.notify(source, 'Bạn đã ~r~hoàn tất~s~ thu hoạch.', 'success');
    }
}
