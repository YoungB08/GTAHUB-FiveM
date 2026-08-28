import { getVehicleMaxFuelStorage, isVehicleModelElectric } from '@public/shared/vehicle/vehicle';

import { Once } from '../../core/decorators/event';
import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { InventoryItem } from '../../shared/inventory';
import { CommonItem } from '../../shared/item';
import { Inventory } from '../inventory/inventory';
import { Notifier } from '../notifier';
import { ProgressService } from '../player/progress.service';
import { VehicleRepository } from '../repository/vehicle.repository';
import { VehicleSpawner } from '../vehicle/vehicle.spawner';
import { VehicleStateService } from '../vehicle/vehicle.state.service';
import { ItemService } from './item.service';

export const BATTERY_FUEL_AMOUNT = 33;

@Provider()
export class ItemFuelProvider {
    @Inject(ItemService)
    private item: ItemService;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(VehicleSpawner)
    private vehicleSpawner: VehicleSpawner;

    @Inject(VehicleStateService)
    private vehicleStateService: VehicleStateService;

    @Inject(VehicleRepository)
    private vehicleRepository: VehicleRepository;

    public async useEssenceJerrycan(
        source: number,
        item: CommonItem,
        inventoryItem: InventoryItem,
        inventory: Inventory
    ) {
        const closestVehicle = await this.vehicleSpawner.getClosestVehicle(source);

        if (!closestVehicle) {
            this.notifier.notify(source, 'Không có phương tiện nào ở gần');

            return;
        }

        if (closestVehicle.isInside) {
            this.notifier.notify(source, "Bạn không thể sử dụng vật phẩm này khi đang ở trong xe", 'error');

            return;
        }

        const vehicleType = GetVehicleType(closestVehicle.vehicleEntityId);

        if (
            vehicleType === 'heli' ||
            vehicleType === 'plane' ||
            vehicleType === 'boat' ||
            vehicleType === 'submarine' ||
            isVehicleModelElectric(GetEntityModel(closestVehicle.vehicleEntityId))
        ) {
            this.notifier.notify(source, 'Bạn không thể sử dụng loại nhiên liệu này cho phương tiện này.', 'error');

            return;
        }

        const vehModel = await this.vehicleRepository.findByHash(GetEntityModel(closestVehicle.vehicleEntityId));
        if (vehModel && vehModel.category == 'Cycles') {
            this.notifier.notify(source, 'Bạn không thể sử dụng loại nhiên liệu này cho phương tiện này.', 'error');

            return;
        }

        const maxFuel = getVehicleMaxFuelStorage(vehModel);

        const vehicleState = this.vehicleStateService.getVehicleState(closestVehicle.vehicleNetworkId);

        if (!inventory.removeAtSlot(inventoryItem.slot, 1)) {
            return;
        }

        const { progress } = await this.progressService.progress(
            source,
            'fuel_jerrycan_essence',
            'Đang nạp nhiên liệu cho xe...',
            10000,
            {
                dictionary: 'timetable@gardener@filling_can',
                name: 'gar_ig_5_filling_can',
            },
            {
                disableMovement: true,
                disableCarMovement: true,
                disableCombat: true,
                disableMouse: false,
            }
        );

        const amount = {
            essence_jerrycan_low: 20,
            essence_jerrycan: 30,
        }[item.name];
        const filledFuel = Math.round(progress * amount);

        this.vehicleStateService.updateVehicleCondition(closestVehicle.vehicleNetworkId, {
            fuelLevel: Math.min(maxFuel, vehicleState.condition.fuelLevel + filledFuel),
        });

        this.notifier.notify(source, "Bạn đã ~g~sử dụng~s~ một can xăng.", 'success');
    }

    public async useKeroseneJerrycan(
        source: number,
        item: CommonItem,
        inventoryItem: InventoryItem,
        inventory: Inventory
    ) {
        const closestVehicle = await this.vehicleSpawner.getClosestVehicle(source);

        if (!closestVehicle) {
            this.notifier.notify(source, 'Không có phương tiện nào ở gần');

            return;
        }

        if (closestVehicle.isInside) {
            this.notifier.notify(source, "Bạn không thể sử dụng vật phẩm này khi đang ở trong xe", 'error');

            return;
        }

        const vehicleType = GetVehicleType(closestVehicle.vehicleEntityId);

        if (
            vehicleType !== 'heli' &&
            vehicleType !== 'plane' &&
            vehicleType !== 'boat' &&
            vehicleType !== 'submarine'
        ) {
            this.notifier.notify(source, 'Bạn không thể sử dụng loại nhiên liệu này cho phương tiện này', 'error');

            return;
        }

        const vehModel = await this.vehicleRepository.findByHash(GetEntityModel(closestVehicle.vehicleEntityId));
        const maxFuel = getVehicleMaxFuelStorage(vehModel);

        const vehicleState = this.vehicleStateService.getVehicleState(closestVehicle.vehicleNetworkId);

        if (!inventory.removeAtSlot(inventoryItem.slot, 1)) {
            return;
        }

        const { progress } = await this.progressService.progress(
            source,
            'fuel_jerrycan_kerosene',
            'Đang nạp nhiên liệu cho xe...',
            10000,
            {
                dictionary: 'timetable@gardener@filling_can',
                name: 'gar_ig_5_filling_can',
            },
            {
                disableMovement: true,
                disableCarMovement: true,
                disableCombat: true,
                disableMouse: false,
            }
        );

        const amount = {
            kerozene_jerrycan_low: 20,
            kerosene_jerrycan: 30,
        }[item.name];
        const filledFuel = Math.round(progress * amount);

        this.vehicleStateService.updateVehicleCondition(closestVehicle.vehicleNetworkId, {
            fuelLevel: Math.min(maxFuel, vehicleState.condition.fuelLevel + filledFuel),
        });

        this.notifier.notify(source, 'Bạn đã ~g~sử dụng~s~ một can dầu hỏa.', 'success');
    }

