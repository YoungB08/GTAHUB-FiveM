import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../../shared/event';
import { JobLabel, JobType } from '../../../../shared/job';
import { MenuType } from '../../../../shared/nui/menu';
import { fetchNui } from '../../../fetch';
import { usePlayer } from '../../../hook/data';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemText,
    MenuTitle,
} from '../../Styleguide/Menu';

type MenuNewsProps = {
    data?: {
        job: JobType;
    };
};

export const MenuNews: FunctionComponent<MenuNewsProps> = ({ data }) => {
    const player = usePlayer();

    if (!data) {
        return null;
    }

    if (!player?.job.onduty) {
        return (
            <Menu type={MenuType.JobUpw}>
                <MainMenu>
                    <MenuTitle title={JobLabel[data.job]} />
                    <MenuContent>
                        <MenuItemText>Bạn hiện chưa vào ca trực tin tức.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.JobNews}>
            <MainMenu>
                <MenuTitle title={JobLabel[data.job]} />
                <MenuContent>
                    <MenuItemSelect
                        title="Phát sóng bản tin"
                        onConfirm={(i, value) => {
                            fetchNui(NuiEvent.NewsCreateAnnounce, {
                                type: value,
                                title: 'Nội dung bản tin phát sóng',
                            });
                        }}
                    >
                        <MenuItemSelectOption value="annonce">Thông báo chung</MenuItemSelectOption>
                        <MenuItemSelectOption value="breaking-news">Tin nóng khẩn cấp (Breaking News)</MenuItemSelectOption>
                        <MenuItemSelectOption value="publicité">Quảng cáo dịch vụ</MenuItemSelectOption>
                        <MenuItemSelectOption value="fait-divers">Tin đời sống & Sự kiện</MenuItemSelectOption>
                        <MenuItemSelectOption value="info-trafic">Tình hình giao thông</MenuItemSelectOption>
                    </MenuItemSelect>
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
