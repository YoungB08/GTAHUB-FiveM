import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuTitle,
} from '@public/nui/components/Styleguide/Menu';
import { fetchNui } from '@public/nui/fetch';
import { PetJobKennelMenuData } from '@public/shared/animal';
import { NuiEvent } from '@public/shared/event/nui';
import { MenuType } from '@public/shared/nui/menu';
import { FunctionComponent } from 'react';

type PetJobKennelMenuProps = {
    data: PetJobKennelMenuData;
};

export const PetJobKennelMenu: FunctionComponent<PetJobKennelMenuProps> = ({ data }) => {
    return (
        <Menu type={MenuType.PetJobKennel}>
            <MainMenu>
                <MenuTitle title="Chuồng nuôi thú cưng cơ quan" />
                <MenuContent>
                    {data.pets.map(
                        pet =>
                            (pet.available || pet.withPlayer) && (
                                <MenuItemSelect
                                    title={pet.name || `Thú cưng chưa đặt tên`}
                                    onConfirm={async (_, value) => {
                                        if (!value) return;
                                        await fetchNui(NuiEvent.PetKennelAction, { pet, action: value });
                                    }}
                                >
                                    {pet.available && (
                                        <MenuItemSelectOption key={'action_take'} value="take">
                                            Dắt thú cưng đi theo
                                        </MenuItemSelectOption>
                                    )}
                                    {pet.withPlayer && (
                                        <MenuItemSelectOption key={'action_remove'} value="remove">
                                            Gửi thú cưng vào chuồng
                                        </MenuItemSelectOption>
                                    )}
                                    {pet.available && (
                                        <MenuItemSelectOption key={'action_abondon'} value="abandon">
                                            Bỏ nuôi thú cưng
                                        </MenuItemSelectOption>
                                    )}
                                </MenuItemSelect>
                            )
                    )}
                    {data.pets.map(
                        pet =>
                            !pet.available &&
                            !pet.withPlayer && (
                                <MenuItemSelect
                                    title={pet.name || `Thú cưng chưa đặt tên`}
                                    onConfirm={async (_, value) => {
                                        if (!value) return;
                                        await fetchNui(NuiEvent.PetKennelAction, { pet, action: value });
                                    }}
                                >
                                    <MenuItemSelectOption key={'action_recall'} value="recall">
                                        Triệu hồi thú cưng về chuồng
                                    </MenuItemSelectOption>
                                </MenuItemSelect>
                            )
                    )}
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
