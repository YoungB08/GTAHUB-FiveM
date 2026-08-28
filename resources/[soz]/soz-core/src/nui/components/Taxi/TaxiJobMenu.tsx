import { usePlayer } from '@public/nui/hook/data';
import { RootState } from '@public/nui/store';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { NuiEvent } from '../../../shared/event';
import { JobLabel } from '../../../shared/job';
import { MenuType } from '../../../shared/nui/menu';
import { fetchNui } from '../../fetch';
import { MainMenu, Menu, MenuContent, MenuItemButton, MenuItemText, MenuTitle } from '../Styleguide/Menu';

export const TaxiJobMenu: FunctionComponent = () => {
    const status = useSelector((state: RootState) => state.taxi);
    const player = usePlayer();

    if (!player.job.onduty) {
        return (
            <Menu type={MenuType.TaxiJobMenu}>
                <MainMenu>
                    <MenuTitle title={JobLabel.taxi} />
                    <MenuContent>
                        <MenuItemText>Bạn chưa vào ca làm việc.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.TaxiJobMenu}>
            <MainMenu>
                <MenuTitle title={JobLabel.taxi} />
                <MenuContent>
                    {status.horodateurDisplayed ? (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.TaxiDisplayHorodateur, false);
                            }}
                        >
                            Ẩn đồng hồ tính tiền
                        </MenuItemButton>
                    ) : (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.TaxiDisplayHorodateur, true);
                            }}
                        >
                            Hiện đồng hồ tính tiền
                        </MenuItemButton>
                    )}
                    {status.horodateurStarted ? (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.TaxiSetHorodateur, false);
                            }}
                        >
                            Dừng tính tiền cước
                        </MenuItemButton>
                    ) : (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.TaxiSetHorodateur, true);
                            }}
                        >
                            Bắt đầu tính tiền cước
                        </MenuItemButton>
                    )}
                    {status.taxiMissionInProgress ? (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.TaxiSetMission, false);
                            }}
                        >
                            Hủy nhiệm vụ
                        </MenuItemButton>
                    ) : (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.TaxiSetMission, true);
                            }}
                        >
                            Nhận chuyến chở khách Taxi (NPC)
                        </MenuItemButton>
                    )}
                    {status.busMissionInProgress ? (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.BusSetService, false);
                            }}
                        >
                            Hủy nhiệm vụ
                        </MenuItemButton>
                    ) : (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.BusSetService, true);
                            }}
                        >
                            Nhận tuyến xe Buýt (NPC)
                        </MenuItemButton>
                    )}
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
