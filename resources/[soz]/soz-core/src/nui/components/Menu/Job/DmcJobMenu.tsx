import { usePlayer } from '@public/nui/hook/data';
import { DmcJobMenuData } from '@public/shared/job/dmc';
import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../../shared/event';
import { JobLabel } from '../../../../shared/job';
import { MenuType } from '../../../../shared/nui/menu';
import { fetchNui } from '../../../fetch';
import { MainMenu, Menu, MenuContent, MenuItemCheckbox, MenuItemText, MenuTitle } from '../../Styleguide/Menu';

type DmcStateProps = {
    data: DmcJobMenuData;
};

const labels = {
    'job:dmc:iron_mine': 'Hiển thị mỏ sắt',
    'job:dmc:aluminium_mine': 'Hiển thị mỏ nhôm',
    'job:dmc:uranium_mine': 'Hiển thị mỏ uranium',
    'job:dmc:resell': 'Hiển thị điểm bán quặng & kim loại',
};

export const DmcJobMenu: FunctionComponent<DmcStateProps> = ({ data }) => {
    const player = usePlayer();

    if (!player.job.onduty) {
        return (
            <Menu type={MenuType.DmcJobMenu}>
                <MainMenu>
                    <MenuTitle title={JobLabel.dmc} />
                    <MenuContent>
                        <MenuItemText>Bạn chưa vào ca làm việc.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.DmcJobMenu}>
            <MainMenu>
                <MenuTitle title={JobLabel.dmc} />
                <MenuContent>
                    {Object.entries(data.blipState).map(([key, checked]) => (
                        <MenuItemCheckbox
                            key={key}
                            checked={checked}
                            onChange={value => {
                                fetchNui(NuiEvent.DmcToggleBlip, { blip: key, value });
                            }}
                        >
                            {labels[key]}
                        </MenuItemCheckbox>
                    ))}
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
