import { SozRole } from '@core/permissions';
import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../shared/event';
import { fetchNui } from '../../fetch';
import {
    MenuContent,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

export type InteractiveSubMenuProps = {
    permission: SozRole;
    state: {
        displayOwners: boolean;
        displayDebugSurface: boolean;
        displayPlayerNames: boolean;
        displayPlayersOnMap: boolean;
    };
};

export const InteractiveSubMenu: FunctionComponent<InteractiveSubMenuProps> = ({ permission, state }) => {
    return (
        <SubMenu id="interactive">
            <MenuTitle title={permission} />
            <MenuContent subtitle="Tùy chọn hiển thị tương tác">
                <MenuItemCheckbox
                    checked={state.displayOwners}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminToggleDisplayOwners, value);
                    }}
                >
                    Hiển thị chủ sở hữu phương tiện
                </MenuItemCheckbox>
                <MenuItemCheckbox
                    checked={state.displayDebugSurface}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminToggleDisplaySurfaceDebug, value);
                    }}
                >
                    Hiển thị thuộc tính bề mặt (Surface Debug)
                </MenuItemCheckbox>
                <MenuItemSelect
                    title={'Hiển thị tên người chơi'}
                    onConfirm={async value => {
                        await fetchNui(NuiEvent.AdminToggleDisplayPlayerNames, {
                            value: !state.displayPlayerNames,
                            withDetails: value === 1,
                        });
                        state.displayPlayerNames = !state.displayPlayerNames;
                    }}
                >
                    <MenuItemSelectOption>Không kèm chi tiết</MenuItemSelectOption>
                    <MenuItemSelectOption>Kèm thông tin chi tiết</MenuItemSelectOption>
                </MenuItemSelect>
                <MenuItemCheckbox
                    checked={state.displayPlayersOnMap}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminToggleDisplayPlayersOnMap, value);
                    }}
                >
                    Hiển thị tất cả người chơi trên bản đồ
                </MenuItemCheckbox>
            </MenuContent>
        </SubMenu>
    );
};
