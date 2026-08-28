import { TaxType } from '@public/shared/tax';
import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../shared/event';
import { MenuType } from '../../../shared/nui/menu';
import { LSCustomMode, VehicleMenuData } from '../../../shared/vehicle/vehicle';
import { fetchNui } from '../../fetch';
import { useGetPrice } from '../../hook/price';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

type MenuVehicleProps = {
    data?: VehicleMenuData;
};

const DoorLabel: Record<number, string> = {
    0: 'Cửa trước bên lái',
    1: 'Cửa trước bên phụ',
    2: 'Cửa sau bên lái',
    3: 'Cửa sau bên phụ',
    4: 'Nắp ca-pô',
    5: 'Cốp sau',
};

export const MenuVehicle: FunctionComponent<MenuVehicleProps> = ({ data }) => {
    const getPrice = useGetPrice();

    if (!data) {
        return null;
    }

    const onVehicleEngineChange = (value: boolean) => {
        fetchNui(NuiEvent.VehicleSetEngine, value);
    };

    const onNeonLightStatusChange = (value: boolean) => {
        fetchNui(NuiEvent.VehicleSetNeonStatus, value);
    };

    const onSpeedLimit = (value: number | null) => {
        fetchNui(NuiEvent.VehicleSetSpeedLimit, value);
    };

    const onRadioLongRange = () => {
        fetchNui(NuiEvent.VehicleHandleRadio);
    };

    const onOpenLSCustom = (mode: LSCustomMode) => {
        fetchNui(NuiEvent.VehicleOpenLSCustom, mode);
    };

    const onOpenBennysUpgrade = (mode: LSCustomMode) => {
        fetchNui(NuiEvent.BennysUpgradeVehicle, mode);
    };

    const onPitStop = price => {
        fetchNui(NuiEvent.VehiclePitStop, price);
    };

    const createOnDoorChange = (doorIndex: number) => {
        return async value => {
            await fetchNui(NuiEvent.VehicleSetDoorOpen, { doorIndex, open: value });
        };
    };

    const onAnchorChange = (value: boolean) => {
        fetchNui(NuiEvent.VehicleAnchorChange, value);
    };

    const onPoliceDisplay = (value: boolean) => {
        fetchNui(NuiEvent.VehiclePoliceDisplay, value);
    };

    const onGyro = (value: boolean) => {
        fetchNui(NuiEvent.VehicleGyro, value);
    };

    return (
        <Menu type={MenuType.Vehicle}>
            <MainMenu>
                <MenuTitle title="Phương tiện" />
                <MenuContent>
                    {data.isDriver && (
                        <MenuItemCheckbox onChange={onVehicleEngineChange} checked={data.engineOn}>
                            Nổ máy xe
                        </MenuItemCheckbox>
                    )}
                    {data.isDriver && data.hasNeon && (
                        <MenuItemCheckbox onChange={onNeonLightStatusChange} checked={data.neonLightsStatus}>
                            Đèn Neon gầm xe
                        </MenuItemCheckbox>
                    )}
                    {data.hasRadio && (
                        <MenuItemButton onConfirm={() => onRadioLongRange()}>Bộ đàm tầm xa</MenuItemButton>
                    )}
                    {data.isDriver && (
                        <>
                            <MenuItemSelect
                                onConfirm={(index, value) => {
                                    onSpeedLimit(value);
                                }}
                                value={data.speedLimit}
                                title="Giới hạn tốc độ"
                                titleWidth={50}
                            >
                                <MenuItemSelectOption value={null}>Không giới hạn</MenuItemSelectOption>
                                <MenuItemSelectOption value={50}>50 km/h</MenuItemSelectOption>
                                <MenuItemSelectOption value={90}>90 km/h</MenuItemSelectOption>
                                <MenuItemSelectOption value={110}>110 km/h</MenuItemSelectOption>
                                <MenuItemSelectOption value={130}>130 km/h</MenuItemSelectOption>
                                <MenuItemSelectOption value={-1}>Tốc độ hiện tại</MenuItemSelectOption>
                                <MenuItemSelectOption value={-2}>Tùy chỉnh</MenuItemSelectOption>
                            </MenuItemSelect>
                            <MenuItemSubMenuLink id="door">Điều khiển cửa xe</MenuItemSubMenuLink>
                            {data.insideLSCustom && (
                                <MenuItemButton onConfirm={() => onOpenLSCustom(LSCustomMode.LsCustom)}>
                                    Xưởng độ xe (LS Custom)
                                </MenuItemButton>
                            )}
                            {data.insideLSCustom && !data.onDutyNg && (
                                <MenuItemButton
                                    onConfirm={() => onPitStop(data.pitstopPrice)}
                                    description={`Chi phí: ${getPrice(data.pitstopPrice, TaxType.SERVICE)} $`}
                                >
                                    Sửa chữa nhanh (Pit Stop)
                                </MenuItemButton>
                            )}
                            {data.crimiCustom && (
                                <MenuItemButton onConfirm={() => onOpenBennysUpgrade(LSCustomMode.CrimiCusto)}>
                                    Độ ngoại thất xe
                                </MenuItemButton>
                            )}
                            {data.crimiPerformance && (
                                <MenuItemButton onConfirm={() => onOpenLSCustom(LSCustomMode.CrimiPerfo)}>
                                    Nâng cấp hiệu suất động cơ
                                </MenuItemButton>
                            )}
                        </>
                    )}
                    {data.isDriver && data.isBoat && (
                        <MenuItemCheckbox onChange={onAnchorChange} checked={data.isAnchor}>
                            Thả neo thuyền
                        </MenuItemCheckbox>
                    )}
                    {data.police && (
                        <MenuItemCheckbox onChange={onPoliceDisplay} checked={data.policeLocator}>
                            Định vị tuần tra
                        </MenuItemCheckbox>
                    )}
                    {data.canGyro && (
                        <MenuItemCheckbox onChange={onGyro} checked={data.hasGyro}>
                            Còi & Đèn ưu tiên (Gyrophare)
                        </MenuItemCheckbox>
                    )}
                </MenuContent>
            </MainMenu>
            <SubMenu id="door">
                <MenuTitle title="Phương tiện" />
                <MenuContent subtitle="Điều khiển cửa xe">
                    {Object.entries(data.doorStatus).map(([door, status]) => {
                        return (
                            <MenuItemCheckbox
                                onChange={createOnDoorChange(parseInt(door, 10))}
                                key={door}
                                checked={status}
                            >
                                {DoorLabel[door] || ''}
                            </MenuItemCheckbox>
                        );
                    })}
                </MenuContent>
            </SubMenu>
        </Menu>
    );
};
