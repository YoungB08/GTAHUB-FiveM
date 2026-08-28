import { TaxType } from '@public/shared/tax';
import { PlayerVehicleState } from '@public/shared/vehicle/player.vehicle';
import { FunctionComponent, useState } from 'react';

import { NuiEvent } from '../../../shared/event';
import { MenuType } from '../../../shared/nui/menu';
import { GarageMenuData, GarageType, GarageVehicle, getTransferPrice } from '../../../shared/vehicle/garage';
import { fetchNui } from '../../fetch';
import { useGetPrice } from '../../hook/price';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuSubTitle,
    MenuTitle,
    SubMenu,
    useMenuNavigate,
} from '../Styleguide/Menu';

type MenuGarageProps = {
    data?: GarageMenuData;
};

const MenutitleMap: Record<GarageType, string> = {
    [GarageType.Public]: 'Gara Công cộng',
    [GarageType.Private]: 'Gara Tư nhân',
    [GarageType.Job]: 'Gara Cơ quan / Công ty',
    [GarageType.JobLuxury]: 'Gara Doanh nghiệp Cao cấp',
    [GarageType.Depot]: 'Bãi tạm giữ / Chuộc xe',
    [GarageType.House]: 'Gara Nhà riêng',
    [GarageType.Gang]: 'Gara Băng đảng',
    [GarageType.CasinoVip]: 'Gara Casino VIP',
};

export const MenuGarage: FunctionComponent<MenuGarageProps> = ({ data }) => {
    const [currentVehicle, setCurrentVehicle] = useState<GarageVehicle | null>(null);
    const getPrice = useGetPrice();

    if (!data) {
        return null;
    }

    const showFreePlaces = [GarageType.Private, GarageType.Gang].includes(data?.garage.type);

    const vehicleShowPlaces = () => {
        fetchNui(NuiEvent.VehicleGarageShowPlaces, { id: data.id, garage: data.garage });
    };

    const vehicleStore = () => {
        fetchNui(NuiEvent.VehicleGarageStore, { id: data.id, garage: data.garage });
    };

    const vehicleStoreTrailer = () => {
        fetchNui(NuiEvent.VehicleGarageStoreTrailer, { id: data.id, garage: data.garage });
    };

    if (data.garage.type === GarageType.Depot) {
        return (
            <Menu type={MenuType.Garage}>
                <MainMenu>
                    <MenuTitle title={MenutitleMap[data?.garage.type]} />
                    <VehicleList data={data} setCurrentVehicle={setCurrentVehicle} />
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.Garage}>
            <MainMenu>
                <MenuTitle title={MenutitleMap[data?.garage.type]} />
                <MenuContent subtitle={data?.garage.name}>
                    {showFreePlaces && (
                        <MenuSubTitle>
                            Chỗ trống: {data?.free_places} / {data?.max_places}
                        </MenuSubTitle>
                    )}
                    <MenuItemSubMenuLink id="vehicles">Danh sách xe</MenuItemSubMenuLink>
                    {data.garage.type === GarageType.House && data.apartments.length > 0 && (
                        <MenuItemSelect
                            onConfirm={(index, apartment) => {
                                fetchNui(NuiEvent.VehicleGarageStore, {
                                    id: apartment.identifier,
                                    garage: data.garage,
                                });
                            }}
                            title="Cất phương tiện vào gara"
                        >
                            {data.apartments.map(apartment => {
                                const id = `apartment_${apartment.identifier}`;
                                const [free, max] =
                                    data.apartmentsPlaces && data.apartmentsPlaces[id]
                                        ? data.apartmentsPlaces[id]
                                        : [0, 0];

                                return (
                                    <MenuItemSelectOption
                                        key={apartment.id}
                                        value={apartment}
                                        description={`Còn trống ${free} / ${max} chỗ`}
                                    >
                                        {apartment.label}
                                    </MenuItemSelectOption>
                                );
                            })}
                        </MenuItemSelect>
                    )}
                    {data.garage.type !== GarageType.House && (
                        <MenuItemButton onConfirm={vehicleStore}>Cất xe vào gara</MenuItemButton>
                    )}
                    {data.garage.allowTrailers && (
                        <MenuItemButton onConfirm={vehicleStoreTrailer}>Cất rơ-moóc vào gara</MenuItemButton>
                    )}
                    {data.garage.type === GarageType.House && data.apartments.length > 0 && (
                        <MenuItemButton onConfirm={vehicleShowPlaces}>Xem vị trí đỗ xe của tôi</MenuItemButton>
                    )}
                </MenuContent>
            </MainMenu>
            <SubMenu id="vehicles">
                <MenuTitle title={MenutitleMap[data?.garage.type]} />
                <VehicleList data={data} setCurrentVehicle={setCurrentVehicle} />
            </SubMenu>
            <SubMenu id="transfer">
                <MenuTitle title={MenutitleMap[data?.garage.type]} />
                <MenuContent>
                    <MenuSubTitle>
                        Chuyển xe {currentVehicle?.name} - {currentVehicle?.vehicle.plate}
                    </MenuSubTitle>
                    {data.transferGarageList.map((garage, key) => {
                        const transferPrice = getTransferPrice(currentVehicle?.weight || 0);

                        return (
                            <MenuItemButton
                                key={key}
                                onConfirm={() => {
                                    fetchNui(NuiEvent.VehicleGarageTransfer, {
                                        id: currentVehicle?.vehicle.id,
                                        from: data.garage,
                                        to: garage,
                                    });
                                }}
                            >
                                <div className="flex justify-between align-items-center">
                                    <span>{garage.garage.name}</span>
                                    <span>{getPrice(transferPrice, TaxType.TRAVEL)}$</span>
                                </div>
                            </MenuItemButton>
                        );
                    })}
                </MenuContent>
            </SubMenu>
        </Menu>
    );
};

