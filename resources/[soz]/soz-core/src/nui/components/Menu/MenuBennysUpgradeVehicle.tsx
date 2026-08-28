import { VehicleBusinessCustomPrice, VehicleBusinessCustomWhatIfPrice } from '@private/shared/business.vehicle';
import { useItem } from '@public/nui/hook/data';
import { RootState } from '@public/nui/store';
import { TaxType } from '@public/shared/tax';
import { LSCustomMode } from '@public/shared/vehicle/vehicle';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { RGBColor } from '../../../shared/color';
import { NuiEvent } from '../../../shared/event';
import { JobLabel } from '../../../shared/job';
import { MenuType } from '../../../shared/nui/menu';
import {
    getVehicleCustomPrice,
    VehicleColor,
    VehicleColorCategory,
    VehicleColorChoiceItem,
    VehicleColorChoices,
    VehicleConfiguration,
    VehicleCustomInput,
    VehicleCustomMenuData,
    VehicleModification,
    VehicleModificationPricing,
    VehicleNeonLight,
    VehicleUpgradeOptions,
    VehicleWheelType,
    VehicleXenonColor,
    VehicleXenonColorChoices,
} from '../../../shared/vehicle/modification';
import { fetchNui } from '../../fetch';
import { useGetPrice } from '../../hook/price';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemGoBack,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSelectOptionColor,
    MenuItemSubMenuLink,
    MenuItemText,
    MenuTitle,
    SubMenu,
} from '../Styleguide/Menu';

type MenuItemVehicleModificationProps = {
    options: VehicleUpgradeOptions;
    modKey: keyof VehicleModification;
    config: VehicleConfiguration;
    set: (configuration: VehicleConfiguration) => void;
    vehiclePrice?: number;
    useHelperText?: boolean;
    initialConfig?: VehicleConfiguration;
};

export const MenuItemVehicleModification: FunctionComponent<MenuItemVehicleModificationProps> = ({
    options,
    modKey,
    set,
    config,
    vehiclePrice,
    initialConfig,
}) => {
    const getPrice = useGetPrice();
    const option = options.modification[modKey];
    const initialValue = useMemo(() => {
        return config.modification[modKey] === undefined ? null : config.modification[modKey];
    }, []);

    if (!option) {
        return null;
    }

    if (option.choice.type === 'list') {
        return (
            <MenuItemSelect
                title={option.label}
                value={config.modification[modKey]}
                initialValue={initialConfig?.modification[modKey] || null}
                onChange={(index, value) => {
                    if (value === null) {
                        const newModification = { ...config.modification };
                        delete newModification[modKey];

                        set({
                            ...config,
                            modification: newModification,
                        });
                    } else {
                        set({
                            ...config,
                            modification: { ...config.modification, [modKey]: value },
                        });
                    }
                }}
            >
                {option.choice.items.map((choice, index) => {
                    let price = null;

                    if (vehiclePrice && choice.value !== initialValue) {
                        price = vehiclePrice * VehicleModificationPricing[modKey].priceByLevels[choice.value] || 0;
                    }

                    return (
                        <MenuItemSelectOption key={index} value={choice.value} helper={choice.label}>
                            {choice.label}
                            {choice.value === initialValue && ' (đã lắp)'}
                            {price !== null && ` (${getPrice(price, TaxType.VEHICLE).toFixed(0)} $)`}
                        </MenuItemSelectOption>
                    );
                })}
            </MenuItemSelect>
        );
    }

    if (option.choice.type === 'toggle') {
        let price = null;

        if (vehiclePrice && config.modification[modKey] !== initialValue) {
            price =
                vehiclePrice * VehicleModificationPricing[modKey].priceByLevels[config.modification[modKey] ? 1 : 0] ||
                0;
        }

        return (
            <MenuItemCheckbox
                checked={config.modification[modKey] as boolean}
                onChange={checked =>
                    set({
                        ...config,
                        modification: { ...config.modification, [modKey]: checked },
                    })
                }
            >
                {option.label}
                {config.modification[modKey] === initialValue && ' (đã lắp)'}
                {price !== null && ` (${getPrice(price, TaxType.VEHICLE).toFixed(0)} $)`}
            </MenuItemCheckbox>
        );
    }
};

type MenuBennysUpgradeVehicleProps = {
    data?: VehicleCustomMenuData;
};

