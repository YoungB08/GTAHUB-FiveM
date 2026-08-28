import { VampireGameRole } from '@public/shared/halloween';
import { SenateParty } from '@public/shared/senate';
import { FunctionComponent, useEffect, useState } from 'react';

import { SozRole } from '../../../core/permissions';
import { AdminPlayer, HEALTH_OPTIONS, MOVEMENT_OPTIONS, VOCAL_OPTIONS } from '../../../shared/admin/admin';
import { NuiEvent } from '../../../shared/event';
import { isOk, Result } from '../../../shared/result';
import { fetchNui } from '../../fetch';
import { useNuiEvent } from '../../hook/nui';
import {
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuItemText,
    MenuSubTitle,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';
import { PlayerPetSubMenu } from './PlayerPetSubMenu';

export type PlayerSubMenuProps = {
    permission: SozRole;
    parties: SenateParty[];
};

export interface NuiAdminPlayerSubMenuMethodMap {
    SetSearchFilter: string;
}

export const TELEPORT_OPTIONS = [
    { label: 'Dịch chuyển đến người chơi (Go to)', value: 'goto' },
    { label: 'Kéo người chơi lại mình (Bring)', value: 'bring' },
];

export const EFFECTS_OPTIONS = [
    { label: 'Say rượu', value: 'alcohol' },
    { label: 'Phê thuốc', value: 'drug' },
    { label: 'Bình thường', value: 'normal' },
];

export const DISEASE_OPTIONS = [
    { label: 'Cảm lạnh', value: 'rhume' },
    { label: 'Cúm', value: 'grippe' },
    { label: 'Ngộ độc thực phẩm', value: 'intoxication' },
    { label: 'Phát ban đỏ', value: 'rougeur' },
    { label: 'Đau lưng', value: 'backpain' },
    { label: 'Chữa khỏi bệnh', value: false },
];

const SCENARIO_OPTIONS = [
    { label: 'Kịch bản 1', value: 'scenario1' },
    { label: 'Kịch bản 2', value: 'scenario2' },
    { label: 'Kịch bản 3', value: 'scenario3' },
    { label: 'Kịch bản 4', value: 'scenario4' },
];

export const PlayerSubMenu: FunctionComponent<PlayerSubMenuProps> = ({ permission, parties }) => {
    const [players, setPlayers] = useState<AdminPlayer[]>([]);
    const [searchFilter, setSearchFilter] = useState<string>('');

    useNuiEvent('admin_player_submenu', 'SetSearchFilter', filter => {
        setSearchFilter(filter);
    });

    useEffect(() => {
        if (players != null && players.length === 0) {
            fetchNui<never, Result<AdminPlayer[], never>>(NuiEvent.AdminGetPlayers).then(result => {
                if (isOk(result)) {
                    setPlayers(result.ok);
                }
            });
        }
    }, [players]);

    if (!players) {
        return null;
    }

    const isAdminOrStaff = ['admin', 'staff'].includes(permission);
    const isAdminOrStaffOrGM = ['admin', 'staff', 'gamemaster'].includes(permission);

    return (
        <>
            <SubMenu id="players">
                <MenuTitle title={permission} />
                <MenuContent subtitle="Danh sách & Quản lý người chơi">
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuPlayerHandleSearchPlayer);
                        }}
                    >
                        🔎 Tìm kiếm người chơi: {searchFilter}
                    </MenuItemButton>
                    {players
                        .filter(player => {
                            if (searchFilter === '') {
                                return true;
                            }
                            const search = searchFilter.toLowerCase();
                            return (
                                player.name.toLowerCase().includes(search) ||
                                player.rpFullName.toLowerCase().includes(search)
                            );
                        })
                        .map((player, i) => (
                            <MenuItemSubMenuLink id={'player_' + player.citizenId} key={i}>
                                [{player.id}] {player.rpFullName} | {player.name}
                            </MenuItemSubMenuLink>
                        ))}
                </MenuContent>
            </SubMenu>
            {players.map((player, index) => (
                <>
                    <SubMenu id={'player_' + player.citizenId} key={`player_index_${index}`}>
                        <MenuTitle title={permission} />
                        <MenuContent subtitle={player.name}>
                            <MenuItemButton
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerSpectate, player);
                                }}
                                disabled={!isAdminOrStaffOrGM}
                                description={
                                    <ul>
                                        <MenuSubTitle>Điều khiển chế độ Quan sát</MenuSubTitle>
                                        <MenuItemText> Tab : Chuyển đổi góc nhìn Camera</MenuItemText>
                                        <MenuItemText> Backspace : Thoát chế độ quan sát</MenuItemText>
                                        <MenuItemText> Shift trái : Tăng tốc Camera tự do</MenuItemText>
                                        <MenuItemText> Ctrl trái : Giảm tốc Camera tự do</MenuItemText>
                                    </ul>
                                }
                            >
                                Quan sát người chơi (Spectate)
                            </MenuItemButton>
                            <MenuItemSelect
                                title={'Sức khỏe người chơi'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleHealthOption, {
                                        action: HEALTH_OPTIONS[selectedIndex].value,
                                        player,
                                    });
                                }}
                            >
                                {HEALTH_OPTIONS.map(option => (
                                    <MenuItemSelectOption key={'health_option_' + option.value}>
                                        {option.label}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Trạng thái di chuyển'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleMovementOption, {
                                        action: MOVEMENT_OPTIONS[selectedIndex].value,
                                        player,
                                    });
                                }}
                            >
                                {MOVEMENT_OPTIONS.map(option => (
                                    <MenuItemSelectOption key={'movement_option_' + option.value}>
                                        {option.label}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Voice Chat trong game'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleVocalOption, {
                                        action: VOCAL_OPTIONS[selectedIndex].value,
                                        player,
                                    });
                                }}
                            >
                                {VOCAL_OPTIONS.map(option => (
                                    <MenuItemSelectOption key={'vocal_option_' + option.value}>
                                        {option.label}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Debug Voice'}
                                onConfirm={async (_, value) => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerSetVoipDebug, {
                                        player,
                                        value,
                                    });
                                }}
                            >
                                <MenuItemSelectOption value={true}>Bật</MenuItemSelectOption>
                                <MenuItemSelectOption value={false}>Tắt</MenuItemSelectOption>
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Dịch chuyển (Teleport)'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleTeleportOption, {
                                        action: TELEPORT_OPTIONS[selectedIndex].value,
                                        player,
                                    });
                                }}
                            >
                                {TELEPORT_OPTIONS.map(option => (
                                    <MenuItemSelectOption key={'teleport_option_' + option.value}>
                                        {option.label}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Hiệu ứng say / ảo giác'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleEffectsOption, {
                                        action: EFFECTS_OPTIONS[selectedIndex].value,
                                        player,
                                    });
                                }}
                            >
                                {EFFECTS_OPTIONS.map(option => (
                                    <MenuItemSelectOption key={'effects_option_' + option.value}>
                                        {option.label}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Gây bệnh tật / Chữa trị'}
                                disabled={!isAdminOrStaff}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleDiseaseOption, {
                                        action: DISEASE_OPTIONS[selectedIndex].value,
                                        player,
                                    });
                                }}
                            >
                                {DISEASE_OPTIONS.map(option => (
                                    <MenuItemSelectOption key={'disease_option_' + option.value}>
                                        {option.label}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>
                            <MenuItemButton
                                disabled={!isAdminOrStaff}
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleResetSkin, player);
                                }}
                            >
                                Khôi phục ngoại hình mặc định
                            </MenuItemButton>
                            <MenuItemButton
                                disabled={!isAdminOrStaff}
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerSearch, player);
                                }}
                            >
                                Khám xét người chơi (Search)
                            </MenuItemButton>
                            <MenuItemSubMenuLink id={`player-pet-${player.citizenId}`}>
                                🐕 Quản lý thú cưng
                            </MenuItemSubMenuLink>
                            <MenuItemButton
                                disabled={!isAdminOrStaff}
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleOpenGunSmith, player);
                                }}
                            >
                                Mở bàn chế tạo vũ khí (GunSmith)
                            </MenuItemButton>
                            <MenuSubTitle>Chỉ số cơ thể & Thể chất</MenuSubTitle>
                            <MenuItemSelect
                                title={'Sức mạnh'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleSetAttribute, {
                                        player,
                                        attribute: 'strength',
                                        value: selectedIndex === 0 ? 'min' : 'max',
                                    });
                                }}
                            >
                                <MenuItemSelectOption key={'strength_min_option'}>Thấp nhất</MenuItemSelectOption>
                                <MenuItemSelectOption key={'strength_max_option'}>Cao nhất</MenuItemSelectOption>
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Thể lực (Stamina)'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleSetAttribute, {
                                        player,
                                        attribute: 'stamina',
                                        value: selectedIndex === 0 ? 'min' : 'max',
                                    });
                                }}
                            >
                                <MenuItemSelectOption key={'stamina_min_option'}>Thấp nhất</MenuItemSelectOption>
                                <MenuItemSelectOption key={'stamina_max_option'}>Cao nhất</MenuItemSelectOption>
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Căng thẳng (Stress)'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleSetAttribute, {
                                        player,
                                        attribute: 'stress',
                                        value: selectedIndex === 0 ? 'min' : 'max',
                                    });
                                }}
                            >
                                <MenuItemSelectOption key={'stress_min_option'}>Thấp nhất</MenuItemSelectOption>
                                <MenuItemSelectOption key={'stress_max_option'}>Cao nhất</MenuItemSelectOption>
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Thiếu dưỡng chất'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleSetAttribute, {
                                        player,
                                        attribute: 'deficiency',
                                        value: selectedIndex === 0 ? 'min' : 'max',
                                    });
                                }}
                            >
                                <MenuItemSelectOption key={'deficiency_option'}>Có</MenuItemSelectOption>
                                <MenuItemSelectOption key={'no_deficiency_option'}>Không</MenuItemSelectOption>
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Tất cả chỉ số (AIO)'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleSetAttribute, {
                                        player,
                                        attribute: 'all',
                                        value: selectedIndex === 0 ? 'min' : 'max',
                                    });
                                }}
                            >
                                <MenuItemSelectOption key={'aio_min_option'}>Thấp nhất</MenuItemSelectOption>
                                <MenuItemSelectOption key={'aio_max_option'}>Cao nhất</MenuItemSelectOption>
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={`Mức chấn thương`}
                                value={player.injuries || 0}
                                onConfirm={async index => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleInjuriesUpdate, {
                                        player,
                                        value: index,
                                    });
                                    player.injuries = index;
                                }}
                            >
                                {Array(13)
                                    .fill(0)
                                    .map((_, index) => (
                                        <MenuItemSelectOption value={index} key={`injuries_${index}`}>
                                            {index}
                                        </MenuItemSelectOption>
                                    ))}
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Reset Halloween 2022'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleResetHalloween, {
                                        player,
                                        year: 'halloween2022',
                                        scenario: SCENARIO_OPTIONS[selectedIndex].value,
                                    });
                                }}
                                titleWidth={60}
                            >
                                {SCENARIO_OPTIONS.map(option => (
                                    <MenuItemSelectOption key={'scenario_option_' + option.value}>
                                        {option.label}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Reset Halloween 2023'}
                                onConfirm={async selectedIndex => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleResetHalloween, {
                                        player,
                                        year: 'halloween2023',
                                        scenario: SCENARIO_OPTIONS[selectedIndex].value,
                                    });
                                }}
                                titleWidth={60}
                            >
                                {SCENARIO_OPTIONS.map(option => (
                                    <MenuItemSelectOption key={'scenario_option_' + option.value}>
                                        {option.label}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>
                            <MenuItemCheckbox
                                disabled={!isAdminOrStaff}
                                checked={player.plate}
                                onChange={async value => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerSetPlate, { type: 'plate', player, value });
                                    player.plate = value;
                                }}
                            >
                                Biển số ZEVENT 2024
                            </MenuItemCheckbox>
                            <MenuItemCheckbox
                                disabled={!isAdminOrStaff}
                                checked={player.specialPlate}
                                onChange={async value => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerSetPlate, {
                                        type: 'special_plate',
                                        player,
                                        value,
                                    });
                                    player.specialPlate = value;
                                }}
                            >
                                Biển số đặc biệt ZEVENT 2024
                            </MenuItemCheckbox>
                            <MenuItemButton
                                disabled={!isAdminOrStaff}
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleSetReputation, player);
                                }}
                            >
                                Thay đổi điểm danh tiếng
                            </MenuItemButton>
                            <MenuItemCheckbox
                                disabled={!isAdminOrStaff}
                                checked={player.canCraftMissive}
                                onChange={async value => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleSetCanCraftMissive, { player, value });
                                    player.canCraftMissive = value;
                                }}
                            >
                                Đại diện tổ chức Corbin
                            </MenuItemCheckbox>
                            <MenuItemButton
                                disabled={!isAdminOrStaff}
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleResetCrimi, player);
                                }}
                            >
                                Đặt lại điểm Tội phạm
                            </MenuItemButton>
                            <MenuItemButton
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerHandleResetClientState, player);
                                }}
                            >
                                Đặt lại Client State
                            </MenuItemButton>
                            <MenuItemSelect
                                title="Đảng phái chính trị"
                                value={player.partyMember?.partyId || null}
                                onConfirm={async (_, value) => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerSetSenateParty, {
                                        player,
                                        value,
                                    });
                                }}
                            >
                                <MenuItemSelectOption value={null}>Không có</MenuItemSelectOption>
                                {parties.map(party => (
                                    <MenuItemSelectOption value={party.id} key={`party_${party.id}`}>
                                        {party.name}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>
                            <MenuItemSelect
                                title={'Chế độ Zombie'}
                                onConfirm={async (_, value) => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerSetZombie, {
                                        player,
                                        value,
                                    });
                                }}
                            >
                                <MenuItemSelectOption value={true}>Bật</MenuItemSelectOption>
                                <MenuItemSelectOption value={false}>Tắt</MenuItemSelectOption>
                            </MenuItemSelect>

                            <MenuSubTitle>Ma cà rồng (Vampire)</MenuSubTitle>
                            <MenuItemCheckbox
                                disabled={!isAdminOrStaff}
                                checked={player.vampireGameExcluded}
                                onChange={async enabled => {
                                    await fetchNui(NuiEvent.AdminMenuHalloweenUpdateGamePlayerExclusion, {
                                        citizenId: player.citizenId,
                                        enabled,
                                    });
                                    player.vampireGameExcluded = enabled;
                                }}
                            >
                                Loại khỏi trò chơi Vampire
                            </MenuItemCheckbox>

                            <MenuItemSelect
                                title={'Vai trò game Vampire'}
                                onConfirm={async (_, value) => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerSetHalloweenRole, {
                                        player,
                                        value,
                                    });
                                }}
                            >
                                {Object.values(VampireGameRole).map(role => (
                                    <MenuItemSelectOption key={role} value={role}>
                                        {role}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>

                            <MenuSubTitle>Sự kiện What if</MenuSubTitle>
                            <MenuItemButton
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerResetWhatIfClan, player);
                                }}
                            >
                                Đặt lại Clan
                            </MenuItemButton>
                            <MenuItemButton
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuPlayerResetWhatIfInfection, player);
                                }}
                            >
                                Đặt lại Lây nhiễm
                            </MenuItemButton>
                        </MenuContent>
                    </SubMenu>
                    <PlayerPetSubMenu disabled={!isAdminOrStaff} player={player} permission={permission} />
                </>
            ))}
            <SubMenu id={'player_features'} key={'player_features'}></SubMenu>
        </>
    );
};
