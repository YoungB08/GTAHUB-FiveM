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

type FoodStateProps = {
    data: {
        recipes: Record<string, CraftCategory>;
        state: {
            displayEasterEggBlip: boolean;
            easterEnabled: boolean;
        };
    };
};

export const FoodJobMenu: FunctionComponent<FoodStateProps> = ({ data }) => {
    const [blips, setBlips] = useState(null);
    const [currentRecipe, setCurrentRecipe] = useState<CraftRecipe>(null);
    const items = useItems();
    const player = usePlayer();

    useEffect(() => {
        if (data && data.state) {
            setBlips(data.state);
        }
    }, [data]);

    const displayBlip = async (blip: string, value: boolean) => {
        setBlips({ ...blips, [blip]: value });
        await fetchNui(NuiEvent.FoodDisplayBlip, { blip, value });
    };

    if (!data.recipes) {
        return null;
    }

    if (!player.job.onduty) {
        return (
            <Menu type={MenuType.FoodJobMenu}>
                <MainMenu>
                    <MenuTitle title={JobLabel.food} />
                    <MenuContent>
                        <MenuItemText>Bạn chưa vào ca làm việc.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.FoodJobMenu}>
            <MainMenu>
                <MenuTitle title={JobLabel.food} />
                <MenuContent>
                    {Object.keys(data.recipes).map(category => (
                        <MenuItemSubMenuLink
                            id={`recipe_${category}`}
                            key={`recipe_${category}`}
                        >{`Sổ tay công thức ${data.recipes[category].icon} ${category}`}</MenuItemSubMenuLink>
                    ))}
                    {data.state.easterEnabled && (
                        <MenuItemCheckbox
                            checked={data.state.displayEasterEggBlip}
                            onChange={value => displayBlip('displayEasterEggBlip', value)}
                        >
                            Hiển thị điểm thu thập Trứng Phục Sinh
                        </MenuItemCheckbox>
                    )}
                </MenuContent>
            </MainMenu>
            {Object.entries(data.recipes).map(([name, category]) => (
                <SubMenu id={`recipe_${name}`}>
                    <MenuTitle title={JobLabel.food} />
                    <MenuContent subtitle={`Sổ tay công thức ${data.recipes[name].icon} ${name}`}>
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
