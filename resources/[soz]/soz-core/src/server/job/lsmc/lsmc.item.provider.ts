import { Inject } from '@core/decorators/injectable';
import { Provider } from '@core/decorators/provider';
import { Once, OnEvent } from '@public/core/decorators/event';
import { Rpc } from '@public/core/decorators/rpc';
import { InventoryFactory } from '@public/server/inventory/inventory.factory';
import { ItemService } from '@public/server/item/item.service';
import { Notifier } from '@public/server/notifier';
import { PlayerService } from '@public/server/player/player.service';
import { PlayerStateService } from '@public/server/player/player.state.service';
import { ProgressService } from '@public/server/player/progress.service';
import { VehicleStateService } from '@public/server/vehicle/vehicle.state.service';
import { ClientEvent, ServerEvent } from '@public/shared/event';
import { Item } from '@public/shared/item';
import { StretcherFoldedModel, StretcherModel, WheelChairModel } from '@public/shared/job/lsmc';
import { RpcServerEvent } from '@public/shared/rpc';

import { ADD_ERROR_MESSAGE, InventoryItem, isInventoryItemExpired } from '../../../shared/inventory';
import { Inventory } from '../../inventory/inventory';

@Provider()
export class LSMCItemProvider {
    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(ItemService)
    private item: ItemService;

    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(PlayerStateService)
    private playerStateService: PlayerStateService;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(VehicleStateService)
    private vehicleStateService: VehicleStateService;

    private usedMorphine = new Set<string>();

    @Once()
    public async onInit() {
        this.item.setItemUseCallback('tissue', this.useTissue.bind(this));
        this.item.setItemUseCallback('antibiotic', this.useAntibiotic.bind(this));
        //this.item.setItemUseCallback('pommade', this.usePommade.bind(this));
        this.item.setItemUseCallback('ifaks', this.useIfaks.bind(this));
        this.item.setItemUseCallback('painkiller', this.usePainkiller.bind(this));
        this.item.setItemUseCallback('stretcher', this.useStretcher.bind(this));
        this.item.setItemUseCallback('wheelchair', this.useWheelChair.bind(this));
        this.item.setItemUseCallback('naloxone', this.useNaloxone.bind(this));
        this.item.setItemUseCallback('morphine', this.useMorphine.bind(this));
    }

    private async useTissue(source: number, _item: Item, inventoryItem: InventoryItem, inventory: Inventory) {
        const player = this.playerService.getPlayer(source);

        if (inventory.removeAtSlot(inventoryItem.slot, 1)) {
            if (player.metadata.disease == 'rhume') {
                this.notifier.notify(source, 'Bạn dùng khăn giấy và cảm thấy dễ chịu hơn!');
                this.playerService.setPlayerDisease(source, false);
            } else {
                this.notifier.notify(source, 'Bạn dùng khăn giấy, nhưng không có gì xảy ra!');
            }
        }
    }

    private async useAntibiotic(source: number, _item: Item, inventoryItem: InventoryItem, inventory: Inventory) {
        const player = this.playerService.getPlayer(source);

        if (inventory.removeAtSlot(inventoryItem.slot, 1)) {
            if (player.metadata.disease == 'intoxication') {
                this.notifier.notify(source, 'Bạn dùng thuốc kháng sinh và cảm thấy dễ chịu hơn!');
                this.playerService.setPlayerDisease(source, false);
            } else {
                this.notifier.notify(source, 'Bạn dùng thuốc kháng sinh, nhưng tình trạng không thay đổi!');
            }
        }
    }

    private async usePainkiller(source: number, _item: Item, inventoryItem: InventoryItem, inventory: Inventory) {
        const player = this.playerService.getPlayer(source);

        if (inventory.removeAtSlot(inventoryItem.slot, 1)) {
            if (player.metadata.disease == 'backpain') {
                this.notifier.notify(source, 'Bạn dùng thuốc giảm đau và cảm thấy dễ chịu hơn!');
                this.playerService.setPlayerDisease(source, false);
            } else {
                this.notifier.notify(source, 'Bạn dùng thuốc giảm đau, nhưng không đỡ hơn!');
            }
        }
    }

