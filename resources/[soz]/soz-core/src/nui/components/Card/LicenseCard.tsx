import { FunctionComponent } from 'react';

import { PlayerData, PlayerLicenceType } from '../../../shared/player';
import { useAssetPath } from '../../hook/assets';

type LicenseCardProps = {
    player: PlayerData;
};

const licenceLabel = (player: PlayerData, type: PlayerLicenceType) => {
    if (player.metadata.licences[type]) {
        return 'Hợp lệ';
    }

    return 'Không hợp lệ';
};

const licenseLabelPoints = (player: PlayerData, type: PlayerLicenceType) => {
    if (player.metadata.licences[type]) {
        return `${player.metadata.licences[type]} điểm`;
    }

    return '-';
};

export const LicenseCard: FunctionComponent<LicenseCardProps> = ({ player }) => {
    const { getPath } = useAssetPath();

    return (
        <div
            style={{
                backgroundImage: `url(${getPath(`images/identity/licenses.webp`)})`,
            }}
            className="bg-contain bg-no-repeat aspect-[855/539] h-[340px]"
        >
            <div className="flex h-full">
                <div className="pt-[48%] pl-[7.5%] flex w-[52%]">
                    <div>
                        <h3 className="text-sm leading-none">Họ</h3>
                        <p className="leading-none text-lg">{player.charinfo.lastname.toUpperCase()}</p>
                    </div>
                    <div className="pl-4">
                        <h3 className="text-sm leading-none">Tên</h3>
                        <p className="leading-none text-lg">{player.charinfo.firstname.toUpperCase()}</p>
                    </div>
                </div>
                <div className="pl-[10%] flex-grow pr-[5%] pt-[12%] pb-[8.5%] h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="w-[50%]">
                            <h3 className="text-2xs leading-none uppercase">Ô tô (Bằng lái)</h3>
                            <p className="font-bold mt-[-1%] text-xsm leading-none uppercase">
                                {licenceLabel(player, PlayerLicenceType.Car)}
                            </p>
                        </div>
                        <div className="w-[50%] text-center font-bold text-sm uppercase">
                            {licenseLabelPoints(player, PlayerLicenceType.Car)}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-[50%]">
                            <h3 className="text-2xs leading-none uppercase">Xe tải / Hạng nặng</h3>
                            <p className="font-bold mt-[-1%] text-xsm leading-none uppercase">
                                {licenceLabel(player, PlayerLicenceType.Truck)}
                            </p>
                        </div>
                        <div className="w-[50%] text-center font-bold text-sm uppercase">
                            {licenseLabelPoints(player, PlayerLicenceType.Truck)}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-[50%]">
                            <h3 className="text-2xs leading-none uppercase">Mô tô (Xe máy)</h3>
                            <p className="font-bold mt-[-1%] text-xsm leading-none uppercase">
                                {licenceLabel(player, PlayerLicenceType.Moto)}
                            </p>
                        </div>
                        <div className="w-[50%] text-center font-bold text-sm uppercase">
                            {licenseLabelPoints(player, PlayerLicenceType.Moto)}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-[50%]">
                            <h3 className="text-2xs leading-none uppercase">Trực thăng</h3>
                            <p className="font-bold mt-[-1%] text-xsm leading-none uppercase">
                                {licenceLabel(player, PlayerLicenceType.Heli)}
                            </p>
                        </div>
                        <div className="w-[50%] text-center font-bold text-sm uppercase">
                            {licenseLabelPoints(player, PlayerLicenceType.Heli)}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-[50%]">
                            <h3 className="text-2xs leading-none uppercase">Thuyền / Ca-nô</h3>
                            <p className="font-bold mt-[-1%] text-xsm leading-none uppercase">
                                {licenceLabel(player, PlayerLicenceType.Boat)}
                            </p>
                        </div>
                        <div className="w-[50%] text-center font-bold text-sm uppercase">
                            {licenseLabelPoints(player, PlayerLicenceType.Boat)}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xs leading-none uppercase">Mang vũ khí</h3>
                        <p className="font-bold mt-[-1%] text-xsm leading-none uppercase">
                            {licenceLabel(player, PlayerLicenceType.Weapon)}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xs leading-none uppercase">Săn bắn</h3>
                        <p className="font-bold mt-[-1%] text-xsm leading-none uppercase">
                            {licenceLabel(player, PlayerLicenceType.Hunting)}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xs leading-none uppercase">Câu cá</h3>
                        <p className="font-bold mt-[-1%] text-xsm leading-none uppercase">
                            {licenceLabel(player, PlayerLicenceType.Fishing)}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xs leading-none uppercase">Sơ cấp cứu (LSMC)</h3>
                        <p className="font-bold text-xsm leading-none uppercase">
                            {licenceLabel(player, PlayerLicenceType.Rescuer)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