type MenuItemSelectVehicleColorProps<T extends number> = {
    value?: T;
    title: string;
    onChange?: (color: T) => void;
    onConfirm?: (color: T) => void;
    useCategory?: boolean;
    choices?: Partial<Record<T, VehicleColorChoiceItem>>;
    firstIsNone?: boolean;
    initialValue?: T;
};

export const MenuItemSelectVehicleColor: FunctionComponent<
    MenuItemSelectVehicleColorProps<VehicleColor | VehicleXenonColor>
> = ({
    value,
    useCategory,
    onChange,
    onConfirm,
    title,
    choices = VehicleColorChoices,
    firstIsNone = false,
    initialValue,
}) => {
    const [category, setCategory] = useState<VehicleColorCategory | null>(choices[value]?.category ?? null);
    const innerOnChange = (index, color) => {
        if (onChange) {
            onChange(color);
        }
    };

    const innerOnConfirm = (index, color) => {
        if (onConfirm) {
            onConfirm(color);
        }
    };

    if (!useCategory) {
        return (
            <MenuItemSelect
                title={title}
                distance={3}
                value={value}
                onChange={innerOnChange}
                onConfirm={innerOnConfirm}
                initialValue={initialValue}
            >
                {Object.keys(choices).map((colorString, index) => {
                    const option = choices[colorString];
                    const value = parseInt(colorString) as VehicleColor;

                    return (
                        <MenuItemSelectOptionColor
                            key={index}
                            color={option.color}
                            label={firstIsNone && value === 0 ? 'Không' : option.label}
                            value={value}
                        />
                    );
                })}
            </MenuItemSelect>
        );
    }

    const initialCategory = choices[initialValue]?.category ?? null;

    const colorList = Object.keys(choices)
        .filter(color => choices[color].category === category)
        .map(colorString => parseInt(colorString) as VehicleColor);

    return (
        <>
            <MenuItemSelect
                onChange={(index, value) => {
                    setCategory(value);
                }}
                value={category}
                initialValue={initialCategory}
                title={`Kiểu ${title.toLowerCase()}`}
            >
                <MenuItemSelectOption value={VehicleColorCategory.Metallic}>Sơn kim loại (Metallic)</MenuItemSelectOption>
                <MenuItemSelectOption value={VehicleColorCategory.Classic}>Sơn cổ điển (Classic)</MenuItemSelectOption>
                <MenuItemSelectOption value={VehicleColorCategory.Matte}>Sơn mờ (Matte)</MenuItemSelectOption>
                <MenuItemSelectOption value={VehicleColorCategory.Pearly}>Sơn bóng (Pearly)</MenuItemSelectOption>
                <MenuItemSelectOption value={VehicleColorCategory.Metal}>Kim loại & Chrome</MenuItemSelectOption>
                <MenuItemSelectOption value={VehicleColorCategory.Cameleon}>Đổi màu (Chameleon)</MenuItemSelectOption>
            </MenuItemSelect>
            <MenuItemSelect
                distance={3}
                title={title}
                value={value}
                onChange={innerOnChange}
                onConfirm={innerOnConfirm}
                keyDescendant={category}
                initialValue={initialValue || 0}
            >
                {colorList.map((color, index) => {
                    const option = choices[color.toString()];

                    return (
                        <MenuItemSelectOptionColor
                            color={option.color}
                            label={option.label}
                            value={color}
                            key={index}
                        />
                    );
                })}
            </MenuItemSelect>
        </>
    );
};

type MenuItemSelectVehicleRGBColorProps = {
    value?: RGBColor;
    title: string;
    onChange?: (color: RGBColor) => void;
    onConfirm?: (color: RGBColor) => void;
    choices?: VehicleColorChoiceItem[];
    initialValue?: RGBColor;
};

export const MenuItemSelectVehicleRGBColor: FunctionComponent<MenuItemSelectVehicleRGBColorProps> = ({
    value,
    onChange,
    onConfirm,
    title,
    choices = Object.values(VehicleColorChoices),
    initialValue,
}) => {
    const innerOnChange = (index, color) => {
        if (onChange) {
            onChange(color);
        }
    };

    const innerOnConfirm = (index, color) => {
        if (onConfirm) {
            onConfirm(color);
        }
    };

    useEffect(() => {
        let foundColor = false;

        if (value) {
            for (const choice of choices) {
                if (choice.color[0] === value[0] && choice.color[1] === value[1] && choice.color[2] === value[2]) {
                    foundColor = true;
                    break;
                }
            }
        }

        if (!foundColor && choices.length > 0 && onChange) {
            onChange(choices[0].color);
        }
    }, [value, choices, onConfirm]);

    return (
        <MenuItemSelect
            distance={3}
            title={title}
            value={value}
            onChange={innerOnChange}
            onConfirm={innerOnConfirm}
            initialValue={initialValue}
            equalityFn={(a: RGBColor, b: RGBColor) =>
                a !== null && b !== null && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
            }
        >
            {choices.map((option, index) => {
                return (
                    <MenuItemSelectOptionColor
                        color={option.color}
                        label={option.label}
                        value={option.color}
                        key={index}
                    />
                );
            })}
        </MenuItemSelect>
    );
};

