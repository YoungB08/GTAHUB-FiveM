import { InventoryFactory } from '@public/server/inventory/inventory.factory';

import { OnEvent } from '../../../core/decorators/event';
import { Inject } from '../../../core/decorators/injectable';
import { Provider } from '../../../core/decorators/provider';
import { ServerEvent } from '../../../shared/event';
import { JobPermission, JobType } from '../../../shared/job';
import { StonkBagType, StonkConfig } from '../../../shared/job/stonk';
import { toVector3Object, Vector3 } from '../../../shared/polyzone/vector';
import { isOk } from '../../../shared/result';
import { Inventory } from '../../inventory/inventory';
import { ItemService } from '../../item/item.service';
import { JobService } from '../../job.service';
import { Monitor } from '../../monitor/monitor';
import { Notifier } from '../../notifier';
import { PlayerService } from '../../player/player.service';
import { ProgressService } from '../../player/progress.service';

@Provider()
export class StonkCollectProvider {
    @Inject(ItemService)
    private itemService: ItemService;

    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(JobService)
    private jobService: JobService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(Monitor)
    private monitor: Monitor;

    private collectBagHistory: Record<string, Map<string, number>> = {};

    @OnEvent(ServerEvent.STONK_COLLECT)
    public async onCollect(source: number, brand: string, shop: string) {
        const player = this.playerService.getPlayer(source);
        if (!player) {
            return;
        }

        const [playerJob, playerJobGrade] = this.playerService.getPlayerJobAndGrade(source);

        if (
            !(await this.jobService.hasTargetJobPermission(
                JobType.CashTransfer,
                playerJob,
                playerJobGrade,
                JobPermission.CashTransfer_CollectBags
            ))
        ) {
            this.notifier.notify(source, `Bạn không có quyền hạn cần thiết.`, 'error');
            return;
        }

        const item = Object.keys(StonkConfig.collection).find(c =>
            StonkConfig.collection[c].takeInAvailableIn.includes(brand)
        ) as StonkBagType;

        if (!item) {
            return;
        }

        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.canCarryItem(item, StonkConfig.resell.amount)) {
            this.notifier.notify(source, `Túi đồ của bạn không có ~r~đủ~s~ chỗ trống.`);
            return;
        }

        if (!this.canCollect(player.citizenid, brand, shop, item)) {
            this.notifier.notify(source, `Cửa hàng này hiện không còn túi tiền nào để thu gom!`, 'error');
            return;
        }

        this.notifier.notify(source, 'Bạn ~g~bắt đầu~s~ thu gom túi tiền.', 'success');

        const outputItemLabel = this.itemService.getItem(item).label;
        const hasCollected = await this.doCollect(source, inventory, shop, item);

        if (hasCollected) {
            this.monitor.traceEvent('job_stonk_collect_bag', {
                item_id: item,
                player_source: source,
                item_label: outputItemLabel,
                amount: StonkConfig.resell.amount,
                position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
            });

            this.notifier.notify(source, `Bạn đã thu gom ${StonkConfig.resell.amount} ~g~${outputItemLabel}~s~.`);
        } else {
            this.notifier.notify(source, 'Bạn đã ~r~dừng~s~ thu gom túi tiền.');
            return;
        }
    }

    private canCollect(citizenid: string, brand: string, shop: string, item: StonkBagType): boolean {
        if (!Object.values(StonkConfig.collection).some(item => item.takeInAvailableIn.includes(brand))) {
            return false;
        }

        if (!this.collectBagHistory[shop]) {
            return true;
        }

        const lastCollect = this.collectBagHistory[shop].get(citizenid) || 0;
        return lastCollect + StonkConfig.collection[item].timeout <= Date.now();
    }

    private async doCollect(source: number, inventory: Inventory, shop: string, item: StonkBagType): Promise<boolean> {
        const player = this.playerService.getPlayer(source);
        if (!player) {
            return;
        }

        const { completed } = await this.progressService.progress(
            source,
            'stonk_collect',
            'Đang thu gom túi tiền...',
            StonkConfig.resell.collectionDuration,
            {
                dictionary: 'anim@mp_radio@garage@low',
                name: 'action_a',
                flags: 1,
            },
            {
                disableCombat: true,
                disableCarMovement: true,
                disableMovement: true,
            }
        );

        if (!completed) {
            return false;
        }

        const addRequest = inventory.add(item, StonkConfig.resell.amount);

        if (!isOk(addRequest)) {
            return false;
        }

        if (this.collectBagHistory[shop] === undefined) {
            this.collectBagHistory[shop] = new Map();
        }
        this.collectBagHistory[shop].set(player.citizenid, Date.now());

        return true;
    }
}
