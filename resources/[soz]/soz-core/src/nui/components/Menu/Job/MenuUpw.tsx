import { fetchNui } from '@public/nui/fetch';
import { usePlayer } from '@public/nui/hook/data';
import { NuiEvent } from '@public/shared/event';
import { MenuUpwData, UpwFacilityType } from '@public/shared/job/upw';
import { MenuType } from '@public/shared/nui/menu';
import { FunctionComponent, useEffect, useState } from 'react';

import { JobLabel } from '../../../../shared/job';
import { MainMenu, Menu, MenuContent, MenuItemCheckbox, MenuItemText, MenuTitle } from '../../Styleguide/Menu';

type MenuUpwProps = {
    data?: MenuUpwData;
};

export const MenuUpw: FunctionComponent<MenuUpwProps> = ({ data }) => {
    const player = usePlayer();
    const [blips, setBlips] = useState(null);

    useEffect(() => {
        if (data && data.blips) {
            setBlips(data.blips);
        }
    }, [data]);

    if (!data || !player || !blips) {
        return null;
    }

    const displayBlip = async (blip: UpwFacilityType, value: boolean) => {
        await fetchNui(NuiEvent.UpwDisplayBlips, { type: blip, value });
    };

    if (!player?.job.onduty) {
        return (
            <Menu type={MenuType.JobUpw}>
                <MainMenu>
                    <MenuTitle title={JobLabel.upw} />
                    <MenuContent>
                        <MenuItemText>Bạn hiện chưa vào ca trực điện lực.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.JobUpw}>
            <MainMenu>
                <MenuTitle title={JobLabel.upw} />
                <MenuContent>
                    <MenuItemCheckbox
                        checked={blips[UpwFacilityType.inverter]}
                        onChange={value => displayBlip(UpwFacilityType.inverter, value)}
                    >
                        Hiển thị Bộ biến tần (Inverter)
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={blips[UpwFacilityType.jobTerminal]}
                        onChange={value => displayBlip(UpwFacilityType.jobTerminal, value)}
                    >
                        Hiển thị Trạm sạc doanh nghiệp
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={blips[UpwFacilityType.terminal]}
                        onChange={value => displayBlip(UpwFacilityType.terminal, value)}
                    >
                        Hiển thị Trạm sạc dân dụng
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={blips[UpwFacilityType.plant]}
                        onChange={value => displayBlip(UpwFacilityType.plant, value)}
                    >
                        Hiển thị Cơ sở phát điện
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={blips[UpwFacilityType.resell]}
                        onChange={value => displayBlip(UpwFacilityType.resell, value)}
                    >
                        Hiển thị Điểm thu mua năng lượng
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={blips[UpwFacilityType.charger]}
                        onChange={value => displayBlip(UpwFacilityType.charger, value)}
                    >
                        Hiển thị Vị trí các bộ sạc pin
                    </MenuItemCheckbox>
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
