import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { getItemWeight, InventoryItem, isInventoryItemExpired } from '../../../shared/inventory';
import { WeaponAmmo } from '../../../shared/weapons/weapon';
import { useItemResolver } from '../../hook/data';
import { GlassMorphismContainer } from '../Styleguide/GlassMorphismContainer';
import { useInventorySize } from './size';

export type ItemDescriptionProps = {
    inventoryItem: InventoryItem | null;
    position: 'left' | 'right';
};

export const FORMAT_LOCALIZED: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

export const ItemDescription: FunctionComponent<ItemDescriptionProps> = ({
    inventoryItem,
    position = 'right',
}: ItemDescriptionProps) => {
    const resolver = useItemResolver();
    const inventorySize = useInventorySize(6);
    const item = resolver(inventoryItem?.name);

    if (!inventoryItem || !item) {
        return null;
    }

    const expiration = inventoryItem.metadata?.expiration ? new Date(inventoryItem.metadata?.expiration) : null;
    const currentTime = new Date();

    let itemLabel = item.label;
    let itemDescription = item.description;

    if (inventoryItem?.type === 'evidence' && inventoryItem.name != 'scientist_photo' && expiration) {
        if (!inventoryItem?.metadata?.evidenceInfos?.isAnalyzed) {
            if (inventoryItem?.metadata?.evidenceInfos?.type === 'evidence_fingerprint') {
                if (currentTime > expiration) {
                    itemLabel = `Dấu vân tay đã hết hạn`;
                } else {
                    itemLabel = `Dấu vân tay chưa giám định`;
                    itemDescription += `Mẫu vân tay này được đội khám nghiệm hiện trường thu thập, cần đưa đến phòng giám định để phân tích danh tính.`;
                }
            } else {
                if (currentTime > expiration) {
                    itemLabel = `Mẫu ${getTypeLabel(inventoryItem.metadata?.evidenceInfos?.type).toLowerCase()} đã hết hạn`;
                } else {
                    itemLabel = `Mẫu ${getTypeLabel(inventoryItem.metadata?.evidenceInfos?.type).toLowerCase()} chưa giám định`;
                    itemDescription += `Mẫu vật chứng này được cảnh sát thu thập từ hiện trường, cần đưa vào phân tích để tìm manh mối.`;
                }
            }
        } else {
            if (inventoryItem?.metadata?.evidenceInfos?.type === 'evidence_fingerprint') {
                if (currentTime > expiration) {
                    itemLabel = `Dấu vân tay đã hết hạn`;
                } else {
                    itemLabel = `Dấu vân tay đã giám định`;
                    itemDescription += `Dấu vân tay đã được phòng pháp y cảnh sát phân tích và lưu hồ sơ.`;
                }
            } else {
                if (currentTime > expiration) {
                    itemLabel = `Mẫu ${getTypeLabel(inventoryItem.metadata?.evidenceInfos?.type).toLowerCase()} đã hết hạn`;
                } else {
                    itemLabel = `Mẫu ${getTypeLabel(inventoryItem.metadata?.evidenceInfos?.type).toLowerCase()} đã giám định`;
                    itemDescription += `Mẫu vật chứng đã được phòng pháp y cảnh sát giám định thành công.`;
                }
            }
        }
    }

    return (
        <div
            className={classNames('absolute top-0', {
                'right-[-102%]': position === 'right',
                'left-[-102%]': position === 'left',
            })}
        >
            <GlassMorphismContainer duration="duration-0" borderClassName="rounded-xl">
                <div
                    className="p-3 text-lsm font-prompt text-gray-100"
                    style={{
                        width: `${inventorySize.width}px`,
                    }}
                >
                    <div className="flex justify-between align-items-center w-full">
                        {!item.canEngrave && inventoryItem.metadata?.label && (
                            <h2 className="font-bold uppercase truncate flex-1 text-sm text-candy-400">
                                {inventoryItem.metadata?.label} <span className="text-2xs text-gray-300">({itemLabel})</span>
                            </h2>
                        )}
                        {(item.canEngrave || !inventoryItem.metadata?.label) && (
                            <h2 className="font-bold uppercase truncate flex-1 text-sm text-candy-400">{itemLabel}</h2>
                        )}
                        <div className="flex-0 text-xs text-candy-300">
                            {inventoryItem.type === 'weapon' && inventoryItem.metadata?.ammo && (
                                <span>[{inventoryItem.metadata?.ammo} viên]</span>
                            )}
                            {inventoryItem.metadata?.plates && inventoryItem.metadata?.plates > 0 && (
                                <span>Giáp tấm: {inventoryItem.metadata?.plates}</span>
                            )}
                            {inventoryItem.type === 'fishing_rod' && inventoryItem.metadata?.bait && (
                                <span>[{resolver(inventoryItem.metadata?.bait?.name)?.label}]</span>
                            )}
                            {inventoryItem.name === 'chainsaw' && inventoryItem.metadata?.fuel && (
                                <span>[{inventoryItem.metadata?.fuel} L]</span>
                            )}
                            {inventoryItem.type === 'crate' && inventoryItem.metadata?.crateElements?.length && (
                                <span>
                                    [
                                    {getItemWeight(
                                        inventoryItem.name,
                                        inventoryItem.amount,
                                        resolver,
                                        inventoryItem.metadata
                                    ) / 1000}
                                    /12Kg]
                                </span>
                            )}
                            {inventoryItem.name === 'zkea_crate' && inventoryItem.metadata?.fuel && (
                                <span>
                                    [
                                    {getItemWeight(
                                        inventoryItem.name,
                                        inventoryItem.amount,
                                        resolver,
                                        inventoryItem.metadata
                                    ) / 1000}
                                    /40Kg]
                                </span>
                            )}
                            {expiration && (
                                <>
                                    {isInventoryItemExpired(inventoryItem) && <span className="text-red-400">[Hết hạn]</span>}
                                    {!isInventoryItemExpired(inventoryItem) && (
                                        <span>
                                            [HSD: {expiration.toLocaleDateString('vi-VN', FORMAT_LOCALIZED)}]
                                        </span>
                                    )}
                                </>
                            )}
                            {inventoryItem.metadata?.type && <span>[{inventoryItem.metadata?.type}]</span>}
                            {inventoryItem.metadata?.url && <span>[{inventoryItem.metadata?.url}]</span>}
                            {inventoryItem.metadata?.notSearchable && <span className="text-yellow-300">[Đã giấu]</span>}
                            {inventoryItem.metadata?.crafted && <span className="text-red-400">[Bất hợp pháp]</span>}
                            {inventoryItem.metadata?.printed && <span>[Sao chép]</span>}
                        </div>
                    </div>
                    <div className="flex mt-1 justify-between align-items-center w-full text-xs text-gray-200">
                        {inventoryItem.metadata?.description ?? itemDescription}
                    </div>
                    {item.canEngrave && (
                        <div className="flex mt-1 justify-between align-items-center w-full">
                            <span></span>
                            <span className="text-candy-400">{inventoryItem.metadata?.label || ''} ★</span>
                        </div>
                    )}
                    {item.type === 'fish' && (inventoryItem.metadata?.weight || inventoryItem.metadata?.length) && (
                        <div className="mt-1 text-xs">
                            <div>
                                <strong>Trọng lượng: </strong>
                                {inventoryItem.metadata?.weight} gram
                            </div>
                            <div>
                                <strong>Kích thước: </strong>
                                {inventoryItem.metadata?.length} cm
                            </div>
                        </div>
                    )}
                    {item.type === 'crate' && (
                        <>
                            {(inventoryItem.metadata?.crateElements || []).map((element, index) => (
                                <div key={index} className="text-xs">
                                    - {element.amount} {resolver(element.name)?.label} [HSD:{' '}
                                    {element.metadata?.expiration
                                        ? new Date(element.metadata?.expiration).toLocaleDateString(
                                              'vi-VN',
                                              FORMAT_LOCALIZED
                                          )
                                        : ''}
                                    ]
                                </div>
                            ))}
                        </>
                    )}
                    {inventoryItem.type === 'zkea_crate' && (
                        <>
                            {(inventoryItem.metadata?.zkeaCrateElements || []).map((element, index) => (
                                <div key={index} className="text-xs">- {element.name}</div>
                            ))}
                        </>
                    )}
                    {inventoryItem.type === 'evidence' &&
                        inventoryItem.name !== 'scientist_photo' &&
                        expiration &&
                        currentTime <= expiration && (
                            <div className="text-xs">
                                {!inventoryItem?.metadata?.evidenceInfos?.isAnalyzed && (
                                    <>
                                        <div>
                                            <strong>Phân loại: </strong>{' '}
                                            {getTypeLabel(inventoryItem.metadata?.evidenceInfos?.type)}
                                        </div>
                                        <div>
                                            <strong>Khu vực thu thập: </strong>Chưa rõ
                                        </div>
                                        <div>
                                            <strong>Vật mang: </strong> Chưa rõ
                                        </div>
                                    </>
                                )}
                                {inventoryItem?.metadata?.evidenceInfos?.isAnalyzed && (
                                    <>
                                        <div>
                                            <strong>Phân loại: </strong>{' '}
                                            {getTypeLabel(inventoryItem.metadata?.evidenceInfos?.type)}
                                        </div>
                                        <div>
                                            <strong>Khu vực thu thập: </strong>
                                            {inventoryItem.metadata?.evidenceInfos?.zone}
                                        </div>
                                        <div>
                                            <strong>Vật mang: </strong> {inventoryItem.metadata?.evidenceInfos?.support}
                                        </div>
                                        <div>
                                            <strong>Thông tin: </strong>{' '}
                                            {inventoryItem.metadata?.evidenceInfos?.generalInfo}
                                        </div>
                                    </>
                                )}
                                {inventoryItem.metadata.evidenceInfos?.quantity && (
                                    <div>
                                        <strong>Số lượng: </strong> {inventoryItem.metadata.evidenceInfos.quantity}
                                    </div>
                                )}
                                {inventoryItem.metadata?.creation && (
                                    <div>
                                        <strong>Thu thập lúc: </strong>{' '}
                                        {new Date(inventoryItem.metadata.creation).toLocaleDateString(
                                            'vi-VN',
                                            FORMAT_LOCALIZED
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    {inventoryItem.name !== 'cyber_crypto_wallet' && inventoryItem.metadata?.value && (
                        <div className="mt-1 text-xs">
                            <div>
                                <strong>Giá trị ước tính: </strong>
                                {(inventoryItem.metadata?.value * inventoryItem.amount).toLocaleString('vi-VN')} $
                            </div>
                        </div>
                    )}
                    {inventoryItem.metadata?.creation && inventoryItem.name.startsWith('champagne_') && (
                        <div className="mt-1 text-xs">
                            <div>
                                <strong>Năm sản xuất: </strong>{' '}
                                {new Date(inventoryItem.metadata.creation).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                })}
                            </div>
                        </div>
                    )}
                    {(item?.storageItemType === 'smuggling_ore' || item?.storageItemType === 'smuggling_electronic') &&
                        inventoryItem?.metadata?.storageElements && (
                            <div className="mt-1 text-xs">
                                <div>
                                    <strong>Giá trị ước tính: </strong>
                                    {Object.values(inventoryItem.metadata.storageElements).reduce((prev, item) => {
                                        if (!item) {
                                            return prev;
                                        }

                                        if (item?.metadata?.printed) {
                                            return prev;
                                        }

                                        if (!item?.metadata?.value) {
                                            return prev;
                                        }

                                        return prev + item.metadata.value * item.amount;
                                    }, 0).toLocaleString('vi-VN')}{' '}
                                    $
                                </div>
                            </div>
                        )}
                    {inventoryItem.name === 'cyber_crypto_wallet' && inventoryItem.metadata?.value !== undefined && (
                        <div className="mt-1 text-xs">
                            <div>
                                <strong>Tiền điện tử Crypto: </strong>
                                {inventoryItem.metadata?.value}
                            </div>
                        </div>
                    )}
                    <div className="flex mt-1 justify-between align-items-center w-full text-xs">
                        <div>
                            {inventoryItem.type === 'weapon' && WeaponAmmo[inventoryItem.name.toUpperCase()] && (
                                <span className="text-candy-300">Cỡ đạn: {WeaponAmmo[inventoryItem.name.toUpperCase()]}</span>
                            )}
                        </div>
                        {item.illustrator && typeof item.illustrator === 'string' && <span>{item.illustrator}</span>}
                        {item.illustrator && item.illustrator instanceof Object && (
                            <span>{item.illustrator[inventoryItem.metadata?.type] || ''}</span>
                        )}
                    </div>
                    {inventoryItem.metadata?.extraLabel && (
                        <div className="mt-1 text-xs text-candy-200">{inventoryItem.metadata.extraLabel}</div>
                    )}
                </div>
            </GlassMorphismContainer>
        </div>
    );
};

const getTypeLabel = (type: string | undefined): string => {
    if (type == 'evidence_glass') {
        return 'Mảnh thủy tinh';
    } else if (type == 'evidence_blood') {
        return 'Vết máu';
    } else if (type == 'evidence_bullet') {
        return 'Vỏ đạn';
    } else if (type == 'evidence_drug') {
        return 'Vết ma túy';
    } else if (type == 'evidence_fingerprint') {
        return 'Dấu vân tay';
    } else if (type == 'evidence_powder') {
        return 'Muội thuốc súng';
    }
    return 'Không xác định';
};
