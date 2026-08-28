import { OnEvent } from '@core/decorators/event';
import { Inject } from '@core/decorators/injectable';
import { Provider } from '@core/decorators/provider';
import { Rpc } from '@public/core/decorators/rpc';
import { InventoryFactory } from '@public/server/inventory/inventory.factory';
import { ItemService } from '@public/server/item/item.service';
import { Monitor } from '@public/server/monitor/monitor';
import { Notifier } from '@public/server/notifier';
import { ServerEvent } from '@public/shared/event';
import { canTreeBeHarvest, canTreeBeWater, FDFConfig, harvestTreeDiff, TreeStatus } from '@public/shared/job/fdf';
import { toVector3Object, Vector3 } from '@public/shared/polyzone/vector';
import { getRandomInt } from '@public/shared/random';
import { RpcServerEvent } from '@public/shared/rpc';
import { formatDuration } from '@public/shared/utils/timeformat';

@Provider()
export class FDFTreeProvider {
    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(ItemService)
    private itemService: ItemService;

    @Inject(Monitor)
    private monitor: Monitor;

    private treeStatus: Map<number, TreeStatus> = new Map();

    @OnEvent(ServerEvent.FDF_TREE_CUT)
    public onCutTree(source: number, id: number, item: string) {
        const tree = this.treeStatus.get(id);
        if (tree) {
            return;
        }

        this.treeStatus.set(id, {
            cutDate: Date.now(),
            nbWater: 0,
            objectRemaining: 40,
            lastWater: 0,
            item: item,
        });

        this.notifier.notify(
            source,
            `Bạn đã ~g~tỉa cành~s~ cho cây này, quả sẽ sẵn sàng thu hoạch sau khoảng 2 giờ nữa.`
        );

        this.monitor.traceEvent('job_fdf_cut_tree', {
            player_source: source,
            item_id: item,
            id: id,
            position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
        });
    }

    @OnEvent(ServerEvent.FDF_TREE_WATER)
    public onWaterTree(source: number, id: number) {
        const tree = this.treeStatus.get(id);
        if (!canTreeBeWater(tree)) {
            return;
        }

        tree.nbWater++;
        tree.lastWater = Date.now();

        this.notifier.notify(
            source,
            `Bạn đã ~g~tưới nước~s~ cho cây này, quả sẽ chín sớm hơn một chút.`
        );

        this.monitor.traceEvent('job_fdf_water_tree', {
            player_source: source,
            type: tree.item,
            id: id,
            position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
        });
    }

    @Rpc(RpcServerEvent.FDF_TREE_HARVEST)
    public async onHarvestTree(source: number, id: number): Promise<number> {
        const tree = this.treeStatus.get(id);
        if (!canTreeBeHarvest(tree)) {
            this.notifier.notify(source, `Không còn quả chín nào trên cây.`);
            return 0;
        }

        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        const nbItem = Math.min(
            getRandomInt(FDFConfig.treeHarvestItemCount[0], FDFConfig.treeHarvestItemCount[1]),
            tree.objectRemaining
        );
        if (!inventory.canCarryItem(tree.item, nbItem)) {
            this.notifier.notify(
                source,
                `Túi đồ của bạn không có đủ chỗ trống để thu hoạch.`,
                'error'
            );
            return 0;
        }

        inventory.add(tree.item, nbItem);

        this.notifier.notify(
            source,
            `Bạn đã thu hoạch ~y~${nbItem}~s~ ~g~${this.itemService.getItem(tree.item).label}~s~.`
        );

        tree.objectRemaining -= nbItem;

        if (tree.objectRemaining == 0) {
            this.notifier.notify(source, `Không còn quả chín nào trên cây.`);
            this.treeStatus.delete(id);
        }

        this.monitor.traceEvent('job_fdf_harvest_tree', {
            player_source: source,
            type: tree.item,
            id: id,
            amount: nbItem,
            position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
        });

        return tree.objectRemaining;
    }

    @Rpc(RpcServerEvent.FDF_TREE_GET)
    public onHarvestGet(source: number, id: number): TreeStatus {
        return this.treeStatus.get(id);
    }

    @OnEvent(ServerEvent.FDF_TREE_CHECK)
    async drugsCheck(source: number, id: number): Promise<void> {
        const tree = this.treeStatus.get(id);
        if (!tree) {
            return;
        }

        const diff = Math.max(harvestTreeDiff(tree), 0);

        this.notifier.notify(
            source,
            `<span style="text-decoration: underline;">Tình trạng cây ăn quả.</span>~n~` +
                (diff > 0
                    ? `<strong>Thời gian đến khi thu hoạch :</strong> ${formatDuration(diff)}~n~`
                    : `<strong>Sẵn sàng thu hoạch :</strong> ${tree.objectRemaining} ${
                          this.itemService.getItem(tree.item).label
                      }~n~`) +
                `<strong>Số lần tưới nước :</strong> ${tree.nbWater}`,
            'success'
        );
    }
}
