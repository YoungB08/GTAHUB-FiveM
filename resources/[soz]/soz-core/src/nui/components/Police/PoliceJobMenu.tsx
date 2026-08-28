import { fetchNui } from '@public/nui/fetch';
import { usePlayer } from '@public/nui/hook/data';
import { NuiEvent } from '@public/shared/event';
import { JobType } from '@public/shared/job';
import { PoliceJobMenuData } from '@public/shared/job/police';
import { MenuType } from '@public/shared/nui/menu';
import { FunctionComponent, useEffect, useState } from 'react';

import { JobPetsSubMenu } from '../Admin/JobPetSubMenu';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSubMenuLink,
    MenuItemText,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

type PoliceJobStateProps = {
    data: PoliceJobMenuData;
};

export const PoliceJobMenu: FunctionComponent<PoliceJobStateProps> = ({ data }) => {
    const player = usePlayer();

    const [wantedPlayers, setWantedPlayers] = useState(null);
    const isStaffOrAdmin = ['staff', 'admin'].includes(data.permission);

    useEffect(() => {
        if (player.job.onduty && wantedPlayers == null) {
            fetchNui(NuiEvent.PoliceGetWantedPlayers).then((players: any) => {
                setWantedPlayers(players);
            });
        }
    });

    if (!player.job.onduty) {
        return (
            <Menu type={MenuType.PoliceJobMenu}>
                <MainMenu>
                    <MenuTitle title={player.job.id} />
                    <MenuContent>
                        <MenuItemText>Bạn hiện chưa vào ca trực nghiệp vụ.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.PoliceJobMenu}>
            <MainMenu>
                <MenuTitle title={player.job.id} />
                <MenuContent subtitle="Bảo vệ trật tự & Thực thi pháp luật!">
                    {player.job.id == JobType.SASP || player.job.id == JobType.FBI ? (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.NewsCreateAnnounce, {
                                    type: `${player.job.id}_annoncement`,
                                    title: 'Nội dung thông cáo cảnh sát',
                                });
                            }}
                        >
                            Phát thông cáo nghiệp vụ
                        </MenuItemButton>
                    ) : (
                        <></>
                    )}
                    {player.job.id == JobType.FBI ? (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.NewsCreateAnnounce, {
                                    type: `presidence`,
                                    title: 'Nội dung thông cáo chính phủ',
                                });
                            }}
                        >
                            Phát thông cáo chính quyền
                        </MenuItemButton>
                    ) : (
                        <></>
                    )}
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.RedCall);
                        }}
                    >
                        🚨 | Báo động Đỏ khẩn cấp
                    </MenuItemButton>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.PoliceShowBadge);
                        }}
                    >
                        Xuất trình thẻ ngành / Huy hiệu
                    </MenuItemButton>
                    <MenuItemSubMenuLink id="persons_searched">👮 | Danh sách đối tượng truy nã</MenuItemSubMenuLink>
                    <MenuItemCheckbox
                        checked={data.displayRadar}
                        onChange={async value => {
                            await fetchNui(NuiEvent.ToggleRadar, value);
                        }}
                    >
                        Hiển thị radar đo tốc độ trên GPS
                    </MenuItemCheckbox>
                    {isStaffOrAdmin && (
                        <MenuItemSubMenuLink id={`pet-management-${player.job.id}`}>
                            🐕 | Quản lý chó nghiệp vụ K9
                        </MenuItemSubMenuLink>
                    )}
                </MenuContent>
            </MainMenu>
            <SubMenu id="persons_searched">
                <MenuTitle title={player.job.id} />
                <MenuContent subtitle="Danh sách đối tượng truy nã">
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.NewsCreateAnnounce, {
                                type: player.job.id,
                                title: 'Họ tên đối tượng truy nã:',
                            });
                            setWantedPlayers(await fetchNui(NuiEvent.PoliceGetWantedPlayers));
                        }}
                    >
                        Thêm đối tượng vào danh sách
                    </MenuItemButton>
                    {wantedPlayers &&
                        wantedPlayers.map((player: any) => (
                            <MenuItemButton
                                key={player.id}
                                description="Gỡ bỏ đối tượng khỏi danh sách truy nã"
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.PoliceDeleteWantedPlayer, {
                                        id: player.id,
                                        message: player.message,
                                    });
                                    setWantedPlayers(await fetchNui(NuiEvent.PoliceGetWantedPlayers));
                                }}
                            >
                                {player.message}
                            </MenuItemButton>
                        ))}
                </MenuContent>
            </SubMenu>
            <JobPetsSubMenu job={player.job.id} />
        </Menu>
    );
};
