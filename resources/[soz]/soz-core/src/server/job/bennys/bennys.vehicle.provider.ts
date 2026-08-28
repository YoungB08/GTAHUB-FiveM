import { VehicleBusinessProvider } from '@private/server/gang/business.vehicle.provider';
import { InventoryFactory } from '@public/server/inventory/inventory.factory';

import { OnEvent } from '../../../core/decorators/event';
import { Inject } from '../../../core/decorators/injectable';
import { Provider } from '../../../core/decorators/provider';
import { ServerEvent } from '../../../shared/event';
import { toVector3Object, Vector3 } from '../../../shared/polyzone/vector';
import { ProgressAnimation, ProgressOptions } from '../../../shared/progress';
import { Monitor } from '../../monitor/monitor';
import { Notifier } from '../../notifier';
import { PlayerService } from '../../player/player.service';
import { ProgressService } from '../../player/progress.service';
import { VehicleService } from '../../vehicle/vehicle.service';
import { VehicleStateService } from '../../vehicle/vehicle.state.service';

@Provider()
export class BennysVehicleProvider {
    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(VehicleService)
    private vehicleService: VehicleService;

    @Inject(VehicleStateService)
    private vehicleStateService: VehicleStateService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(Monitor)
    private monitor: Monitor;

    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(VehicleBusinessProvider)
    private vehicleBusinessProvider: VehicleBusinessProvider;

    @OnEvent(ServerEvent.BENNYS_REPAIR_VEHICLE_ENGINE)
    public async onRepairVehicleEngine(source: number, vehicleNetworkId: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.hasEnoughItem('repair_part_motor', 1, true)) {
            this.notifier.error(source, `Bạn không có phụ tùng sửa động cơ.`);

            return;
        }

        const state = this.vehicleStateService.getVehicleState(vehicleNetworkId);
        const damageDiff = 1000 - state.condition.engineHealth;
        const repairTime = (damageDiff * 30000) / 1000 + 10000; // Between 10s and 40s

        if (!(await this.doRepairVehicle(source, repairTime))) {
            return;
        }

        if (!inventory.remove('repair_part_motor', 1, false)) {
            return;
        }

        this.notifier.notify(source, `Động cơ đã được sửa chữa.`);

        this.vehicleStateService.updateVehicleCondition(vehicleNetworkId, {
            engineHealth: 1000,
        });

