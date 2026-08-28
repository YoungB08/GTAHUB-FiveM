import { fetchNui } from '@public/nui/fetch';
import { usePlayer } from '@public/nui/hook/data';
import { NuiEvent } from '@public/shared/event';
import { MenuType } from '@public/shared/nui/menu';
import { FunctionComponent } from 'react';

import { JobLabel } from '../../../../shared/job';
import { MenuPawlData } from '../../../../shared/nui/pawl';
import { MainMenu, Menu, MenuContent, MenuItemCheckbox, MenuItemText, MenuTitle } from '../../Styleguide/Menu';

type MenuPawlProps = {
    data?: MenuPawlData;
};

export const MenuPawl: FunctionComponent<MenuPawlProps> = ({ data }) => {
    const player = usePlayer();

    if (!data || !player) {
        return null;
    }

    if (!player?.job.onduty) {
        return (
            <Menu type={MenuType.JobPawl}>
                <MainMenu>
                    <MenuTitle title={JobLabel.pawl} />
                    <MenuContent>
                        <MenuItemText>Bạn hiện chưa vào ca trực lâm nghiệp.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.JobPawl}>
            <MainMenu>
                <MenuTitle title={JobLabel.pawl} />
                <MenuContent>
                    <MenuItemCheckbox
                        checked={data.showFields}
                        onChange={value => {
                            fetchNui(NuiEvent.PawlShowFields, { value });
                        }}
                    >
                        Hiển thị khu vực khai thác gỗ trên GPS
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.showResell}
                        onChange={value => {
                            fetchNui(NuiEvent.PawlShowResell, { value });
                        }}
                    >
                        Hiển thị điểm thu mua gỗ trên GPS
                    </MenuItemCheckbox>
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
