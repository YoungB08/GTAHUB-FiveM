import { SWAT_ITEM_TYPE } from '@public/shared/job/police';

import { OnEvent, OnNuiEvent } from '../../core/decorators/event';
import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { emitRpc } from '../../core/rpc';
import { wait } from '../../core/utils';
import { ClientEvent, NuiEvent } from '../../shared/event';
import { MenuType } from '../../shared/nui/menu';
import { Err, Ok } from '../../shared/result';
import { RpcServerEvent } from '../../shared/rpc';
import { WeaponAttachment } from '../../shared/weapons/attachment';
import { WeaponMk2TintColorChoices, WeaponTintColorChoices } from '../../shared/weapons/tint';
import { WeaponConfiguration } from '../../shared/weapons/weapon';
import { AnimationService } from '../animation/animation.service';
import { InventoryManager } from '../inventory/inventory.manager';
import { ItemService } from '../item/item.service';
import { Notifier } from '../notifier';
import { InputService } from '../nui/input.service';
import { NuiMenu } from '../nui/nui.menu';
import { PlayerService } from '../player/player.service';
import { WeaponDrawingProvider } from './weapon.drawing.provider';
import { WeaponHolsterProvider } from './weapon.holster.provider';
import { WeaponService } from './weapon.service';

@Provider()
export class WeaponGunsmithProvider {
    @Inject(NuiMenu)
    private nuiMenu: NuiMenu;

    @Inject(WeaponService)
    private weaponService: WeaponService;

    @Inject(InputService)
    private inputService: InputService;

    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(InventoryManager)
    private inventoryManager: InventoryManager;

    @Inject(ItemService)
    private itemService: ItemService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(AnimationService)
    private animationService: AnimationService;

    @Inject(WeaponHolsterProvider)
    private weaponHolsterProvider: WeaponHolsterProvider;

    @Inject(WeaponDrawingProvider)
    private weaponDrawingProvider: WeaponDrawingProvider;

    @OnEvent(ClientEvent.WEAPON_OPEN_GUNSMITH)
    async openGunsmith(admin = false) {
        const weapons = this.inventoryManager
            .getItems()
            .filter(item => item.type === 'weapon' && item.metadata?.type !== SWAT_ITEM_TYPE);
        const coords = GetEntityCoords(PlayerPedId(), true);

        if (weapons.length === 0) {
            this.notifier.notify('Bạn không mang theo vũ khí nào trên người', 'info');
            return;
        }

        await this.weaponService.clear();
        this.weaponDrawingProvider.onUseWeapon(null);

        this.nuiMenu.openMenu(
            MenuType.GunSmith,
            {
                weapons: weapons,
                tints: weapons.map(weapon => {
                    return {
                        slot: weapon.slot,
                        tints: weapon.name.includes('mk2') ? WeaponMk2TintColorChoices : WeaponTintColorChoices,
                    };
                }),
                attachments: weapons.map(weapon => {
                    return {
                        slot: weapon.slot,
                        attachments: this.weaponService.getWeaponConfig(weapon.name)?.attachments ?? [],
                    };
                }),
                admin,
            },
            {
                position: {
                    position: [coords[0], coords[1], coords[2]],
                    distance: 5.0,
                },
            }
        );
    }
    @OnNuiEvent<{ menuType: MenuType }>(NuiEvent.MenuClosed)
    public async resetGunSmith({ menuType }) {
        if (menuType !== MenuType.GunSmith) {
            return;
        }

        this.animationService.stop();
        await this.weaponService.clear();
        this.weaponDrawingProvider.onUseWeapon(null);

        this.playerService.updateState({
            isInShop: false,
        });
    }

    public async setWeapon(player: number, slot: number) {
        const weapon = this.weaponService.getWeaponFromSlot(slot);
        if (!weapon) {
            return;
        }

        const previewWeapon = this.weaponService.getCurrentWeapon();
        if (previewWeapon?.name !== weapon.name) {
            await this.weaponService.clear();
            this.weaponDrawingProvider.onUseWeapon(weapon);
            await this.weaponService.set(weapon);
        }

        return GetHashKey(weapon.name);
    }

    // Tint
    @OnNuiEvent(NuiEvent.GunSmithPreviewTint)
    async previewTint({ slot, tint }: { slot: number; tint: number }) {
        const player = PlayerPedId();
        const weaponHash = await this.setWeapon(player, slot);

        SetPedWeaponTintIndex(player, weaponHash, Number(tint));

        this.setupAnimation();
    }

