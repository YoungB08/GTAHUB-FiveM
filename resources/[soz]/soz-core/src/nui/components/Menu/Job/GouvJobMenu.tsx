import { usePlayer } from '@public/nui/hook/data';
import { GouvJobMenuPropData } from '@public/shared/job/gouv';
import { TaxLabel, TaxType } from '@public/shared/tax';
import { FunctionComponent } from 'react';

import { NuiEvent } from '../../../../shared/event';
import { JobLabel, JobPermission, JobType } from '../../../../shared/job';
import { MenuType } from '../../../../shared/nui/menu';
import { RepositoryType } from '../../../../shared/repository';
import { fetchNui } from '../../../fetch';
import { useHasJobPermission } from '../../../hook/job';
import { useConfigurationValue, useRepository } from '../../../hook/repository';
import {
    MainMenu,
    Menu,
    MenuContent,
    MenuItemButton,
    MenuItemCheckbox,
    MenuItemSelect,
    MenuItemSelectOption,
    MenuItemSubMenuLink,
    MenuItemText,
    MenuTitle,
    SubMenu,
} from '../../Styleguide/Menu';

type GouvJobMenuProps = {
    data: GouvJobMenuPropData;
};

export const TAX_DESCRIPTION_ITEMS: Record<TaxType, string[]> = {
    [TaxType.HOUSING]: ['Mua bất động sản / nhà ở.', 'Nâng cấp và cải tạo nhà ở.', 'Mua sắm nội thất gia đình.'],
    [TaxType.VEHICLE]: [
        'Mua phương tiện tại đại lý thông thường, xe sang, du thuyền, trực thăng, mô tô và xe công vụ.',
        'Độ và nâng cấp xe tại LS Customs.',
        'Sử dụng dịch vụ rửa xe tự động.',
        'Thi và cấp các loại bằng lái xe.',
    ],
    [TaxType.GREEN]: ['Mua phương tiện giao thông thuần điện (bảo vệ môi trường).'],
    [TaxType.FOOD]: ['Mua sắm tại các siêu thị, cửa hàng tiện lợi 24/7.'],
    [TaxType.WEAPON]: ['Mua sắm tại cửa hàng vũ khí Ammu-Nation.', 'Nâng cấp và tinh chỉnh phụ kiện súng.'],
    [TaxType.SUPPLY]: ['Mua sắm quần áo và trang phục.', 'Xăm hình nghệ thuật.', 'Cắt tóc và tạo mẫu tại Salon.'],
    [TaxType.TRAVEL]: ['Phí vận chuyển phương tiện giữa đảo Cayo Perico và San Andreas.'],
    [TaxType.SERVICE]: [
        'Dịch vụ khám chữa bệnh và cấp cứu y tế khẩn cấp.',
        'Dịch vụ cứu hộ giao thông và sửa chữa khẩn cấp.',
        'Thẻ thành viên tập gym thể hình Muscle Peach.',
    ],
};

