import { SceneSubMenu } from '@public/nui/components/Admin/SceneSubMenu';
import { CeremonySubMenuState } from '@public/shared/admin/admin';
import { JobType } from '@public/shared/job';
import { JobRegistry } from '@public/shared/job/config';
import { FunctionComponent, useState } from 'react';

import { SozRole } from '../../../core/permissions';
import { NuiEvent } from '../../../shared/event';
import { fetchNui } from '../../fetch';
import {
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuSubTitle,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

export type CeremonySubMenuProps = {
    permission: SozRole;
    state: CeremonySubMenuState;
};

export const CeremonySubMenu: FunctionComponent<CeremonySubMenuProps> = ({ permission, state }) => {
    const [volume, setVolume] = useState<number>(10);

    return (
        <>
            <SubMenu id="ceremony">
                <MenuTitle title={permission} />
                <MenuContent subtitle="Sự kiện Buổi lễ">
                    <MenuItemSubMenuLink id="christmas">Quản lý sân khấu</MenuItemSubMenuLink>
                    <MenuItemCheckbox
                        checked={state.disableNpc}
                        onChange={async value => {
                            await fetchNui(NuiEvent.AdminMenuMeteorDisableNpc, value);
                        }}
                    >
                        Tắt spawn NPC thường dân
                    </MenuItemCheckbox>
                    <MenuItemSelect
                        title={`Ép thời gian`}
                        value={-1}
                        onConfirm={async (index, value) => {
                            await fetchNui(NuiEvent.AdminMenuCeremonyTime, { value: value === -1 ? null : value });
                        }}
                    >
                        <MenuItemSelectOption value={-1} key={`time_${-1}`}>
                            Đặt lại (Mặc định)
                        </MenuItemSelectOption>
                        {Array(24)
                            .fill(0)
                            .map((_, index) => (
                                <MenuItemSelectOption value={index} key={`time_${index}`}>
                                    {index} giờ
                                </MenuItemSelectOption>
                            ))}
                    </MenuItemSelect>

                    <MenuSubTitle>Diễu hành buổi lễ</MenuSubTitle>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuCeremonyParadeStart, true);
                        }}
                    >
                        Bắt đầu diễu hành
                    </MenuItemButton>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuCeremonyParadeStart, false);
                        }}
                    >
                        Dừng diễu hành
                    </MenuItemButton>
                    <MenuItemSelect
                        title={`Phát thanh thông báo`}
                        onConfirm={async (index, value) => {
                            await fetchNui(NuiEvent.AdminMenuCeremonyParadeSound, { type: value, volume });
                        }}
                    >
                        {[JobType.LSPD, JobType.BCSO, JobType.SASP, JobType.LSMC, JobType.CashTransfer].map(value => (
                            <MenuItemSelectOption value={value} key={`sound_${value}`}>
                                {JobRegistry[value].platePrefix}
                            </MenuItemSelectOption>
                        ))}
                    </MenuItemSelect>
                    <MenuItemSelect
                        title={`Âm lượng thông báo`}
                        onChange={async index => {
                            setVolume(index + 1);
                        }}
                    >
                        {Array(10)
                            .fill(0)
                            .map((_, index) => (
                                <MenuItemSelectOption value={index} key={`volume_${index}`}>
                                    {index + 1}
                                </MenuItemSelectOption>
                            ))}
                    </MenuItemSelect>

                    <MenuSubTitle>Hiệu ứng ánh sáng buổi lễ</MenuSubTitle>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuPublicCeremonyStart);
                        }}
                    >
                        Thắp sáng các tòa nhà công cộng
                    </MenuItemButton>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuFinalCeremonyStart);
                        }}
                    >
                        Thắp sáng toàn thành phố
                    </MenuItemButton>
                </MenuContent>
            </SubMenu>
            <SceneSubMenu permission={permission} state={state.scene} />
        </>
    );
};