    // Attachment
    @OnNuiEvent(NuiEvent.GunSmithPreviewAttachment)
    async previewAttachment({
        slot,
        attachment,
        attachmentList,
    }: {
        slot: number;
        attachment: string;
        attachmentList: WeaponAttachment[];
    }) {
        const player = PlayerPedId();
        const weaponHash = await this.setWeapon(player, slot);

        if (attachment) {
            GiveWeaponComponentToPed(player, weaponHash, GetHashKey(attachment));
        } else if (attachment === null) {
            const currentAttachment = attachmentList.find(attachment =>
                HasPedGotWeaponComponent(player, weaponHash, GetHashKey(attachment.component))
            );
            if (currentAttachment) {
                RemoveWeaponComponentFromPed(player, weaponHash, GetHashKey(currentAttachment.component));
            }
        }

        this.setupAnimation();
    }

    @OnNuiEvent(NuiEvent.GunSmithApplyConfiguration)
    async applyConfiguration({
        slot,
        label,
        repair,
        tint,
        attachments,
        admin,
    }: WeaponConfiguration & { slot: number; admin: boolean }) {
        const weapon = this.weaponService.getWeaponFromSlot(slot);
        if (!weapon) {
            return;
        }

        let customValidated = true;

        const item = this.itemService.getItem(weapon.name);

        if (label) {
            const weaponLabel = await this.inputService.askInput(
                {
                    title: `Đặt tên cho vũ khí`,
                    maxCharacters: 30,
                    defaultValue: weapon.metadata?.label ?? item.label,
                },
                value => {
                    if (value.length < 2) {
                        return Err('Tên phải có độ dài ít nhất 2 ký tự');
                    }
                    return Ok(value);
                }
            );

            const applied = await emitRpc<boolean>(RpcServerEvent.WEAPON_SET_LABEL, weapon.slot, weaponLabel, admin);
            if (applied) {
                this.notifier.notify(`Bạn đã đổi tên vũ khí thành ~b~${weaponLabel}`);
            } else {
                customValidated = false;
            }
        }

        if (repair) {
            const applied = await emitRpc<boolean>(RpcServerEvent.WEAPON_REPAIR, weapon.slot, admin);
            if (applied) {
                this.notifier.notify(`Bạn đã sửa chữa độ bền vũ khí (~b~${item.label}~s~)`);
            } else {
                customValidated = false;
            }
        }

        if (tint !== weapon.metadata.tint && (tint !== 0 || weapon.metadata.tint !== undefined)) {
            const applied = await emitRpc<boolean>(RpcServerEvent.WEAPON_SET_TINT, weapon.slot, tint, admin);
            if (applied) {
                this.notifier.notify(
                    `Bạn đã đổi màu sơn vũ khí thành ~b~${
                        (weapon.name.includes('mk2') ? WeaponMk2TintColorChoices : WeaponTintColorChoices)[tint].label
                    }`
                );
            } else {
                customValidated = false;
            }
        }

        if (attachments) {
            for (const [type, attachment] of Object.entries(attachments)) {
                if (attachment !== weapon.metadata?.attachments?.[type]) {
                    const applied = await emitRpc<boolean>(
                        RpcServerEvent.WEAPON_SET_ATTACHMENTS,
                        weapon.slot,
                        type,
                        attachment,
                        admin
                    );
                    if (!applied) {
                        customValidated = false;
                    }
                }
            }
        }

        if (customValidated) {
            this.notifier.notify('Các tùy chỉnh nâng cấp đã được áp dụng thành công');
        } else {
            this.notifier.notify(
                'Một số nâng cấp không thể áp dụng do bạn không đủ tiền.',
                'error'
            );
        }

        this.nuiMenu.closeMenu(false);
    }

    private inSetup = false;
    private async setupAnimation() {
        if (this.inSetup) {
            return;
        }

        this.inSetup = true;
        await wait(200);
        const player = PlayerPedId();

        this.playerService.updateState({
            isInShop: true,
        });

        while (this.weaponHolsterProvider.isInAnimation()) {
            await wait(200);
        }

        if (IsEntityPlayingAnim(player, 'missbigscore1guard_wait_rifle', 'wait_base', 3)) {
            this.inSetup = false;
            return;
        }

        await this.animationService.stop();
        await wait(200);

        this.animationService.playAnimation(
            {
                base: {
                    dictionary: 'missbigscore1guard_wait_rifle',
                    name: 'wait_base',
                    options: {
                        enablePlayerControl: true,
                        repeat: true,
                    },
                },
            },
            {
                resetWeapon: false,
            }
        );
        await wait(200);
        this.inSetup = false;
    }
}
