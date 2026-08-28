import { OnEvent } from '@public/core/decorators/event';
import { ClientEvent, ServerEvent } from '@public/shared/event';

import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { Rpc } from '../../core/decorators/rpc';
import { Tick } from '../../core/decorators/tick';
import { Logger } from '../../core/logger';
import { wait } from '../../core/utils';
import { BankMoneyType } from '../../shared/bank';
import { Feature } from '../../shared/features';
import {
    ADD_ERROR_MESSAGE,
    INVENTORY_ITEM_CREATORS,
    InventoryItem,
    InventorySort,
    InventoryType,
    isInventoryItemExpired,
    MERGE_ERROR_MESSAGE,
} from '../../shared/inventory';
import { getDistance, Vector3 } from '../../shared/polyzone/vector';
import { getRandomInt } from '../../shared/random';
import { isErr, isOk } from '../../shared/result';
import { RpcServerEvent } from '../../shared/rpc';
import { FeatureProvider } from '../feature/feature.provider';
import { ItemService } from '../item/item.service';
import { LockBinService } from '../job/bluebird/lock.bin.service';
import { Monitor } from '../monitor/monitor';
import { Notifier } from '../notifier';
import { PermissionService } from '../permission.service';
import { PlayerMoneyService } from '../player/player.money.service';
import { PlayerService } from '../player/player.service';
import { Inventory } from './inventory';
import { InventoryFactory } from './inventory.factory';
import { InventoryPositionChecker } from './inventory.position.checker';

/**
 * Exposition of some methods from the InventoryManager to the clients
 */
@Provider()
export class InventoryProvider {
    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(LockBinService)
    private lockBinService: LockBinService;

    @Inject(ItemService)
    private itemService: ItemService;

    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(PlayerMoneyService)
    private playerMoneyService: PlayerMoneyService;

    @Inject(InventoryPositionChecker)
    private inventoryPositionChecker: InventoryPositionChecker;

    @Inject(Monitor)
    private monitor: Monitor;

    @Inject(PermissionService)
    private permissionService: PermissionService;

    @Inject(Logger)
    private logger: Logger;

    @Inject(FeatureProvider)
    private featureProvider: FeatureProvider;

    @Tick()
    public async populateInventories() {
        if (this.featureProvider.isFeatureEnabled(Feature.WhatIfSecondEpisode)) {
            return;
        }

        for (const [, inventory] of this.inventoryFactory.getLoadedInventories().entries()) {
            await this.regenerateInventory(inventory);
        }

        await wait(getRandomInt(1, 3) * 3600 * 1000);
    }

    private async regenerateInventory(inventory: Inventory) {
        const createConfig = INVENTORY_ITEM_CREATORS[inventory.type()];
        if (!createConfig) {
            return;
        }

        for (const itemName of Object.keys(createConfig)) {
            const creatorConfig = createConfig[itemName];
            const shouldCreate = getRandomInt(0, 100) <= creatorConfig.chance;

            if (!shouldCreate) {
                continue;
            }

            const amount = getRandomInt(creatorConfig.min, creatorConfig.max);

            for (let i = 0; i < amount; i++) {
                inventory.add(itemName, 1);
            }
        }

        await inventory.observe();
    }

    @Rpc(RpcServerEvent.BIN_IS_NOT_LOCKED)
    public isBinLock(source: number, id: string) {
        return !this.lockBinService.isLock(id);
    }

    @Rpc(RpcServerEvent.INVENTORY_GET_ITEM_COUNT)
    public async getItemCount(source: number, storageId: string, itemId: string) {
        const inventory = await this.inventoryFactory.get(storageId);

        return inventory.getItemCount(itemId);
    }

    @OnEvent(ServerEvent.INVENTORY_REMOVE_PLAYER_ITEM)
    public async onRemoveItem(source: number, item: string, amount: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory) {
            return;
        }

