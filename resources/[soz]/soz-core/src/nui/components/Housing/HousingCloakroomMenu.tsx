import { MenuType } from '@public/shared/nui/menu';
import { FunctionComponent } from 'react';

import { PlayerCloakroomItem } from '../../../shared/cloth';
import { NuiEvent } from '../../../shared/event/nui';
import { fetchNui } from '../../fetch';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuTitle,
} from '../Styleguide/Menu';

type HousingCloakroomMenuProps = {
    data?: {
        items: PlayerCloakroomItem[];
        gang: boolean;
    };
};

export const HousingCloakroomMenu: FunctionComponent<HousingCloakroomMenuProps> = ({ data }) => {
    if (!data) {
        return null;
    }

    return (
        <Menu type={MenuType.HousingCloakroomMenu}>
            <MainMenu>
                <MenuTitle title={data.gang ? 'Khu Vực Băng Đảng' : 'Tủ Đồ Cá Nhân'} />
                <MenuContent>
                    <MenuItemButton
                        onConfirm={() => {
                            fetchNui(NuiEvent.HousingCloakroomSave, {});
                        }}
                    >
                        Lưu bộ trang phục hiện tại
                    </MenuItemButton>
                    {data.items.map(item => {
                        return (
                            <MenuItemSelect
                                onConfirm={(index, value) => {
                                    if (value === 'apply') {
                                        fetchNui(NuiEvent.HousingCloakroomApply, {
                                            item: item,
                                        });
                                    }

                                    if (value === 'rename') {
                                        fetchNui(NuiEvent.HousingCloakroomRename, {
                                            item: item,
                                        });
                                    }

                                    if (value === 'delete') {
                                        fetchNui(NuiEvent.HousingCloakroomDelete, {
                                            item: item,
                                        });
                                    }
                                }}
                                title={item.name}
                                key={item.id}
                            >
                                <MenuItemSelectOption value="apply">Mặc trang phục này</MenuItemSelectOption>
                                <MenuItemSelectOption value="rename">Đổi tên</MenuItemSelectOption>
                                <MenuItemSelectOption value="delete">Xóa</MenuItemSelectOption>
                            </MenuItemSelect>
                        );
                    })}
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