export const MenuBennysUpgradeVehicle: FunctionComponent<MenuBennysUpgradeVehicleProps> = ({ data }) => {
    const [config, setConfig] = useState<VehicleConfiguration | null>(null);
    const [options, setOptions] = useState<VehicleUpgradeOptions | null>(null);
    const item = useItem('veh_strip_piece_std');
    const crimi = ![LSCustomMode.Admin, LSCustomMode.LsCustom, LSCustomMode.NewGahray].includes(data.mode);
    const menuTitle = crimi ? 'Độ ngoại thất xe' : JobLabel.bennys;
    const whatIf = useSelector((state: RootState) => state.features.WhatIfFirstEpisode);

    useEffect(() => {
        if (data?.currentConfiguration) {
            setConfig(data.currentConfiguration);
        }
    }, [data]);

    const applyCustom = async (vehicle: number, config: VehicleConfiguration) => {
        const newOptions = await fetchNui(NuiEvent.VehicleCustomApply, {
            vehicleEntityId: data.vehicle,
            originalConfiguration: data.originalConfiguration,
            vehicleConfiguration: config,
        });

        if (newOptions) {
            setOptions(newOptions as VehicleUpgradeOptions);
        }
    };

    useEffect(() => {
        if (config && data) {
            applyCustom(data.vehicle, config);
        }
    }, [config]);

    useEffect(() => {
        if (data) {
            setOptions(data.options);
        }
    }, [data]);

    if (!data || !options) {
        return null;
    }

    const onConfirm = () => {
        const input: VehicleCustomInput = {
            vehicleEntityId: data.vehicle,
            originalConfiguration: data.originalConfiguration,
            vehicleConfiguration: config,
            mode: data.mode,
            onlyPerformance: false,
        };
        fetchNui(NuiEvent.VehicleCustomConfirmModification, input);
    };

    const createOnDoorChange = (doorIndex: number) => {
        return async value => {
            await fetchNui(NuiEvent.VehicleSetDoorOpen, { doorIndex, open: value });
        };
    };

    const price =
        data.mode != LSCustomMode.CrimiCusto
            ? 0
            : config
              ? getVehicleCustomPrice(data.vehiclePrice, data.options, data.currentConfiguration, config)
              : 0;

    return (
        <Menu type={MenuType.BennysUpgradeVehicle}>
            <MainMenu>
                <MenuTitle title={menuTitle} />
                <MenuContent
                    subtitle={crimi ? 'Độ ngoại thất xe' : 'Màu sắc & Ngoại hình'}
                    helpPanel={
                        data.mode == LSCustomMode.CrimiCusto && (
                            <>
                                <MenuItemText>
                                    <span className="underline">Tổng chi phí vật tư: </span>
                                </MenuItemText>
                                <MenuItemText>
                                    •{' '}
                                    {Math.ceil(
                                        price / (whatIf ? VehicleBusinessCustomWhatIfPrice : VehicleBusinessCustomPrice)
                                    )}{' '}
                                    {item.label}
                                </MenuItemText>
                            </>
                        )
                    }
                >
                    <MenuItemSubMenuLink id="colors">Màu sắc & Ngoại hình</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="body">Thân vỏ xe</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="wheel">Bánh xe & Vành xe</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="interior">Nội thất</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="exterior">Ngoại thất & Phụ kiện</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="light">Hệ thống Đèn</MenuItemSubMenuLink>
                    {data.options.extra.length > 0 && <MenuItemSubMenuLink id="extra">Trang bị bổ sung (Extras)</MenuItemSubMenuLink>}
                    <MenuItemCheckbox onChange={createOnDoorChange(4)} checked={false}>
                        Mở nắp ca-pô
                    </MenuItemCheckbox>
                    <MenuItemCheckbox onChange={createOnDoorChange(5)} checked={false}>
                        Mở cốp sau
                    </MenuItemCheckbox>
                    <MenuItemButton onConfirm={() => onConfirm()}>
                        <div className="flex w-full justify-between items-center">
                            <span>✅ Xác nhận thay đổi</span>
                        </div>
                    </MenuItemButton>
                </MenuContent>
            </MainMenu>
            <SubMenu id="colors">
                <MenuTitle title={menuTitle} />
                <MenuContent subtitle="Màu sắc & Ngoại hình">
                    {options?.livery && (
                        <MenuItemSelect
                            onChange={(index, value) => {
                                setConfig({
                                    ...config,
                                    livery: value,
                                });
                            }}
                            title="Decal / Tem xe"
                            value={config?.livery}
                        >
                            {options.livery.items.map((livery, index) => (
                                <MenuItemSelectOption key={index} value={livery.value}>
                                    {livery.label}
                                </MenuItemSelectOption>
                            ))}
                        </MenuItemSelect>
                    )}
                    <MenuItemSelectVehicleColor
                        value={config?.color?.primary as VehicleColor}
                        title="Màu sơn chính"
                        useCategory={true}
                        initialValue={data.originalConfiguration?.color?.primary as VehicleColor}
                        onChange={color => {
                            setConfig({
                                ...config,
                                color: { ...config.color, primary: color as VehicleColor },
                            });
                        }}
                    />
                    <MenuItemSelectVehicleColor
                        value={config?.color?.secondary as VehicleColor}
                        title="Màu sơn phụ"
                        useCategory={true}
                        initialValue={data.originalConfiguration?.color?.secondary as VehicleColor}
                        onChange={color => {
                            setConfig({
                                ...config,
                                color: { ...config.color, secondary: color as VehicleColor },
                            });
                        }}
                    />
                    <MenuItemSelectVehicleColor
                        value={config?.color?.pearlescent as VehicleColor}
                        title="Ánh xà cừ (Pearlescent)"
                        firstIsNone={true}
                        initialValue={data.originalConfiguration?.color?.pearlescent as VehicleColor}
                        onChange={color => {
                            setConfig({
                                ...config,
                                color: { ...config.color, pearlescent: color as VehicleColor },
                            });
                        }}
                    />
                    <MenuItemVehicleModification
                        modKey="trimDesign"
                        options={options}
                        initialConfig={data?.originalConfiguration}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="plaques"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="speakers"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemGoBack />
                </MenuContent>
            </SubMenu>
            <SubMenu id="body">
                <MenuTitle title={menuTitle} />
                <MenuContent subtitle="Thân vỏ xe">
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="spoiler"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        modKey="bumperFront"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemVehicleModification
                        modKey="bumperRear"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="sideSkirt"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="exhaust"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="frame"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="grille"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="hood"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification modKey="fender" options={options} config={config} set={setConfig} />
                    <MenuItemVehicleModification
                        modKey="fenderRight"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="roof"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="trunk"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        modKey="engineBlock"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="airFilter"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="tank"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="struts"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="archCover"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="hydraulics"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemGoBack />
                </MenuContent>
            </SubMenu>
            <SubMenu id="wheel">
                <MenuTitle title={menuTitle} />
                <MenuContent subtitle="Bánh xe & Vành xe">
                    {Object.keys(options.wheelType).length > 1 && (
                        <MenuItemSelect
                            title="Loại vành bánh xe"
                            value={config?.wheelType}
                            initialValue={data.originalConfiguration?.wheelType}
                            onChange={(index, value) => {
                                setConfig({
                                    ...config,
                                    wheelType: value,
                                });
                            }}
                        >
                            {Object.keys(options.wheelType).map((key, index) => {
                                const value = parseInt(key) as VehicleWheelType;
                                const label = options.wheelType[key];

                                return (
                                    <MenuItemSelectOption key={index} value={value}>
                                        {label}
                                    </MenuItemSelectOption>
                                );
                            })}
                        </MenuItemSelect>
                    )}
                    <MenuItemVehicleModification
                        modKey="wheelFront"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemCheckbox
                        checked={config?.customWheelFront}
                        onChange={checked => {
                            setConfig({
                                ...config,
                                customWheelFront: checked,
                            });
                        }}
                    >
                        Lốp xe tùy chỉnh (Custom)
                    </MenuItemCheckbox>
                    <MenuItemSelectVehicleColor
                        value={config?.color?.rim as VehicleColor}
                        title="Màu sơn vành xe"
                        initialValue={data.originalConfiguration?.color?.rim as VehicleColor}
                        onChange={color => {
                            setConfig({
                                ...config,
                                color: { ...config.color, rim: color as VehicleColor },
                            });
                        }}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="tyreSmoke"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemSelectVehicleRGBColor
                        title="Màu khói lốp xe"
                        value={config?.tyreSmokeColor}
                        initialValue={data.originalConfiguration?.tyreSmokeColor}
                        onChange={color => {
                            setConfig({
                                ...config,
                                tyreSmokeColor: color,
                            });
                        }}
                    />
                    <MenuItemGoBack />
                </MenuContent>
            </SubMenu>
            <SubMenu id="exterior">
                <MenuTitle title={menuTitle} />
                <MenuContent subtitle="Ngoại thất & Phụ kiện">
                    <MenuItemSelect
                        title="Kiểu biển số xe"
                        value={config?.plateStyle}
                        initialValue={data.originalConfiguration?.plateStyle}
                        onChange={(index, value) => {
                            setConfig({
                                ...config,
                                plateStyle: value,
                            });
                        }}
                    >
                        <MenuItemSelectOption value={0}>Chữ xanh nền trắng</MenuItemSelectOption>
                        <MenuItemSelectOption value={1}>Chữ vàng nền đen</MenuItemSelectOption>
                        <MenuItemSelectOption value={2}>Chữ vàng nền xanh</MenuItemSelectOption>
                        <MenuItemSelectOption value={3}>Chữ xanh nền trắng 2</MenuItemSelectOption>
                        <MenuItemSelectOption value={4}>Chữ xanh nền trắng 3</MenuItemSelectOption>
                        <MenuItemSelectOption value={5}>Yankton</MenuItemSelectOption>
                        <MenuItemSelectOption value={6}>eCola</MenuItemSelectOption>
                        <MenuItemSelectOption value={7}>Las Venturas</MenuItemSelectOption>
                        <MenuItemSelectOption value={8}>Liberty City</MenuItemSelectOption>
                        <MenuItemSelectOption value={9}>Los Santos Car Meet</MenuItemSelectOption>
                        <MenuItemSelectOption value={10}>Los Santos Panic</MenuItemSelectOption>
                        <MenuItemSelectOption value={11}>Los Santos Pounders</MenuItemSelectOption>
                        <MenuItemSelectOption value={12}>Sprunk</MenuItemSelectOption>
                    </MenuItemSelect>
                    <MenuItemSelect
                        title="Màu dán kính (Tint)"
                        value={config?.windowTint}
                        initialValue={data.originalConfiguration?.windowTint}
                        onChange={(index, value) => {
                            setConfig({
                                ...config,
                                windowTint: value,
                            });
                        }}
                    >
                        <MenuItemSelectOption value={0}>Kính trong suốt (Không dán)</MenuItemSelectOption>
                        <MenuItemSelectOption value={1}>Dán kính đen tuyền (Limo)</MenuItemSelectOption>
                        <MenuItemSelectOption value={2}>Dán kính khói tối (Dark Smoke)</MenuItemSelectOption>
                        <MenuItemSelectOption value={3}>Dán kính khói nhạt (Light Smoke)</MenuItemSelectOption>
                        <MenuItemSelectOption value={4}>Kính nguyên bản (Stock)</MenuItemSelectOption>
                        <MenuItemSelectOption value={5}>Dán kính xanh lục</MenuItemSelectOption>
                    </MenuItemSelect>
                    <MenuItemVehicleModification
                        modKey="plateHolder"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemVehicleModification
                        modKey="vanityPlate"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="ornament"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="aerials"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="trim"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="windows"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="windowsSecondary"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemGoBack />
                </MenuContent>
            </SubMenu>
            <SubMenu id="interior">
                <MenuTitle title={menuTitle} />
                <MenuContent subtitle="Nội thất">
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="horn"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="dashboard"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        modKey="dialDesign"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemVehicleModification
                        modKey="doorSpeaker"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemVehicleModification
                        initialConfig={data?.originalConfiguration}
                        modKey="seat"
                        options={options}
                        config={config}
                        set={setConfig}
                    />
                    <MenuItemVehicleModification
                        modKey="steeringWheel"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemVehicleModification
                        modKey="columnShifterLevers"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemSelectVehicleColor
                        value={config?.interiorColor as VehicleColor}
                        title="Màu da nội thất"
                        initialValue={data.originalConfiguration?.interiorColor as VehicleColor}
                        onChange={color => {
                            setConfig({
                                ...config,
                                interiorColor: color as VehicleColor,
                            });
                        }}
                    />
                    <MenuItemSelectVehicleColor
                        value={config?.dashboardColor as VehicleColor}
                        title="Màu táp-lô"
                        initialValue={data.originalConfiguration?.dashboardColor as VehicleColor}
                        onChange={color => {
                            setConfig({
                                ...config,
                                dashboardColor: color as VehicleColor,
                            });
                        }}
                    />
                    <MenuItemGoBack />
                </MenuContent>
            </SubMenu>
            <SubMenu id="light">
                <MenuTitle title={menuTitle} />
                <MenuContent subtitle="Hệ thống Đèn">
                    <MenuItemCheckbox
                        checked={config?.neon?.light[VehicleNeonLight.Front]}
                        onChange={value => {
                            setConfig({
                                ...config,
                                neon: {
                                    ...config?.neon,
                                    light: {
                                        ...config?.neon?.light,
                                        [VehicleNeonLight.Front]: value,
                                    },
                                },
                            });
                        }}
                    >
                        Đèn Neon gầm trước
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={config?.neon?.light[VehicleNeonLight.Back]}
                        onChange={value => {
                            setConfig({
                                ...config,
                                neon: {
                                    ...config?.neon,
                                    light: {
                                        ...config?.neon?.light,
                                        [VehicleNeonLight.Back]: value,
                                    },
                                },
                            });
                        }}
                    >
                        Đèn Neon gầm sau
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={config?.neon?.light[VehicleNeonLight.Right]}
                        onChange={value => {
                            setConfig({
                                ...config,
                                neon: {
                                    ...config?.neon,
                                    light: {
                                        ...config?.neon?.light,
                                        [VehicleNeonLight.Right]: value,
                                    },
                                },
                            });
                        }}
                    >
                        Đèn Neon gầm phải
                    </MenuItemCheckbox>
                    <MenuItemCheckbox
                        checked={config?.neon?.light[VehicleNeonLight.Left]}
                        onChange={value => {
                            setConfig({
                                ...config,
                                neon: {
                                    ...config?.neon,
                                    light: {
                                        ...config?.neon?.light,
                                        [VehicleNeonLight.Left]: value,
                                    },
                                },
                            });
                        }}
                    >
                        Đèn Neon gầm trái
                    </MenuItemCheckbox>
                    <MenuItemSelectVehicleRGBColor
                        title="Màu sắc đèn Neon"
                        value={config?.neon?.color}
                        initialValue={data.originalConfiguration?.neon?.color}
                        onChange={color => {
                            if (!color) {
                                return;
                            }

                            setConfig({
                                ...config,
                                neon: {
                                    light: {},
                                    ...config?.neon,
                                    color,
                                },
                            });
                        }}
                        choices={Object.values(VehicleXenonColorChoices)}
                    />
                    <MenuItemVehicleModification
                        modKey="xenonHeadlights"
                        options={options}
                        config={config}
                        set={setConfig}
                        initialConfig={data?.originalConfiguration}
                    />
                    <MenuItemSelectVehicleColor
                        value={config?.xenonColor as VehicleXenonColor}
                        title="Màu sắc đèn Pha Xenon"
                        initialValue={data.originalConfiguration?.xenonColor as VehicleXenonColor}
                        onChange={color => {
                            setConfig({
                                ...config,
                                xenonColor: color as VehicleXenonColor,
                            });
                        }}
                        choices={VehicleXenonColorChoices}
                    />
                    <MenuItemGoBack />
                </MenuContent>
            </SubMenu>
            <SubMenu id="extra">
                <MenuTitle title={menuTitle} />
                <MenuContent subtitle="Trang bị bổ sung (Extras)">
                    {options.extra?.map((extra, index) => (
                        <MenuItemCheckbox
                            key={index}
                            checked={config.extra[extra]}
                            onChange={() => {
                                setConfig({
                                    ...config,
                                    extra: {
                                        ...config.extra,
                                        [extra]: !config.extra[extra],
                                    },
                                });
                            }}
                        >
                            Trang bị thêm {extra}
                        </MenuItemCheckbox>
                    ))}
                    <MenuItemGoBack />
                </MenuContent>
            </SubMenu>
        </Menu>
    );
};
