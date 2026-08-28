import { Once, OnEvent } from '@public/core/decorators/event';
import { Inject } from '@public/core/decorators/injectable';
import { Provider } from '@public/core/decorators/provider';
import { Rpc } from '@public/core/decorators/rpc';
import { ItemService } from '@public/server/item/item.service';
import { MeteorSubMenuState } from '@public/shared/admin/admin';
import { Music } from '@public/shared/audio';
import { ClientEvent, ServerEvent } from '@public/shared/event';
import { Feature } from '@public/shared/features';
import { RpcServerEvent } from '@public/shared/rpc';

import { FeatureProvider } from '../feature/feature.provider';
import { Notifier } from '../notifier';
import { PermissionService } from '../permission.service';
import { PlayerAppearanceService } from '../player/player.appearance.service';
import { PlayerService } from '../player/player.service';
import { ProgressService } from '../player/progress.service';
import { RebootProvider } from '../reboot/reboot.provider';
import { NpcProvider } from '../utils/npc.provider';
import { EarthquakeProvider } from './earthquake.provider';
import { FireProvider } from './fire.provider';
import { OceanProvider } from './ocean.provider';
import { TornadoProvider } from './tornado.provider';

@Provider()
export class MeteorProvider {
    @Inject(PermissionService)
    private permissionService: PermissionService;

    @Inject(RebootProvider)
    public rebootProvider: RebootProvider;

    @Inject(EarthquakeProvider)
    public earthquakeProvider: EarthquakeProvider;

    @Inject(OceanProvider)
    public oceanProvider: OceanProvider;

    @Inject(Notifier)
    public notifier: Notifier;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(ItemService)
    private itemService: ItemService;

    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(PlayerAppearanceService)
    private playerAppearanceService: PlayerAppearanceService;

    @Inject(NpcProvider)
    private npcProvider: NpcProvider;

    @Inject(FeatureProvider)
    private featureProvider: FeatureProvider;

    @Inject(TornadoProvider)
    private tornadoProvider: TornadoProvider;

    @Inject(FireProvider)
    private fireProvider: FireProvider;

    private musics: Record<Music, number> = {
        [Music.Siren]: 0,
        [Music.Chronos]: 0,
        [Music.Ambiance]: 0,
        [Music.SandStorm]: 0,
        [Music.Impact]: 0,
        [Music.DiesIrae]: 0,
        [Music.Cinis]: 0,
        [Music.Obsession]: 0,
    };

    @Once()
    public onStart() {
        this.itemService.setItemUseCallback('full_scarf', this.useFullScarf.bind(this));
    }

    private async useFullScarf(source: number) {
        const progress = await this.progressService.progress(
            source,
            'switch_clothes',
            "Changement d'habits...",
            1000,
            {
                name: 'put_on_mask',
                dictionary: 'mp_masks@on_foot',
                options: {
                    cancellable: false,
                    enablePlayerControl: false,
                },
            },
            {
                disableCombat: true,
                disableMovement: true,
                canCancel: false,
            }
        );

        if (!progress.completed) {
            return;
        }

        const targetPlayer = this.playerService.getPlayer(source);
        targetPlayer.cloth_config.Config.HideMask = false;
        this.playerAppearanceService.setClothConfig(source, targetPlayer.cloth_config, true);

        TriggerClientEvent(ClientEvent.FULL_SCARF_TOGGLE, source);
    }

    @Rpc(RpcServerEvent.ADMIN_METEOR_STATE)
    public getMeteorSate(): MeteorSubMenuState {
        return {
            disableNpc: this.npcProvider.isDisabled(),
            musics: this.musics,
            earthQuake: this.earthquakeProvider.isEarthQuake(),
            highWave: this.oceanProvider.getHighWave(),
            tornado: this.tornadoProvider.isRunning(),
            firePropagation: this.fireProvider.propagationIsEnabled(),
        };
    }

