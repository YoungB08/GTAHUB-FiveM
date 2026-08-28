import { RadarAllowedVehicle, RadarInformedVehicle } from '../../config/radar';
import { OnEvent } from '../../core/decorators/event';
import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { ClientEvent, ServerEvent } from '../../shared/event';
import { FDO, JobType } from '../../shared/job';
import { PlayerLicenceType } from '../../shared/player';
import { VehicleSeat } from '../../shared/vehicle/vehicle';
import { BankService } from '../bank/bank.service';
import { PrismaService } from '../database/prisma.service';
import { Monitor } from '../monitor/monitor';
import { Notifier } from '../notifier';
import { PlayerService } from '../player/player.service';
import { RadarRepository } from '../repository/radar.repository';
import { VehicleRepository } from '../repository/vehicle.repository';
import { VehicleStateService } from './vehicle.state.service';

const RadarMessage = {
    Title: 'RADAR TỰ ĐỘNG',
    FlashVehicle: 'Phương tiện của bạn đã bị camera bắn tốc độ!',
    FlashPolice: 'Một phương tiện đã bị camera bắn tốc độ!',
};

@Provider()
export class VehicleRadarProvider {
    @Inject(VehicleRepository)
    private vehicleRepository: VehicleRepository;

    @Inject(PrismaService)
    private prismaService: PrismaService;

    @Inject(BankService)
    private bankService: BankService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(RadarRepository)
    private radarRepository: RadarRepository;

    @Inject(VehicleStateService)
    private vehicleStateService: VehicleStateService;

    @Inject(Monitor)
    private monitor: Monitor;

    private disabledEndTimes: Record<number, number> = {};

    public disableRadar(radarId: number, duration: number) {
        this.disabledEndTimes[radarId] = Date.now() + duration;
    }

    @OnEvent(ServerEvent.VEHICLE_RADAR_TRIGGER)
    public async trigger(
        source: number,
        radarID: number,
        vehiclePlate: string,
        vehicleClass: number,
        vehicleModel: number,
        vehicleType: string,
        vehicleSpeed: number,
        streetName: string
    ) {
        const radar = await this.radarRepository.find(radarID);

        if (!radar) {
            return;
        }

        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        if (radar.destroyed) {
            return;
        }

        if (this.disabledEndTimes[radarID] && this.disabledEndTimes[radarID] > Date.now()) {
            return;
        }

        if (vehicleSpeed - 5 > radar.speed) {
            TriggerClientEvent(ClientEvent.VEHICLE_RADAR_FLASHED, source);

            let radarMessage = `Biển số: ~b~${vehiclePlate}~s~~n~`;
            radarMessage += `Tốc độ: ~r~${vehicleSpeed} km/h~s~ (~g~${radar.speed} km/h~s~)~n~`;

            if (RadarAllowedVehicle.includes(vehicleModel)) {
                this.notifier.advancedNotify(
                    source,
                    RadarMessage.Title,
                    RadarMessage.FlashVehicle,
                    radarMessage + '~g~Phương tiện được phép~s~',
                    'CHAR_BLOCKED',
                    'info'
                );
                return;
            }

            const dbRadar = await this.prismaService.radar.findUnique({
                where: {
                    id: radarID,
                },
            });

            if (vehicleSpeed > dbRadar.speed_record) {
                radarMessage =
                    radarMessage +
                    `Kỷ lục mới: ~b~${await this.playerService.getNameFromCitizenId(
                        player.citizenid
                    )}~s~ ~o~${vehicleSpeed}km/h~s~~n~`;

                await this.prismaService.radar.update({
                    where: {
                        id: radarID,
                    },
                    data: {
                        citizenid: player.citizenid,
                        speed_record: vehicleSpeed,
                    },
                });
            } else if (dbRadar.citizenid) {
                radarMessage =
                    radarMessage +
                    `Kỷ lục: ~b~${await this.playerService.getNameFromCitizenId(dbRadar.citizenid)}~s~ ~o~${
                        dbRadar.speed_record
                    }km/h~s~~n~`;
            }

            const fine = Math.round(((vehicleSpeed - radar.speed) * 0.6) ** 1.35 + 20);

            let licenceAction = 'no_action';
            if (fine > 0) {
                radarMessage = radarMessage + `Tiền phạt: ~r~$${fine}~s~~n~`;

                if (vehicleSpeed - radar.speed >= 20) {
                    const licences = player.metadata['licences'];
                    const vehicleDB = await this.vehicleRepository.findByHash(vehicleModel);

                    let licenceType = PlayerLicenceType.Car;
                    if (vehicleDB) {
                        licenceType = vehicleDB.requiredLicence as PlayerLicenceType;
                    } else if (vehicleType == 'bike' || vehicleClass == 8) {
                        licenceType = PlayerLicenceType.Moto;
                    } else if (
                        vehicleType == 'automobile' &&
                        (vehicleClass == 10 || vehicleClass == 17 || vehicleClass == 20)
                    ) {
                        licenceType = PlayerLicenceType.Truck;
                    } else if (vehicleType == 'heli') {
                        licenceType = PlayerLicenceType.Heli;
                    } else if (vehicleType == 'boat' || vehicleType !== 'submarine') {
                        licenceType = PlayerLicenceType.Boat;
                    }

                    if (licences[licenceType] >= 1) {
                        licences[licenceType] = licences[licenceType] - 1;

                        if (licences[licenceType] >= 1) {
                            licenceAction = 'remove_point';
                            radarMessage = radarMessage + 'Điểm: ~r~-1 Điểm~s~~n~';
                        } else {
                            licenceAction = 'remove_licence';
                            radarMessage = radarMessage + '~r~Bị tước bằng lái~s~~n~';
                        }
                    } else {
                        licenceAction = 'no_licence';
                        radarMessage = radarMessage + '~r~Không có bằng lái~s~~n~';
                    }

                    this.playerService.setPlayerMetadata(source, 'licences', licences);
                }
            }

            this.monitor.traceEvent('radar_flash', {
                player_source: source,
                id: radarID.toString(),
                vehicle_plate: vehiclePlate,
                type: licenceAction,
                money: fine,
                amount: vehicleSpeed,
            });

            if (fine > 0) {
                await this.bankService.transferBankMoney(player.charinfo.account, JobType.Gouv, 'money', fine, true);
            }

            this.notifier.advancedNotify(
                source,
                RadarMessage.Title,
                RadarMessage.FlashVehicle,
                radarMessage,
                'CHAR_BLOCKED',
                'info'
            );

            this.notifier.advancedNotifyOnDutyWorkers(
                RadarMessage.Title,
                RadarMessage.FlashPolice,
                `Biển số: ~b~${vehiclePlate}~s~ ~n~Đường: ~b~${streetName}~s~ ~n~Tốc độ: ~r~${vehicleSpeed} km/h~s~`,
                'CHAR_BLOCKED',
                'info',
                FDO,
                player => {
                    const currentVehicle = GetVehiclePedIsIn(GetPlayerPed(player.source), false);
                    if (currentVehicle && RadarInformedVehicle.includes(GetEntityModel(currentVehicle))) {
                        const ped = GetPlayerPed(player.source);
                        return (
                            GetPedInVehicleSeat(currentVehicle, VehicleSeat.Driver) == ped ||
                            GetPedInVehicleSeat(currentVehicle, VehicleSeat.Copilot) == ped
                        );
                    }
                    return false;
                }
            );
        }
    }

    public setDisbledTime(radarId: number, time: number) {
        if (!this.disabledEndTimes[radarId] || this.disabledEndTimes[radarId] < time) {
            this.disabledEndTimes[radarId] = time;
        }
    }
}