export const GouvJobMenu: FunctionComponent<GouvJobMenuProps> = ({ data }) => {
    const taxData = useRepository(RepositoryType.Tax);
    const taxAllowed = useHasJobPermission(JobType.Gouv, JobPermission.GouvUpdateTax);
    const fineAllowed = useHasJobPermission(JobType.Gouv, JobPermission.GouvManageFine);
    const tier = useConfigurationValue('JobTaxTier');
    const gouv = useConfigurationValue('Gouv');
    const player = usePlayer();

    if (!player.job.onduty) {
        return (
            <Menu type={MenuType.GouvJobMenu}>
                <MainMenu>
                    <MenuTitle title={JobLabel.gouv} />
                    <MenuContent>
                        <MenuItemText>Bạn hiện chưa vào ca trực chính quyền.</MenuItemText>
                    </MenuContent>
                </MainMenu>
            </Menu>
        );
    }

    return (
        <Menu type={MenuType.GouvJobMenu}>
            <MainMenu>
                <MenuTitle title={JobLabel.gouv} />
                <MenuContent>
                    <MenuItemButton
                        onConfirm={async () => {
                            await fetchNui(NuiEvent.GouvAnnoncement);
                        }}
                    >
                        Phát thông cáo chính phủ
                    </MenuItemButton>
                    {taxAllowed && <MenuItemSubMenuLink id="tax">Thuế suất</MenuItemSubMenuLink>}
                    {taxAllowed && <MenuItemSubMenuLink id="tier">Hạn mức thuế thu nhập</MenuItemSubMenuLink>}
                    {fineAllowed && <MenuItemSubMenuLink id="fine">Mức phạt hành chính</MenuItemSubMenuLink>}
                    <MenuItemCheckbox
                        checked={data.displayRadar}
                        onChange={async value => {
                            await fetchNui(NuiEvent.ToggleRadar, value);
                        }}
                    >
                        Hiển thị radar đo tốc độ trên GPS
                    </MenuItemCheckbox>
                    {data.updateSenatSalary && (
                        <MenuItemButton
                            onConfirm={async () => {
                                await fetchNui(NuiEvent.GouvSenatSalary, gouv.SenatSalary);
                            }}
                        >
                            <div className="pr-2 flex items-center justify-between">
                                <span>Lương Nghị sĩ / Quan chức</span>
                                <span>{gouv.SenatSalary}$</span>
                            </div>
                        </MenuItemButton>
                    )}
                </MenuContent>
            </MainMenu>
            <SubMenu id="tax">
                <MenuTitle title={JobLabel.gouv} />
                <MenuContent subtitle="Thuế suất hiện hành">
                    {Object.values(TaxType).map(taxType => {
                        const tax = taxData[taxType] ?? { id: taxType, value: 11 };

                        return (
                            <MenuItemButton
                                key={tax.id}
                                onConfirm={() => {
                                    fetchNui(NuiEvent.GouvSetTax, {
                                        type: tax.id,
                                    });
                                }}
                                description={
                                    <div className="text-sm">
                                        <h5 className="underline decoration-solid">
                                            Thuế này áp dụng cho các hoạt động:
                                        </h5>
                                        <ul className="pl-7 list-disc">
                                            {TAX_DESCRIPTION_ITEMS[tax.id].map((description, index) => (
                                                <li key={index}>{description}</li>
                                            ))}
                                        </ul>
                                    </div>
                                }
                            >
                                <span className="font-bold">{TaxLabel[tax.id]}</span>: {tax.value}%
                            </MenuItemButton>
                        );
                    })}
                </MenuContent>
            </SubMenu>
            <SubMenu id="tier">
                <MenuTitle title={JobLabel.gouv} />
                <MenuContent subtitle="Bậc thuế thu nhập">
                    <MenuItemSelect
                        onConfirm={(_, value) => {
                            if (value === 'amount') {
                                fetchNui(NuiEvent.GouvSetJobTaxTier, {
                                    tier: 'Tier1',
                                });
                            }

                            if (value === 'percentage') {
                                fetchNui(NuiEvent.GouvSetJobTaxTierPercentage, {
                                    tier: 'Tier1Percentage',
                                });
                            }
                        }}
                        description={`Dưới ${Intl.NumberFormat('vi-VN').format(tier.Tier1)}$, mức thuế: ${
                            tier.Tier1Percentage
                        }%`}
                        title="Bậc 1"
                    >
                        <MenuItemSelectOption value="amount">Sửa mức tiền</MenuItemSelectOption>
                        <MenuItemSelectOption value="percentage">Sửa phần trăm thuế</MenuItemSelectOption>
                    </MenuItemSelect>
                    <MenuItemSelect
                        onConfirm={(_, value) => {
                            if (value === 'amount') {
                                fetchNui(NuiEvent.GouvSetJobTaxTier, {
                                    tier: 'Tier2',
                                });
                            }

                            if (value === 'percentage') {
                                fetchNui(NuiEvent.GouvSetJobTaxTierPercentage, {
                                    tier: 'Tier2Percentage',
                                });
                            }
                        }}
                        description={`Từ ${Intl.NumberFormat('vi-VN').format(
                            tier.Tier1 + 1
                        )}$ đến ${Intl.NumberFormat('vi-VN').format(tier.Tier2)}$, mức thuế: ${tier.Tier2Percentage}%`}
                        title="Bậc 2"
                    >
                        <MenuItemSelectOption value="amount">Sửa mức tiền</MenuItemSelectOption>
                        <MenuItemSelectOption value="percentage">Sửa phần trăm thuế</MenuItemSelectOption>
                    </MenuItemSelect>
                    <MenuItemSelect
                        onConfirm={(_, value) => {
                            if (value === 'amount') {
                                fetchNui(NuiEvent.GouvSetJobTaxTier, {
                                    tier: 'Tier3',
                                });
                            }

                            if (value === 'percentage') {
                                fetchNui(NuiEvent.GouvSetJobTaxTierPercentage, {
                                    tier: 'Tier3Percentage',
                                });
                            }
                        }}
                        description={`Từ ${Intl.NumberFormat('vi-VN').format(
                            tier.Tier2 + 1
                        )}$ đến ${Intl.NumberFormat('vi-VN').format(tier.Tier3)}$, mức thuế: ${tier.Tier3Percentage}%`}
                        title="Bậc 3"
                    >
                        <MenuItemSelectOption value="amount">Sửa mức tiền</MenuItemSelectOption>
                        <MenuItemSelectOption value="percentage">Sửa phần trăm thuế</MenuItemSelectOption>
                    </MenuItemSelect>
                    <MenuItemSelect
                        onConfirm={(_, value) => {
                            if (value === 'amount') {
                                fetchNui(NuiEvent.GouvSetJobTaxTier, {
                                    tier: 'Tier4',
                                });
                            }

                            if (value === 'percentage') {
                                fetchNui(NuiEvent.GouvSetJobTaxTierPercentage, {
                                    tier: 'Tier4Percentage',
                                });
                            }
                        }}
                        description={`Từ ${Intl.NumberFormat('vi-VN').format(
                            tier.Tier3 + 1
                        )}$ đến ${Intl.NumberFormat('vi-VN').format(tier.Tier4)}$, mức thuế: ${tier.Tier4Percentage}%`}
                        title="Bậc 4"
                    >
                        <MenuItemSelectOption value="amount">Sửa mức tiền</MenuItemSelectOption>
                        <MenuItemSelectOption value="percentage">Sửa phần trăm thuế</MenuItemSelectOption>
                    </MenuItemSelect>
                    <MenuItemSelect
                        onConfirm={(_, value) => {
                            if (value === 'percentage') {
                                fetchNui(NuiEvent.GouvSetJobTaxTierPercentage, {
                                    tier: 'Tier5Percentage',
                                });
                            }
                        }}
                        description={`Trên ${Intl.NumberFormat('vi-VN').format(tier.Tier4)}$, mức thuế: ${
                            tier.Tier5Percentage
                        }%`}
                        title="Bậc 5"
                    >
                        <MenuItemSelectOption value="percentage">Sửa phần trăm thuế</MenuItemSelectOption>
                    </MenuItemSelect>
                </MenuContent>
            </SubMenu>
            <SubMenu id="fine">
                <MenuTitle title={JobLabel.gouv} />
                <MenuContent subtitle="Mức phạt hành chính">
                    <MenuItemSubMenuLink id="fine_1">🟢 Danh mục 1 (Vi phạm nhẹ)</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="fine_2">🟡 Danh mục 2 (Vi phạm trung bình)</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="fine_3">🟠 Danh mục 3 (Vi phạm nghiêm trọng)</MenuItemSubMenuLink>
                    <MenuItemSubMenuLink id="fine_4">🔴 Danh mục 4 (Trọng tội)</MenuItemSubMenuLink>
                </MenuContent>
            </SubMenu>
            <FineSubMenu category={1} />
            <FineSubMenu category={2} />
            <FineSubMenu category={3} />
            <FineSubMenu category={4} />
        </Menu>
    );
};

