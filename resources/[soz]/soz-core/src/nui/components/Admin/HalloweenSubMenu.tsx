import { SozRole } from '@core/permissions';
import { fetchNui } from '@public/nui/fetch';
import { HalloweenSubMenuState } from '@public/shared/admin/admin';
import { NuiEvent } from '@public/shared/event/nui';
import { VampireGameCollection, VampireGameLabel, VampireGameObjectiveTypePart2 } from '@public/shared/halloween';
import { FunctionComponent } from 'react';

import {
    MenuContent,
    MenuItemButton,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuItemText,
    MenuSubTitle,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

export type MeteorSubMenuProps = {
    permission: SozRole;
    state: HalloweenSubMenuState;
};

const MOON_OPTIONS = [
    { label: 'Tắt', value: 'off' },
    { label: 'Trời quang', value: 'clear' },
    { label: 'Ánh sáng nhẹ', value: 'light' },
    { label: 'Trăng tròn rực rỡ', value: 'full' },
];

export const HalloweenSubMenu: FunctionComponent<MeteorSubMenuProps> = ({ permission, state }) => {
    const isAdmin = permission === 'admin';
    const isAdminOrStaff = isAdmin || permission === 'staff';

    return (
        <>
            <SubMenu id="halloween">
                <MenuTitle title={permission} />
                <MenuContent subtitle="Sự kiện Halloween">
                    <MenuItemSelect
                        disabled={!isAdminOrStaff}
                        title="🌑 Trăng máu (Blood Moon)"
                        onConfirm={async (index, value) => {
                            await fetchNui(NuiEvent.AdminMenuHalloweenUpdateMoon, value);
                        }}
                    >
                        {MOON_OPTIONS.map(option => (
                            <MenuItemSelectOption key={option.value} value={option.value}>
                                {option.label}
                            </MenuItemSelectOption>
                        ))}
                    </MenuItemSelect>

                    <MenuItemSubMenuLink disabled={!isAdminOrStaff} id="halloween-vampire-game">
                        Trò chơi Ma cà rồng (Vampire Game)
                    </MenuItemSubMenuLink>
                </MenuContent>
            </SubMenu>

            <SubMenu id="halloween-vampire-game-excluded-players">
                <MenuTitle title={permission} />
                <MenuContent subtitle="Danh sách người chơi bị loại trừ">
                    <MenuItemSubMenuLink disabled={!isAdminOrStaff} id="players">
                        Xem danh sách người chơi
                    </MenuItemSubMenuLink>

                    {state.excludedPlayers.map(player => (
                        <MenuItemButton
                            key={player.citizenId}
                            description="Hủy bỏ loại trừ người chơi"
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.AdminMenuHalloweenUpdateGamePlayerExclusion, {
                                    citizenId: player.citizenId,
                                    enabled: false,
                                });
                            }}
                        >
                            {player.name}
                        </MenuItemButton>
                    ))}
                    {state.excludedPlayers.length === 0 && <MenuItemText>Không có người chơi nào bị loại</MenuItemText>}
                </MenuContent>
            </SubMenu>

            <SubMenu id="halloween-vampire-game">
                <MenuTitle title={permission} />
                <MenuContent subtitle="Thiết lập Vampire Game">
                    <MenuItemButton
                        disabled={state.started}
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuHalloweenLaunchGame);
                        }}
                    >
                        Bắt đầu trò chơi
                    </MenuItemButton>
                    <MenuItemButton
                        disabled={!state.started}
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuHalloweenStopGame);
                        }}
                    >
                        Dừng trò chơi
                    </MenuItemButton>

                    <MenuItemSelect
                        title="Ép vai trò (Role)"
                        description={`Thay đổi vai trò của người chơi thành vai trò đã chọn`}
                        onConfirm={async (_, value) => {
                            await fetchNui(NuiEvent.AdminMenuHalloweenForceTransformPlayer, value);
                        }}
                    >
                        {Object.keys(state.roleMaxNumber).map(role => (
                            <MenuItemSelectOption key={role} value={role}>
                                {role}
                            </MenuItemSelectOption>
                        ))}
                    </MenuItemSelect>

                    <MenuSubTitle>Cài đặt trò chơi</MenuSubTitle>
                    <MenuItemButton
                        description="Thời lượng trò chơi (phút)"
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuHalloweenUpdateGameDuration);
                        }}
                    >
                        <div className="pr-2 flex items-center justify-between">
                            <span>Thời lượng tối đa ván chơi</span>
                            <span>{state.gameDuration} phút</span>
                        </div>
                    </MenuItemButton>

                    <MenuItemSubMenuLink disabled={!isAdminOrStaff} id="halloween-vampire-game-excluded-players">
                        Loại trừ người chơi
                    </MenuItemSubMenuLink>

                    <MenuSubTitle>Tỷ lệ phân bổ vai trò</MenuSubTitle>
                    {Object.entries(state.roleMaxNumber).map(([role, amount]) => (
                        <MenuItemButton
                            key={role}
                            description={`Tỷ lệ trúng vai trò ${role}`}
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.AdminMenuHalloweenUpdateRole, role);
                            }}
                        >
                            <div className="pr-2 flex items-center justify-between">
                                <span>{role}</span>
                                <span>{amount}%</span>
                            </div>
                        </MenuItemButton>
                    ))}

                    <MenuSubTitle>Mục tiêu Con người - Phần 1</MenuSubTitle>
                    {Object.entries(state.mortalObjectivePart1).map(([collection, amount]) => (
                        <MenuItemButton
                            key={collection}
                            description={`Props cho hành động: ${VampireGameLabel(collection as VampireGameCollection)}`}
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.AdminMenuHalloweenUpdateMortalCollection, collection);
                            }}
                        >
                            <div className="pr-2 flex items-center justify-between">
                                <span>{collection}</span>
                                <span>{amount}</span>
                            </div>
                        </MenuItemButton>
                    ))}

                    <MenuSubTitle>Mục tiêu Con người - Phần 2</MenuSubTitle>
                    {Object.entries(state.mortalObjectivePart2).map(([objective, amount]) => (
                        <MenuItemButton
                            key={objective}
                            description={`Số người chơi cho hành động: ${VampireGameLabel(objective as VampireGameObjectiveTypePart2)}`}
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.AdminMenuHalloweenUpdateObjectivePart2, objective);
                            }}
                        >
                            <div className="pr-2 flex items-center justify-between">
                                <span>{VampireGameLabel(objective as VampireGameObjectiveTypePart2)}</span>
                                <span>{amount}</span>
                            </div>
                        </MenuItemButton>
                    ))}

                    <MenuSubTitle>Mục tiêu Con người - Phần 3</MenuSubTitle>
                    <MenuItemButton
                        description="Thời lượng giai đoạn (phút)"
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuHalloweenUpdateObjectivePart3);
                        }}
                    >
                        <div className="pr-2 flex items-center justify-between">
                            <span>Thời lượng tối đa của giai đoạn</span>
                            <span>{state.mortalObjectivePart3} phút</span>
                        </div>
                    </MenuItemButton>
                </MenuContent>
            </SubMenu>
        </>
    );
};
