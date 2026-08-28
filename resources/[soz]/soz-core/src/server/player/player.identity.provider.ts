import { PlayerData } from '@public/shared/player';

import { OnEvent } from '../../core/decorators/event';
import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { ClientEvent, ServerEvent } from '../../shared/event';
import { InventoryCard } from '../../shared/inventory';
import { CardType } from '../../shared/nui/card';
import { PlayerService } from './player.service';

@Provider()
export class PlayerIdentityProvider {
    @Inject(PlayerService)
    private playerService: PlayerService;

    @OnEvent(ServerEvent.PLAYER_SHOW_IDENTITY)
    public showIdentity(source, type: CardType, targets: number[], player: PlayerData, accountId?: string) {
        for (const target of targets) {
            if (target !== source) {
                TriggerClientEvent(ClientEvent.PLAYER_SHOW_IDENTITY, target, type, player, accountId);
            }
        }
    }

    @OnEvent(ServerEvent.PLAYER_OPEN_WALLET)
    public async openPlayerWallet(source: number) {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        const cards: InventoryCard[] = [
            {
                type: 'identity',
                label: "Căn cước công dân",
                description: "Thẻ căn cước công dân của bạn tại bang San Andreas. Đừng làm mất nhé!",
            },
            {
                type: 'license',
                label: 'Bằng lái xe',
                description: 'Bằng lái xe của bạn, hãy lái xe cẩn thận và đừng để bị trừ điểm..',
            },
            {
                type: 'health',
                label: 'Thẻ y tế',
                description: 'Thẻ bảo hiểm y tế xuất trình tại trung tâm y tế San Andreas.',
            },
            {
                type: 'bank',
                label: 'Thẻ ngân hàng',
                description: 'Thẻ ngân hàng STONK cá nhân của bạn.',
                iban: player.charinfo.account,
            },
        ];

        if (player.metadata.casino_vip_premium_subscription_expire_at > Date.now()) {
            cards.push({
                type: 'casino_premium',
                label: 'VIP Premium',
                description: 'Thẻ VIP Premium Casino của bạn',
                expiration: player.metadata.casino_vip_premium_subscription_expire_at,
                point: player.metadata.casino_vip_point ?? 0,
            });
        } else if (player.metadata.casino_vip_standard_subscription_expire_at > Date.now()) {
            cards.push({
                type: 'casino_standard',
                label: 'VIP Tiêu chuẩn',
                description: 'Thẻ VIP Tiêu chuẩn Casino của bạn',
                expiration: player.metadata.casino_vip_standard_subscription_expire_at,
                point: player.metadata.casino_vip_point ?? 0,
            });
        }

        TriggerClientEvent(ClientEvent.INVENTORY_OPEN_WALLET, source, cards);
    }
}
