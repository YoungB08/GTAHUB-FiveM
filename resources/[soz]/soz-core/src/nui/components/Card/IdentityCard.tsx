import { FunctionComponent } from 'react';

import { JobLabel } from '../../../shared/job';
import { expirationVisaDuration, PlayerData } from '../../../shared/player';
import { useAssetPath } from '../../hook/assets';
import { Mugshot } from '../Player/Mugshot';

type IdentityCardProps = {
    player: PlayerData;
};

const FORMAT_LOCALIZED: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
};

export const IdentityCard: FunctionComponent<IdentityCardProps> = ({ player }) => {
    const { getPath } = useAssetPath();

    return (
        <div
            style={{
                backgroundImage: player.is_validated
                    ? `url(${getPath(`images/identity/identity.webp`)})`
                    : `url(${getPath(`images/identity/identity_temp.webp`)})`,
            }}
            className="bg-contain bg-no-repeat aspect-[855/539] h-[340px]"
        >
            <div className="flex h-full">
                <div className="w-[50%] pt-[20%] pl-[10%]">
                    <Mugshot player={player} />
                </div>
                <div className="flex flex-col pt-[14%] pb-[9%] justify-between">
                    <div>
                        <h3 className="text-xs leading-none">Họ</h3>
                        <p className="uppercase leading-none">{player.charinfo.lastname}</p>
                    </div>
                    <div>
                        <h3 className="text-xs leading-none">Tên</h3>
                        <p className="uppercase leading-none">{player.charinfo.firstname}</p>
                    </div>
                    <div>
                        <h3 className="text-xs leading-none">Giới tính</h3>
                        <p className="uppercase leading-none">
                            {player.skin?.Model?.Hash === -1667301416 ? 'Nữ' : 'Nam'}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xs leading-none">Nghề nghiệp</h3>
                        <p className="uppercase leading-none">{JobLabel[player.job.id]}</p>
                    </div>
                    <div>
                        <h3 className="text-xs leading-none">Địa chỉ thường trú</h3>
                        <p className="uppercase leading-none">{player.address ? player.address : '-'}</p>
                    </div>
                    <div>
                        <h3 className="text-xs leading-none">Số điện thoại</h3>
                        <p className="uppercase leading-none">{player.charinfo.phone}</p>
                    </div>
                    {!player.is_validated && (
                        <div>
                            <h3 className="text-xs leading-none">Ngày hết hạn</h3>
                            <p className="uppercase leading-none">
                                {new Date(player.created_at + expirationVisaDuration).toLocaleDateString(
                                    'vi-VN',
                                    FORMAT_LOCALIZED
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