        this.monitor.traceEvent('job_bennys_repair_vehicle', {
            player_source: source,
            repair_type: 'engine',
            vehicle_plate: state.volatile.plate,
            position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
        });
    }

    @OnEvent(ServerEvent.BENNYS_REPAIR_VEHICLE_BODY)
    public async onRepairVehicleEngineBody(source: number, vehicleNetworkId: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.hasEnoughItem('repair_part_body', 1, true)) {
            this.notifier.error(source, `Bạn không có phụ tùng sửa thân xe/vỏ xe.`);

            return;
        }

        const state = this.vehicleStateService.getVehicleState(vehicleNetworkId);
        const damageDiff = 1000 - state.condition.bodyHealth;
        const repairTime = (damageDiff * 30000) / 1000 + 10000; // Between 10s and 40s

        if (!(await this.doRepairVehicle(source, repairTime))) {
            return;
        }

        if (!inventory.remove('repair_part_body', 1, false)) {
            return;
        }

        this.notifier.notify(source, `Thân vỏ xe đã được sửa chữa.`);

        this.vehicleStateService.updateVehicleCondition(vehicleNetworkId, {
            bodyHealth: 1000,
            doorStatus: {},
            windowStatus: {},
            dirtLevel: 0,
        });

        this.vehicleBusinessProvider.repairVehicule(vehicleNetworkId);

        this.monitor.traceEvent('job_bennys_repair_vehicle', {
            player_source: source,
            repair_type: 'body',
            vehicle_plate: state.volatile.plate,
            position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
        });
    }

    @OnEvent(ServerEvent.BENNYS_REPAIR_VEHICLE_TANK)
    public async onRepairVehicleEngineTank(source: number, vehicleNetworkId: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.hasEnoughItem('repair_part_fuel_tank', 1, true)) {
            this.notifier.error(source, `Bạn không có phụ tùng sửa bình nhiên liệu.`);

            return;
        }

        const state = this.vehicleStateService.getVehicleState(vehicleNetworkId);
        const damageDiff = 1000 - state.condition.tankHealth;
        const repairTime = (damageDiff * 30000) / 1000 + 10000; // Between 10s and 40s

        if (!(await this.doRepairVehicle(source, repairTime))) {
            return;
        }

        if (!inventory.remove('repair_part_fuel_tank', 1, false)) {
            return;
        }

        this.notifier.notify(source, `Bình nhiên liệu đã được sửa chữa.`);

        this.vehicleStateService.updateVehicleCondition(vehicleNetworkId, {
            tankHealth: 1000,
        });

        this.monitor.traceEvent('job_bennys_repair_vehicle', {
            player_source: source,
            repair_type: 'tank',
            vehicle_plate: state.volatile.plate,
            position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
        });
    }

    @OnEvent(ServerEvent.BENNYS_REPAIR_VEHICLE_WHEEL)
    public async onRepairVehicleEngineWheel(source: number, vehicleNetworkId: number) {
        const state = this.vehicleStateService.getVehicleState(vehicleNetworkId);
        let repairTime = 10000;

        for (const wheelIndexStr of Object.keys(state.condition.tireHealth)) {
            const wheelIndex = parseInt(wheelIndexStr);

            if (
                state.condition.tireBurstCompletely[wheelIndex] ||
                state.condition.tireBurstState[wheelIndex] ||
                state.condition.tireHealth[wheelIndex] <= 950
            ) {
                repairTime += 10000;
            }
        }

        if (
            !(await this.doRepairVehicle(
                source,
                repairTime,
                {
                    dictionary: 'amb@world_human_vehicle_mechanic@male@base',
                    name: 'base',
                    options: {
                        repeat: true,
                    },
                },
                {
                    headingEntity: {
                        entity: vehicleNetworkId,
                        heading: 180,
                    },
                }
            ))
        ) {
            return;
        }

        this.notifier.notify(source, `Các bánh xe đã được sửa chữa.`);

        this.vehicleStateService.updateVehicleCondition(vehicleNetworkId, {
            tireTemporaryRepairDistance: {},
            tireHealth: {},
            tireBurstCompletely: {},
            tireBurstState: {},
        });

        this.monitor.traceEvent('job_bennys_repair_vehicle', {
            player_source: source,
            repair_type: 'wheel',
            vehicle_plate: state.volatile.plate,
            position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
        });
    }

    private async doRepairVehicle(
        source: number,
        repairTime: number,
        animation: ProgressAnimation = null,
        options: Partial<ProgressOptions> = null
    ) {
        if (!animation) {
            animation = {
                name: 'car_bomb_mechanic',
                dictionary: 'mp_car_bomb',
                options: {
                    onlyUpperBody: true,
                    repeat: true,
                },
            };
        }

        const { completed } = await this.progressService.progress(
            source,
            'repairing_vehicle',
            'Đang sửa chữa phương tiện...',
            repairTime,
            animation,
            {
                disableMovement: true,
                disableCarMovement: true,
                disableMouse: false,
                disableCombat: true,
                ...options,
            }
        );

        if (!completed) {
            this.notifier.notify(source, 'Bạn đã hủy sửa chữa phương tiện.');

            return false;
        }

        return true;
    }

    @OnEvent(ServerEvent.BENNYS_WASH_VEHICLE)
    public async onWashVehicle(source: number, vehicleNetworkId: number) {
        const state = this.vehicleStateService.getVehicleState(vehicleNetworkId);
        const { completed } = await this.progressService.progress(
            source,
            'cleaning_vehicle',
            'Đang rửa phương tiện...',
            5000,
            {
                task: 'WORLD_HUMAN_MAID_CLEAN',
            },
            {
                disableMovement: true,
                disableCarMovement: true,
                disableMouse: false,
                disableCombat: true,
            }
        );

        if (!completed) {
            this.notifier.notify(source, 'Bạn đã hủy rửa phương tiện.');

            return;
        }

        this.notifier.notify(source, `Phương tiện đã được rửa sạch sẽ.`);

        this.vehicleStateService.updateVehicleCondition(vehicleNetworkId, {
            dirtLevel: 0,
        });

        this.monitor.traceEvent('job_bennys_clean_vehicle', {
            player_source: source,
            vehicle_plate: state.volatile.plate,
            position: toVector3Object(GetEntityCoords(GetPlayerPed(source)) as Vector3),
        });
    }
}
