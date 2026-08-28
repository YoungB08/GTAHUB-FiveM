import { Provider } from '@public/core/decorators/provider';

import { OnEvent } from '../../../core/decorators/event';
import { Inject } from '../../../core/decorators/injectable';
import { Rpc } from '../../../core/decorators/rpc';
import { Tick, TickInterval } from '../../../core/decorators/tick';
import { ClientEvent } from '../../../shared/event/client';
import { ServerEvent } from '../../../shared/event/server';
import { RpcServerEvent } from '../../../shared/rpc';
import { InventoryFactory } from '../../inventory/inventory.factory';
import { Notifier } from '../../notifier';
import { StateGlobalProvider } from '../../store/state.global.provider';

const PROCESSING_DURATION = 300_000;

@Provider()
export class PawlProcessingProvider {
    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(StateGlobalProvider)
    private stateGlobalProvider: StateGlobalProvider;

    @Inject(Notifier)
    private notifier: Notifier;

    private enabled = false;

    private startedAt = null;

    @Rpc(RpcServerEvent.PAWL_IS_PROCESSING_ENABLED)
    async isProcessingEnabled() {
        return this.enabled;
    }

    @OnEvent(ServerEvent.PAWL_PROCESSING_START)
    async onStartProcessing(source: number) {
        if (this.enabled) {
            this.notifier.notify(source, 'Một quy trình chế biến đang diễn ra.', 'error');

            return;
        }

        const plankInventory = await this.inventoryFactory.get('pawl_plank_storage');
        const sawdustInventory = await this.inventoryFactory.get('pawl_sawdust_storage');

        if (!plankInventory || !sawdustInventory) {
            this.notifier.notify(source, 'Không tìm thấy kho chứa.', 'error');

            return;
        }

        if (!plankInventory.canCarryItem('wood_plank', 30)) {
            this.notifier.error(source, 'Kho chứa ván gỗ đã đầy!');

            return;
        }

        if (!sawdustInventory.canCarryItem('sawdust', 60)) {
            this.notifier.error(source, 'Kho chứa mùn cưa đã đầy!');

            return;
        }

        this.enabled = true;
        this.startedAt = Date.now();

        this.notifier.notify(source, 'Quy trình chế biến ~g~bắt đầu~s~.', 'success');

        TriggerLatentClientEvent(ClientEvent.PAWL_SYNC_PROCESSING, -1, 16 * 1024, true);
    }

    @OnEvent(ServerEvent.PAWL_PROCESSING_STOP)
    async onStopProcessing(source: number) {
        if (!this.enabled) {
            this.notifier.notify(source, "Không có quy trình chế biến nào đang hoạt động.", 'error');

            return;
        }

        this.disableProcessing();

        this.notifier.notify(source, 'Quy trình chế biến đã dừng.', 'success');
    }

    @OnEvent(ServerEvent.PAWL_PROCESSING_STATUS)
    async onProcessingStatus(source: number) {
        if (this.enabled) {
            const end = this.startedAt + PROCESSING_DURATION;
            const remaining = end - Date.now();

            if (remaining > 0) {
                const remainingSeconds = Math.round(remaining / 1000);
                const remainingMinutes = Math.floor(remainingSeconds / 60);
                const remainingSecondsFormatted = remainingSeconds % 60;

                if (remainingMinutes === 0) {
                    this.notifier.notify(
                        source,
                        `Còn lại ${remainingSecondsFormatted} giây trước khi kết thúc xẻ gỗ.`,
                        'info'
                    );
                } else {
                    this.notifier.notify(
                        source,
                        `Còn lại ${remainingMinutes} phút ${remainingSecondsFormatted} giây trước khi kết thúc xẻ gỗ.`,
                        'info'
                    );
                }

                return;
            }
        }

        this.notifier.notify(source, "Không có quy trình chế biến nào đang hoạt động.", 'info');
    }

    @Tick(TickInterval.EVERY_SECOND)
    async processing() {
        if (!this.enabled) {
            return;
        }

        const globalState = this.stateGlobalProvider.getGlobalState();

        if (globalState.blackoutLevel > 3 || globalState.blackout) {
            this.disableProcessing();

            return;
        }

        const now = Date.now();
        const remaining = this.startedAt + PROCESSING_DURATION - now;

        if (remaining > 0) {
            return;
        }

        const processingStorage = await this.inventoryFactory.get('pawl_log_processing');

        if (!processingStorage.remove('tree_trunk', 3)) {
            this.disableProcessing();

            return;
        }

        const plankInventory = await this.inventoryFactory.get('pawl_plank_storage');
        const sawdustInventory = await this.inventoryFactory.get('pawl_sawdust_storage');

        plankInventory.add('wood_plank', 30);
        sawdustInventory.add('sawdust', 60);

        if (processingStorage.hasEnoughItem('tree_trunk', 3)) {
            this.startedAt = Date.now();

            return;
        }

        this.disableProcessing();
    }

    private disableProcessing() {
        this.enabled = false;
        this.startedAt = null;

        TriggerLatentClientEvent(ClientEvent.PAWL_SYNC_PROCESSING, -1, 16 * 1024, false);
    }
}
