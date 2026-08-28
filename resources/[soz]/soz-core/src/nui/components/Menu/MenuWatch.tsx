import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../shared/event';
import { AllThemesConfig, HudSettings } from '../../../shared/hud';
import { MenuType } from '../../../shared/nui/menu';
import { fetchNui } from '../../fetch';
import { usePlayer } from '../../hook/data';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuSubTitle,
    MenuTitle,
} from '../Styleguide/Menu';

type MenuWatchProps = {
    data: HudSettings;
};

export const MenuWatch: FunctionComponent<MenuWatchProps> = ({ data }) => {
    const player = usePlayer();

    if (!player) {
        return null;
    }

    return (
        <Menu type={MenuType.WatchMenu}>
            <MainMenu>
                <MenuTitle title="Đồng hồ Thông minh" />
                <MenuContent>
                    <MenuItemSelect
                        title="Chủ đề màu"
                        value={data.theme}
                        description={`Giao diện màu sắc của đồng hồ và HUD`}
                        onConfirm={async (_, value) => {
                            await fetchNui(NuiEvent.WatchMenuSetTheme, value);
                        }}
                    >
                        {data.availableTheme.map(id => (
                            <MenuItemSelectOption key={id} value={id}>
                                {AllThemesConfig[id]?.label ?? id}
                            </MenuItemSelectOption>
                        ))}
                    </MenuItemSelect>

                    <MenuItemSelect
                        title="Kích thước Đồng hồ"
                        value={data.zoom}
                        description={`Tỉ lệ thu phóng của đồng hồ HUD`}
                        onConfirm={async (_, value) => {
                            await fetchNui(NuiEvent.WatchMenuSetZoom, value);
                        }}
                    >
                        <MenuItemSelectOption value={0.5}>50%</MenuItemSelectOption>
                        <MenuItemSelectOption value={0.75}>75%</MenuItemSelectOption>
                        <MenuItemSelectOption value={1}>100%</MenuItemSelectOption>
                        <MenuItemSelectOption value={1.25}>125%</MenuItemSelectOption>
                        <MenuItemSelectOption value={1.5}>150%</MenuItemSelectOption>
                    </MenuItemSelect>

                    <MenuItemSelect
                        title="Kích thước Túi đồ"
                        value={data.inventorySize}
                        description={`Tỉ lệ thu phóng giao diện túi đồ`}
                        onConfirm={async (_, value) => {
                            await fetchNui(NuiEvent.WatchMenuSetInventorySize, value);
                        }}
                    >
                        <MenuItemSelectOption value={0.5}>50%</MenuItemSelectOption>
                        <MenuItemSelectOption value={0.75}>75%</MenuItemSelectOption>
                        <MenuItemSelectOption value={1}>100%</MenuItemSelectOption>
                        <MenuItemSelectOption value={1.25}>125%</MenuItemSelectOption>
                        <MenuItemSelectOption value={1.5}>150%</MenuItemSelectOption>
                    </MenuItemSelect>

                    <MenuItemCheckbox
                        checked={data.showDateTime}
                        description="Bật / Tắt hiển thị ngày và giờ thực tế"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetShowDateTime, value)}
                    >
                        Ngày và Giờ
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.showWeather}
                        description="Bật / Tắt hiển thị thời tiết hiện tại"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetShowWeather, value)}
                    >
                        Thời tiết
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.showStreetName}
                        description="Bật / Tắt hiển thị tên đường và vị trí"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetShowStreetName, value)}
                    >
                        Tên đường & Vị trí
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.showCompass}
                        description="Bật / Tắt hiển thị la bàn định hướng"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetShowCompass, value)}
                    >
                        La bàn định hướng
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.showStress}
                        description="Bật / Tắt hiển thị mức độ căng thẳng"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetShowStress, value)}
                    >
                        Mức độ căng thẳng (Stress)
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.showStamina}
                        description="Bật / Tắt hiển thị thanh thể lực"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetShowStamina, value)}
                    >
                        Thể lực (Stamina)
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={data.showAnimalStats}
                        description="Bật / Tắt hiển thị chỉ số sức khỏe thú cưng"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetShowAnimalStats, value)}
                    >
                        Trạng thái thú cưng
                    </MenuItemCheckbox>
                    <MenuSubTitle>Trạng thái thương tật</MenuSubTitle>
                    <MenuItemCheckbox
                        checked={data.showInjuryTracker}
                        description="Bật / Tắt hiển thị sơ đồ thương tật cơ thể"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetShowInjuryTracker, value)}
                    >
                        Sơ đồ thương tật cơ thể
                    </MenuItemCheckbox>
                    <MenuItemSelect
                        title="Kích cỡ sơ đồ"
                        value={data.zoomInjuryTracker}
                        onConfirm={async (_, value) => {
                            await fetchNui(NuiEvent.WatchMenuSetZoomInjuryTracker, value);
                        }}
                    >
                        <MenuItemSelectOption value={0.5}>50%</MenuItemSelectOption>
                        <MenuItemSelectOption value={0.75}>75%</MenuItemSelectOption>
                        <MenuItemSelectOption value={1}>100%</MenuItemSelectOption>
                        <MenuItemSelectOption value={1.25}>125%</MenuItemSelectOption>
                        <MenuItemSelectOption value={1.5}>150%</MenuItemSelectOption>
                    </MenuItemSelect>
                    <MenuItemCheckbox
                        checked={data.switchInjuryTrackerPosition}
                        description="Đổi vị trí hiển thị sơ đồ thương tật"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetSwitchInjuryTrackerPosition, value)}
                    >
                        Hiển thị thương tật bên trái màn hình
                    </MenuItemCheckbox>

                    <MenuSubTitle>Bố cục & Vị trí</MenuSubTitle>
                    <MenuItemCheckbox
                        checked={data.switchPlayerStatsPosition}
                        description="Đổi vị trí thanh máu, giáp, ăn uống của nhân vật"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetSwitchPlayerStatsPosition, value)}
                    >
                        Hiển thị chỉ số nhân vật bên phải
                    </MenuItemCheckbox>

                    <MenuSubTitle>Hướng dẫn phím tắt</MenuSubTitle>
                    <MenuItemCheckbox
                        checked={data.showInstructionalOverlay}
                        description="Bật / Tắt hiển thị hướng dẫn các phím bấm tương tác"
                        onChange={value => fetchNui(NuiEvent.WatchMenuSetShowInstructionalOverlay, value)}
                    >
                        Gợi ý phím bấm tương tác
                    </MenuItemCheckbox>
                </MenuContent>
            </MainMenu>
        </Menu>
    );
};