type VehicleListProps = {
    data: GarageMenuData;
    setCurrentVehicle: (vehicle: GarageVehicle) => void;
};

export const VehicleList: FunctionComponent<VehicleListProps> = ({ data, setCurrentVehicle }) => {
    const navigateToTransfer = useMenuNavigate('transfer');
    const getPrice = useGetPrice();

    if (!data) {
        return null;
    }

    const showFreePlaces = [GarageType.Private, GarageType.Gang].includes(data?.garage.type);

    const vehicleTakeOut = (id: number, use_ticket: boolean) => {
        fetchNui(NuiEvent.VehicleGarageTakeOut, { id: data.id, garage: data.garage, vehicle: id, use_ticket });
    };

    const vehicleSetName = (id: number) => {
        fetchNui(NuiEvent.VehicleGarageSetName, { id: data.id, garage: data.garage, vehicle: id });
    };

    const vehicleList = data.vehicles
        .map(garageVehicle => {
            const name = garageVehicle.vehicle.label
                ? `${garageVehicle.vehicle.label} | ${garageVehicle.name} | ${garageVehicle.vehicle.plate}`
                : `${garageVehicle.name} | ${garageVehicle.vehicle.plate}`;

            return {
                ...garageVehicle,
                vehicle_name: name,
            };
        })
        .sort((a, b) => {
            return a.vehicle_name.localeCompare(b.vehicle_name);
        });

    return (
        <MenuContent subtitle={data?.garage.name}>
            {showFreePlaces && (
                <MenuSubTitle>
                    Chỗ trống: {data?.free_places} / {data?.max_places}
                </MenuSubTitle>
            )}
            {data.vehicles.length === 0 && <MenuItemButton disabled>Không có phương tiện nào trong gara</MenuItemButton>}
            {(data.garage.type === GarageType.Job || data.garage.type === GarageType.House) && (
                <>
                    {vehicleList.map(garageVehicle => {
                        return (
                            <MenuItemSelect
                                onConfirm={(idnex, value) => {
                                    if (value === 'take_out') {
                                        vehicleTakeOut(garageVehicle.vehicle.id, false);
                                    }

                                    if (value === 'set_name') {
                                        vehicleSetName(garageVehicle.vehicle.id);
                                    }
                                }}
                                key={garageVehicle.vehicle.id}
                                title={garageVehicle.vehicle_name}
                                titleWidth={60}
                                description={`Đã đi: ${(
                                    (garageVehicle.vehicle.condition.mileage || 0) / 1000
                                ).toFixed(2)} km`}
                            >
                                <MenuItemSelectOption value="take_out">Lấy xe ra</MenuItemSelectOption>
                                <MenuItemSelectOption value="set_name">Đổi tên xe</MenuItemSelectOption>
                            </MenuItemSelect>
                        );
                    })}
                </>
            )}
            {data.garage.type !== GarageType.Job && data.garage.type !== GarageType.House && (
                <>
                    {vehicleList.map(garageVehicle => {
                        return (
                            <MenuItemSelect
                                onConfirm={(index, value) => {
                                    if (value === 'take_out') {
                                        vehicleTakeOut(garageVehicle.vehicle.id, false);
                                    }

                                    if (value === 'take_out_ticket') {
                                        vehicleTakeOut(garageVehicle.vehicle.id, true);
                                    }

                                    if (value === 'transfer') {
                                        setCurrentVehicle(garageVehicle);
                                        navigateToTransfer();
                                    }
                                }}
                                key={garageVehicle.vehicle.id}
                                title={garageVehicle.vehicle_name}
                                titleWidth={60}
                                description={
                                    <div>
                                        <div className="pr-2 flex items-center justify-between">
                                            <span>Quãng đường</span>
                                            <span>
                                                {((garageVehicle.vehicle.condition.mileage || 0) / 1000).toFixed(2)} km
                                            </span>
                                        </div>
                                        {garageVehicle.price > 0 && (
                                             <div className="pr-2 flex items-center justify-between">
                                                <span>Phí lấy xe</span>
                                                <span>
                                                    $
                                                    {garageVehicle.vehicle.state === PlayerVehicleState.InFedPound
                                                        ? garageVehicle.price
                                                        : getPrice(garageVehicle.price, TaxType.VEHICLE)}
                                                    <br />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                }
                            >
                                <MenuItemSelectOption value="take_out">Lấy xe ra</MenuItemSelectOption>
                                {garageVehicle.price > 0 &&
                                    data.has_fake_ticket &&
                                    data.garage.type === GarageType.Private && (
                                        <MenuItemSelectOption value="take_out_ticket">
                                            Dùng vé miễn phí
                                        </MenuItemSelectOption>
                                    )}
                                {data.garage.type === GarageType.Public && (
                                    <MenuItemSelectOption value="transfer">Chuyển sang gara khác</MenuItemSelectOption>
                                )}
                            </MenuItemSelect>
                        );
                    })}
                </>
            )}
        </MenuContent>
    );
};
