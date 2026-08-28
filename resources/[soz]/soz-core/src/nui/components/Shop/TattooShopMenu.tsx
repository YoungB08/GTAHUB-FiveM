import { BrandConfig, BrandsConfig } from '@public/config/shops';
import { fetchNui } from '@public/nui/fetch';
import { NuiEvent } from '@public/shared/event';
import { MenuType } from '@public/shared/nui/menu';
import { TattooShopCategory, TattooShopItem } from '@public/shared/shop';
import { TaxType } from '@public/shared/tax';
import { FunctionComponent } from 'react';

import { useGetPrice } from '../../hook/price';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemSubMenuLink,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

type MenuTattooShopStateProps = {
    data: {
        brand: string;
        categories: Record<string, TattooShopCategory>;
        products: TattooShopItem[];
    };
};

export const TattooShopMenu: FunctionComponent<MenuTattooShopStateProps> = ({ data }) => {
    const config = BrandsConfig[data.brand] as BrandConfig;
    const getPrice = useGetPrice();

    if (!data.products || data.products.length === 0 || !data.brand || !config) {
        return null;
    }

    return (
        <Menu type={MenuType.TattooShop}>
            <MainMenu>
                <MenuTitle title={config.label} />
                <MenuContent>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.TattooShopResetTattos);
                        }}
                        description="Do chất lượng mực xăm kém, bạn có thể chọn xóa toàn bộ hình xăm trên người."
                    >
                        ⚠️ Xóa toàn bộ hình xăm
                    </MenuItemButton>
                    {Object.keys(data.categories).map(category => (
                        <MenuItemSubMenuLink
                            id={category}
                            onSelected={async () => {
                                await fetchNui(NuiEvent.TattooShopSelectCategory, category);
                            }}
                        >
                            {data.categories[category].label}
                        </MenuItemSubMenuLink>
                    ))}
                </MenuContent>
            </MainMenu>
            {Object.keys(data.categories).map(category => (
                <SubMenu key={category} id={category}>
                    <MenuTitle title={config.label} />
                    <MenuContent subtitle={data.categories[category].label}>
                        {Object.values(data.products)
                            .filter(product => product.Zone === category)
                            .map((product, id) => (
                                <MenuItemButton
                                    key={id}
                                    onConfirm={async () => {
                                        await fetchNui(NuiEvent.TattooShopBuy, product);
                                    }}
                                    onSelected={async () => {
                                        await fetchNui(NuiEvent.TattoShopPreview, product);
                                    }}
                                    description="Nhấn Shift để đổi góc nhìn camera."
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{product.Name}</span>
                                        <span className="mr-1">${getPrice(product.Price, TaxType.SUPPLY)}</span>
                                    </div>
                                </MenuItemButton>
                            ))}
                    </MenuContent>
                </SubMenu>
            ))}
        </Menu>
    );
};
