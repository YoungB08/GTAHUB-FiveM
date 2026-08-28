import { useItems, usePlayer } from '@public/nui/hook/data';
import { CraftCategory, CraftRecipe } from '@public/shared/craft/craft';
import { FunctionComponent, useEffect, useState } from 'react';

import { NuiEvent } from '../../../shared/event';
import { JobLabel } from '../../../shared/job';
import { MenuType } from '../../../shared/nui/menu';
import { fetchNui } from '../../fetch';
import { CraftInputs } from '../Shared/CraftInputs';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuItemText,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

type BahamaUnicornStateProps = {
    data: {
        recipes: Record<string, CraftCategory>;
        state: {
            displayLiquorBlip: boolean;
            displayFlavorBlip: boolean;
            displayFurnitureBlip: boolean;
            displayResellBlip: boolean;
            displaySnackBlip: boolean;
            displayBeerBlip: boolean;
        };
    };
};

export const BahamaUnicornJobMenu: FunctionComponent<BahamaUnicornStateProps> = ({ data }) => {
    const [state, setState] = useState(null);
    const [currentRecipe, setCurrentRecipe] = useState<CraftRecipe>();
    const items = useItems();
    const player = usePlayer();

    useEffect(() => {
        if (data && data.state) {
            setState(data.state);
        }
    }, [data]);

    if (!state || !data.recipes) {
        return null;
    }

    const displayBlip = async (key: string, value: boolean) => {
        setState({ ...state, [key]: value });
        await fetchNui(NuiEvent.BaunDisplayBlip, { blip: key, value });
    };

    if (!player.job.onduty) {
        return (
            <Menu type={MenuType.BahamaUnicornJobMenu}>
                <MainMenu>
                    <MenuTitle title={JobLabel.baun} />
                    <MenuContent>
                        <MenuItemText>Bạn chưa vào ca làm việc.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.BahamaUnicornJobMenu}>
            <MainMenu>
                <MenuTitle title={JobLabel.baun} />
                <MenuContent>
                    {Object.keys(data.recipes).map(category => (
                        <MenuItemSubMenuLink
                            id={`recipe_${category}`}
                            key={`recipe_${category}`}
                        >{`Sổ tay công thức ${category}`}</MenuItemSubMenuLink>
                    ))}
                    <MenuItemCheckbox
                        checked={state.displayLiquorBlip}
                        onChange={value => displayBlip('displayLiquorBlip', value)}
                    >
                        Hiển thị điểm thu hoạch rượu
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={state.displayFlavorBlip}
                        onChange={value => displayBlip('displayFlavorBlip', value)}
                    >
                        Hiển thị điểm thu hoạch hương liệu
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={state.displayFurnitureBlip}
                        onChange={value => displayBlip('displayFurnitureBlip', value)}
                    >
                        Hiển thị điểm lấy đồ dùng pha chế
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={state.displaySnackBlip}
                        onChange={value => displayBlip('displaySnackBlip', value)}
                    >
                        Hiển thị điểm lấy đồ ăn nhẹ (Snacks)
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={state.displayBeerBlip}
                        onChange={value => displayBlip('displayBeerBlip', value)}
                    >
                        Hiển thị địa chỉ xưởng ủ bia
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={state.displayResellBlip}
                        onChange={value => displayBlip('displayResellBlip', value)}
                    >
                        Hiển thị điểm bán Cocktail
                    </MenuItemCheckbox>
                </MenuContent>
            </MainMenu>
            {Object.entries(data.recipes).map(([name, category]) => (
                <SubMenu id={`recipe_${name}`}>
                    <MenuTitle title={JobLabel.baun} />
                    <MenuContent subtitle={`Sổ tay công thức ${name}`}>
                        <MenuItemSelect title="" titleWidth={0}>
                            {Object.entries(category.recipes).map(([output, recipe]) => (
                                <MenuItemSelectOption
                                    key={output}
                                    onSelected={() => {
                                        setCurrentRecipe(recipe);
                                    }}
                                >
                                    {recipe.amount}x {items.find(elem => elem.name == output)?.label}
                                </MenuItemSelectOption>
                            ))}
                        </MenuItemSelect>
                        {currentRecipe && <CraftInputs inputs={currentRecipe.inputs} />}
                    </MenuContent>
                </SubMenu>
            ))}
        </Menu>
    );
};
