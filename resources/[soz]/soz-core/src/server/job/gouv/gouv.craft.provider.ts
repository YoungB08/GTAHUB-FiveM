import { OnEvent } from '@core/decorators/event';
import { Inject } from '@core/decorators/injectable';
import { Provider } from '@core/decorators/provider';
import { InventoryFactory } from '@public/server/inventory/inventory.factory';
import { Notifier } from '@public/server/notifier';
import { PlayerMoneyService } from '@public/server/player/player.money.service';
import { ClientEvent, ServerEvent } from '@public/shared/event';
import { SEARCH_WARRANT_PRICE } from '@public/shared/job/gouv';

@Provider()
export class GouvCraftProvider {
    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(PlayerMoneyService)
    private playerMoneyService: PlayerMoneyService;

    @Inject(Notifier)
    private notifier: Notifier;

    @OnEvent(ServerEvent.GOUV_CRAFT_SEARCH_WARRANT)
    public async craftSearchWarrant(source: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);
        if (!inventory.canCarryItem('search_warrant')) {
            this.notifier.notify(source, 'Bạn không thể mang thêm số lượng này...', 'error');
            return;
        }

        if (!inventory.remove('paper')) {
            this.notifier.error(source, `Bạn không có tờ giấy nào.`);
            return;
        }

        if (!(await this.playerMoneyService.buy(source, SEARCH_WARRANT_PRICE, null))) {
            this.notifier.notify(source, `Bạn không có đủ tiền.`, 'error');
            return;
        }

        TriggerClientEvent(ClientEvent.ANIMATION_GIVE, source);
        inventory.add('search_warrant', 1);
        this.notifier.notify(source, `Bạn đã soạn ~g~1~s~ ~b~lệnh khám xét~s~.`, 'success');
        this.notifier.notify(
            source,
            `Lệnh khám xét cho phép lực lượng thực thi pháp luật và Mandatory quyền tiếp cận nơi ở trong vòng ~g~2~s~ giờ.`,
            'success'
        );
    }
}
