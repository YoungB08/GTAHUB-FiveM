import { InventoryFactory } from '@public/server/inventory/inventory.factory';

import { Once, OnceStep, OnEvent } from '../../../core/decorators/event';
import { Inject } from '../../../core/decorators/injectable';
import { Provider } from '../../../core/decorators/provider';
import { Logger } from '../../../core/logger';
import { ClientEvent, ServerEvent } from '../../../shared/event';
import { JobPermission, JobType } from '../../../shared/job';
import { StonkConfig } from '../../../shared/job/stonk';
import { NamedZone } from '../../../shared/polyzone/box.zone';
import { isOk } from '../../../shared/result';
import { BankService } from '../../bank/bank.service';
import { FieldProvider } from '../../field/field.provider';
import { ItemService } from '../../item/item.service';
import { JobService } from '../../job.service';
import { Notifier } from '../../notifier';
import { PlayerService } from '../../player/player.service';
import { ProgressService } from '../../player/progress.service';

@Provider()
export class StonkDeliveryProvider {
    @Inject(ItemService)
    private itemService: ItemService;

    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(BankService)
    private bankService: BankService;

    @Inject(FieldProvider)
    private fieldService: FieldProvider;

    @Inject(JobService)
    private jobService: JobService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(Logger)
    private logger: Logger;

    private fieldIdentifier = 'stonk_delivery';

    private getLiveryLocation(): NamedZone {
        const locationId = Math.trunc(new Date().getHours() % StonkConfig.delivery.location.length);
        return StonkConfig.delivery.location[locationId];
    }

    @Once(OnceStep.RepositoriesLoaded)
    public async onInit() {
        await this.fieldService.createField({
            identifier: this.fieldIdentifier,
            owner: JobType.CashTransfer,
            item: StonkConfig.delivery.item,
            capacity: 0,
            maxCapacity: 8,
            refill: {
                delay: 60 * 60 * 1000,
                amount: 1,
            },
            harvest: {
                delay: 0,
                amount: 1,
            },
        });

        this.itemService.setItemUseCallback(StonkConfig.delivery.item, this.useSecureContainer.bind(this));
    }

    public async useSecureContainer(source: number) {
        if (this.playerService.getPlayer(source).job.id !== JobType.CashTransfer) {
            return;
        }

        TriggerClientEvent(ClientEvent.STONK_DELIVER_LOCATION, source, this.getLiveryLocation());
    }

    @OnEvent(ServerEvent.STONK_DELIVERY_TAKE)
    public async onTake(source: number) {
        const [playerJob, playerJobGrade] = this.playerService.getPlayerJobAndGrade(source);

        if (
            !(await this.jobService.hasTargetJobPermission(
                JobType.CashTransfer,
                playerJob,
                playerJobGrade,
                JobPermission.CashTransfer_CollectSecure
            ))
        ) {
            this.notifier.notify(source, `Bạn không có quyền hạn cần thiết.`, 'error');
            return;
        }

        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.canCarryItem(StonkConfig.delivery.item, 1)) {
            this.notifier.notify(source, `Túi đồ của bạn không có đủ chỗ trống.`, 'error');
            return false;
        }

        const { completed } = await this.progressService.progress(
            source,
            'stonk_delivery',
            'Đang lấy thùng hàng...',
            StonkConfig.delivery.duration,
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

        const harvest = await this.fieldService.harvestField(this.fieldIdentifier, 1);

        if (!harvest) {
            this.notifier.notify(source, `Không còn thùng hàng nào để lấy.`, 'error');
            return false;
        }

        const addRequest = inventory.add(StonkConfig.delivery.item, 1);
        if (isOk(addRequest)) {
            this.notifier.notify(source, `Bạn đã ~g~lấy~s~ một thùng hàng.`);
        } else {
            this.notifier.notify(source, `Không thể ~r~lấy~s~ thùng hàng.`, 'error');
        }
    }

    @OnEvent(ServerEvent.STONK_DELIVERY_END)
    public async onEnd(source: number, location: NamedZone) {
        const currentLocation = this.getLiveryLocation();

        if (location.name !== currentLocation.name) {
            this.notifier.notify(source, `Bạn đang không ở đúng địa điểm giao hàng.`, 'error');
            return false;
        }

        const { completed } = await this.progressService.progress(
            source,
            'stonk_delivery',
            'Đang giao thùng hàng...',
            StonkConfig.delivery.duration,
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

        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (inventory.remove(StonkConfig.delivery.item, 1, false)) {
            this.notifier.notify(source, `Bạn đã ~g~giao~s~ một thùng hàng.`);

            const transfer = await this.bankService.transferFarmMoney(
                source,
                StonkConfig.bankAccount.farm,
                StonkConfig.bankAccount.safe,
                StonkConfig.delivery.society_gain
            );
            if (!transfer) {
                this.logger.error(
                    `Failed to transfer money to safe: ${JSON.stringify({
                        account_source: StonkConfig.bankAccount.farm,
                        account_destination: StonkConfig.bankAccount.safe,
                        amount: StonkConfig.delivery.society_gain,
                    })}`
                );
            }
        } else {
            this.notifier.notify(source, `Không thể ~r~giao~s~ thùng hàng.`, 'error');
        }
    }
}
