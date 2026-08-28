import { fetchNui } from '@public/nui/fetch';
import { usePlayer } from '@public/nui/hook/data';
import { NuiEvent } from '@public/shared/event';
import { MenuType } from '@public/shared/nui/menu';
import { FunctionComponent } from 'react';

import { JobLabel } from '../../../../shared/job';
import { MenuOilData } from '../../../../shared/job/oil';
import { MainMenu, Menu, MenuContent, MenuItemCheckbox, MenuItemText, MenuTitle } from '../../Styleguide/Menu';

type MenuOilProps = {
    data?: MenuOilData;
};

export const MenuOil: FunctionComponent<MenuOilProps> = ({ data }) => {
    const player = usePlayer();

    if (!data || !player) {
        return null;
    }

    if (!player?.job.onduty) {
        return (
            <Menu type={MenuType.JobOil}>
                <MainMenu>
                    <MenuTitle title={JobLabel.oil} />
                    <MenuContent>
                        <MenuItemText>Bạn hiện chưa vào ca trực ngành dầu khí.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.JobOil}>
            <MainMenu>
                <MenuTitle title={JobLabel.oil} />
                <MenuContent>
                    <MenuItemCheckbox
                        checked={data.showOilFields}
                        onChange={value => {
                            fetchNui(NuiEvent.OilShowOilFields, { value });
                        }}
                    >
                        Hiển thị mỏ khai thác dầu thô trên GPS
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.showRefinery}
                        onChange={value => {
                            fetchNui(NuiEvent.OilShowRefinery, { value });
                        }}
                    >
                        Hiển thị nhà máy lọc dầu trên GPS
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.showReseller}
                        onChange={value => {
                            fetchNui(NuiEvent.OilShowReseller, { value });
                        }}
                    >
                        Hiển thị điểm phân phối xăng dầu trên GPS
                    </MenuItemCheckbox>
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
