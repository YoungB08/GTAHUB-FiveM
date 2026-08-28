import { usePlayer } from '@public/nui/hook/data';
import { FunctionComponent, useEffect, useState } from 'react';

import { NuiEvent } from '../../../shared/event';
import { JobLabel } from '../../../shared/job';
import { MenuType } from '../../../shared/nui/menu';
import { fetchNui } from '../../fetch';
import { MainMenu, Menu, MenuContent, MenuItemCheckbox, MenuItemText, MenuTitle } from '../Styleguide/Menu';

type FightForStyleStateProps = {
    data: {
        state: {
            displaySecureContainerTake: boolean;
            displayResellJewelbagBlip: boolean;
            displayResellBigBagBlip: boolean;
            displayResellMediumBagBlip: boolean;
            displayResellSmallBagBlip: boolean;
        };
    };
};

export const StonkJobMenu: FunctionComponent<FightForStyleStateProps> = ({ data }) => {
    const [blips, setBlips] = useState(null);
    const player = usePlayer();

    useEffect(() => {
        if (data && data.state) {
            setBlips(data.state);
        }
    }, [data]);

    if (!blips) {
        return null;
    }

    const displayBlip = async (blip: string, value: boolean) => {
        setBlips({ ...blips, [blip]: value });
        await fetchNui(NuiEvent.StonkDisplayBlip, { blip, value });
    };

    if (!player.job.onduty) {
        return (
            <Menu type={MenuType.StonkJobMenu}>
                <MainMenu>
                    <MenuTitle title={JobLabel['cash-transfer']} />
                    <MenuContent>
                        <MenuItemText>Bạn chưa vào ca làm việc.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.StonkJobMenu}>
            <MainMenu>
                <MenuTitle title={JobLabel['cash-transfer']} />
                <MenuContent>
                    <MenuItemCheckbox
                        checked={blips['displaySecureContainerTake']}
                        onChange={value => displayBlip('displaySecureContainerTake', value)}
                    >
                        Hiển thị Điểm nhận Container bảo mật
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={blips['displayResellJewelbagBlip']}
                        onChange={value => displayBlip('displayResellJewelbagBlip', value)}
                    >
                        Hiển thị Điểm bán túi trang sức
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={blips['displayResellBigBagBlip']}
                        onChange={value => displayBlip('displayResellBigBagBlip', value)}
                    >
                        Hiển thị Điểm bán túi tiền lớn
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={blips['displayResellMediumBagBlip']}
                        onChange={value => displayBlip('displayResellMediumBagBlip', value)}
                    >
                        Hiển thị Điểm bán túi tiền vừa
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={blips['displayResellSmallBagBlip']}
                        onChange={value => displayBlip('displayResellSmallBagBlip', value)}
                    >
                        Hiển thị Điểm bán túi tiền nhỏ
                    </MenuItemCheckbox>
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
