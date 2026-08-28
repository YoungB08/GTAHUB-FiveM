import { usePlayer } from '@public/nui/hook/data';
import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../shared/event';
import { JobLabel } from '../../../shared/job';
import { MenuType } from '../../../shared/nui/menu';
import { fetchNui } from '../../fetch';
import { MainMenu, Menu, MenuContent, MenuItemCheckbox, MenuItemText, MenuTitle } from '../Styleguide/Menu';

type FoodStateProps = {
    data: {
        displayBinBlip: boolean;
    };
};

export const GarbageJobMenu: FunctionComponent<FoodStateProps> = ({ data }) => {
    const player = usePlayer();

    if (!player.job.onduty) {
        return (
            <Menu type={MenuType.GarbageJobMenu}>
                <MainMenu>
                    <MenuTitle title={JobLabel.garbage} />
                    <MenuContent>
                        <MenuItemText>Bạn chưa vào ca làm việc.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.GarbageJobMenu}>
            <MainMenu>
                <MenuTitle title={JobLabel.garbage} />
                <MenuContent>
                    <MenuItemCheckbox
                        checked={data.displayBinBlip}
                        onChange={value => {
                            fetchNui(NuiEvent.GarbageDisplayBlip, {
                                value,
                            });
                        }}
                    >
                        Hiển thị các điểm thu gom rác trên GPS
                    </MenuItemCheckbox>
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
