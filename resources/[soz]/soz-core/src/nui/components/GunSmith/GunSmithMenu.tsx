import { TaxType } from '@public/shared/tax';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { NuiEvent } from '../../../shared/event';
import { InventoryItem } from '../../../shared/inventory';
import { MenuType } from '../../../shared/nui/menu';
import { WEAPON_CUSTOM_PRICE, WeaponAttachment, WeaponComponentType } from '../../../shared/weapons/attachment';
import { WeaponTintColor, WeaponTintColorChoiceItem } from '../../../shared/weapons/tint';
import { WeaponConfiguration, WeaponsMenuData } from '../../../shared/weapons/weapon';
import { fetchNui } from '../../fetch';
import { useItems } from '../../hook/data';
import { useGetPrice } from '../../hook/price';
import { RootState } from '../../store';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSelectOptionColor,
    MenuItemSubMenuLink,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

type MenuGunSmithStateProps = {
    data: WeaponsMenuData;
};

const GunSmithWeaponSubMenu: FunctionComponent<{
    submenu_id: number;
    weapon: InventoryItem;
    tint: Record<WeaponTintColor, WeaponTintColorChoiceItem>;
    attachments: WeaponAttachment[];
    admin: boolean;
}> = ({ submenu_id, weapon, tint, attachments, admin }) => {
    const [configuration, setConfiguration] = useState<WeaponConfiguration>({});
    const getPrice = useGetPrice();

    const price = useMemo(() => {
        let price = 0;

        if (configuration.attachments) {
            price += Object.values(configuration.attachments).reduce((acc, attachment) => {
                if (attachment && !Object.values(weapon.metadata.attachments || []).includes(attachment)) {
                    return acc + WEAPON_CUSTOM_PRICE.attachment;
                }
                return acc;
            }, 0);
        }

        if (configuration.label) {
            price += WEAPON_CUSTOM_PRICE.label;
        }

        if (configuration.repair) {
            price +=
                WEAPON_CUSTOM_PRICE.repair *
                Math.floor(100 - ((weapon.metadata.health / weapon.metadata.maxHealth) * 100 || 0));
        }

        if (
            configuration.tint !== weapon.metadata.tint &&
            (configuration.tint !== 0 || weapon.metadata.tint !== undefined)
        ) {
            price += WEAPON_CUSTOM_PRICE.tint;
        }

        return price;
    }, [configuration]);

    return (
        <SubMenu id={`gunsmith_${submenu_id}`}>
            <MenuTitle title="Thợ sửa súng (Gunsmith)" />
            <MenuContent subtitle={`Tùy chỉnh vũ khí ${configuration.label ? `(${configuration.label})` : ''}`}>
                <MenuItemCheckbox
                    onChange={label => {
                        setConfiguration(s => ({ ...s, label }));
                    }}
                >
                    Đổi tên vũ khí
                </MenuItemCheckbox>

                <MenuItemCheckbox
                    onChange={repair => {
                        setConfiguration(s => ({ ...s, repair }));
                    }}
                >
                    Sửa chữa độ bền vũ khí ({((weapon.metadata.health / weapon.metadata.maxHealth) * 100 || 0).toFixed(0)}%)
                </MenuItemCheckbox>

                <MenuItemSelect
                    title="Màu sơn súng"
                    distance={5}
                    onChange={async (_, tint) => {
                        setConfiguration(s => ({ ...s, tint: Number(tint) }));
                        fetchNui(NuiEvent.GunSmithPreviewTint, { slot: weapon.slot, tint: Number(tint) });
                    }}
                    value={(weapon.metadata.tint ?? 0).toString()}
                >
                    {Object.entries(tint).map(([key, tint]) => (
                        <MenuItemSelectOptionColor key={key} color={tint.color} label={tint.label} value={key} />
                    ))}
                </MenuItemSelect>

                <MenuWeaponComponentSelect
                    label="Băng đạn"
                    type={WeaponComponentType.Clip}
                    weapon={weapon}
                    attachments={attachments}
                    onUpdate={setConfiguration}
                />
                <MenuWeaponComponentSelect
                    label="Đèn pin"
                    type={WeaponComponentType.Flashlight}
                    weapon={weapon}
                    attachments={attachments}
                    onUpdate={setConfiguration}
                />
                <MenuWeaponComponentSelect
                    label="Ống giảm thanh"
                    type={WeaponComponentType.Suppressor}
                    weapon={weapon}
                    attachments={attachments}
                    onUpdate={setConfiguration}
                />
                <MenuWeaponComponentSelect
                    label="Ống ngắm"
                    type={WeaponComponentType.Scope}
                    weapon={weapon}
                    attachments={attachments}
                    onUpdate={setConfiguration}
                />
                <MenuWeaponComponentSelect
                    label="Tay cầm"
                    type={WeaponComponentType.Grip}
                    weapon={weapon}
                    attachments={attachments}
                    onUpdate={setConfiguration}
                />
                <MenuWeaponComponentSelect
                    label="Skin chính"
                    type={WeaponComponentType.PrimarySkin}
                    weapon={weapon}
                    attachments={attachments}
                    onUpdate={setConfiguration}
                />
                <MenuWeaponComponentSelect
                    label="Skin phụ"
                    type={WeaponComponentType.SecondarySkin}
                    weapon={weapon}
                    attachments={attachments}
                    onUpdate={setConfiguration}
                />

                <MenuItemButton
                    className="border-t border-white/50"
                    onConfirm={async () => {
                        fetchNui(NuiEvent.GunSmithApplyConfiguration, {
                            slot: weapon.slot,
                            ...configuration,
                            admin,
                        });
                    }}
                >
                    <div className="flex w-full justify-between items-center">
                        <span>✅ Xác nhận nâng cấp</span>
                        {!admin && <span>${getPrice(price, TaxType.WEAPON).toLocaleString('vi-VN')}</span>}
                    </div>
                </MenuItemButton>
            </MenuContent>
        </SubMenu>
    );
};