        inventory.remove(item, amount);
    }

    @OnEvent(ServerEvent.INVENTORY_ITEM_SHOW)
    public async onShow(source: number, target: number, inventoryId: string, slotId: number) {
        const inventory = await this.inventoryFactory.get(inventoryId);

        const invItem = inventory.getItemAtSlot(slotId);

        if (invItem) {
            this.itemService.executeShowCallback(source, target, invItem);
        }
    }

    @OnEvent(ServerEvent.INVENTORY_GIVE_MONEY)
    public async onGiveMoney(source: number, targetId: number, amount: number, moneyPriority: BankMoneyType) {
        const player = this.playerService.getPlayer(source);
        const target = this.playerService.getPlayer(targetId);

        if (!player || !target) {
            return;
        }

        if (amount <= 0) {
            return;
        }

        const playerPosition = GetEntityCoords(GetPlayerPed(source)) as Vector3;
        const targetPosition = GetEntityCoords(GetPlayerPed(targetId)) as Vector3;

        if (getDistance(playerPosition, targetPosition) > 2) {
            this.notifier.error(source, "Không có ai ở gần bạn");

            return;
        }

        let moneyToGive = 0;
        let markedMoneyToGive = 0;

        const moneyAmount = this.playerMoneyService.get(source, 'money');
        const markedMoneyAmount = this.playerMoneyService.get(source, 'marked_money');

        if (amount > markedMoneyAmount + moneyAmount) {
            this.notifier.error(source, "Bạn không có đủ tiền");

            return;
        }

        if (moneyPriority === 'money') {
            moneyToGive = Math.min(amount, moneyAmount);
            markedMoneyToGive = amount - moneyToGive;
        } else {
            markedMoneyToGive = Math.min(amount, markedMoneyAmount);
            moneyToGive = amount - markedMoneyToGive;
        }

        this.playerMoneyService.remove(source, moneyToGive, 'money');
        this.playerMoneyService.remove(source, markedMoneyToGive, 'marked_money');

        this.playerMoneyService.add(targetId, moneyToGive, 'money');
        this.playerMoneyService.add(targetId, markedMoneyToGive, 'marked_money');

        this.notifier.notify(source, `Bạn đã đưa ~r~$${amount}~s~`);
        this.notifier.notify(targetId, `Bạn đã nhận ~g~$${amount}~s~`);

        this.monitor.traceEvent('give_money', {
            player_source: source,
            target_source: targetId,
            money: moneyToGive,
            money_marked: markedMoneyToGive,
            money_type: moneyPriority,
        });

        TriggerClientEvent(ClientEvent.ANIMATION_GIVE, source);
        TriggerClientEvent(ClientEvent.ANIMATION_GIVE, targetId);
    }

    @Rpc(RpcServerEvent.INVENTORY_TRANSFER_MONEY)
    public async onTransferMoney(source: number, sourceInventoryId: string, targetInventoryId: string, amount: number) {
        const sourceInventory = await this.inventoryFactory.get(sourceInventoryId);
        const targetInventory = await this.inventoryFactory.get(targetInventoryId);

        if (!sourceInventory || !targetInventory) {
            this.notifier.error(source, "Không thể chuyển tiền vào túi đồ này");

            return null;
        }

        const sourceCitizenId = sourceInventory.getPlayerCitizenId();
        const targetCitizenId = targetInventory.getPlayerCitizenId();

        if (!sourceCitizenId || !targetCitizenId) {
            this.notifier.error(source, "Không thể chuyển tiền vào túi đồ này");

            return null;
        }

        const player = this.playerService.getPlayerByCitizenId(sourceCitizenId);
        const target = this.playerService.getPlayerByCitizenId(targetCitizenId);

        if (!player || !target) {
            this.notifier.error(source, "Không thể chuyển tiền vào túi đồ này");

            return null;
        }

        if (amount <= 0) {
            return null;
        }

        const playerPosition = GetEntityCoords(GetPlayerPed(player.source)) as Vector3;
        const targetPosition = GetEntityCoords(GetPlayerPed(target.source)) as Vector3;

        if (getDistance(playerPosition, targetPosition) > 2) {
            this.notifier.error(source, "Không có ai ở gần bạn");

            return null;
        }

        let moneyToGive = 0;
        let markedMoneyToGive = 0;

        const moneyAmount = this.playerMoneyService.get(player.source, 'money');
        const markedMoneyAmount = this.playerMoneyService.get(player.source, 'marked_money');

        if (amount > markedMoneyAmount + moneyAmount) {
            this.notifier.error(source, "Không đủ tiền");

            return null;
        }

        moneyToGive = Math.min(amount, moneyAmount);
        markedMoneyToGive = amount - moneyToGive;

        this.playerMoneyService.remove(player.source, moneyToGive, 'money');
        this.playerMoneyService.remove(player.source, markedMoneyToGive, 'marked_money');

        this.playerMoneyService.add(target.source, moneyToGive, 'money');
        this.playerMoneyService.add(target.source, markedMoneyToGive, 'marked_money');

        this.notifier.notify(player.source, `Bạn đã đưa ~r~$${amount}~s~`);
        this.notifier.notify(target.source, `Bạn đã nhận ~g~$${amount}~s~`);

        this.monitor.traceEvent('transfer_money', {
            player_source: source === player.source ? source : target.source,
            target_source: source === player.source ? target.source : source,
            money: moneyToGive,
            money_marked: markedMoneyToGive,
            money_type: 'money_and_marked',
        });

        // we wait because we don't know if qbcore has already updated the money so let's wait some ticks
        await wait(100);

        if (source === player.source) {
            const refreshedTargetPlayer = this.playerService.getPlayerByCitizenId(targetCitizenId);

            return refreshedTargetPlayer.money.money + refreshedTargetPlayer.money.marked_money;
        }

        const refreshedTargetPlayer = this.playerService.getPlayerByCitizenId(sourceCitizenId);

        return refreshedTargetPlayer.money.money + refreshedTargetPlayer.money.marked_money;
    }

    @OnEvent(ServerEvent.INVENTORY_DROP_ITEM)
    public async onDropItem(source: number, inventoryId: string, inventoryItemSlot: number) {
        const inventory = await this.inventoryFactory.get(inventoryId);

        if (!inventory) {
            return;
        }

        if (!this.inventoryPositionChecker.checkPlayerDistance(source, inventoryId)) {
            this.notifier.error(source, "Bạn không ở trong phạm vi của túi đồ.");

            return;
        }

        const inventoryItem = inventory.getItemAtSlot(inventoryItemSlot);

        if (!inventoryItem) {
            this.notifier.error(source, "Bạn chưa vứt vật phẩm nào.");

            return;
        }

        if (!inventory.removeAtSlot(inventoryItem.slot, inventoryItem.amount)) {
            this.notifier.error(source, "Bạn chưa vứt vật phẩm nào.");

            return;
        }

        const item = this.itemService.getItem(inventoryItem.name);

        this.notifier.notify(
            source,
            `Bạn đã vứt ~o~${inventoryItem.amount} ~b~${item?.label || inventoryItem.name}~s~`
        );

        TriggerClientEvent(ClientEvent.ANIMATION_GIVE, source);
    }

    @OnEvent(ServerEvent.INVENTORY_MOVE_ITEM)
    public async onMoveItem(
        source: number,
        sourceInventoryId: string,
        sourceSlot: number,
        targetInventoryId: string,
        targetSlot: number | null,
        amount: number | null
    ) {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        const playerInventoryId = `player_${player.citizenid}`;
        const playerClothingInventoryId = `player_clothing_${player.citizenid}`;
        const sourceInventory = await this.inventoryFactory.get(sourceInventoryId);
        const targetInventory = await this.inventoryFactory.get(targetInventoryId);

        if (!sourceInventory || !targetInventory) {
            return;
        }

        const sourceItem = sourceInventory.getItemAtSlot(sourceSlot);

        if (!sourceItem) {
            return;
        }

        if (
            !this.inventoryPositionChecker.checkPlayerDistance(source, sourceInventoryId) ||
            !this.inventoryPositionChecker.checkPlayerDistance(source, targetInventoryId)
        ) {
            this.notifier.error(source, "Bạn không ở trong phạm vi của túi đồ.");

            return;
        }
        if (!amount) {
            amount = sourceItem.amount;
        }

        if (sourceItem.amount < amount) {
            this.notifier.error(source, 'Số lượng quá lớn.');

            return;
        }

        if (
            sourceInventory.id !== playerClothingInventoryId &&
            (sourceInventory.id !== targetInventory.id || sourceInventory.id !== playerInventoryId)
        ) {
            TriggerClientEvent(ClientEvent.ANIMATION_GIVE, source);
        }

        // 1. Case : no target item, simply move item if possible
        if (!targetSlot) {
            await this.moveItem(source, sourceInventory, targetInventory, sourceItem, amount, targetSlot);

            return;
        }

        // 2. case : try to merge items
        const mergeResult = targetInventory.merge(
            targetSlot,
            sourceItem,
            amount,
            sourceInventory.id === targetInventory.id
        );

        if (isOk(mergeResult)) {
            sourceInventory.removeAtSlot(sourceSlot, mergeResult.ok);
            await sourceInventory.observe();
            await targetInventory.observe();

            if (sourceInventory.id !== targetInventory.id) {
                this.notifyMoveItem(source, sourceInventory, targetInventory, sourceItem, mergeResult.ok);

                this.monitor.traceEvent('merge_item', {
                    player_source: source,
                    item_id: sourceItem.name,
                    amount,
                    inventory_source_id: sourceInventory.id,
                    inventory_target_id: targetInventory.id,
                    item_slot: targetSlot,
                });
            }

            return;
        }

        const error = mergeResult.err;

        if (error === 'no_item_to_merge') {
            await this.moveItem(source, sourceInventory, targetInventory, sourceItem, amount, targetSlot);

            return;
        }

        // 4. Case we swap items
        if (error === 'cannot_merge') {
            const targetItem = targetInventory.getItemAtSlot(targetSlot);

            if (!targetItem) {
                return;
            }

            if (targetInventory.id !== sourceInventory.id) {
                if (
                    !sourceInventory.canSwapItems(
                        [
                            {
                                name: sourceItem.name,
                                amount,
                                metadata: sourceItem.metadata,
                            },
                        ],
                        [
                            {
                                name: targetItem.name,
                                amount: targetItem.amount,
                                metadata: targetItem.metadata,
                            },
                        ]
                    )
                ) {
                    this.notifier.error(source, 'Không thể mang theo vật phẩm này');

                    return;
                }

                if (
                    !targetInventory.canSwapItems(
                        [
                            {
                                name: targetItem.name,
                                amount: targetItem.amount,
                                metadata: targetItem.metadata,
                            },
                        ],
                        [
                            {
                                name: sourceItem.name,
                                amount,
                                metadata: sourceItem.metadata,
                            },
                        ]
                    )
                ) {
                    this.notifier.error(source, 'Không đủ chỗ để đổi vật phẩm.');

                    return;
                }

                // Check onlyone
                const sourceItemDef = this.itemService.getItem(sourceItem.name);
                const targetItemDef = this.itemService.getItem(targetItem.name);

                if (
                    sourceItemDef?.onlyone &&
                    targetInventory.hasEnoughItem(sourceItem.name, 1, false) &&
                    targetItem.name !== sourceItem.name &&
                    targetInventory.type() === InventoryType.Player
                ) {
                    this.notifier.error(source, "Bạn chỉ có thể mang ~r~duy nhất một món~s~ vật phẩm này.");

                    return;
                }

                if (
                    targetItemDef?.onlyone &&
                    sourceInventory.hasEnoughItem(targetItem.name, 1, false) &&
                    targetItem.name !== sourceItem.name &&
                    sourceInventory.type() === InventoryType.Player
                ) {
                    this.notifier.error(source, "Bạn chỉ có thể mang ~r~duy nhất một món~s~ vật phẩm này.");

                    return;
                }

                if (
                    targetInventory.id !== sourceInventory.id &&
                    (targetItemDef.notGiveable || sourceItemDef.notGiveable) &&
                    !this.permissionService.isStaff(source)
                ) {
                    this.notifier.error(source, 'Bạn không thể ~r~chuyển giao~s~ vật phẩm này.');

                    return 0;
                }

                if (
                    ((targetInventory.type() !== InventoryType.Player && sourceItem.metadata?.notStorable) ||
                        (sourceInventory.type() !== InventoryType.Player && targetItem.metadata?.notStorable)) &&
                    !this.permissionService.isStaff(source)
                ) {
                    this.notifier.error(source, 'Bạn không thể ~r~cất giữ~s~ vật phẩm này.');

                    return 0;
                }
            }

            sourceInventory.removeAtSlot(sourceItem.slot, amount);
            targetInventory.removeAtSlot(targetItem.slot, targetItem.amount);

            const targetResult = targetInventory.add(sourceItem.name, amount, sourceItem.metadata, targetSlot, true);

            if (isErr(targetResult)) {
                this.notifier.error(source, ADD_ERROR_MESSAGE[targetResult.err]);

                this.logger.error(
                    `Error while adding item to target inventory : ${ADD_ERROR_MESSAGE[targetResult.err]} from ${sourceInventory.id} to ${targetInventory.id}, item: ${sourceItem.name}, amount: ${amount}, metadata: ${JSON.stringify(sourceItem.metadata)}`
                );

                sourceInventory.add(sourceItem.name, amount, sourceItem.metadata, null, true);
                targetInventory.add(targetItem.name, targetItem.amount, targetItem.metadata, null, true);

                return;
            }

            const sourceResult = sourceInventory.add(
                targetItem.name,
                targetItem.amount,
                targetItem.metadata,
                sourceSlot,
                true
            );

            if (isErr(sourceResult)) {
                this.notifier.error(source, ADD_ERROR_MESSAGE[sourceResult.err]);

                this.logger.error(
                    `Error while adding item to source inventory : ${ADD_ERROR_MESSAGE[sourceResult.err]} from ${targetInventory.id} to ${sourceInventory.id}, item: ${targetItem.name}, amount: ${targetItem.amount}, metadata: ${JSON.stringify(targetItem.metadata)}`
                );

                targetInventory.remove(sourceItem.name, amount, true, sourceItem.metadata);
                targetInventory.add(targetItem.name, targetItem.amount, targetItem.metadata, null, true);
                sourceInventory.add(sourceItem.name, amount, sourceItem.metadata, null, true);

                return;
            }

            await sourceInventory.observe(); // Force refresh of the inventory
            await targetInventory.observe(); // Force refresh of the inventory

            const sourceItemDef = this.itemService.getItem(sourceItem.name);
            const targetItemDef = this.itemService.getItem(targetItem.name);

            if (targetInventory.id !== sourceInventory.id) {
                let targetPlayerId = null;

                if (playerInventoryId === sourceInventory.id && targetInventory.getPlayerCitizenId()) {
                    targetPlayerId = targetInventory.getPlayerCitizenId();
                } else if (playerInventoryId === targetInventory.id && sourceInventory.getPlayerCitizenId()) {
                    targetPlayerId = sourceInventory.getPlayerCitizenId();
                }

                if (targetPlayerId) {
                    const targetPlayer = this.playerService.getPlayerByCitizenId(targetPlayerId);

                    if (targetPlayer) {
                        this.notifier.notify(
                            targetPlayer.source,
                            `Bạn đã nhận đổi ~o~${targetItem.amount} ~b~${targetItemDef?.label || targetItem.name}~s~ lấy ~o~${amount} ~b~${sourceItemDef?.label || sourceItem.name}~s~`
                        );
                    }
                }

                this.monitor.traceEvent('move_item', {
                    player_source: source,
                    item_id: sourceItem.name,
                    amount,
                    inventory_source_id: sourceInventory.id,
                    inventory_target_id: targetInventory.id,
                    item_slot: targetResult.ok.slot,
                });

                this.monitor.traceEvent('move_item', {
                    player_source: source,
                    item_id: targetItem.name,
                    amount: targetItem.amount,
                    inventory_source_id: targetInventory.id,
                    inventory_target_id: sourceInventory.id,
                    item_slot: sourceResult.ok.slot,
                });
            }

            return;
        }

        this.notifier.error(source, MERGE_ERROR_MESSAGE[error]);
    }

    @OnEvent(ServerEvent.INVENTORY_SORT)
    public async onSort(source: number, inventoryId: string, sort: InventorySort) {
        const inventory = await this.inventoryFactory.get(inventoryId);

        if (!inventory) {
            return;
        }

        if (!this.inventoryPositionChecker.checkPlayerDistance(source, inventoryId)) {
            this.notifier.error(source, "Bạn không ở trong phạm vi của túi đồ.");

            return;
        }

        inventory.sort(sort);
        await inventory.observe();
    }

    @OnEvent(ServerEvent.INVENTORY_USE_ITEM)
    public async onUseItem(source: number, inventoryId: string, slot: number) {
        const inventory = await this.inventoryFactory.get(inventoryId);

        if (!inventory) {
            return;
        }

        if (!this.inventoryPositionChecker.checkPlayerDistance(source, inventoryId)) {
            this.notifier.error(source, "Bạn không ở trong phạm vi của túi đồ.");

            return;
        }

        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        const inventoryItem = inventory.getItemAtSlot(slot);

        if (!inventoryItem) {
            return;
        }

        if (player.metadata.isdead || player.metadata.ishandcuffed || player.metadata.inlaststand) {
            return;
        }

        if (inventoryItem.type === 'weapon') {
            if (isInventoryItemExpired(inventoryItem)) {
                const item = this.itemService.getItem(inventoryItem.name);
                this.notifier.notify(source, `${item.label} đã hết hạn sử dụng.`, 'error');
                return;
            }

            TriggerClientEvent(ClientEvent.WEAPON_USE_WEAPON, source, inventoryItem);
        } else {
            await this.itemService.useItem(source, inventoryItem, inventory);
        }

        await inventory.observe();

        this.monitor.traceEvent('use_item', {
            player_source: source,
            item_id: inventoryItem.name,
            inventory_id: inventoryId,
        });
    }

    @OnEvent(ServerEvent.INVENTORY_FORCE_CONSUME)
    public async onForceConsume(source: number, inventoryId: string, inventoryItem: InventoryItem) {
        const inventory = await this.inventoryFactory.get(inventoryId);

        if (!inventory) {
            return;
        }

        if (!this.inventoryPositionChecker.checkPlayerDistance(source, inventoryId)) {
            this.notifier.error(source, "Bạn không ở trong phạm vi của túi đồ.");

            return;
        }

        if (inventory.type() !== InventoryType.Player) {
            return;
        }

        const citizenId = inventoryId.replace('player_', '');
        const target = this.playerService.getPlayerByCitizenId(citizenId);

        if (!target) {
            return;
        }

        if (target.metadata.isdead || target.metadata.inlaststand) {
            this.notifier.error(source, "Người chơi đang ở trạng thái không thể sử dụng vật phẩm.");

            return;
        }

        await this.itemService.useItem(target.source, inventoryItem, inventory);

        const itemObject = this.itemService.getItem(inventoryItem.name);

        this.notifier.notify(
            source,
            `Bạn đã ép người chơi sử dụng ~b~${itemObject.label || inventoryItem.name}~s~`
        );

        this.notifier.notify(
            target.source,
            `Bạn bị ép buộc phải sử dụng ~b~${itemObject.label || inventoryItem.name}~s~`
        );

        await inventory.observe();

        this.monitor.traceEvent('force_consume', {
            player_source: source,
            target_source: target.source,
            item_id: inventoryItem.name,
            inventory_id: inventoryId,
        });
    }

    @OnEvent(ServerEvent.INVENTORY_RENAME_ITEM)
    public async onRenameItem(source: number, inventoryId: string, slot: number, label: string | null) {
        const inventory = await this.inventoryFactory.get(inventoryId);

        if (!inventory) {
            return;
        }

        if (!this.inventoryPositionChecker.checkPlayerDistance(source, inventoryId)) {
            this.notifier.error(source, "Bạn không ở trong phạm vi của túi đồ.");

            return;
        }

        const inventoryItem = inventory.getItemAtSlot(slot);

        if (!inventoryItem) {
            return;
        }

        inventory.updateMetadataAtSlot(slot, {
            label,
        });

        this.notifier.notify(source, `Bạn đã gắn nhãn ~g~${label}~s~`);

        await inventory.observe();
    }

    public async engraveItem(
        source: number,
        inventory: Inventory,
        inventoryItem: InventoryItem,
        label: string,
        price: number = 0
    ) {
        inventory.removeAtSlot(inventoryItem.slot, 1);
        inventory.add(inventoryItem.name, 1, {
            label,
        });

        const itemObject = this.itemService.getItem(inventoryItem.name);
        this.notifier.notify(
            source,
            `Bạn đã khắc lên ~b~${itemObject.label}~s~ dòng chữ ~b~${label}~s~ với giá ~g~$${price}~s~ !`
        );

        await inventory.observe();
    }

    @OnEvent(ServerEvent.INVENTORY_GIVE_ITEM)
    public async onGiveItem(source: number, target: number, inventoryId: string, slot: number, amount: number) {
        const sourceInventory = await this.inventoryFactory.get(inventoryId);

        if (!sourceInventory) {
            return;
        }

        const sourceItem = sourceInventory.getItemAtSlot(slot);

        if (!sourceItem) {
            return;
        }

        const targetInventory = await this.inventoryFactory.getPlayerInventory(target);

        if (!targetInventory) {
            return;
        }

        if (
            !this.inventoryPositionChecker.checkPlayerDistance(source, sourceInventory.id) ||
            !this.inventoryPositionChecker.checkPlayerDistance(source, targetInventory.id)
        ) {
            this.notifier.error(source, "Bạn không ở trong phạm vi của túi đồ.");

            return;
        }

        if (targetInventory.id === sourceInventory.id) {
            this.notifier.error(source, "Bạn không thể tự đưa đồ cho chính mình.");

            return;
        }

        const amountMoved = await this.moveItem(source, sourceInventory, targetInventory, sourceItem, amount);

        if (amountMoved <= 0) {
            return;
        }

        TriggerClientEvent(ClientEvent.ANIMATION_GIVE, source);
        TriggerClientEvent(ClientEvent.ANIMATION_GIVE, target);
    }

    private async moveItem(
        source: number,
        sourceInventory: Inventory,
        targetInventory: Inventory,
        sourceItem: InventoryItem,
        amount: number,
        targetSlot?: number
    ) {
        if (
            sourceInventory.id !== targetInventory.id &&
            !targetInventory.canCarryItem(sourceItem.name, amount, sourceItem.metadata)
        ) {
            while (amount > 0 && !targetInventory.canCarryItem(sourceItem.name, amount, sourceItem.metadata)) {
                amount -= 1;
            }

            if (amount === 0) {
                this.notifier.error(source, ADD_ERROR_MESSAGE['not_enough_space']);

                return 0;
            }
        }

        const itemObject = this.itemService.getItem(sourceItem.name);

        if (
            targetInventory.type() === InventoryType.PlayerClothing &&
            targetInventory.hasEnoughItem(sourceItem.name, 1, false)
        ) {
            this.notifier.error(source, "Bạn chỉ có thể mang ~r~duy nhất một món~s~ vật phẩm này.");

            return 0;
        }

        if (
            itemObject?.onlyone &&
            sourceInventory.id !== targetInventory.id &&
            targetInventory.hasEnoughItem(sourceItem.name, 1, false) &&
            targetInventory.type() === InventoryType.Player
        ) {
            this.notifier.error(source, "Bạn chỉ có thể mang ~r~duy nhất một món~s~ vật phẩm này.");

            return 0;
        }

        if (
            targetInventory.id !== sourceInventory.id &&
            itemObject.notGiveable &&
            !this.permissionService.isStaff(source)
        ) {
            this.notifier.error(source, 'Bạn không thể ~r~chuyển giao~s~ vật phẩm này.');

            return 0;
        }

        if (
            targetInventory.type() !== InventoryType.Player &&
            sourceItem.metadata?.notStorable &&
            !this.permissionService.isStaff(source)
        ) {
            this.notifier.error(source, 'Bạn không thể ~r~cất giữ~s~ vật phẩm này.');

            return 0;
        }

        if (!sourceInventory.removeAtSlot(sourceItem.slot, amount)) {
            this.notifier.error(source, "Không thể lấy vật phẩm khỏi túi đồ.");

            return 0;
        }

        const addResult = targetInventory.add(
            sourceItem.name,
            amount,
            sourceItem.metadata,
            targetSlot,
            sourceInventory.id === targetInventory.id
        );

        if (isErr(addResult)) {
            this.notifier.error(source, ADD_ERROR_MESSAGE[addResult.err]);

            this.logger.error(
                `Error while adding item to target inventory : ${ADD_ERROR_MESSAGE[addResult.err]} from ${sourceInventory.id} to ${targetInventory.id}, item: ${sourceItem.name}, amount: ${amount}, metadata: ${JSON.stringify(sourceItem.metadata)}`
            );

            sourceInventory.add(sourceItem.name, amount, sourceItem.metadata, null, true);

            return 0;
        }

        if (targetInventory.id !== sourceInventory.id) {
            this.monitor.traceEvent('transfer_item', {
                player_source: source,
                item_id: sourceItem.name,
                amount,
                inventory_source_id: sourceInventory.id,
                inventory_target_id: targetInventory.id,
                item_slot: addResult.ok.slot,
            });

            this.notifyMoveItem(source, sourceInventory, targetInventory, sourceItem, amount);
        }

        await sourceInventory.observe(); // Force refresh of the inventory
        await targetInventory.observe(); // Force refresh of the inventory

        return amount;
    }

    private notifyMoveItem(
        source: number,
        sourceInventory: Inventory,
        targetInventory: Inventory,
        sourceItem: InventoryItem,
        amount: number
    ) {
        if (sourceInventory.id === targetInventory.id) {
            return;
        }

        const itemObject = this.itemService.getItem(sourceItem.name);
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        const playerInventoryId = `player_${player.citizenid}`;

        if (playerInventoryId === sourceInventory.id) {
            if (targetInventory.getPlayerCitizenId()) {
                const targetPlayer = this.playerService.getPlayerByCitizenId(targetInventory.getPlayerCitizenId());

                if (targetPlayer) {
                    this.notifier.notify(
                        targetPlayer.source,
                        `Bạn đã nhận được ~o~${amount} ~b~${itemObject.label || sourceItem.name}~s~`
                    );
                }
            }
        }

        if (playerInventoryId === targetInventory.id) {
            if (sourceInventory.getPlayerCitizenId()) {
                const targetPlayer = this.playerService.getPlayerByCitizenId(sourceInventory.getPlayerCitizenId());

                if (targetPlayer) {
                    this.notifier.notify(
                        targetPlayer.source,
                        `Bạn đã bị lấy đi ~o~${amount} ~b~${itemObject.label || sourceItem.name}~s~`
                    );
                }
            }
        }
    }
}
