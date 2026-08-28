import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemSubMenuLink,
    MenuItemText,
    MenuTitle,
    SubMenu,
} from '@public/nui/components/Styleguide/Menu';
import { fetchNui } from '@public/nui/fetch';
import { NuiEvent } from '@public/shared/event';
import { LaserGameAdminInfo, LaserGameType } from '@public/shared/games/laser';
import { MenuType } from '@public/shared/nui/menu';
import { FunctionComponent } from 'react';

type MenuLaserGameAdminProps = {
    data: Record<string, LaserGameAdminInfo>;
};

export const MenuLaserGameAdmin: FunctionComponent<MenuLaserGameAdminProps> = ({ data }) => {
    return (
        <Menu type={MenuType.LaserGameAdmin}>
            <MainMenu>
                <MenuTitle title="Bắn Súng Laser (Admin)" />
                <MenuContent>
                    {Object.keys(data).length === 0 && <MenuItemText>Không có phòng chơi nào</MenuItemText>}
                    {Object.values(data).map(game => {
                        return (
                            <MenuItemSubMenuLink key={`game_${game.creator}`} id={`game_${game.creator}`}>
                                {`Phòng của ${game.players[game.creator].rpFullName}`}
                            </MenuItemSubMenuLink>
                        );
                    })}
                </MenuContent>
            </MainMenu>
            {Object.values(data).map(game => {
                return <LaserGameSubMenu key={`game_${game.creator}`} data={game} />;
            })}
        </Menu>
    );
};

type MenuLaserGameSubProps = {
    data: LaserGameAdminInfo;
};

export const LaserGameSubMenu: FunctionComponent<MenuLaserGameSubProps> = ({ data }) => {
    return (
        <>
            <SubMenu id={`game_${data.creator}`}>
                <MenuTitle title={`Phòng của ${data.players[data.creator].rpFullName}`} />
                <MenuContent>
                    <MenuItemSubMenuLink key={`players_${data.creator}`} id={`players_${data.creator}`}>
                        Danh sách người chơi
                    </MenuItemSubMenuLink>
                    <MenuItemText>{`Chế độ chơi: ${LaserGameType[data.type].name}`}</MenuItemText>
                </MenuContent>
            </SubMenu>
            <SubMenu id={`players_${data.creator}`}>
                <MenuTitle title="Người chơi" />
                <MenuContent>
                    {Object.values(data.players).map(player => (
                        <MenuItemButton
                            key={player.citizenId}
                            description="Theo dõi người chơi (Spectate)"
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.AdminMenuPlayerSpectate, player);
                            }}
                        >
                            {player.rpFullName}
                        </MenuItemButton>
                    ))}
                </MenuContent>
            </SubMenu>
        </>
    );
};