    public async useOilJerrycan(source: number, item: CommonItem, inventoryItem: InventoryItem, inventory: Inventory) {
        const closestVehicle = await this.vehicleSpawner.getClosestVehicle(source);

        if (!closestVehicle) {
            this.notifier.notify(source, 'Không có phương tiện nào ở gần');

            return;
        }

        if (isVehicleModelElectric(GetEntityModel(closestVehicle.vehicleEntityId))) {
            this.notifier.notify(source, "Phương tiện này không cần nhớt, nó là xe điện!", 'error');

            return;
        }

        if (closestVehicle.isInside) {
            this.notifier.notify(source, "Bạn không thể sử dụng vật phẩm này khi đang ở trong xe", 'error');

            return;
        }

        const vehicleState = this.vehicleStateService.getVehicleState(closestVehicle.vehicleNetworkId);

        if (!inventory.removeAtSlot(inventoryItem.slot, 1)) {
            return;
        }

        const { progress } = await this.progressService.progress(
            source,
            'oil_jerrycan_kerosene',
            'Đang nạp nhiên liệu cho xe...',
            10000,
            {
                dictionary: 'timetable@gardener@filling_can',
                name: 'gar_ig_5_filling_can',
            },
            {
                disableMovement: true,
                disableCarMovement: true,
                disableCombat: true,
                disableMouse: false,
            }
        );

        const filledOil = Math.round(progress * (100 - vehicleState.condition.oilLevel));

        this.vehicleStateService.updateVehicleCondition(closestVehicle.vehicleNetworkId, {
            oilLevel: Math.min(vehicleState.condition.oilLevel + filledOil, 100),
        });

        this.notifier.notify(source, "Bạn đã ~g~sử dụng~s~ một bình nhớt động cơ.", 'success');
    }

    public async usePortableBattery(
        source: number,
        item: CommonItem,
        inventoryItem: InventoryItem,
        inventory: Inventory
    ) {
        const closestVehicle = await this.vehicleSpawner.getClosestVehicle(source);

        if (!closestVehicle) {
            this.notifier.notify(source, 'Không có phương tiện nào ở gần');

            return;
        }

        if (!isVehicleModelElectric(GetEntityModel(closestVehicle.vehicleEntityId))) {
            this.notifier.notify(source, "Phương tiện này không phải là xe chạy điện", 'error');
            return;
        }

        const vehModel = await this.vehicleRepository.findByHash(GetEntityModel(closestVehicle.vehicleEntityId));
        const maxFuel = getVehicleMaxFuelStorage(vehModel);

        const vehicleState = this.vehicleStateService.getVehicleState(closestVehicle.vehicleNetworkId);

        if (!inventory.removeAtSlot(inventoryItem.slot, 1)) {
            return;
        }

        const { progress } = await this.progressService.progress(
            source,
            'recharger_battery',
            'Đang sạc pin cho xe...',
            10000,
            {
                dictionary: 'timetable@gardener@filling_can',
                name: 'gar_ig_5_filling_can',
            },
            {
                disableMovement: true,
                disableCarMovement: true,
                disableCombat: true,
                disableMouse: false,
            }
        );

        const filledFuel = Math.round(progress * BATTERY_FUEL_AMOUNT);

        this.vehicleStateService.updateVehicleCondition(closestVehicle.vehicleNetworkId, {
            fuelLevel: Math.min(maxFuel, vehicleState.condition.fuelLevel + filledFuel),
        });

        this.notifier.notify(source, 'Bạn đã ~g~sạc~s~ ắc quy/pin của phương tiện.', 'success');
    }

    @Once()
    public async onStart() {
        this.item.setItemUseCallback('essence_jerrycan', this.useEssenceJerrycan.bind(this));
        this.item.setItemUseCallback('essence_jerrycan_low', this.useEssenceJerrycan.bind(this));
        this.item.setItemUseCallback('kerosene_jerrycan', this.useKeroseneJerrycan.bind(this));
        this.item.setItemUseCallback('kerozene_jerrycan_low', this.useKeroseneJerrycan.bind(this));
        this.item.setItemUseCallback('oil_jerrycan', this.useOilJerrycan.bind(this));
        this.item.setItemUseCallback('car_portable_battery', this.usePortableBattery.bind(this));
    }
}
