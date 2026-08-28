import { OnEvent } from '@public/core/decorators/event';
import { Inject } from '@public/core/decorators/injectable';
import { Provider } from '@public/core/decorators/provider';
import { Rpc } from '@public/core/decorators/rpc';
import { PlayerService } from '@public/server/player/player.service';
import { ClientEvent, ServerEvent } from '@public/shared/event';
import { JobType } from '@public/shared/job';
import { PlayerLicenceLabels, PlayerLicenceType } from '@public/shared/player';
import { getDistance, Vector3 } from '@public/shared/polyzone/vector';
import { RpcServerEvent } from '@public/shared/rpc';

const jobAllowed = [JobType.FBI, JobType.LSMC, JobType.LSPD, JobType.BCSO, JobType.SASP, JobType.LSCS];

@Provider()
export class PoliceLicenceProvider {
    @Inject(PlayerService)
    private playerService: PlayerService;

    @OnEvent(ServerEvent.POLICE_REMOVE_POINT)
    public onRemovePoint(source: number, targetId: number, licenceType: PlayerLicenceType, nbPoints: number) {
        const player = this.playerService.getPlayer(source);
        const target = this.playerService.getPlayer(targetId);

        if (player && target && player != target) {
            if (
                getDistance(
                    GetEntityCoords(GetPlayerPed(player.source)) as Vector3,
                    GetEntityCoords(GetPlayerPed(target.source)) as Vector3
                ) > 2.5
            ) {
                TriggerClientEvent(
                    ClientEvent.NOTIFICATION_DRAW,
                    player.source,
                    `Bạn đang ở quá xa người này để thực hiện trừ điểm bằng lái`
                );
                return;
            }
            if (jobAllowed.includes(player.job.id)) {
                const licences = target.metadata.licences;
                const newValue = Math.max(0, licences[licenceType] - nbPoints);
                licences[licenceType] = newValue;
                const label = PlayerLicenceLabels[licenceType];

                TriggerClientEvent(
                    ClientEvent.NOTIFICATION_DRAW,
                    player.source,
                    `Bạn đã trừ ~b~${nbPoints} điểm~s~ trên bằng ~b~${label}~s~`
                );
                TriggerClientEvent(
                    ClientEvent.NOTIFICATION_DRAW,
                    target.source,
                    `~b~${nbPoints} điểm~s~ đã bị trừ trên bằng ~b~${label}~s~ của bạn!`
                );
                this.playerService.setPlayerMetadata(target.source, 'licences', licences);
            }
        }
    }

    @OnEvent(ServerEvent.POLICE_REMOVE_LICENCE)
    public onRemoveLicence(source: number, targetId: number, licenceType: PlayerLicenceType) {
        const player = this.playerService.getPlayer(source);
        const target = this.playerService.getPlayer(targetId);

        if (player && target && player != target) {
            if (jobAllowed.includes(player.job.id)) {
                const licences = target.metadata.licences;
                if (!licences[licenceType]) {
                    TriggerClientEvent(
                        ClientEvent.NOTIFICATION_DRAW,
                        player.source,
                        `Bằng ~b~${PlayerLicenceLabels[licenceType]}~s~ hiện đã không còn hiệu lực`
                    );
                    return;
                }
                licences[licenceType] = 0;

                TriggerClientEvent(
                    ClientEvent.NOTIFICATION_DRAW,
                    player.source,
                    `Bạn đã tước bằng ~b~${PlayerLicenceLabels[licenceType]}~s~`
                );
                TriggerClientEvent(
                    ClientEvent.NOTIFICATION_DRAW,
                    target.source,
                    `Bằng ~b~${PlayerLicenceLabels[licenceType]}~s~ của bạn đã bị tước!`
                );
                this.playerService.setPlayerMetadata(target.source, 'licences', licences);
            }
        }
    }

    @OnEvent(ServerEvent.POLICE_GIVE_LICENCE)
    public onGiveLicence(source: number, targetId: number, licenceType: PlayerLicenceType) {
        const player = this.playerService.getPlayer(source);
        const target = this.playerService.getPlayer(targetId);

        if (player && target && player != target) {
            if (jobAllowed.includes(player.job.id)) {
                const licences = target.metadata.licences;
                if (licences[licenceType]) {
                    TriggerClientEvent(
                        ClientEvent.NOTIFICATION_DRAW,
                        player.source,
                        `Bằng ~b~${PlayerLicenceLabels[licenceType]}~s~ đã có hiệu lực từ trước`
                    );
                    return;
                }
                licences[licenceType] = 1;

                TriggerClientEvent(
                    ClientEvent.NOTIFICATION_DRAW,
                    player.source,
                    `Bạn đã cấp bằng ~b~${PlayerLicenceLabels[licenceType]}~s~`
                );
                TriggerClientEvent(
                    ClientEvent.NOTIFICATION_DRAW,
                    target.source,
                    `Bạn đã nhận được bằng ~b~${PlayerLicenceLabels[licenceType]}~s~`
                );
                this.playerService.setPlayerMetadata(target.source, 'licences', licences);
            }
        }
    }

    @Rpc(RpcServerEvent.POLICE_LICENSE_HAS_RECUER)
    public hasRescuerLicence(source: number, targetId: number) {
        const target = this.playerService.getPlayer(targetId);

        if (!target) {
            return false;
        }

        return target.metadata.licences[PlayerLicenceType.Rescuer];
    }
}
