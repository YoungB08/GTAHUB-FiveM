import { getDistance, Vector3 } from '@public/shared/polyzone/vector';

import { OnEvent } from '../../core/decorators/event';
import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { ClientEvent, ServerEvent } from '../../shared/event';
import { Notifier } from '../notifier';
import { PlayerService } from '../player/player.service';
import { VehicleStateService } from './vehicle.state.service';

@Provider()
export class VehicleKeysProvider {
    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(VehicleStateService)
    private vehicleStateService: VehicleStateService;

    @Inject(Notifier)
    private notifier: Notifier;

    @OnEvent(ServerEvent.VEHICLE_OPEN_KEYS)
    public onVehicleOpenKeys(source: number) {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        const keys = this.vehicleStateService.getVehicleKeys(player.citizenid);

        TriggerClientEvent(ClientEvent.INVENTORY_OPEN_KEYS, source, keys);
    }

    @OnEvent(ServerEvent.VEHICLE_GIVE_KEY)
    private onVehicleGiveKey(source: number, plate: string, target: number) {
        const sourcePlayer = this.playerService.getPlayer(source);
        const targetPlayer = this.playerService.getPlayer(target);

        if (!sourcePlayer || !targetPlayer) {
            return;
        }

        const sourcePosition = GetEntityCoords(GetPlayerPed(source)) as Vector3;
        const targetPosition = GetEntityCoords(GetPlayerPed(target)) as Vector3;

        if (getDistance(sourcePosition, targetPosition) > 4.0) {
            this.notifier.notify(source, 'Bạn đang ở quá xa người nhận, hãy lại gần hơn.', 'error');
            return;
        }

        if (!this.vehicleStateService.hasVehicleKey(plate, sourcePlayer.citizenid)) {
            this.notifier.notify(source, 'Bạn không có chìa khóa của phương tiện này.', 'error');
            return;
        }

        this.vehicleStateService.addVehicleKey(plate, targetPlayer.citizenid);

        TriggerClientEvent(ClientEvent.ANIMATION_GIVE, source);
        TriggerClientEvent(ClientEvent.ANIMATION_GIVE, target);

        this.notifier.notify(source, `Bạn đã trao chìa khóa xe biển số ${plate}.`, 'success');
        this.notifier.notify(target, `Bạn đã nhận được chìa khóa xe biển số ${plate}.`, 'success');
    }
}
