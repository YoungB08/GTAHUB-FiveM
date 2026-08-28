import { InventoryFactory } from '@public/server/inventory/inventory.factory';

import { Once, OnceStep, OnEvent } from '../../../core/decorators/event';
import { Inject } from '../../../core/decorators/injectable';
import { Provider } from '../../../core/decorators/provider';
import { Rpc } from '../../../core/decorators/rpc';
import { ServerEvent } from '../../../shared/event/server';
import { JobType } from '../../../shared/job';
import { OIL_FIELDS } from '../../../shared/job/oil';
import { toVector3Object, Vector3 } from '../../../shared/polyzone/vector';
import { isErr } from '../../../shared/result';
import { RpcServerEvent } from '../../../shared/rpc';
import { VehicleClass } from '../../../shared/vehicle/vehicle';
import { BankService } from '../../bank/bank.service';
import { FieldProvider } from '../../field/field.provider';
import { Monitor } from '../../monitor/monitor';
import { Notifier } from '../../notifier';
import { PlayerService } from '../../player/player.service';
import { ProgressService } from '../../player/progress.service';
import { VehicleStateService } from '../../vehicle/vehicle.state.service';

const MAX_PEOPLE_BY_TANKER = 2;
const HARVEST_AMOUNT = 11;

@Provider()
export class OilTankerProvider {
    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(FieldProvider)
    private fieldProvider: FieldProvider;

    @Inject(BankService)
    private bankService: BankService;

    @Inject(Monitor)
    private monitor: Monitor;

    @Inject(VehicleStateService)
    private vehicleStateService: VehicleStateService;

    private lockedTankers = new Map<number, Set<number>>();

    private tankerUsed = new Map<number, number>();

    @Once(OnceStep.RepositoriesLoaded)
    public async initTankerField() {
        for (const fieldKey of Object.keys(OIL_FIELDS)) {
            const field = OIL_FIELDS[fieldKey];

            await this.fieldProvider.createField({
                identifier: fieldKey,
                owner: JobType.Oil,
                item: 'petroleum',
                capacity: field.production.max,
                refill: {
                    delay: field.delay,
                    amount: field.production,
                },
                maxCapacity: field.production.max,
                harvest: {
                    delay: 0,
                    amount: HARVEST_AMOUNT,
                },
            });
        }
    }

    @Rpc(RpcServerEvent.OIL_LOCK_TANKER)
    public async lockTanker(source: number, entityNetId: number): Promise<boolean> {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return false;
        }

        const players = this.lockedTankers.get(entityNetId) || new Set<number>();

        for (const player of players) {
            if (!this.playerService.getPlayer(player)) {
                players.delete(player);
            }
        }

        if (players.size >= MAX_PEOPLE_BY_TANKER) {
            return false;
        }

        players.add(source);
        this.lockedTankers.set(entityNetId, players);

