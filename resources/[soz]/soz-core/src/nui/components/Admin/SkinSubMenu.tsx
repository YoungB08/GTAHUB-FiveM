import { SozRole } from '@core/permissions';
import { Component, Outfit, Prop } from '@public/shared/cloth';
import { FunctionComponent, useState } from 'react';

import { NuiEvent } from '../../../shared/event';
import { fetchNui } from '../../fetch';
import { useNuiEvent } from '../../hook/nui';
import {
    MenuContent,
    MenuItemButton,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';
import { ClothCollectionSubMenu } from './ClothCollectionSubMenu';

export type SkinSubMenuProps = {
    permission: SozRole;
    state: {
        clothConfig: Outfit;
        maxOptions: {
            componentIndex?: Component;
            propIndex?: Prop;
            maxDrawables: number;
        }[];
    };
};

export interface NuiAdminSkinSubMenuMethodMap {
    InitializeSubMenu: {
        clothConfig: Outfit;
        maxOptions: {
            index: Component | Prop;
            maxDrawables: number;
        }[];
    };
    SetComponentDrawable: {
        index: Component | Prop;
        drawable: number;
        isComponent: boolean;
    };
}

const SKIN_OPTIONS = [
    { key: 'skin_dog', label: 'Chó (Dog)', value: 'a_c_shepherd' },
    { key: 'skin_cat', label: 'Mèo (Cat)', value: 'a_c_cat_01' },
    { key: 'civilian_female', label: 'NPC Nữ thường dân', value: 'u_f_y_mistress' },
    { key: 'civilian_male', label: 'NPC Nam thường dân', value: 'a_m_y_latino_01' },
    { key: 'player_female', label: 'Người chơi Nữ (Freemode)', value: 'mp_f_freemode_01' },
    { key: 'player_male', label: 'Người chơi Nam (Freemode)', value: 'mp_m_freemode_01' },
];

const TRANSLATED_INDEXES: Record<string, string> = {
    Head: 'Đầu / Khuôn mặt',
    Mask: 'Mặt nạ',
    Hair: 'Kiểu tóc',
    Torso: 'Thân / Găng tay',
    Legs: 'Quần',
    Bag: 'Túi / Balo',
    Shoes: 'Giày / Dép',
    Accessories: 'Phụ kiện / Cà vạt',
    Undershirt: 'Áo lót / Áo trong',
    BodyArmor: 'Áo giáp',
    Decals: 'Huy hiệu / Decal',
    Tops: 'Áo khoác / Áo ngoài',
    Hat: 'Mũ / Nón',
    Glasses: 'Kính mắt',
    Ear: 'Khuyên tai / Tai nghe',
    LeftHand: 'Tay trái / Đồng hồ',
    RightHand: 'Tay phải / Vòng tay',
};

export const SkinSubMenu: FunctionComponent<SkinSubMenuProps> = ({ permission, state }) => {
    const [currentDrawable, setCurrentDrawable] = useState<number>(0);

    useNuiEvent(
        'admin_skin_submenu',
        'SetComponentDrawable',
        async (data: { index: number; drawable: number; isComponent: boolean }) => {
            if (data.isComponent) {
                await onComponentChange(data.index, 'drawable', data.drawable);
            } else {
                await onPropChange(data.index, 'drawable', data.drawable);
            }
        }
    );

    useNuiEvent('menu', 'Backspace', () => {
        setCurrentDrawable(0);
    });

    const onComponentChange = async (
        componentIndex: Component | string,
        key: 'drawable' | 'texture',
        value: number
    ) => {
        if (!state.clothConfig) {
            return;
        }

        let componentKey: string | Component = componentIndex;

        if (isNaN(Number(componentIndex))) {
            componentKey = Component[componentIndex];
        }

        const component = state.clothConfig.Components[componentKey.toString()];

        switch (key) {
            case 'drawable':
                component.Drawable = value;
                setCurrentDrawable(value);
                break;
            case 'texture':
                component.Texture = value;
                break;
        }

        await fetchNui(NuiEvent.AdminMenuSkinChangeComponent, {
            componentIndex,
            component,
        });
    };

    const onPropChange = async (propIndex: Prop | string, key: 'drawable' | 'texture', value: number) => {
        if (!state.clothConfig) {
            return;
        }

        let propKey: string | Prop = propIndex;

        if (isNaN(Number(propKey))) {
            propKey = Prop[propKey];
        }
        const prop = state.clothConfig.Props[propKey.toString()];

        switch (key) {
            case 'drawable':
                prop.Drawable = value;
                setCurrentDrawable(value);
                break;
            case 'texture':
                prop.Texture = value;
                break;
        }

        await fetchNui(NuiEvent.AdminMenuSkinChangeProp, {
            propIndex,
            prop,
        });
    };

    if (!state.clothConfig) {
        return null;
    }

    return (
        <>
            <SubMenu id="skin">
                <MenuTitle title={permission} />
                <MenuContent subtitle="Chỉnh sửa diện mạo & Trang phục">
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuSkinChangeAppearance);
                        }}
                    >
                        Thay đổi diện mạo nhân vật
                    </MenuItemButton>
                    <MenuItemSelect
                        title={`Danh sách diện mạo có sẵn`}
                        onConfirm={async selectedIndex => {
                            const value = SKIN_OPTIONS[selectedIndex].value;
                            await fetchNui(NuiEvent.AdminMenuSkinChangeAppearance, value);
                        }}
                    >
                        {SKIN_OPTIONS.map(option => (
                            <MenuItemSelectOption key={option.key}>{option.label}</MenuItemSelectOption>
                        ))}
                    </MenuItemSelect>
                    <MenuItemSubMenuLink id={'player_style2'}>Chỉnh sửa trang phục theo DLC</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id={'player_style'}>Chỉnh sửa chi tiết trang phục</MenuItemSubMenuLink>
                </MenuContent>
            </SubMenu>
            <SubMenu id={'player_style'}>
                <MenuTitle title={permission} />
                <MenuContent subtitle="Chỉnh sửa chi tiết trang phục">
                    <MenuItemSubMenuLink id={'player_style_components'}>
                        👕 Bộ phận trang phục
                    </MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id={'player_style_props'}>🎩 Phụ kiện trang phục</MenuItemSubMenuLink>

                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuSkinCopy);
                        }}
                    >
                        📋 Sao chép bộ trang phục vào Clipboard
                    </MenuItemButton>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuSkinSave);
                        }}
                    >
                        Lưu bộ trang phục này
                    </MenuItemButton>
                </MenuContent>
            </SubMenu>
            <SubMenu id={'player_style_components'}>
                <MenuTitle title={permission} />
                <MenuContent subtitle="Bộ phận trang phục">
                    {Object.keys(state.clothConfig.Components).map(componentIndex => (
                        <MenuItemSubMenuLink id={`player_style_component_${componentIndex}`} key={componentIndex}>
                            {`[${componentIndex}] - ${TRANSLATED_INDEXES[Component[componentIndex]]}`}
                        </MenuItemSubMenuLink>
                    ))}
                </MenuContent>
            </SubMenu>
            <SubMenu id={'player_style_props'}>
                <MenuTitle title={permission} />
                <MenuContent subtitle="Phụ kiện trang phục">
                    {Object.keys(state.clothConfig.Props).map(propIndex => (
                        <MenuItemSubMenuLink id={`player_style_prop_${propIndex}`} key={propIndex}>
                            {`[${propIndex}] - ${TRANSLATED_INDEXES[Prop[propIndex]]}`}
                        </MenuItemSubMenuLink>
                    ))}
                </MenuContent>
            </SubMenu>
            <ClothCollectionSubMenu />

            {Object.keys(state.clothConfig.Components).map(componentIndex => (
                <SubMenu id={`player_style_component_${componentIndex}`} key={componentIndex}>
                    <MenuTitle title={permission} />
                    <MenuContent subtitle={`[${componentIndex}] - ${TRANSLATED_INDEXES[Component[componentIndex]]}`}>
                        <MenuItemSelect
                            title={`Drawable`}
                            value={currentDrawable || state.clothConfig.Components[componentIndex].Drawable || 0}
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.AdminMenuSkinLookAtDrawable, {
                                    index: componentIndex,
                                    isComponent: true,
                                });
                            }}
                            onChange={async index => {
                                await onComponentChange(componentIndex, 'drawable', index);
                            }}
                        >
                            {Array(
                                state.maxOptions.find(option => option.componentIndex === Number(componentIndex))
                                    ?.maxDrawables || 0
                            )
                                .fill(0)
                                .map((_, index) => (
                                    <MenuItemSelectOption value={index} key={`${componentIndex}_drawable_${index}`}>
                                        {index}
                                    </MenuItemSelectOption>
                                ))}
                        </MenuItemSelect>
                        <MenuItemSelect
                            title={`Texture`}
                            value={state.clothConfig.Components[componentIndex].Texture || 0}
                            onChange={async index => {
                                await onComponentChange(componentIndex, 'texture', index);
                            }}
                        >
                            {Array(26)
                                .fill(0)
                                .map((_, index) => (
                                    <MenuItemSelectOption value={index} key={`${componentIndex}_texture_${index}`}>
                                        {index}
                                    </MenuItemSelectOption>
                                ))}
                        </MenuItemSelect>
                    </MenuContent>
                </SubMenu>
            ))}

            {Object.keys(state.clothConfig.Props).map(propIndex => (
                <SubMenu id={`player_style_prop_${propIndex}`} key={propIndex}>
                    <MenuTitle title={permission} />
                    <MenuContent subtitle={`[${propIndex}] - ${TRANSLATED_INDEXES[Prop[propIndex]]}`}>
                        <MenuItemSelect
                            title={`Drawable`}
                            value={currentDrawable || state.clothConfig.Props[propIndex].Drawable || 0}
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.AdminMenuSkinLookAtDrawable, {
                                    index: propIndex,
                                    isComponent: false,
                                });
                            }}
                            onChange={async index => {
                                await onPropChange(propIndex, 'drawable', index);
                            }}
                        >
                            {Array(
                                state.maxOptions.find(option => option.propIndex === Number(propIndex))?.maxDrawables ||
                                    0
                            )
                                .fill(0)
                                .fill(0)
                                .map((_, index) => (
                                    <MenuItemSelectOption value={index} key={`${propIndex}_drawable_${index}`}>
                                        {index}
                                    </MenuItemSelectOption>
                                ))}
                        </MenuItemSelect>
                        <MenuItemSelect
                            title={`Texture`}
                            value={state.clothConfig.Props[propIndex].Texture || 0}
                            onChange={async index => {
                                await onPropChange(propIndex, 'texture', index);
                            }}
                        >
                            {Array(26)
                                .fill(0)
                                .map((_, index) => (
                                    <MenuItemSelectOption value={index} key={`${propIndex}_texture_${index}`}>
                                        {index}
                                    </MenuItemSelectOption>
                                ))}
                        </MenuItemSelect>
                    </MenuContent>
                </SubMenu>
            ))}
        </>
    );
};