const MenuWeaponComponentSelect: FunctionComponent<{
    label: string;
    type: WeaponComponentType;
    weapon: InventoryItem;
    attachments: WeaponAttachment[];
    onUpdate?: (s) => void;
}> = ({ onUpdate, label, type, weapon, attachments }) => {
    const options = attachments.filter(a => a.type === type);
    const player = useSelector((state: RootState) => state.player);

    return (
        <MenuItemSelect
            title={label}
            onChange={async (_, attachment) => {
                fetchNui(NuiEvent.GunSmithPreviewAttachment, {
                    slot: weapon.slot,
                    attachment: attachment,
                    attachmentList: options,
                });
                onUpdate?.(s => ({ ...s, attachments: { ...s.attachments, [type]: attachment } }));
            }}
            value={weapon.metadata?.attachments?.[type] ?? 0}
            disabled={
                options.length === 0 ||
                (type === WeaponComponentType.Suppressor && player.role !== 'admin' && player.role !== 'staff')
            }
        >
            <MenuItemSelectOption value={null}>Mặc định</MenuItemSelectOption>

            {options.map((attachment, index) => (
                <MenuItemSelectOption key={index} value={attachment.component}>
                    {attachment.label}
                </MenuItemSelectOption>
            ))}
        </MenuItemSelect>
    );
};

export const MenuGunSmith: FunctionComponent<MenuGunSmithStateProps> = ({
    data: { weapons, tints, attachments, admin },
}) => {
    const items = useItems();

    return (
        <Menu type={MenuType.GunSmith}>
            <MainMenu>
                <MenuTitle title="Thợ sửa súng (Gunsmith)" />
                <MenuContent>
                    {weapons.map((weapon, id) => {
                        const item = items.find(i => i.name === weapon.name);

                        return (
                            <MenuItemSubMenuLink key={`gunsmith_${id}`} id={`gunsmith_${id}`}>
                                {weapon.metadata.label ? weapon.metadata.label + ` (${item?.label})` : item?.label}
                            </MenuItemSubMenuLink>
                        );
                    })}
                </MenuContent>
            </MainMenu>
            {weapons.map((weapon, id) => (
                <GunSmithWeaponSubMenu
                    key={`gunsmith_${id}`}
                    submenu_id={id}
                    weapon={weapon}
                    tint={tints.find(t => t.slot === weapon.slot).tints}
                    attachments={attachments?.find(t => t.slot === weapon.slot)?.attachments || []}
                    admin={admin}
                />
            ))}
        </Menu>
    );
};
