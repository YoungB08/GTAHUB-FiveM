import { AnimationService } from '@public/client/animation/animation.service';
import { Notifier } from '@public/client/notifier';
import { OnEvent, OnNuiEvent } from '@public/core/decorators/event';
import { Inject } from '@public/core/decorators/injectable';
import { Provider } from '@public/core/decorators/provider';
import { emitRpc } from '@public/core/rpc';
import { ClientEvent, NuiEvent, ServerEvent } from '@public/shared/event';
import { RpcServerEvent } from '@public/shared/rpc';

import { PositiveNumberValidator } from '../../../shared/nui/input';
import { Ok } from '../../../shared/result';
import { InputService } from '../../nui/input.service';
import { PoliceAnimationProvider } from './police.animation.provider';

@Provider()
export class PoliceJobMenuProvider {
    @Inject(AnimationService)
    private animationService: AnimationService;

    @Inject(InputService)
    private inputService: InputService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(PoliceAnimationProvider)
    private policeAnimationProvider: PoliceAnimationProvider;

    @OnEvent(ClientEvent.POLICE_PLACE_SPEED_ZONE)
    public async onNuiPlaceSpeedZone() {
        const distances = Math.floor(
            await this.inputService.askInput({ title: 'Khoảng cách (từ 1 đến 5 mét)' }, PositiveNumberValidator)
        );

        if (!distances || distances < 1 || distances > 5) {
            this.notifier.notify(`Khoảng cách phải từ 1 đến 5 mét.`, 'error');
            return;
        }

        const speed = await this.inputService.askInput(
            {
                title: 'Tốc độ giới hạn (km/h)',
            },
            PositiveNumberValidator
        );

        if (speed !== 0 && !speed) {
            this.notifier.notify(`Tốc độ nhập vào không hợp lệ.`, 'error');
            return;
        }
        TriggerServerEvent(ServerEvent.POLICE_PLACE_SPEEDZONE, distances, speed);

        return Ok(true);
    }

    @OnNuiEvent(NuiEvent.RedCall)
    public redCall(injector = false): Promise<void> {
        const ped = PlayerPedId();
        const coords = GetEntityCoords(ped);
        const [street, street2] = GetStreetNameAtCoord(coords[0], coords[1], coords[2]);

        let name = GetStreetNameFromHashKey(street);
        if (street2) {
            name += ' và ' + GetStreetNameFromHashKey(street2);
        }

        this.policeAnimationProvider.redCall(
            '555-POLICE',
            `BÁO ĐỘNG ĐỎ !!! Một sĩ quan đang cần hỗ trợ khẩn cấp tại ${name}`,
            `BÁO ĐỘNG ĐỎ !!! Một sĩ quan đang cần hỗ trợ khẩn cấp tại <span {class}>${name}</span>`,
            injector
        );

        return;
    }

    @OnNuiEvent(NuiEvent.PoliceShowBadge)
    public async showBadge(): Promise<void> {
        const anim = this.animationService.playAnimation({
            base: {
                dictionary: 'paper_1_rcm_alt1-9',
                name: 'player_one_dual-9',
                duration: 3000.0,
                blendInSpeed: 8,
                blendOutSpeed: -8,
                playbackRate: 0,
                lockX: false,
                lockY: false,
                lockZ: false,
                options: {
                    enablePlayerControl: true,
                    onlyUpperBody: true,
                    repeat: true,
                },
            },
            props: [
                {
                    bone: 28422,
                    model: 'prop_fib_badge',
                    position: [0.065, 0.029, -0.035],
                    rotation: [80.0, -1.9, 75.0],
                },
            ],
        });
        // CreateThread(function()
        const vehicle = this.getVehicleInDirection();
        if (vehicle) {
            let pedFound = 0;
            for (let i = -1; i <= GetVehicleModelNumberOfSeats(vehicle); i++) {
                const vehiclePed = GetPedInVehicleSeat(vehicle, i);
                if (vehiclePed != 0 && !IsPedAPlayer(vehiclePed)) {
                    TaskLeaveVehicle(vehiclePed, vehicle, 256);
                    SetBlockingOfNonTemporaryEvents(vehiclePed, true);
                    TaskWanderStandard(vehiclePed, 10.0, 10.0);

                    pedFound++;
                }
            }

            if (pedFound >= 1) {
                const vehicleNetworkId = NetworkGetNetworkIdFromEntity(vehicle);

                TriggerServerEvent(ServerEvent.VEHICLE_TAKE_OWNER, vehicleNetworkId);
                this.notifier.notify('Bạn đã trưng dụng phương tiện này cho công vụ');
            }
        }
        await anim;
    }

    private getVehicleInDirection(): number | null {
        const ped = PlayerPedId();
        const coords = GetEntityCoords(ped);
        const inDirection = GetOffsetFromEntityInWorldCoords(ped, 0.0, 5.0, 0.0);
        const rayHandle = StartExpensiveSynchronousShapeTestLosProbe(
            coords[0],
            coords[1],
            coords[2],
            inDirection[0],
            inDirection[1],
            inDirection[2],
            10,
            ped,
            0
        );
        const [, hit, , , entityHit] = GetShapeTestResult(rayHandle);

        if (hit == 1 && GetEntityType(entityHit) == 2) {
            return entityHit;
        } else {
            return null;
        }
    }

    @OnNuiEvent(NuiEvent.PoliceGetWantedPlayers)
    public async getWantedPlayers(): Promise<{ id: number; message: string }[]> {
        return await emitRpc(RpcServerEvent.POLICE_GET_WANTED_PLAYERS);
    }

    @OnNuiEvent(NuiEvent.PoliceDeleteWantedPlayer)
    public async deleteWantedPlayer({ id, message }: { id: number; message: string }): Promise<void> {
        const deletion: boolean = await emitRpc(RpcServerEvent.POLICE_DELETE_WANTED_PLAYER, id);
        if (deletion) {
            this.notifier.notify(`Bạn đã gỡ ${message} khỏi danh sách truy nã`);
        }
    }
}
