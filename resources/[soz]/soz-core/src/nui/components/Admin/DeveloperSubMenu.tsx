import { ShopBrand } from '@public/config/shops';
import { SozRole } from '@public/core/permissions';
import { DeveloperSubMenuState } from '@public/shared/admin/admin';
import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../shared/event';
import { fetchNui } from '../../fetch';
import {
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

export type DeveloperSubMenuProps = {
    permission: SozRole;
    state: DeveloperSubMenuState;
};

const coordOptions = [
    { label: 'Vector 3', value: 'coords3' },
    { label: 'Vector 4', value: 'coords4' },
];

const notificationTypeOptions = [
    { label: 'Basic', value: 'basic' },
    { label: 'Advanced', value: 'advanced' },
    { label: 'Police', value: 'police' },
];

export const DeveloperSubMenu: FunctionComponent<DeveloperSubMenuProps> = ({ permission, state }) => {
    const isAdmin = permission === 'admin';
    const isAdminOrStaff = isAdmin || permission === 'staff';
    return (
        <SubMenu id="developer">
            <MenuTitle title={permission} />
            <MenuContent subtitle="Công cụ Lập trình & Kỹ thuật">
                <MenuItemCheckbox
                    checked={state.noClip}
                    onChange={async () => {
                        await fetchNui(NuiEvent.AdminToggleNoClip);
                    }}
                >
                    Bay xuyên tường (NoClip)
                </MenuItemCheckbox>
                <MenuItemCheckbox
                    checked={state.displayCoords}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminToggleShowCoordinates, value);
                    }}
                >
                    Hiển thị tọa độ (Coords)
                </MenuItemCheckbox>
                <MenuItemCheckbox
                    checked={state.displayMileage}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminToggleShowMileage, value);
                    }}
                >
                    Hiển thị số km đã chạy
                </MenuItemCheckbox>
                <MenuItemCheckbox
                    checked={state.displayMouseDebug}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminToggleShowMouseDebug, value);
                    }}
                >
                    Debug thực thể dưới con trỏ chuột
                </MenuItemCheckbox>
                <MenuItemSelect
                    title="📋 Sao chép tọa độ"
                    onConfirm={async selectedIndex => {
                        await fetchNui(NuiEvent.AdminCopyCoords, coordOptions[selectedIndex].value);
                    }}
                >
                    {coordOptions.map(option => (
                        <MenuItemSelectOption key={'copy_coords_' + option.value}>{option.label}</MenuItemSelectOption>
                    ))}
                </MenuItemSelect>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminChangePlayer);
                    }}
                >
                    🧑 Chuyển đổi nhân vật
                </MenuItemButton>
                <MenuItemSelect
                    title="Thử gửi thông báo"
                    onConfirm={async selectedIndex => {
                        await fetchNui(NuiEvent.AdminTriggerNotification, notificationTypeOptions[selectedIndex].value);
                    }}
                >
                    {notificationTypeOptions.map(option => (
                        <MenuItemSelectOption key={'trigger_notification_' + option.value}>
                            {option.label}
                        </MenuItemSelectOption>
                    ))}
                </MenuItemSelect>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminResetHealthData);
                    }}
                >
                    Hồi đầy Đói / Khát
                </MenuItemButton>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminCreateZone);
                    }}
                >
                    Tạo khu vực (Zone) mới
                </MenuItemButton>
                <MenuItemCheckbox
                    checked={state.debugPoly}
                    disabled={!isAdminOrStaff}
                    onChange={async value => {
                        state.doors = value;
                        await fetchNui(NuiEvent.AdminSetDisplayZones, value);
                    }}
                >
                    🧊 Hiển thị các vùng (Zones)
                </MenuItemCheckbox>
                <MenuItemCheckbox
                    checked={state.doors}
                    disabled={!isAdminOrStaff}
                    onChange={async value => {
                        state.doors = value;
                        await fetchNui(NuiEvent.AdminSetDoorManagement, value);
                    }}
                >
                    🚪 Quản lý các cánh cửa
                </MenuItemCheckbox>
                <MenuItemSelect
                    title="Cửa hàng quần áo"
                    onConfirm={async (_, brand) => {
                        await fetchNui(NuiEvent.AdminMenuClothes, brand);
                    }}
                >
                    {[ShopBrand.Ponsonbys, ShopBrand.Binco, ShopBrand.Suburban, ShopBrand.Mask].map(option => (
                        <MenuItemSelectOption key={'cloth_shop' + option} value={option}>
                            {option}
                        </MenuItemSelectOption>
                    ))}
                </MenuItemSelect>
                <MenuItemButton
                    disabled={!isAdmin}
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuOilPrice);
                    }}
                >
                    ⛽ Thay đổi giá trạm xăng dầu
                </MenuItemButton>
                <MenuItemButton
                    disabled={!isAdminOrStaff}
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuTraveling);
                    }}
                >
                    🎥 Quay phim / Góc nhìn du lịch
                </MenuItemButton>
            </MenuContent>
        </SubMenu>
    );
};
