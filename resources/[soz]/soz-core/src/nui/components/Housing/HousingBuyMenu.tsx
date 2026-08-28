import { MenuType } from '@public/shared/nui/menu';
import { TaxType } from '@public/shared/tax';
import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../shared/event/nui';
import { ApartmentMenuData } from '../../../shared/housing/housing';
import { fetchNui } from '../../fetch';
import { useGetPrice } from '../../hook/price';
import { MainMenu, Menu, MenuContent, MenuItemButton, MenuTitle } from '../Styleguide/Menu';

type HousingBuyMenuProps = {
    data?: ApartmentMenuData;
};

export const HousingBuyMenu: FunctionComponent<HousingBuyMenuProps> = ({ data }) => {
    const getPrice = useGetPrice();

    if (!data) {
        return null;
    }

    return (
        <Menu type={MenuType.HousingBuyMenu}>
            <MainMenu>
                <MenuTitle title="Bất Động Sản & Nhà Ở" />
                <MenuContent>
                    {data.apartments.map(apartment => {
                        return (
                            <MenuItemButton
                                onConfirm={() => {
                                    fetchNui(NuiEvent.HousingBuy, {
                                        apartmentId: apartment.id,
                                        propertyId: data.property.id,
                                    });
                                }}
                                key={apartment.id}
                            >
                                <div className="pr-2 flex items-center justify-between">
                                    <span>{apartment.label}</span>
                                    <span>
                                        💸 $
                                        {Intl.NumberFormat('vi-VN').format(getPrice(apartment.price, TaxType.HOUSING))}
                                    </span>
                                </div>
                            </MenuItemButton>
                        );
                    })}
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