    @OnEvent(ServerEvent.ADMIN_METEOR_ACTIVATE)
    public activate(source: number) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        TriggerClientEvent(ClientEvent.METEOR_START, -1);
        this.notifier.notify(source, 'Đang phóng thiên thạch...');
        this.musics[Music.Siren] = 0;
        this.musics[Music.Ambiance] = 0;
    }

    @OnEvent(ServerEvent.ADMIN_METEOR_MUSIC)
    public activateMusic(source: number, music: Music, value: number) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        this.musics[music] = value;
        TriggerClientEvent(ClientEvent.METEOR_MUSIC, -1, this.musics);
    }

    @OnEvent(ServerEvent.ADMIN_METEOR_KICK_PLAYERS)
    public kickPlayers() {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        let message = "Tác động của thiên thạch đã đánh gục bạn, bạn sẽ có thể tỉnh lại sau vài phút...";

        if (this.featureProvider.isFeatureEnabled(Feature.WhatIfFirstEpisode)) {
            message =
                "Sau tác động của quả bom hạt nhân, San Andreas và cư dân của nó đã bốc hơi, do đó, phiên bản đầu tiên của WHAT IF! Cảm ơn tất cả người chơi vì sự tham gia của họ. ❤️";
        }

        if (this.featureProvider.isFeatureEnabled(Feature.WhatIfSecondEpisode)) {
            message =
                '📜 Journal de Bord — Dernières Pages\n' +
                '\n' +
                '"Ils nous avaient promis le salut. Ils nous ont offert la mort."\n' +
                '\n' +
                'Đom Đóm đã phản bội chúng ta. Họ chưa bao giờ có ý định sơ tán chúng tôi. Khi đội tiên phong của họ đặt chân lên San Andreas, chúng tôi nghĩ rằng cuối cùng mình cũng sẽ nhìn thấy ánh sáng nơi tận cùng địa ngục. Nhưng chính những viên đạn đã bay tới chứ không phải những lời hứa hẹn. Những khẩu súng máy quét qua đám đông, hạ gục những người sống sót cũng như các gia tộc. Một cảnh tượng kinh hoàng. Máu trên bê tông, tiếng la hét bị bóp nghẹt dưới tiếng va chạm của vũ khí. Một số bỏ trốn, trốn trong đống đổ nát, nhưng hầu hết... không bao giờ có cơ hội.' +
                '\n' +
                'Và thời gian nghỉ ngơi chỉ kéo dài một hơi thở. Một lúc sau, bầu trời bùng cháy. Máy bay bắn phá hòn đảo không ngừng nghỉ, biến các thị trấn và rừng rậm thành tro bụi. Các trại không còn tồn tại nữa. Những con đường không còn dẫn đến đâu nữa. Khắp nơi, xác chết – còn sống hay đã chết, bị nhiễm bệnh hay không, tất cả đều nằm lẫn trong cùng một ngôi mộ tập thể. San Andreas đã trở thành một nghĩa trang lộ thiên, một vết thương hở hang mà ngay cả lũ quạ cũng không dám đậu xuống.' +
                '\n' +
                'Lửa đã từ trên trời rơi xuống trong nhiều ngày. Cánh tay tôi bị gãy, mỗi cử động đều khiến tôi đau đớn không thể nguôi ngoai được nữa. Tôi không còn thuốc, gần như không còn thức ăn. Tất cả các nơi trú ẩn đã bị san bằng. Mỗi đêm tôi đào dưới đống đổ nát, cầu nguyện rằng đợt bom tiếp theo sẽ quên tôi. Nhưng tôi biết cuối cùng cô ấy sẽ tìm thấy tôi.' +
                '\n' +
                'Tôi không nghĩ còn nhiều thời gian nữa. Có thể là vài giờ, có thể là một ngày khác. Nhật ký này kết thúc ở đây, với những lời cuối cùng của tôi, trước khi sự im lặng nuốt chửng tôi.' +
                '\n' +
                'Adieu, San Andreas.\n' +
                'Tôi sẽ yêu em... ngay cả khi em xấu xí, thậm chí cả sự tàn ác của em.';
        }

        this.rebootProvider.kickAll(message);
    }

    @OnEvent(ServerEvent.ADMIN_METEOR_DISABLE_NPC)
    public disableNPC(source: number, value: boolean) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        this.npcProvider.disableNPC(value);
    }
}