    private async useIfaks(source: number, _item: Item, inventoryItem: InventoryItem) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.removeAtSlot(inventoryItem.slot, 1)) {
            return;
        }

        this.playerService.setPlayerMetaDatas(source, {
            hunger: 100,
            thirst: 100,
        });

        TriggerClientEvent(ClientEvent.LSMC_HEAL, source, 100);
    }

    private async useStretcher(source: number, _item: Item, inventoryItem: InventoryItem, inventory: Inventory) {
        const { completed } = await this.progressService.progress(
            source,
            'use_stretcher',
            'Đang mở cáng cứu thương...',
            3000,
            {
                dictionary: 'mp_common',
                name: 'givetake2_a',
                blendInSpeed: 8.0,
                blendOutSpeed: 8.0,
                options: {
                    enablePlayerControl: true,
                    onlyUpperBody: true,
                },
            },
            {}
        );

        if (!completed) {
            return;
        }

        if (inventory.removeAtSlot(inventoryItem.slot, 1)) {
            TriggerClientEvent(ClientEvent.LSMC_STRETCHER_USE, source);
        }
    }

    @OnEvent(ServerEvent.LSMC_STRETCHER_RETRIEVE)
    public async onStretcherRetrieve(source: number, netId: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.canCarryItem('stretcher', 1)) {
            this.notifier.notify(source, ADD_ERROR_MESSAGE['not_enough_space'], 'error');
            return;
        }

        const entity = NetworkGetEntityFromNetworkId(netId);
        if (!DoesEntityExist(entity) || ![StretcherModel, StretcherFoldedModel].includes(GetEntityModel(entity))) {
            return;
        }

        DeleteEntity(entity);
        inventory.add('stretcher', 1);

        this.notifier.notify(source, 'Bạn đã nhặt lại cáng cứu thương');
    }

    @OnEvent(ServerEvent.LSMC_STRETCHER_PUT_ON)
    public onPutOnStretcher(source: number, netId: number) {
        const playerState = this.playerStateService.getClientState(source);
        if (!playerState || !playerState.isEscorting || !playerState.escorting) {
            return;
        }

        const player = this.playerService.getPlayer(source);
        const target = this.playerService.getPlayer(playerState.escorting);

        if (player && target && player != target) {
            this.playerStateService.setClientState(target.source, { isEscorted: false });
            this.playerStateService.setClientState(player.source, { isEscorting: false, escorting: null });
            TriggerClientEvent(ClientEvent.LSMC_STRETCHER_PUT_ON, target.source, netId);
        }
    }

    @OnEvent(ServerEvent.LSMC_STRETCHER_ON_AMBULANCE)
    public onAmbulanceStretcher(
        source: number,
        target: number,
        netId: number,
        vehNetId: number,
        newStretcherNetID: number
    ) {
        const entity = NetworkGetEntityFromNetworkId(netId);
        if (!DoesEntityExist(entity) || GetEntityModel(entity) != StretcherModel) {
            return;
        }

        DeleteEntity(entity);

        this.vehicleStateService.updateVehicleVolatileState(vehNetId, {
            ambulanceAttachedStretcher: newStretcherNetID,
        });

        if (target) {
            TriggerClientEvent(ClientEvent.LSMC_STRETCHER_PUT_ON, target, newStretcherNetID);
        }
    }

    @OnEvent(ServerEvent.LSMC_STRETCHER_RETRIEVE_AMBULANCE)
    public onAmbulanceretrieveStretcher(
        source: number,
        target: number,
        netId: number,
        vehNetId: number,
        newStretcherNetID: number
    ) {
        const entity = NetworkGetEntityFromNetworkId(netId);
        if (!DoesEntityExist(entity) || GetEntityModel(entity) != StretcherFoldedModel) {
            return;
        }

        DeleteEntity(entity);

        this.vehicleStateService.updateVehicleVolatileState(vehNetId, {
            ambulanceAttachedStretcher: null,
        });

        if (target) {
            TriggerClientEvent(ClientEvent.LSMC_STRETCHER_PUT_ON, target, newStretcherNetID);
        }
    }

    @Rpc(RpcServerEvent.LSMC_STRETCHER_AMBULANCE_STATUS)
    public getAmbulanceStretcherStatus(source: number, vehicleNetworkId: number) {
        return this.vehicleStateService.getVehicleState(vehicleNetworkId).volatile.ambulanceAttachedStretcher;
    }

    private async useWheelChair(source: number, _item: Item, inventoryItem: InventoryItem, inventory: Inventory) {
        const { completed } = await this.progressService.progress(
            source,
            'use_wheelchair',
            'Vous dépliez la chaise roulante...',
            3000,
            {
                dictionary: 'mp_common',
                name: 'givetake2_a',
                blendInSpeed: 8.0,
                blendOutSpeed: 8.0,
                options: {
                    enablePlayerControl: true,
                    onlyUpperBody: true,
                },
            },
            {}
        );

        if (!completed) {
            return;
        }

        if (inventory.removeAtSlot(inventoryItem.slot, 1)) {
            TriggerClientEvent(ClientEvent.LSMC_WHEELCHAIR_USE, source);
        }
    }

    @OnEvent(ServerEvent.LSMC_WHEELCHAIR_RETRIEVE)
    public async onWheelChairRetrieve(source: number, netId: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.canCarryItem('wheelchair', 1)) {
            this.notifier.notify(source, ADD_ERROR_MESSAGE['not_enough_space'], 'error');
            return;
        }

        const entity = NetworkGetEntityFromNetworkId(netId);
        if (!DoesEntityExist(entity) || GetEntityModel(entity) != WheelChairModel) {
            return;
        }

        DeleteEntity(entity);
        inventory.add('wheelchair', 1);

        this.notifier.notify(source, 'Bạn đã nhặt lại xe lăn');
    }

    public async useNaloxone(
        source: number,
        item: Item,
        inventoryItem: InventoryItem,
        inventory: Inventory
    ): Promise<void> {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        const progress = await this.progressService.progress(
            source,
            'use_naloxone',
            'Đang tiêm Naloxone...',
            10000,
            {
                name: 'miranda_shooting_up',
                dictionary: 'rcmpaparazzo1ig_4',
                options: {
                    onlyUpperBody: true,
                },
                playbackRate: 0.4,
            },
            {
                firstProp: {
                    model: 'prop_syringe_01',
                    bone: 28422,
                    coords: { x: 0.0, y: 0.0, z: -0.045 },
                    rotation: { x: 0, y: 0, z: 0 },
                },
            }
        );

        if (!progress.completed) {
            return;
        }

        this.playerService.setPlayerMetadata(source, 'drug', Math.max(0, player.metadata.drug - 50));
        inventory.removeAtSlot(inventoryItem.slot, 1);

        this.notifier.notify(
            source,
            'Bạn đã tự tiêm một liều ~g~Naloxone~s~, cơn nghiện đã được giải trừ.'
        );
    }

    @OnEvent(ServerEvent.LSMC_NALOXONE)
    public async onNaloxone(source: number, target: number) {
        const { completed } = await this.progressService.progress(
            source,
            'use_naloxone',
            'Đang tiêm Naloxone...',
            10000,
            {
                name: 'miranda_shooting_up',
                dictionary: 'rcmpaparazzo1ig_4',
                options: {
                    onlyUpperBody: true,
                },
                playbackRate: 0.4,
            },
            {
                firstProp: {
                    model: 'prop_syringe_01',
                    bone: 28422,
                    coords: { x: 0.0, y: 0.0, z: -0.045 },
                    rotation: { x: 0, y: 0, z: 0 },
                },
            }
        );

        if (!completed) {
            return;
        }

        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.remove('naloxone', 1, false)) {
            return;
        }

        const targetPlayer = this.playerService.getPlayer(target);
        this.playerService.setPlayerMetadata(target, 'drug', Math.max(0, targetPlayer.metadata.drug - 50));

        this.notifier.notify(source, 'Bạn đã tiêm một liều ~g~Naloxone~s~ cho bệnh nhân.');
        this.notifier.notify(target, 'Bạn đã nhận một liều ~g~Naloxone~s~, cơn nghiện đã được giải trừ.');
    }

    public async useMorphine(
        source: number,
        item: Item,
        inventoryItem: InventoryItem,
        inventory: Inventory
    ): Promise<void> {
        await this.onMorphine(source, source, inventoryItem, inventory);
    }

    @OnEvent(ServerEvent.LSMC_MORPHINE)
    public async onMorphine(source: number, target: number, item: InventoryItem, inventory: Inventory | null) {
        const player = this.playerService.getPlayer(target);

        if (!player) {
            return;
        }

        if (!inventory) {
            inventory = await this.inventoryFactory.getPlayerInventory(source);
        }

        if (!item) {
            item = inventory.findItem(item => item.name == 'morphine' && !isInventoryItemExpired(item));

            if (!item) {
                return;
            }
        }

        const { completed } = await this.progressService.progress(
            source,
            'use_naloxone',
            'Đang tiêm Morphine...',
            10000,
            {
                name: 'miranda_shooting_up',
                dictionary: 'rcmpaparazzo1ig_4',
                options: {
                    onlyUpperBody: true,
                },
                playbackRate: 0.4,
            },
            {
                firstProp: {
                    model: 'prop_syringe_01',
                    bone: 28422,
                    coords: { x: 0.0, y: 0.0, z: -0.045 },
                    rotation: { x: 0, y: 0, z: 0 },
                },
            }
        );

        if (!completed) {
            return;
        }

        if (!inventory) {
            inventory = await this.inventoryFactory.getPlayerInventory(source);
        }

        if (!inventory.removeAtSlot(item.slot, 1)) {
            return;
        }

        this.playerService.incrementMetadata(target, 'drug', 10, 0, 110);

        if (this.usedMorphine.has(player.citizenid)) {
            this.notifier.notify(source, 'Bạn đã sử dụng morphine trước đó rồi.', 'error');
        } else {
            this.playerService.incrementMetadata(target, 'stress_level', -20, 0, 100);
            this.usedMorphine.add(player.citizenid);
        }

        if (target != source) {
            this.notifier.notify(source, 'Bạn đã tiêm một liều ~g~Morphine~s~ cho bệnh nhân.');
            this.notifier.notify(target, 'Bạn đã nhận một liều ~g~Morphine~s~.');
        } else {
            this.notifier.notify(source, 'Bạn đã tự tiêm một liều ~g~Morphine~s~.');
        }
    }
}
