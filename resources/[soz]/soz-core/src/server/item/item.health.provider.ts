import { InventoryFactory } from '@public/server/inventory/inventory.factory';

import { Once, OnEvent } from '../../core/decorators/event';
import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { ServerEvent } from '../../shared/event';
import { ADD_ERROR_MESSAGE, InventoryItem } from '../../shared/inventory';
import { CommonItem } from '../../shared/item';
import { isErr } from '../../shared/result';
import { Inventory } from '../inventory/inventory';
import { Notifier } from '../notifier';
import { PlayerDiseaseProvider } from '../player/player.disease.provider';
import { PlayerService } from '../player/player.service';
import { ProgressService } from '../player/progress.service';
import { ItemService } from './item.service';

@Provider()
export class ItemHealthProvider {
    @Inject(ItemService)
    private item: ItemService;

    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(PlayerDiseaseProvider)
    private diseaseService: PlayerDiseaseProvider;

    private usedAntiDepressant = new Set<string>();

    public async useFlaskPee(source: number, item: CommonItem, inventoryItem: InventoryItem, inventory: Inventory) {
        if (!inventory.removeAtSlot(inventoryItem.slot, 1)) {
            return;
        }

        const { completed } = await this.progressService.progress(source, 'pee_in_flask', '', 5000, {
            name: 'peeing_loop',
            dictionary: 'misscarsteal2peeing',
            flags: 0,
        });

        if (!completed) {
            return;
        }

        const result = inventory.add(
            'flask_pee_full',
            1,
            {
                player: source,
            },
            null
        );

        if (isErr(result)) {
            this.notifier.notify(source, 'Không thể làm đầy lọ: ' + (ADD_ERROR_MESSAGE[result.err] || result.err), 'error');
        } else {
            this.notifier.notify(source, "Lọ đã được đổ đầy đến giọt cuối cùng", 'success');
        }
    }

    private async useAntidepressant(
        source: number,
        item: CommonItem,
        inventoryItem: InventoryItem,
        inventory: Inventory
    ) {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        if (this.usedAntiDepressant.has(player.citizenid)) {
            this.notifier.notify(source, 'Bạn đã dùng thuốc chống trầm cảm rồi.', 'error');

            return;
        }

        if (!inventory.removeAtSlot(inventoryItem.slot, 1)) {
            return;
        }

        this.usedAntiDepressant.add(player.citizenid);
        this.playerService.incrementMetadata(source, 'stress_level', -40, 0, 100);

        this.notifier.notify(
            source,
            "Bạn cảm thấy hoàn toàn thư giãn. Tinh thần thật sảng khoái và thoải mái.",
            'success'
        );
    }

    @OnEvent(ServerEvent.LSMC_BLOOD_FILL_FLASK)
    public async useFlaskBlood(source: number, target: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        if (!inventory.remove('flask_blood_empty', 1)) {
            return;
        }

        const { completed } = await this.progressService.progress(
            source,
            'take_blood',
            'Đang lấy mẫu máu...',
            5000,
            {
                task: 'CODE_HUMAN_MEDIC_TEND_TO_DEAD',
            }
        );

        if (!completed) {
            return;
        }

        const result = inventory.add(
            'flask_blood_full',
            1,
            {
                player: target,
            },
            null
        );

        if (isErr(result)) {
            this.notifier.notify(source, 'Không thể làm đầy lọ: ' + (ADD_ERROR_MESSAGE[result.err] || result.err), 'error');
        } else {
            this.notifier.notify(source, "Lọ đã được đổ đầy đến giọt cuối cùng", 'success');
        }
    }

    public async useAntiacide(source: number, item: CommonItem, inventoryItem: InventoryItem, inventory: Inventory) {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        if (!inventory.removeAtSlot(inventoryItem.slot, 1)) {
            return;
        }

        if (player.metadata.disease === 'dyspepsie') {
            this.diseaseService.setPlayerDisease(source, false);
            this.notifier.notify(source, 'Bạn cảm thấy bớt đầy hơi, dễ chịu hơn.', 'success');
        } else {
            this.notifier.notify(
                source,
                "Bạn vẫn tự hỏi tại sao mình vừa uống loại thuốc này?",
                'error'
            );
        }
    }

    @Once()
    public onStart() {
        this.item.setItemUseCallback('flask_pee_empty', this.useFlaskPee.bind(this));
        this.item.setItemUseCallback('antidepressant', this.useAntidepressant.bind(this));
        this.item.setItemUseCallback('antiacide', this.useAntiacide.bind(this));
    }
}
