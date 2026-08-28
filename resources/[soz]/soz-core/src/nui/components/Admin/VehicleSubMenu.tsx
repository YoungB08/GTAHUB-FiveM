import { VehicleSubMenuState } from '@public/shared/admin/admin';
import { FunctionComponent, useEffect, useState } from 'react';

import { SozRole } from '../../../core/permissions';
import { NuiEvent } from '../../../shared/event';
import { isOk, Result } from '../../../shared/result';
import { LSCustomMode, Vehicle, VehicleCategory } from '../../../shared/vehicle/vehicle';
import { fetchNui } from '../../fetch';
import {
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

export type VehicleSubMenuProps = {
    permission: SozRole;
    state: VehicleSubMenuState;
};

export const VEHICLE_OPTIONS = [
    { label: 'Tạo phương tiện (Spawn)', value: 'spawn' },
    { label: 'Xem giá xe', value: 'see-car-price' },
    { label: 'Thay đổi giá xe', value: 'change-car-price' },
];

type Catalog = Record<keyof VehicleCategory, Vehicle[]>;

export const VehicleSubMenu: FunctionComponent<VehicleSubMenuProps> = ({ permission, state }) => {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [catalog, setCatalog] = useState<Catalog>(null);

    useEffect(() => {
        if (vehicles != null && vehicles.length === 0) {
            fetchNui<never, Result<{ vehicles: Vehicle[]; catalog: Catalog }, never>>(NuiEvent.AdminGetVehicles).then(
                result => {
                    if (isOk(result)) {
                        const { catalog, vehicles } = result.ok;
                        setVehicles(vehicles);
                        setCatalog(catalog);
                    }
                }
            );
        }
    });

    if (!vehicles || !catalog) {
        return null;
    }

    const onOpenBennysUpgrade = () => {
        fetchNui(NuiEvent.BennysUpgradeVehicle, LSCustomMode.Admin);
    };
    const onOpenLSCustom = () => {
        fetchNui(NuiEvent.VehicleOpenLSCustom, LSCustomMode.Admin);
    };

    const isStaffOrAdmin = ['staff', 'admin'].includes(permission);

    return (
        <>
            <SubMenu id="vehicle" key={'vehicle'}>
                <MenuTitle title={permission} />
                <MenuContent subtitle="Quản lý & Tùy biến phương tiện">
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuVehicleSpawn);
                        }}
                    >
                        🧞 Tạo phương tiện (Spawn xe)
                    </MenuItemButton>
                    <MenuItemSubMenuLink id={'vehicles_catalog'}>📝 Danh mục toàn bộ phương tiện</MenuItemSubMenuLink>
                    <MenuItemButton onConfirm={onOpenBennysUpgrade}>🔧 Nâng cấp phương tiện (Bennys)</MenuItemButton>
                    <MenuItemButton onConfirm={() => onOpenLSCustom()}>🚀 Độ xe (LS Custom)</MenuItemButton>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuVehicleRepair);
                        }}
                    >
                        ⚒ Sửa chữa xe hoàn toàn
                    </MenuItemButton>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuVehicleClean);
                        }}
                    >
                        🧽 Rửa sạch xe
                    </MenuItemButton>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuVehicleRefill);
                        }}
                    >
                        ⛽ Đổ đầy bình xăng
                    </MenuItemButton>
                    {permission == 'admin' && (
                        <>
                            <MenuItemButton
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuVehicleSetFBIConfig);
                                }}
                            >
                                👮 Cấu hình xe FBI / Đặc nhiệm
                            </MenuItemButton>
                            <MenuItemButton
                                onConfirm={async () => {
                                    await fetchNui(NuiEvent.AdminMenuVehicleSave);
                                }}
                            >
                                ⚠️ Lưu bản sao phương tiện
                            </MenuItemButton>
                        </>
                    )}
                    <MenuItemCheckbox
                        disabled={!isStaffOrAdmin}
                        checked={state.noBurstTyres}
                        onChange={async value => {
                            state.noBurstTyres = value;
                            await fetchNui(NuiEvent.AdminToggleBurstTyres, value);
                        }}
                    >
                        🞉 Lốp xe chống thủng (Không nổ lốp)
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        disabled={!isStaffOrAdmin}
                        checked={state.noStall}
                        onChange={async value => {
                            state.noStall = value;
                            await fetchNui(NuiEvent.AdminToggleNoStall, value);
                        }}
                    >
                        ⛍ Tắt chết máy khi va chạm
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        disabled={!isStaffOrAdmin}
                        checked={state.noSurfaceCalc}
                        onChange={async value => {
                            state.noSurfaceCalc = value;
                            await fetchNui(NuiEvent.AdminToggleNoSurfaceCalc, value);
                        }}
                    >
                        ⛍ Tắt ảnh hưởng bề mặt địa hình
                    </MenuItemCheckbox>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuVehicleNos);
                        }}
                    >
                        🏎 Bình Nitro (NOS)
                    </MenuItemButton>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuVehicleMapping);
                        }}
                    >
                        🖳 Bản đồ ECU động cơ (Mapping)
                    </MenuItemButton>
                    <MenuItemButton
                        disabled={!isStaffOrAdmin}
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.AdminMenuVehicleDelete);
                        }}
                    >
                        ❌ Xóa bỏ phương tiện (Delete)
                    </MenuItemButton>
                </MenuContent>
            </SubMenu>
            <SubMenu id={'vehicles_catalog'} key={'vehicles_catalog'}>
                <MenuTitle title={permission} />
                <MenuContent subtitle="Danh mục phương tiện">
                    {Object.keys(catalog).map(category => (
                        <MenuItemSubMenuLink
                            id={'vehicles_catalog_' + category}
                            key={'vehicles_catalog_' + category + '_link'}
                        >
                            {VehicleCategory[category]}
                        </MenuItemSubMenuLink>
                    ))}
                </MenuContent>
            </SubMenu>
            {Object.keys(catalog).map(category => (
                <SubMenu id={'vehicles_catalog_' + category} key={'vehicles_catalog_' + category}>
                    <MenuTitle title={permission} />
                    <MenuContent subtitle={VehicleCategory[category]}>
                        {catalog[category].map(vehicle => (
                            <MenuItemSelect
                                title={vehicle.name}
                                key={'vehicle_' + vehicle.model}
                                onConfirm={async selectedIndex => {
                                    const option = VEHICLE_OPTIONS[selectedIndex];
                                    if (option.value === 'spawn') {
                                        await fetchNui(NuiEvent.AdminMenuVehicleSpawn, vehicle.model);
                                    } else if (option.value === 'see-car-price') {
                                        await fetchNui(NuiEvent.AdminMenuVehicleSeeCarPrice, vehicle.model);
                                    } else if (option.value === 'change-car-price') {
                                        await fetchNui(NuiEvent.AdminMenuVehicleChangeCarPrice, vehicle.model);
                                    }
                                }}
                            >
                                {VEHICLE_OPTIONS.map(option => (
                                    <MenuItemSelectOption key={'vehicle_option_' + option.value}>
                                        {option.label}
                                    </MenuItemSelectOption>
                                ))}
                            </MenuItemSelect>
                        ))}
                    </MenuContent>
                </SubMenu>
            ))}
        </>
    );
};
