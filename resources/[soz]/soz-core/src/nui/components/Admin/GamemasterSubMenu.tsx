import { FunctionComponent } from 'react';

import { SozRole } from '../../../core/permissions';
import { GameMasterSubMenuState, LICENCES, MONEY_OPTIONS } from '../../../shared/admin/admin';
import { NuiEvent } from '../../../shared/event';
import { fetchNui } from '../../fetch';
import { usePlayer } from '../../hook/data';
import {
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

export type GameMasterSubMenuProps = {
    permission: SozRole;
    state: GameMasterSubMenuState;
};

export const GameMasterSubMenu: FunctionComponent<GameMasterSubMenuProps> = ({ permission, state }) => {
    const isAdmin = permission === 'admin';
    const isAdminOrStaff = isAdmin || permission === 'staff';
    const isAdminOrStaffOrHelper = isAdminOrStaff || permission === 'helper';
    const isAdminOrStaffOrGM = isAdminOrStaff || permission === 'gamemaster';
    const player = usePlayer();

    if (!player) {
        return null;
    }

    return (
        <SubMenu id="game_master">
            <MenuTitle title={permission} />
            <MenuContent subtitle="Menu Quản Trò (GameMaster)">
                <MenuItemSelect
                    title="💰 Nhận tiền sạch"
                    disabled={!isAdmin}
                    onConfirm={async index => {
                        await fetchNui(NuiEvent.AdminGiveMoney, MONEY_OPTIONS[index].value);
                    }}
                >
                    {MONEY_OPTIONS.map(option => (
                        <MenuItemSelectOption key={option.value}>{option.label}</MenuItemSelectOption>
                    ))}
                </MenuItemSelect>
                <MenuItemSelect
                    title="💰 Nhận tiền bẩn (Đánh dấu)"
                    disabled={!isAdmin}
                    onConfirm={async index => {
                        await fetchNui(NuiEvent.AdminGiveMarkedMoney, MONEY_OPTIONS[index].value);
                    }}
                >
                    {MONEY_OPTIONS.map(option => (
                        <MenuItemSelectOption key={option.value}>{option.label}</MenuItemSelectOption>
                    ))}
                </MenuItemSelect>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminTeleportToWaypoint);
                    }}
                >
                    🥷 Dịch chuyển đến Điểm đánh dấu (Waypoint)
                </MenuItemButton>
                <MenuItemSelect
                    title="Cấp bằng lái / Giấy phép"
                    disabled={!isAdmin}
                    onConfirm={async index => {
                        await fetchNui(NuiEvent.AdminGiveLicence, LICENCES[index].value);
                    }}
                >
                    {LICENCES.map(licence => (
                        <MenuItemSelectOption key={licence.label}>{licence.label}</MenuItemSelectOption>
                    ))}
                </MenuItemSelect>
                <MenuItemCheckbox
                    checked={state.moneyCase}
                    disabled={!isAdmin}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminToggleMoneyCase, value);
                    }}
                >
                    💼 Vali tiền
                </MenuItemCheckbox>
                <MenuItemCheckbox
                    checked={state.invisible}
                    disabled={!isAdmin}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminSetVisible, !value);
                    }}
                >
                    Tàng hình (Invisible)
                </MenuItemCheckbox>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminAutoPilot);
                    }}
                >
                    🏎️ Tự động lái xe (Auto-pilot)
                </MenuItemButton>
                <MenuItemCheckbox
                    checked={player.metadata.godmode}
                    disabled={!isAdmin}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminSetGodMode, value);
                    }}
                >
                    🔱 Chế độ Bất tử (God Mode)
                </MenuItemCheckbox>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuGameMasterUncuff);
                    }}
                >
                    Tự mở khóa còng tay
                </MenuItemButton>
                <MenuItemCheckbox
                    checked={state.adminGPS}
                    disabled={!isAdminOrStaffOrGM}
                    onChange={async value => {
                        state.adminGPS = value;
                        await fetchNui(NuiEvent.AdminSetAdminGPS, value);
                    }}
                >
                    🗺 GPS vĩnh viễn
                </MenuItemCheckbox>
                <MenuItemCheckbox
                    checked={state.adminPoliceLocator}
                    disabled={!isAdminOrStaff}
                    onChange={async value => {
                        state.adminPoliceLocator = value;
                        await fetchNui(NuiEvent.AdminSetPoliceLocator, value);
                    }}
                >
                    🗺️ Hiện vị trí tuần tra cảnh sát
                </MenuItemCheckbox>
                <MenuItemButton
                    disabled={!isAdminOrStaffOrGM}
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuGameMasterArmor);
                    }}
                >
                    𐂫 Hồi đầy Giáp
                </MenuItemButton>
                <MenuItemCheckbox
                    checked={state.adminInfiniteAmmo}
                    disabled={!isAdminOrStaffOrHelper}
                    onChange={async value => {
                        state.adminInfiniteAmmo = value;
                        await fetchNui(NuiEvent.AdminSetAdminInfiniteAmmo, value);
                    }}
                >
                    🔫 Đạn vô hạn
                </MenuItemCheckbox>
                <MenuItemCheckbox
                    checked={state.adminNoRecoil}
                    disabled={!isAdminOrStaffOrHelper}
                    onChange={async value => {
                        state.adminNoRecoil = value;
                        await fetchNui(NuiEvent.AdminSetAdminNoRecoil, value);
                    }}
                >
                    🔫 Không giật súng (No Recoil)
                </MenuItemCheckbox>
            </MenuContent>
        </SubMenu>
    );
};