        return true;
    }

    @OnEvent(ServerEvent.OIL_UNLOCK_TANKER)
    public onUnlockTanker(source: number, entityNetId: number): void {
        const players = this.lockedTankers.get(entityNetId) || new Set<number>();

        players.delete(source);

        if (players.size === 0) {
            this.lockedTankers.delete(entityNetId);
        } else {
            this.lockedTankers.set(entityNetId, players);
        }
    }

    @OnEvent(ServerEvent.OIL_REFILL_TANKER)
    public async onRefillTanker(source: number, entityNetId: number, vehicleClass: VehicleClass, field: string) {
        const state = await this.vehicleStateService.getVehicleState(entityNetId);
        const inventory = await this.inventoryFactory.getVehicleInventory(entityNetId, vehicleClass, state);

        if (!inventory) {
            this.notifier.error(source, "Xe téc không có cốp đồ/khoang chứa.");

            return;
        }

        if (this.tankerUsed.has(source)) {
            this.notifier.error(source, 'Bạn đã đang sử dụng xe téc rồi.');

            return;
        }

        try {
            this.tankerUsed.set(source, entityNetId);

            // eslint-disable-next-line no-constant-condition
            while (true) {
                const canRefillTanker = inventory.canCarryItem('petroleum', HARVEST_AMOUNT);

                if (!canRefillTanker) {
                    this.notifier.notify(source, 'Xe téc đã đầy dầu thô.');

                    break;
                }

                const { completed } = await this.progressService.progress(
                    source,
                    'fill_tanker',
                    'Đang bơm nạp dầu...',
                    12000,
                    {
                        dictionary: 'timetable@gardener@filling_can',
                        name: 'gar_ig_5_filling_can',
                        options: {
                            repeat: true,
                        },
                    },
                    {
                        disableMovement: true,
                        disableCombat: true,
                    }
                );

                if (!completed) {
                    break;
                }

                const isHarvested = await this.fieldProvider.harvestField(field, HARVEST_AMOUNT);

                if (!isHarvested) {
                    this.notifier.error(source, 'Mỏ dầu đã cạn kiệt.');

                    break;
                }

                if (isErr(inventory.add('petroleum', HARVEST_AMOUNT))) {
                    this.notifier.error(source, 'Rơ-moóc của bạn ~r~không thể chứa thêm~s~ dầu thô.');

                    break;
                }

                this.notifier.notify(source, `Bạn đã ~g~bơm nạp~s~ ${HARVEST_AMOUNT}L dầu thô.`);

                this.monitor.traceEvent('job_mtp_fill_oil_tanker', {
                    player_source: source,
                    amount: HARVEST_AMOUNT,
                    position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
                });
            }
        } finally {
            this.tankerUsed.delete(source);
        }
    }

    @OnEvent(ServerEvent.OIL_REFINE_TANKER)
    public async onRefineTanker(source: number, entityNetId: number, vehicleClass: VehicleClass) {
        const state = await this.vehicleStateService.getVehicleState(entityNetId);
        const inventory = await this.inventoryFactory.getVehicleInventory(entityNetId, vehicleClass, state);

        if (!inventory) {
            this.notifier.error(source, "Xe téc không có cốp đồ/khoang chứa.");

            return;
        }

        if (this.tankerUsed.has(source)) {
            this.notifier.error(source, 'Bạn đã đang sử dụng xe téc rồi.');

            return;
        }

        if (inventory.getItemCount('petroleum') < HARVEST_AMOUNT) {
            this.notifier.notify(source, 'Rơ-moóc của bạn ~r~không có đủ~s~ dầu thô.');

            return;
        }

        try {
            this.tankerUsed.set(source, entityNetId);

            this.notifier.notify(source, 'Bạn đã ~g~kết nối~s~ xe téc với ~g~nhà máy lọc dầu~s~.');

            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (inventory.getItemCount('petroleum') < HARVEST_AMOUNT) {
                    this.notifier.notify(source, 'Rơ-moóc của bạn ~r~không có đủ~s~ dầu thô.');

                    return;
                }

                const { completed } = await this.progressService.progress(
                    source,
                    'refine_tanker',
                    'Đang lọc dầu...',
                    10000,
                    {
                        dictionary: 'timetable@gardener@filling_can',
                        name: 'gar_ig_5_filling_can',
                        options: {
                            repeat: true,
                        },
                    },
                    {
                        disableMovement: true,
                        disableCombat: true,
                    }
                );

                if (!completed) {
                    break;
                }

                if (
                    !inventory.canSwapItems(
                        [
                            {
                                name: 'petroleum',
                                amount: HARVEST_AMOUNT,
                                metadata: {},
                            },
                        ],
                        [
                            {
                                name: 'petroleum_refined',
                                amount: 3 * HARVEST_AMOUNT,
                                metadata: {},
                            },
                            {
                                name: 'petroleum_residue',
                                amount: HARVEST_AMOUNT,
                                metadata: {},
                            },
                        ]
                    )
                ) {
                    this.notifier.notify(source, 'Rơ-moóc của bạn ~r~không thể chứa thêm~s~ dầu đã lọc.');

                    return;
                }

                if (!inventory.remove('petroleum', HARVEST_AMOUNT)) {
                    this.notifier.notify(source, 'Rơ-moóc của bạn ~r~không thể chứa thêm~s~ dầu đã lọc.');

                    return;
                }

                inventory.add('petroleum_refined', 3 * HARVEST_AMOUNT);
                inventory.add('petroleum_residue', HARVEST_AMOUNT);

                this.notifier.notify(source, `Bạn đã ~g~lọc~s~ ${HARVEST_AMOUNT}L dầu.`);

                this.monitor.traceEvent('job_mtp_refining_oil', {
                    player_source: source,
                    amount: HARVEST_AMOUNT,
                    position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
                });
            }
        } finally {
            this.tankerUsed.delete(source);
        }
    }

    @OnEvent(ServerEvent.OIL_RESELL_TANKER)
    public async onResellTanker(source: number, entityNetId: number, vehicleClass: VehicleClass) {
        const state = await this.vehicleStateService.getVehicleState(entityNetId);
        const inventory = await this.inventoryFactory.getVehicleInventory(entityNetId, vehicleClass, state);

        if (!inventory) {
            this.notifier.error(source, "Xe téc không có cốp đồ/khoang chứa.");

            return;
        }

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const essenceItemAmount = inventory.getItemCount('essence');
            const keroseneItemAmount = inventory.getItemCount('kerosene');

            if (essenceItemAmount < 10 && keroseneItemAmount < 10) {
                this.notifier.error(source, "Bạn không có nhiên liệu để bán.");

                return;
            }

            const { completed } = await this.progressService.progress(
                source,
                'resell_tanker',
                'Đang bơm xả nhiên liệu...',
                3_000,
                {
                    dictionary: 'timetable@gardener@filling_can',
                    name: 'gar_ig_5_filling_can',
                    options: {
                        repeat: true,
                    },
                },
                {
                    disableMovement: true,
                    disableCombat: true,
                }
            );

            if (!completed) {
                return;
            }

            if (inventory.remove('essence', 10)) {
                await this.bankService.transferFarmMoney(source, 'farm_mtp', 'safe_oil', 500);

                this.monitor.traceEvent('job_mtp_sell_oil', {
                    player_source: source,
                    type: 'essence',
                    amount: 10,
                    position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
                });

                this.notifier.notify(source, "Bạn đã ~g~bán lại~s~ 100L xăng.");
            } else if (inventory.remove('kerosene', 10)) {
                await this.bankService.transferFarmMoney(source, 'farm_mtp', 'safe_oil', 500);

                this.monitor.traceEvent('job_mtp_sell_oil', {
                    player_source: source,
                    type: 'kerosene',
                    amount: 10,
                    position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
                });

                this.notifier.notify(source, 'Bạn đã ~g~bán lại~s~ 100L dầu hỏa.');
            }
        }
    }
}