type FineSubMenuProps = {
    category: number;
};

const FineSubMenu: FunctionComponent<FineSubMenuProps> = ({ category }) => {
    const fines = useRepository(RepositoryType.Fine);
    const finesForCategory = Object.values(fines).filter(fine => fine.category === category);

    return (
        <SubMenu id={`fine_${category}`}>
            <MenuTitle title={JobLabel.gouv} />
            <MenuContent subtitle={`Mức phạt Danh mục ${category}`}>
                <MenuItemButton
                    onConfirm={() => {
                        fetchNui(NuiEvent.GouvFineAdd, {
                            category,
                        });
                    }}
                >
                    Thêm hành vi vi phạm mới
                </MenuItemButton>
                {finesForCategory.map(fine => (
                    <MenuItemSelect
                        key={fine.id}
                        title={fine.label}
                        description={fine.label}
                        onConfirm={(i, value) => {
                            if (value === 'label') {
                                fetchNui(NuiEvent.GouvFineSetLabel, {
                                    id: fine.id,
                                });
                            }

                            if (value === 'min') {
                                fetchNui(NuiEvent.GouvFineSetMinPrice, {
                                    id: fine.id,
                                });
                            }

                            if (value === 'max') {
                                fetchNui(NuiEvent.GouvFineSetMaxPrice, {
                                    id: fine.id,
                                });
                            }

                            if (value === 'delete') {
                                fetchNui(NuiEvent.GouvFineRemove, {
                                    id: fine.id,
                                });
                            }
                        }}
                    >
                        <MenuItemSelectOption value="label">Đổi tên vi phạm</MenuItemSelectOption>
                        <MenuItemSelectOption value="min">Mức tối thiểu: ${fine.price.min}</MenuItemSelectOption>
                        <MenuItemSelectOption value="max">Mức tối đa: ${fine.price.max}</MenuItemSelectOption>
                        <MenuItemSelectOption value="delete">Xóa bỏ</MenuItemSelectOption>
                    </MenuItemSelect>
                ))}
            </MenuContent>
        </SubMenu>
    );
};
