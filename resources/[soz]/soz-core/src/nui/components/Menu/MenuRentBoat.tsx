import { VehicleColor } from '@public/shared/vehicle/modification';
import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../shared/event';
import { MenuType } from '../../../shared/nui/menu';
import { fetchNui } from '../../fetch';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuTitle,
} from '../Styleguide/Menu';

const Colors = {
    ['Xanh lá']: VehicleColor.MetallicGreen,
    ['Đỏ']: VehicleColor.MetallicRed,
    ['Cam']: VehicleColor.MetallicOrange,
    ['Vàng']: VehicleColor.MetallicRaceYellow,
    ['Xanh dương']: VehicleColor.MetallicBlue,
    ['Tím']: VehicleColor.MetallicPurple,
    ['Trắng']: VehicleColor.MetallicWhite,
    ['Hồng']: VehicleColor.HotPink,
};

export const MenuRentBoat: FunctionComponent = () => {
    const returnBoat = () => {
        fetchNui(NuiEvent.BoatReturn);
    };

    return (
        <Menu type={MenuType.RentBoat}>
            <MainMenu>
                <MenuTitle title="Thuê thuyền buồm & Ca-nô" />
                <MenuContent>
                    <MenuItemButton onConfirm={() => returnBoat()}>Trả lại thuyền</MenuItemButton>
                    <MenuItemSelect
                        title={`Thuê Marquis`}
                        value={VehicleColor.MetallicGreen}
                        onConfirm={async (index, color) => {
                            await fetchNui(NuiEvent.BoatRent, color);
                        }}
                        description={`Giá thuê : $1450 (Tiền đặt cọc : $1000)`}
                    >
                        {Object.entries(Colors).map(([colorName, colorId]) => (
                            <MenuItemSelectOption value={colorId} key={`color_${colorId}`}>
                                {colorName}
                            </MenuItemSelectOption>
                        ))}
                    </MenuItemSelect>
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
