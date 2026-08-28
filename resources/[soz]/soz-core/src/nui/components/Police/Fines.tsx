import { fetchNui } from '@public/nui/fetch';
import { NuiEvent } from '@public/shared/event';
import { PoliceJobFineMenuData } from '@public/shared/job/police';
import { MenuType } from '@public/shared/nui/menu';
import { FunctionComponent } from 'react';

import { JobLabel } from '../../../shared/job';
import { RepositoryType } from '../../../shared/repository';
import { useRepository } from '../../hook/repository';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemSubMenuLink,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

type FinesStateProps = {
    data: PoliceJobFineMenuData;
};

export const FinesMenu: FunctionComponent<FinesStateProps> = ({ data }) => {
    return (
        <Menu type={MenuType.PoliceJobFines}>
            <MainMenu>
                <MenuTitle title={data.job} />
                <MenuContent subtitle="Xử phạt vi phạm hành chính & Trật tự">
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.PolicePreCustomFine, {
                                playerServerId: data.playerServerId,
                            });
                        }}
                    >
                        Mức phạt tùy chỉnh
                    </MenuItemButton>
                    <MenuItemSubMenuLink id="fine_1">Nhóm vi phạm 1 (Nhẹ)</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="fine_2">Nhóm vi phạm 2 (Trung bình)</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="fine_3">Nhóm vi phạm 3 (Nghiêm trọng)</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="fine_4">Nhóm vi phạm 4 (Đặc biệt nghiêm trọng)</MenuItemSubMenuLink>
                </MenuContent>
            </MainMenu>
            <FineSubMenu category={1} playerServerId={data.playerServerId} />
            <FineSubMenu category={2} playerServerId={data.playerServerId} />
            <FineSubMenu category={3} playerServerId={data.playerServerId} />
            <FineSubMenu category={4} playerServerId={data.playerServerId} />
        </Menu>
    );
};

type FineSubMenuProps = {
    category: number;
    playerServerId: number;
};

const FineSubMenu: FunctionComponent<FineSubMenuProps> = ({ category, playerServerId }) => {
    const fines = useRepository(RepositoryType.Fine);
    const finesForCategory = Object.values(fines).filter(fine => fine.category === category);

    return (
        <SubMenu id={`fine_${category}`}>
            <MenuTitle title={JobLabel.gouv} />
            <MenuContent subtitle={`Bảng phạt vi phạm nhóm ${category}`}>
                {finesForCategory.map(fine => (
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.PolicePreFine, {
                                playerServerId,
                                fine: fine,
                            });
                        }}
                    >
                        <div className="flex justify-between">
                            <div>{fine.label}</div>
                            <div>
                                ${fine.price.min} - ${fine.price.max}
                            </div>
                        </div>
                    </MenuItemButton>
                ))}
            </MenuContent>
        </SubMenu>
    );
};
