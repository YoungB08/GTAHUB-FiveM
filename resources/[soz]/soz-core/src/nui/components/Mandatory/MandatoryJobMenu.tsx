import { usePlayer } from '@public/nui/hook/data';
import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../shared/event';
import { JobLabel } from '../../../shared/job';
import { MenuType } from '../../../shared/nui/menu';
import { fetchNui } from '../../fetch';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemText,
    MenuTitle,
} from '../Styleguide/Menu';

type MandatoryStateProps = {
    data: {
        displayRadar: boolean;
    };
};

export const MandatoryJobMenu: FunctionComponent<MandatoryStateProps> = ({ data }) => {
    const player = usePlayer();

    if (!player.job.onduty) {
        return (
            <Menu type={MenuType.MandatoryJobMenu}>
                <MainMenu>
                    <MenuTitle title={JobLabel.mdr} />
                    <MenuContent>
                        <MenuItemText>Bạn chưa vào ca làm việc.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.MandatoryJobMenu}>
            <MainMenu>
                <MenuTitle title={JobLabel.mdr} />
                <MenuContent>
                    <MenuItemCheckbox
                        checked={data.displayRadar}
                        onChange={async value => {
                            await fetchNui(NuiEvent.ToggleRadar, value);
                        }}
                    >
                        Hiển thị các trạm đo tốc độ (Radar) trên GPS
                    </MenuItemCheckbox>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.RedCallMendatory);
                        }}
                    >
                        🚨 Báo động Khẩn cấp (Code Red)
                    </MenuItemButton>
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
