import { SozRole } from '@core/permissions';
import { __ } from '@headlessui/react/dist/types';
import { MeteorSubMenuState } from '@public/shared/admin/admin';
import { Music } from '@public/shared/audio';
import { FireType } from '@public/shared/fire';
import { FunctionComponent, useEffect, useState } from 'react';

import { NuiEvent } from '../../../shared/event';
import { fetchNui } from '../../fetch';
import {
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuSubTitle,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

export type MeteorSubMenuProps = {
    permission: SozRole;
    state: MeteorSubMenuState;
};

export const MeteorSubMenu: FunctionComponent<MeteorSubMenuProps> = ({ permission, state }) => {
    const [waterLevel, setWaterLevel] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        // Use setTimeout to update the message after 2000 milliseconds (2 seconds)
        const timeoutId = setInterval(() => {
            fetchNui<__, [number, number]>(NuiEvent.AdminMenuOceanGetWaterLevel).then(data => setWaterLevel(data));
        }, 2000);

        // Cleanup function to clear the timeout if the component unmounts
        return () => {
            clearInterval(timeoutId);
            fetchNui(NuiEvent.AdminMenuPreviewFire, null);
        };
    }, []);

    return (
        <SubMenu id="meteor">
            <MenuTitle title={permission} />
            <MenuContent subtitle="Sự kiện Thiên thạch & Thiên tai">
                <MenuItemSelect
                    title={`Còi báo động`}
                    value={state.musics[Music.Siren]}
                    onConfirm={async index => {
                        await fetchNui(NuiEvent.AdminMenuMeteorMusic, { music: Music.Siren, value: index });
                    }}
                >
                    {Array(11)
                        .fill(0)
                        .map((_, index) => (
                            <MenuItemSelectOption value={index} key={`siren_${index}`}>
                                {index}
                            </MenuItemSelectOption>
                        ))}
                </MenuItemSelect>
                <MenuItemSelect
                    title={`Nhạc Chronos`}
                    value={state.musics[Music.Chronos]}
                    onConfirm={async index => {
                        await fetchNui(NuiEvent.AdminMenuMeteorMusic, { music: Music.Chronos, value: index });
                    }}
                >
                    {Array(11)
                        .fill(0)
                        .map((_, index) => (
                            <MenuItemSelectOption value={index} key={`music_${index}`}>
                                {index}
                            </MenuItemSelectOption>
                        ))}
                </MenuItemSelect>
                <MenuItemSelect
                    title={`Âm thanh môi trường`}
                    value={state.musics[Music.Ambiance]}
                    onConfirm={async index => {
                        await fetchNui(NuiEvent.AdminMenuMeteorMusic, { music: Music.Ambiance, value: index });
                    }}
                >
                    {Array(11)
                        .fill(0)
                        .map((_, index) => (
                            <MenuItemSelectOption value={index} key={`music_${index}`}>
                                {index}
                            </MenuItemSelectOption>
                        ))}
                </MenuItemSelect>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuMeteorActivate);
                    }}
                >
                    Kích hoạt Thiên thạch rơi
                </MenuItemButton>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuMeteorKickPlayers);
                    }}
                >
                    Kick toàn bộ người chơi
                </MenuItemButton>
                <MenuItemCheckbox
                    checked={state.disableNpc}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminMenuMeteorDisableNpc, value);
                    }}
                >
                    Tắt spawn NPC
                </MenuItemCheckbox>
                <MenuSubTitle>
                    Mực nước biển {waterLevel[0].toFixed(3)}/{waterLevel[1]}
                </MenuSubTitle>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuOceanSetWaterLevel, false);
                    }}
                >
                    Thay đổi mực nước biển từ từ
                </MenuItemButton>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuOceanSetWaterLevel, true);
                    }}
                >
                    Thay đổi mực nước biển ngay lập tức
                </MenuItemButton>
                <MenuItemCheckbox
                    checked={state.highWave}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminMenuOceanSetHighWave, value);
                    }}
                >
                    Sóng thần / Sóng lớn
                </MenuItemCheckbox>
                <MenuSubTitle>Động đất</MenuSubTitle>
                <MenuItemCheckbox
                    checked={state.earthQuake}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminMenuEarthquake, value);
                    }}
                >
                    Kích hoạt động đất
                </MenuItemCheckbox>
                <MenuItemSelect
                    title={`Bão cát`}
                    value={state.musics[Music.SandStorm]}
                    titleWidth={50}
                    onConfirm={async index => {
                        await fetchNui(NuiEvent.AdminMenuMeteorMusic, { music: Music.SandStorm, value: index });
                    }}
                >
                    {Array(11)
                        .fill(0)
                        .map((_, index) => (
                            <MenuItemSelectOption value={index} key={`sandstorm_${index}`}>
                                {index}
                            </MenuItemSelectOption>
                        ))}
                </MenuItemSelect>
                <MenuSubTitle>Bão lửa (FireStorm)</MenuSubTitle>
                <MenuItemCheckbox
                    checked={state.tornado}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminMenuTornado, value);
                    }}
                >
                    Lốc xoáy / Vòi rồng
                </MenuItemCheckbox>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuTornadoMove);
                    }}
                >
                    Di chuyển lốc xoáy
                </MenuItemButton>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuFireStorm);
                    }}
                >
                    Phim cắt cảnh Bão lửa
                </MenuItemButton>
                <MenuItemCheckbox
                    checked={state.firePropagation}
                    onChange={async value => {
                        await fetchNui(NuiEvent.AdminMenuFirePropagation, value);
                    }}
                >
                    Lây lan đám cháy
                </MenuItemCheckbox>
                <MenuItemSelect
                    title="Đám cháy"
                    initialValue={null}
                    onChange={async (_index, value) => {
                        await fetchNui(NuiEvent.AdminMenuPreviewFire, String(value));
                    }}
                    onConfirm={async (_index, value) => {
                        await fetchNui(NuiEvent.AdminMenuStartFire, String(value));
                    }}
                >
                    {[null, FireType.Small, FireType.Medium, FireType.Huge].map(value => (
                        <MenuItemSelectOption value={value} key={`fire_${value}`}>
                            {FireType[value]}
                        </MenuItemSelectOption>
                    ))}
                </MenuItemSelect>
                <MenuItemButton
                    onConfirm={() => fetchNui(NuiEvent.AdminMenuStopFire)}
                    description="Giảm dần bán kính đám cháy cho đến khi tắt hẳn"
                >
                    Dập tắt dần các đám cháy
                </MenuItemButton>
                <MenuItemButton
                    onConfirm={() => fetchNui(NuiEvent.AdminMenuStopFire, true)}
                    description="Xóa toàn bộ ngọn lửa ngay lập tức"
                >
                    Dập tắt ngay mọi đám cháy
                </MenuItemButton>
                <MenuItemButton
                    onConfirm={() => fetchNui(NuiEvent.AdminMenuFireRemoveModelSwap)}
                    description="Khôi phục lại mô hình cây cối ban đầu"
                >
                    Khôi phục mô hình cây cối
                </MenuItemButton>

                <MenuItemSelect
                    title={`Nhạc - Impact`}
                    value={state.musics[Music.Impact]}
                    titleWidth={50}
                    onConfirm={async index => {
                        await fetchNui(NuiEvent.AdminMenuMeteorMusic, { music: Music.Impact, value: index });
                    }}
                >
                    {Array(31)
                        .fill(0)
                        .map((_, index) => (
                            <MenuItemSelectOption value={index} key={`siren_${index}`}>
                                {index}
                            </MenuItemSelectOption>
                        ))}
                </MenuItemSelect>
                <MenuItemSelect
                    title={`Nhạc - Dies Irae`}
                    value={state.musics[Music.DiesIrae]}
                    titleWidth={50}
                    onConfirm={async index => {
                        await fetchNui(NuiEvent.AdminMenuMeteorMusic, { music: Music.DiesIrae, value: index });
                    }}
                >
                    {Array(31)
                        .fill(0)
                        .map((_, index) => (
                            <MenuItemSelectOption value={index} key={`music_${index}`}>
                                {index}
                            </MenuItemSelectOption>
                        ))}
                </MenuItemSelect>
                <MenuItemSelect
                    title={`Nhạc - Cinis`}
                    value={state.musics[Music.Cinis]}
                    titleWidth={50}
                    onConfirm={async index => {
                        await fetchNui(NuiEvent.AdminMenuMeteorMusic, { music: Music.Cinis, value: index });
                    }}
                >
                    {Array(31)
                        .fill(0)
                        .map((_, index) => (
                            <MenuItemSelectOption value={index} key={`music_${index}`}>
                                {index}
                            </MenuItemSelectOption>
                        ))}
                </MenuItemSelect>

                <MenuSubTitle>Thông báo khẩn cấp toàn thành phố</MenuSubTitle>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuEarthquakeFlash);
                    }}
                >
                    Cảnh báo Động đất
                </MenuItemButton>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuSandstormFlash);
                    }}
                >
                    Cảnh báo Bão cát
                </MenuItemButton>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuFloodFlash);
                    }}
                >
                    Cảnh báo Lũ lụt
                </MenuItemButton>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuFireFlash, false);
                    }}
                >
                    Cảnh báo Hỏa hoạn
                </MenuItemButton>
                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuTornadoFlash);
                    }}
                >
                    Cảnh báo Lốc xoáy
                </MenuItemButton>

                <MenuSubTitle>Sự kiện What if</MenuSubTitle>

                <MenuItemButton
                    onConfirm={async () => {
                        await fetchNui(NuiEvent.AdminMenuWhatIfCinematic);
                    }}
                >
                    Phim cắt cảnh (Cinematic)
                </MenuItemButton>
            </MenuContent>
        </SubMenu>
    );
};
