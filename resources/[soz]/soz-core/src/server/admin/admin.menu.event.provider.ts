import { OnEvent } from '../../core/decorators/event';
import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { ServerEvent } from '../../shared/event/server';
import { ItemService } from '../item/item.service';
import { Notifier } from '../notifier';
import { PermissionService } from '../permission.service';
import { WorldEventRepository } from '../repository/world.event.repository';

@Provider()
export class AdminMenuEventProvider {
    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(WorldEventRepository)
    private worldEventRepository: WorldEventRepository;

    @Inject(ItemService)
    private itemService: ItemService;

    @Inject(PermissionService)
    private permissionService: PermissionService;

    @OnEvent(ServerEvent.ADMIN_EVENT_CREATE)
    public async createEvent(source: number, name: string): Promise<void> {
        if (!this.permissionService.isHelper(source)) {
            return;
        }

        const event = await this.worldEventRepository.addEvent(name);

        this.notifier.notify(source, `Đã tạo sự kiện ${event.name}`);
    }

    @OnEvent(ServerEvent.ADMIN_EVENT_DELETE)
    public async removeEvent(source: number, eventId: string): Promise<void> {
        if (!this.permissionService.isHelper(source)) {
            return;
        }

        const event = await this.worldEventRepository.remove(eventId);

        this.notifier.notify(source, `Đã xóa sự kiện ${event.name}`);
    }

    @OnEvent(ServerEvent.ADMIN_EVENT_ADD_REWARD)
    public async addReward(
        source: number,
        eventId: string,
        itemId: string,
        chance: number,
        min: number,
        max: number
    ): Promise<void> {
        if (!this.permissionService.isHelper(source)) {
            return;
        }

        const item = this.itemService.getItem(itemId);

        if (!item) {
            this.notifier.notify(source, `Vật phẩm ${itemId} không tồn tại`, 'error');

            return;
        }

        const existingEvent = await this.worldEventRepository.getEvent(eventId);

        if (!existingEvent) {
            this.notifier.notify(source, `Sự kiện ${eventId} không tồn tại`, 'error');

            return;
        }

        const event = await this.worldEventRepository.addReward(eventId, {
            item: item.name,
            chance,
            min,
            max,
        });

        this.notifier.notify(source, `Đã thêm phần thưởng ${item.label} vào sự kiện ${event.name}`);
    }

    @OnEvent(ServerEvent.ADMIN_EVENT_REMOVE_REWARD)
    public async removeReward(source: number, eventId: string, index: number): Promise<void> {
        if (!this.permissionService.isHelper(source)) {
            return;
        }

        const existingEvent = await this.worldEventRepository.getEvent(eventId);

        if (!existingEvent) {
            this.notifier.notify(source, `Sự kiện ${eventId} không tồn tại`, 'error');

            return;
        }

        const itemId = await this.worldEventRepository.removeReward(eventId, index);

        this.notifier.notify(source, `Đã xóa phần thưởng ${itemId} khỏi sự kiện ${existingEvent.name}`);
    }

    @OnEvent(ServerEvent.ADMIN_EVENT_SET_REWARD_CHANCE)
    public async setRewardChance(source: number, eventId: string, index: number, chance: number): Promise<void> {
        if (!this.permissionService.isHelper(source)) {
            return;
        }

        const existingEvent = await this.worldEventRepository.getEvent(eventId);

        if (!existingEvent) {
            this.notifier.notify(source, `Sự kiện ${eventId} không tồn tại`, 'error');

            return;
        }

        const itemId = await this.worldEventRepository.setRewardChance(eventId, index, chance);

        this.notifier.notify(
            source,
            `Phần thưởng ${itemId} của sự kiện ${existingEvent.name} hiện có tỷ lệ rơi là ${chance}%`
        );
    }

    @OnEvent(ServerEvent.ADMIN_EVENT_SET_REWARD_MIN)
    public async setRewardMin(source: number, eventId: string, index: number, min: number): Promise<void> {
        if (!this.permissionService.isHelper(source)) {
            return;
        }

        const existingEvent = await this.worldEventRepository.getEvent(eventId);

        if (!existingEvent) {
            this.notifier.notify(source, `Sự kiện ${eventId} không tồn tại`, 'error');

            return;
        }

        const itemId = await this.worldEventRepository.setRewardMin(eventId, index, min);

        this.notifier.notify(
            source,
            `Phần thưởng ${itemId} của sự kiện ${existingEvent.name} hiện có số lượng tối thiểu là ${min}`
        );
    }

    @OnEvent(ServerEvent.ADMIN_EVENT_SET_REWARD_MAX)
    public async setRewardMax(source: number, eventId: string, index: number, max: number): Promise<void> {
        if (!this.permissionService.isHelper(source)) {
            return;
        }

        const existingEvent = await this.worldEventRepository.getEvent(eventId);

        if (!existingEvent) {
            this.notifier.notify(source, `Sự kiện ${eventId} không tồn tại`, 'error');

            return;
        }

        const itemId = await this.worldEventRepository.setRewardMax(eventId, index, max);

        this.notifier.notify(
            source,
            `Phần thưởng ${itemId} của sự kiện ${existingEvent.name} hiện có số lượng tối đa là ${max}`
        );
    }

    @OnEvent(ServerEvent.ADMIN_EVENT_SET_START_SOUND)
    public async setStartSound(source: number, eventId: string, startSound: string | null): Promise<void> {
        if (!this.permissionService.isHelper(source)) {
            return;
        }

        const existingEvent = await this.worldEventRepository.getEvent(eventId);

        if (!existingEvent) {
            this.notifier.notify(source, `Sự kiện ${eventId} không tồn tại`, 'error');

            return;
        }

        await this.worldEventRepository.setStartSound(eventId, startSound);

        if (startSound) {
            this.notifier.notify(
                source,
                `Sự kiện ${existingEvent.name} hiện có âm thanh bắt đầu: ${startSound}`
            );
        } else {
            this.notifier.notify(source, `Sự kiện ${existingEvent.name} hiện không còn âm thanh bắt đầu`);
        }
    }
}
