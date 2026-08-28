import { Provider } from '@public/core/decorators/provider';
import { wait } from '@public/core/utils';
import { VampireGameStateProvider } from '@public/server/story/vampire.game.state.provider';
import { WorldObject } from '@public/shared/object';
import { PlayerData } from '@public/shared/player';
import { fromVector3Object, fromVector4Object, Vector3, Vector4 } from '@public/shared/polyzone/vector';
import PCancelable from 'p-cancelable';

import { Command } from '../../core/decorators/command';
import { On, Once, OnceStep, OnEvent } from '../../core/decorators/event';
import { Inject } from '../../core/decorators/injectable';
import { Rpc } from '../../core/decorators/rpc';
import { Tick, TickInterval } from '../../core/decorators/tick';
import { Logger } from '../../core/logger';
import { AdminPlayer, HalloweenSubMenuState } from '../../shared/admin/admin';
import { ClientEvent } from '../../shared/event/client';
import { ServerEvent } from '../../shared/event/server';
import { Feature } from '../../shared/features';
import {
    locationIsTooClose,
    MortalRespawnPoints,
    VampireGameClientState,
    VampireGameCollection,
    VampireGameEnemyRoles,
    VampireGameLabel,
    VampireGameObjectiveCollectionPart1,
    VampireGameObjectivePart2,
    VampireGameObjectiveProps,
    VampireGameObjectiveTypePart2,
    VampireGameRole,
    VampireRespawnPoints,
} from '../../shared/halloween';
import { BIN_MODELS } from '../../shared/job/garbage';
import { ProgressAnimation } from '../../shared/progress';
import { getRandomKeyWeighted } from '../../shared/random';
import { RpcServerEvent } from '../../shared/rpc';
import { FeatureProvider } from '../feature/feature.provider';
import { LSMCDeathProvider } from '../job/lsmc/lsmc.death.provider';
import { LockService } from '../lock.service';
import { Monitor } from '../monitor/monitor';
import { Notifier } from '../notifier';
import { ObjectProvider } from '../object/object.provider';
import { PermissionService } from '../permission.service';
import { PlayerPositionProvider } from '../player/player.position.provider';
import { PlayerService } from '../player/player.service';
import { PlayerStateService } from '../player/player.state.service';
import { ProgressService } from '../player/progress.service';
import { ConfigurationRepository } from '../repository/configuration.repository';
import { ServerStateService } from '../server.state.service';
import { Store } from '../store/store';
import { NpcProvider } from '../utils/npc.provider';
import { XmasProvider } from './xmas.provider';

const OBJECTIVE_Y_LIMITATION = [-3600, 1200];

type StopReason = 'cancel' | 'mortal_victory' | 'vampire_victory';

@Provider()
export class VampireGameProvider {
    @Inject(PermissionService)
    private readonly permissionService: PermissionService;

    @Inject(ServerStateService)
    private readonly serverStateService: ServerStateService;

    @Inject(ProgressService)
    private readonly progressService: ProgressService;

    @Inject(PlayerStateService)
    private readonly playerStateService: PlayerStateService;

    @Inject(FeatureProvider)
    private readonly featureProvider: FeatureProvider;

    @Inject(PlayerService)
    private readonly playerService: PlayerService;

    @Inject('Store')
    private readonly store: Store;

    @Inject(Notifier)
    private readonly notifier: Notifier;

    @Inject(Logger)
    private readonly logger: Logger;

    @Inject(NpcProvider)
    private readonly npcProvider: NpcProvider;

    @Inject(PlayerPositionProvider)
    private readonly playerPositionProvider: PlayerPositionProvider;

    @Inject(LSMCDeathProvider)
    private readonly lsmcDeathProvider: LSMCDeathProvider;

    @Inject(VampireGameStateProvider)
    private readonly gameState: VampireGameStateProvider;

    @Inject(LockService)
    private readonly lockService: LockService;

    @Inject(ConfigurationRepository)
    private readonly configurationRepository: ConfigurationRepository;

    @Inject(XmasProvider)
    private readonly xmasProvider: XmasProvider;

    @Inject(ObjectProvider)
    private readonly objectProvider: ObjectProvider;

    @Inject(Monitor)
    private readonly monitor: Monitor;

    private gameDuration: number; // minutes
    private autoRespawnDuration = 20; // seconds
    private autoMortalRespawnDuration = 30; // seconds

    private roleMaxNumber: Record<VampireGameRole, number>;
    private mortalObjectivePart1: Record<Exclude<VampireGameCollection, 'player'>, number>;
    private mortalObjectivePart2: Record<VampireGameObjectiveTypePart2, number>;
    private mortalObjectivePart3Duration: number; // minutes

    private mortalTpList = new Map<string, number>();
    private blipEnabled = true;

    @Once(OnceStep.DatabaseConnected)
    async databaseReady() {
        const vampireGameConfiguration = await this.configurationRepository.getValue('VampireGame');

        this.gameDuration = vampireGameConfiguration.gameDuration;

        this.roleMaxNumber = vampireGameConfiguration.roleMaxNumber;
        this.gameState.excludedPlayers = new Set(vampireGameConfiguration.excludedPlayers);

        this.mortalObjectivePart1 = vampireGameConfiguration.mortalObjectivePart1;
        this.mortalObjectivePart2 = vampireGameConfiguration.mortalObjectivePart2;
        this.mortalObjectivePart3Duration = vampireGameConfiguration.mortalObjectivePart3Duration;
    }

    @Once()
    onStart() {
        VampireRespawnPoints.forEach(location => {
            this.playerPositionProvider.registerZone(`halloween_vampire_respawn_${location.id}`, [
                ...location.coords,
                0,
            ]);
        });

        Object.entries(MortalRespawnPoints).forEach(([id, location]) => {
            this.playerPositionProvider.registerZone(`halloween_mortal_respawn_${id}`, location);
        });
    }

    @OnEvent(ServerEvent.HALLOWEEN_VAMPIRE_NEW_PLAYER)
    async onNewPlayer(source: number) {
        if (!this.featureProvider.isFeatureEnabled(Feature.Halloween)) return;
        if (!this.gameState.started) return;

        const player = this.serverStateService.getPlayer(source);
        if (!player) {
            return;
        }

        await this.newPlayer(player);
        TriggerClientEvent(ClientEvent.HALLOWEEN_VAMPIRE_START_GAME, source);
    }

    @On('QBCore:Server:PlayerUnload', false)
    async onPlayerUnload(source: number) {
        if (!this.featureProvider.isFeatureEnabled(Feature.Halloween)) return;
        if (!this.gameState.started) return;

        const player = this.serverStateService.getPlayer(source);
        if (!player) {
            return;
        }

        const role = this.gameState.playerRoles.get(player.citizenid);
        if (!role) return;

        this.gameState.playerRoles.delete(player.citizenid);

        await this.computeCurrentRoleGauge();
    }

    @OnEvent(ServerEvent.ADMIN_HALLOWEEN_START_GAME)
    public async launchGameEvent(source: number) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        if (this.gameState.started) {
            this.notifier.error(source, 'Trò chơi đã đang diễn ra');
            return;
        }

        this.createObjectivePart1();

        Object.keys(VampireGameObjectivePart2).forEach(objective => {
            this.gameState.objectiveGauges.part2.set(
                {
                    objective,
                    total: this.mortalObjectivePart2[objective],
                },
                0
            );
        });

        this.notifier.notify(-1, 'Một điều gì đó đen tối đang chuẩn bị xảy ra... Hãy cẩn thận đề phòng!', 'info');
        await wait(10_000);

        for (const player of this.serverStateService.getPlayers()) {
            await this.newPlayer(player);
        }

        await wait(15_000);

        this.npcProvider.disableNPC(true);

        this.store.dispatch.global.update({
            halloween: 'full',
            blackout: true,
            blackoutLevel: 3,
            blackoutOverride: true,
        });
        TriggerClientEvent('InteractSound_CL:PlayOnOne', -1, 'halloween/laugh_evil', 0.8);

        await wait(2000);

        this.gameState.timer = setTimeout(
            async () => {
                await this.stopGame('vampire_victory');
            },
            this.gameDuration * 60 * 1000
        );

        this.gameState.started = true;
        TriggerLatentClientEvent(ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_STATE, -1, 1024, {
            started: this.gameState.started,
        });

        this.notifier.notify(source, 'Trò chơi đã được bắt đầu', 'info');
    }

    @OnEvent(ServerEvent.ADMIN_HALLOWEEN_STOP_GAME)
    public async stopGameEvent(source: number) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        if (!this.gameState.started) {
            this.notifier.error(source, "Trò chơi chưa bắt đầu");
            return;
        }

        await this.stopGame('cancel');
    }

    @OnEvent(ServerEvent.HALLOWEEN_VAMPIRE_GAME_TAKE_OBJECTIVE_PART1)
    public async takeObjectivePart1(source: number, collection: VampireGameCollection, objective: Vector3) {
        if (!this.gameState.started) return;

        const player = this.serverStateService.getPlayer(source);
        if (!player) {
            return;
        }

        if (VampireGameEnemyRoles.includes(this.gameState.playerRoles.get(player.citizenid))) {
            this.notifier.error(source, "Bạn không có quyền thực hiện hành động này");
            return;
        }

        const objectiveIndex = this.gameState.mortalObjectivePart1
            .get(collection)
            .findIndex(obj => obj[0] === objective[0] && obj[1] === objective[1] && obj[2] === objective[2]);

        if (objectiveIndex === -1) {
            this.notifier.error(source, 'Mục tiêu không hợp lệ');
            return;
        }

        let [name, label, animation]: [string, string, ProgressAnimation] = [
            'halloween_repair',
            'Đang sửa chữa ...',
            {
                task: 'world_human_welding',
            },
        ];

        if (collection === 'prop_fire_hydrant') {
            [name, label, animation] = [
                'halloween_get',
                'Đang thu thập ...',
                {
                    name: 'base',
                    dictionary: 'amb@prop_human_bum_bin@base',
                    flags: 1,
                },
            ];
        } else if (collection === 'prop_gas_pump') {
            [name, label, animation] = [
                'halloween_get',
                'Đang thu thập ...',
                {
                    dictionary: 'anim@heists@ornate_bank@thermal_charge',
                    name: 'thermal_charge',
                },
            ];
        }

        const { completed } = await this.progressService.progress(source, name, label, 5000, animation, {});
        if (!completed) {
            return;
        }

        this.gameState.mortalObjectivePart1.set(
            collection,
            this.gameState.mortalObjectivePart1.get(collection).filter((_, idx) => idx !== objectiveIndex)
        );
        this.gameState.objectiveGauges.part1.set(
            {
                objective: collection,
                total: this.mortalObjectivePart1[collection],
            },
            this.mortalObjectivePart1[collection] - this.gameState.mortalObjectivePart1.get(collection).length
        );

        this.monitor.traceEvent('vampire_game_mortal_objective', {
            player_source: source,
            objective_part: 1,
            objective: collection,
            position: objective,
        });

        this.notifier.notify(
            source,
            `Mục tiêu ~g~${VampireGameLabel(collection)}~s~ vừa được hoàn thành! Hãy kiểm tra bản đồ để đến mục tiêu khác.`,
            'success'
        );

        this.sendObjectivePart1();

        for (const [, positions] of this.gameState.mortalObjectivePart1) {
            if (positions.length > 0) return;
        }

        this.callFunctionOnNonEnemyPlayers(player => {
            this.notifier.notify(
                player.source,
                'Phe Người Phàm đã ~g~vượt qua~s~ giai đoạn đầu tiên! Hành trình tiếp tục với các ~y~mục tiêu mới cần hoàn thành~s~.',
                'info',
                45_000
            );
        });

        this.sendObjectivePart2();
    }

    @OnEvent(ServerEvent.HALLOWEEN_VAMPIRE_GAME_TAKE_OBJECTIVE_PART2)
    public async takeObjectivePart2(source: number, objective: VampireGameObjectiveTypePart2) {
        if (!this.gameState.started) return;

        const player = this.serverStateService.getPlayer(source);
        if (!player) {
            return;
        }

        if (VampireGameEnemyRoles.includes(this.gameState.playerRoles.get(player.citizenid))) {
            this.notifier.error(source, "Bạn không có quyền thực hiện hành động này");
            return;
        }

        const objectiveGaugeLabel = {
            objective,
            total: this.mortalObjectivePart2[objective],
        };

        this.gameState.mortalObjectivePart2[objective].players.add(player.citizenid);
        this.gameState.objectiveGauges.part2.labels(objectiveGaugeLabel).inc();

        let animation = {};
        if (objective === 'vampire') {
            animation = {
                dictionary: 'missheistdockssetup1clipboard@base',
                name: 'base',
            };
        } else if (objective === 'battery') {
            animation = {
                dictionary: 'mp_fm_intro_cut',
                name: 'fixing_a_ped',
            };
        } else if (objective === 'dam') {
            animation = {
                task: 'world_human_welding',
            };
        } else if (objective === 'weapon') {
            animation = {
                task: 'world_human_hammering',
            };
        }

        const { completed } = await this.progressService.progress(
            source,
            'halloween_part2',
            '',
            10_000,
            {
                ...animation,
                options: {
                    repeat: true,
                },
            },
            {
                disableMovement: true,
                disableCarMovement: true,
                disableMouse: false,
                disableCombat: true,
            }
        );
        if (!completed) {
            this.gameState.mortalObjectivePart2[objective].players.delete(player.citizenid);
            this.gameState.objectiveGauges.part2.labels(objectiveGaugeLabel).dec();
            return;
        }

        await this.lockService.lock('vampireValidateObjectivePart2', async () => {
            if (this.gameState.mortalObjectivePart2[objective].players.size >= this.mortalObjectivePart2[objective]) {
                this.gameState.mortalObjectivePart2[objective].finished = true;

                this.monitor.traceEvent('vampire_game_mortal_objective', {
                    player_source: source,
                    objective_part: 2,
                    objective: objective,
                });

                this.callFunctionOnNonEnemyPlayers(player => {
                    this.notifier.notify(
                        player.source,
                        `Mục tiêu ~g~${VampireGameLabel(objective)}~s~ vừa được hoàn thành! Hãy kiểm tra bản đồ để đến mục tiêu khác.`,
                        'success'
                    );
                });
            }
            if (!this.gameState.mortalObjectivePart2[objective].finished) {
                const currentPlayers = this.gameState.mortalObjectivePart2[objective].players.size;
                const requiredPlayers = this.mortalObjectivePart2[objective];

                this.notifier.notify(
                    player.source,
                    `Mục tiêu ~b~${VampireGameLabel(objective)}~s~ chưa thể hoàn thành! Hiện có ~o~${currentPlayers}~s~/~b~${requiredPlayers} người chơi~s~ đang kích hoạt.`,
                    'error'
                );
            }

            this.gameState.mortalObjectivePart2[objective].players.delete(player.citizenid);
            this.gameState.objectiveGauges.part2.labels(objectiveGaugeLabel).dec();

            this.sendObjectivePart2();

            for (const { finished } of Object.values(this.gameState.mortalObjectivePart2)) {
                if (!finished) return;
            }

            this.triggerMortalObjectivePart3();

            this.callFunctionOnNonEnemyPlayers(player => {
                this.notifier.notify(
                    player.source,
                    `Tất cả Người Phàm đã nhận được vũ khí tự vệ, đạn bạc có thể tiêu diệt Ma Cà Rồng! Cuộc săn lùng đã đảo chiều, hãy sống sót trong ${this.mortalObjectivePart3Duration} phút để giành chiến thắng trong trận chiến này.`,
                    'info',
                    45_000
                );
            });

            this.callFunctionOnEnemyPlayers(player => {
                this.notifier.notify(
                    player.source,
                    `Phe Người Phàm đã nhận được vũ khí tự vệ, đạn bạc có thể giết chết bạn! Đừng để trở thành con mồi của những thợ săn này! Bạn chỉ còn ${this.mortalObjectivePart3Duration} phút để săn lùng họ và khiến họ phải trả giá.`,
                    'info',
                    45_000
                );
            });
        });
    }

    @OnEvent(ServerEvent.HALLOWEEN_VAMPIRE_GAME_PLAYER_KNOCKED_OUT)
    public async playerKnockedOut(source: number) {
        if (!this.gameState.started) return;
        if (this.playerStateService.getClientState(source).isKnockedOut) return;

        const player = this.serverStateService.getPlayer(source);
        if (!player) {
            return;
        }

        this.playerStateService.setClientState(source, {
            isKnockedOut: true,
        });

        const playerRole = this.gameState.playerRoles.get(player.citizenid);

        if (VampireGameEnemyRoles.includes(playerRole)) {
            const autoRespawn = new PCancelable<void>(async (resolve, reject, onCancel) => {
                let isCanceled = false;

                onCancel(() => {
                    onCancel.shouldReject = false;
                    isCanceled = true;
                });

                await wait(this.autoRespawnDuration * 1000);
                if (isCanceled) return;

                this.switchPlayerRole(source, playerRole);
                resolve();
            });

            this.gameState.autoRespawn.set(player.citizenid, autoRespawn);
        } else {
            const autoRespawn = new PCancelable<void>(async (resolve, reject, onCancel) => {
                let isCanceled = false;

                onCancel(() => {
                    onCancel.shouldReject = false;
                    isCanceled = true;
                });

                await wait(this.autoMortalRespawnDuration * 1000);
                if (isCanceled) return;

                this.gameState.ghoulOriginalRoles.set(player.citizenid, playerRole);
                this.gameState.playerRoles.set(player.citizenid, VampireGameRole.Ghoul);

                await this.computeCurrentRoleGauge();

                this.switchPlayerRole(source, VampireGameRole.Ghoul);
                resolve();
            });

            this.gameState.autoRespawn.set(player.citizenid, autoRespawn);
        }
    }

    @OnEvent(ServerEvent.HALLOWEEN_VAMPIRE_GAME_CANCEL_VAMPIRE_KNOCKOUT)
    public async cancelVampireKnockout(source: number, target?: number, admin?: boolean) {
        if (!this.gameState.started) return;

        if (!target) {
            target = source;
        }

        if (!this.playerStateService.getClientState(target).isKnockedOut) return;

        const player = this.serverStateService.getPlayer(target);
        if (!player) {
            return;
        }

        this.gameState.autoRespawn.get(player.citizenid)?.cancel();
        this.gameState.autoRespawn.delete(player.citizenid);

        this.playerStateService.setClientState(target, {
            isKnockedOut: false,
        });

        if (admin) {
            TriggerClientEvent(
                ClientEvent.HALLOWEEN_VAMPIRE_PLAYER_CONVERTED,
                target,
                this.gameState.playerRoles.get(player.citizenid)
            );
        }
    }

    @OnEvent(ServerEvent.HALLOWEEN_VAMPIRE_GAME_CONVERT_PLAYER)
    public async convertPlayer(source: number, target: number, role: VampireGameRole) {
        if (!this.gameState.started) return;

        const playerSource = this.serverStateService.getPlayer(source);
        if (!playerSource) {
            return;
        }

        const playerTarget = this.serverStateService.getPlayer(target);
        if (!playerTarget) {
            return;
        }

        const sourceRole = this.gameState.playerRoles.get(playerSource.citizenid);
        const targetRole = this.gameState.playerRoles.get(playerTarget.citizenid);

        if (![...VampireGameEnemyRoles, VampireGameRole.Alchemist].includes(sourceRole)) {
            this.notifier.error(source, "Bạn không có quyền thực hiện hành động này");
        }

        if (role === VampireGameRole.Ghoul) {
            if (VampireGameEnemyRoles.includes(targetRole)) {
                this.notifier.error(source, 'Mục tiêu phải là Người Phàm');
                return;
            }

            const { completed } = await this.progressService.progress(
                source,
                'vampire',
                'Đang hút máu mạnh mẽ...',
                3000,
                {
                    name: 'base',
                    dictionary: 'amb@prop_human_bum_bin@base',
                    options: {
                        repeat: true,
                    },
                },
                {
                    disableMovement: true,
                    disableCarMovement: true,
                    disableMouse: false,
                    disableCombat: true,
                }
            );

            if (!completed) {
                return;
            }
        } else {
            const { completed } = await this.progressService.progress(
                source,
                'analyze',
                'Đang tiêm huyết thanh...',
                3000,
                {
                    name: 'base',
                    dictionary: 'amb@prop_human_bum_bin@base',
                    options: {
                        repeat: true,
                    },
                },
                {
                    disableMovement: true,
                    disableCarMovement: true,
                    disableMouse: false,
                    disableCombat: true,
                }
            );

            if (!completed) {
                return;
            }
        }

        this.gameState.autoRespawn.get(playerTarget.citizenid)?.cancel();
        this.gameState.autoRespawn.delete(playerTarget.citizenid);

        if (role === VampireGameRole.Ghoul) {
            this.gameState.ghoulOriginalRoles.set(playerTarget.citizenid, targetRole);
        }

        if (role) {
            this.gameState.playerRoles.set(playerTarget.citizenid, role);
        } else if (this.gameState.ghoulOriginalRoles.has(playerTarget.citizenid)) {
            role = this.gameState.ghoulOriginalRoles.get(playerTarget.citizenid);
        } else {
            role = targetRole;
        }

        this.switchPlayerRole(target, role);

        if (VampireGameEnemyRoles.includes(role)) {
            TriggerClientEvent(ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_OBJECTIVE_PART1, target, {});
        }

        await this.computeCurrentRoleGauge();

        await wait(1000);

        for (const role of [
            VampireGameRole.Hunter,
            VampireGameRole.Mortal,
            VampireGameRole.Squire,
            VampireGameRole.Alchemist,
        ]) {
            const roleGauge = await this.gameState.gauges[role].get();
            if (roleGauge.values[0].value > 0) return;
        }

        await this.stopGame('vampire_victory');
    }

    @OnEvent(ServerEvent.HALLOWEEN_VAMPIRE_GAME_KNOCK_PLAYER)
    public async knockPlayer(source: number, target: number) {
        if (!this.gameState.started) return;

        const player = this.playerService.getPlayer(source);
        if (!player) {
            return;
        }

        if (this.playerStateService.getClientState(target).isKnockedOut) return;

        TriggerClientEvent(ClientEvent.ADMIN_KILL_PLAYER, target);
    }

    @Tick(TickInterval.EVERY_SECOND, 'vampire-game:syncEnemyPosition')
    async syncEnemyPosition() {
        if (!this.gameState.started) return;
        if (!this.blipEnabled) return;

        const vampirePlayers = [];
        const ghoulPlayers = [];
        const squirePlayers = [];

        const vampirePositions: Vector3[] = [];
        const ghoulPositions: Vector3[] = [];
        const victimPositions: Vector3[] = [];

        this.gameState.playerRoles.forEach((role, citizenId) => {
            if (role === VampireGameRole.Vampire) {
                vampirePlayers.push(citizenId);
            } else if (role === VampireGameRole.Ghoul) {
                ghoulPlayers.push(citizenId);
            } else if (role === VampireGameRole.Squire) {
                squirePlayers.push(citizenId);
            }

            const player = this.serverStateService.getPlayerByCitizenId(citizenId);
            if (!player) return;

            const position = this.playerPositionProvider.getPlayerPosition(player.source);
            if (!position) return;

            if (role === VampireGameRole.Vampire) {
                vampirePositions.push(position);
            } else if (role === VampireGameRole.Ghoul) {
                ghoulPositions.push(position);
            } else {
                victimPositions.push(position);
            }
        });

        const enemyPositions = [...vampirePositions, ...ghoulPositions];

        squirePlayers.forEach(citizenId => {
            const player = this.serverStateService.getPlayerByCitizenId(citizenId);
            if (!player) return;

            TriggerLatentClientEvent(
                ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_POSITION,
                player.source,
                16 * 1024,
                enemyPositions,
                true
            );
        });

        vampirePlayers.forEach(citizenId => {
            const player = this.serverStateService.getPlayerByCitizenId(citizenId);
            if (!player) return;

            TriggerLatentClientEvent(
                ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_POSITION,
                player.source,
                16 * 1024,
                victimPositions,
                false
            );
        });

        ghoulPlayers.forEach(citizenId => {
            const player = this.serverStateService.getPlayerByCitizenId(citizenId);
            if (!player) return;

            TriggerLatentClientEvent(
                ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_POSITION,
                player.source,
                16 * 1024,
                vampirePositions,
                true
            );
        });
    }

    @Command('blip-vampire', { role: 'admin' })
    public setVampireBlip(source: number, enabled: string) {
        const ENABLE_VALUES = ['true', 'on', '1'];
        this.blipEnabled = ENABLE_VALUES.includes(enabled.toLowerCase());
    }

    /* Admin events */
    @Rpc(RpcServerEvent.ADMIN_HALLOWEEN_GAME_STATE)
    public getState(): HalloweenSubMenuState {
        const excludedPlayers: Partial<AdminPlayer>[] = [];

        this.gameState.excludedPlayers.forEach(citizenId => {
            const player = this.serverStateService.getPlayerByCitizenId(citizenId);
            if (!player) return;

            excludedPlayers.push({
                citizenId,
                name: `${player.charinfo.firstname} ${player.charinfo.lastname}`,
            });
        });

        return {
            started: this.gameState.started,
            excludedPlayers,
            gameDuration: this.gameDuration,
            roleMaxNumber: this.roleMaxNumber,
            mortalObjectivePart1: this.mortalObjectivePart1,
            mortalObjectivePart2: this.mortalObjectivePart2,
            mortalObjectivePart3: this.mortalObjectivePart3Duration,
            ceremony: {
                disableNpc: false,
                scene: this.xmasProvider.sceneState,
            },
        };
    }

    @OnEvent(ServerEvent.ADMIN_HALLOWEEN_UPDATE_GAME_PLAYER_EXCLUSION)
    public async togglePlayerExclusion(source: number, citizenId: string, value: boolean) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        if (value) {
            this.gameState.excludedPlayers.add(citizenId);
            this.notifier.notify(source, `Người chơi ${citizenId} đã bị loại khỏi trò chơi`, 'info');
        } else {
            this.gameState.excludedPlayers.delete(citizenId);
            this.notifier.notify(source, `Người chơi ${citizenId} đã được đưa trở lại trò chơi`, 'info');
        }

        await this.updateConfiguration();
    }

    @OnEvent(ServerEvent.ADMIN_HALLOWEEN_UPDATE_GAME_DURATION)
    public async updateGameDuration(source: number, value: number) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        this.gameDuration = value;
        this.notifier.notify(source, `Thời lượng trò chơi đã được cập nhật, thời gian tối đa: ${value} phút`, 'info');

        await this.updateConfiguration();
    }

    @OnEvent(ServerEvent.ADMIN_HALLOWEEN_UPDATE_ROLE)
    public async toggleRole(source: number, role: VampireGameRole, value: number) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        this.roleMaxNumber[role] = value;
        if (value <= 0) {
            this.notifier.notify(source, `Vai trò ${role} đã bị tắt`, 'info');
            return;
        }

        this.notifier.notify(source, `Vai trò ${role} đã được cập nhật, tỷ lệ rơi: ${value}%`, 'info');

        await this.updateConfiguration();
    }

    @OnEvent(ServerEvent.ADMIN_HALLOWEEN_FOCE_TRANSFORM_PLAYER)
    public forceTransformStaffPlayer(source: number, target: number, role: VampireGameRole): void {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        const player = this.serverStateService.getPlayer(target);
        if (!player) {
            return;
        }

        this.gameState.autoRespawn.get(player.citizenid)?.cancel();
        this.gameState.autoRespawn.delete(player.citizenid);

        this.gameState.playerRoles.set(player.citizenid, role);
        this.computeCurrentRoleGauge();

        TriggerClientEvent(ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_STATE, target, {
            inWaitingRoom: true,
            started: this.gameState.started,
            role,
        });

        this.sendObjectivePart1();
        this.sendObjectivePart2();

        this.switchPlayerRole(target, role);
    }

    @OnEvent(ServerEvent.ADMIN_HALLOWEEN_UPDATE_MORTAL_OBJECTIVE_PART1)
    public async toggleCollection(source: number, collection: VampireGameCollection, value: number) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        this.mortalObjectivePart1[collection] = value;
        if (value <= 0) {
            this.notifier.notify(source, `Bộ sưu tập ${collection} đã bị tắt`, 'info');
            return;
        }

        this.notifier.notify(source, `Bộ sưu tập ${collection} đã được cập nhật, số lượng tối đa: ${value}`, 'info');

        await this.updateConfiguration();
    }

    @OnEvent(ServerEvent.ADMIN_HALLOWEEN_UPDATE_MORTAL_OBJECTIVE_PART2)
    public async updateObjectivePart2Player(source: number, objective: VampireGameCollection, value: number) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        this.mortalObjectivePart2[objective] = value;
        if (value <= 0) {
            this.notifier.notify(source, `Mục tiêu ${objective} đã bị tắt`, 'info');
            return;
        }

        this.notifier.notify(source, `Mục tiêu ${objective} đã được cập nhật, số người chơi yêu cầu: ${value}`, 'info');

        await this.updateConfiguration();
    }

    @OnEvent(ServerEvent.ADMIN_HALLOWEEN_UPDATE_MORTAL_OBJECTIVE_PART3)
    public async updateObjectivePart3(source: number, value: number) {
        if (!this.permissionService.isStaff(source)) {
            return;
        }

        this.mortalObjectivePart3Duration = value;
        this.notifier.notify(source, `Thời gian của mục tiêu 3 đã được cập nhật: ${value} phút`, 'info');

        await this.updateConfiguration();
    }

    @OnEvent(ServerEvent.PLAYER_MORTAL_TP)
    public async tpMortal(source: number, locationId: string) {
        const player = this.serverStateService.getPlayer(source);
        if (!player) {
            return;
        }

        const lastTp = this.mortalTpList.get(player.citizenid) || 0;
        const now = Date.now();

        if (now - lastTp < 60 * 1000) {
            this.notifier.notify(source, 'Bạn cần ~r~chờ~s~ trước khi có thể dịch chuyển!');
            return;
        }

        const location = MortalRespawnPoints[locationId];
        if (!location) {
            return;
        }

        this.playerPositionProvider.teleportToCoords(source, location);
        this.mortalTpList.set(player.citizenid, now);
    }

    /* Private methods */
    private async stopGame(reason: StopReason) {
        await this.lockService.lock(
            'stopVampireGame',
            async () => {
                if (!this.gameState.started) {
                    return;
                }

                if (reason === 'cancel') {
                    this.notifier.notify(
                        -1,
                        'Cảnh quay đã kết thúc, toàn bộ cư dân trên đảo có thể trở lại hoạt động bình thường.',
                        'info',
                        45_000
                    );
                }

                if (reason === 'vampire_victory') {
                    this.notifier.notify(
                        -1,
                        'Phe Ma Cà Rồng đã chiến thắng kịch bản này! Cảnh quay đã kết thúc, cảm ơn sự tham gia xuất sắc của tất cả mọi người.',
                        'info',
                        45_000
                    );
                }

                if (reason === 'mortal_victory') {
                    this.notifier.notify(
                        -1,
                        'Phe Người Phàm đã chiến thắng kịch bản này! Cảnh quay đã kết thúc, cảm ơn sự tham gia xuất sắc của tất cả mọi người.',
                        'info',
                        45_000
                    );
                }

                TriggerClientEvent('InteractSound_CL:PlayOnOne', -1, 'halloween/wolf', 0.8);

                this.npcProvider.disableNPC(false);

                this.store.dispatch.global.update({
                    halloween: '',
                    blackout: false,
                    blackoutLevel: 0,
                    blackoutOverride: false,
                });

                clearTimeout(this.gameState.timer);
                clearTimeout(this.gameState.mortalObjectivePart3);

                this.gameState.playerRoles.forEach((_, citizenId) => {
                    const player = this.serverStateService.getPlayerByCitizenId(citizenId);
                    if (!player) {
                        return;
                    }

                    const position = this.gameState.originalPlayerPositions.get(citizenId);
                    if (position && position[0] !== 0 && position[1] !== 0) {
                        this.playerPositionProvider.teleportToCoords(player.source, position);
                        this.gameState.originalPlayerPositions.delete(citizenId);
                    }

                    const playerState = this.playerStateService.getClientStateByCitizenId(citizenId);
                    if (!playerState.isKnockedOut) return;

                    this.gameState.autoRespawn.get(citizenId)?.cancel();
                    TriggerClientEvent(
                        ClientEvent.HALLOWEEN_VAMPIRE_PLAYER_CONVERTED,
                        player.source,
                        VampireGameRole.Mortal
                    );
                });

                this.playerStateService.setAllClientsState({
                    halloweenRole: null,
                    isKnockedOut: false,
                });

                TriggerLatentClientEvent(ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_STATE, -1, 1024, {
                    inWaitingRoom: false,
                    started: false,
                    role: null,
                    objectivePart1: null,
                    objectivePart2: null,
                } as VampireGameClientState);

                Object.values(this.gameState.gauges).forEach(gauge => gauge.reset());

                this.gameState.mortalObjectivePart1.clear();
                Object.keys(this.gameState.mortalObjectivePart2).forEach(key => {
                    this.gameState.mortalObjectivePart2[key].finished = false;
                    this.gameState.mortalObjectivePart2[key].players.clear();
                });
                this.gameState.mortalObjectivePart3 = null;

                this.gameState.objectiveGauges.part1.reset();
                this.gameState.objectiveGauges.part2.reset();

                this.gameState.ghoulOriginalRoles.clear();
                this.gameState.originalPlayerPositions.clear();

                this.gameState.autoRespawn.clear();
                this.gameState.playerRoles.clear();
                this.gameState.started = false;
            },
            10_000
        );
    }

    private async newPlayer(player: PlayerData) {
        if (this.gameState.excludedPlayers.has(player.citizenid)) {
            this.logger.debug(
                `${player.charinfo.firstname} ${player.charinfo.lastname} has been excluded from the game`
            );
            return;
        }

        if (this.gameState.playerRoles.has(player.citizenid)) {
            const role = this.gameState.playerRoles.get(player.citizenid);

            this.logger.error(
                `${player.charinfo.firstname} ${player.charinfo.lastname} has already been assigned to a role: ${role}`
            );

            this.playerStateService.setClientState(player.source, {
                isKnockedOut: false,
                halloweenRole: role,
            });

            TriggerLatentClientEvent(ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_STATE, player.source, 1024, {
                inWaitingRoom: true,
                started: this.gameState.started,
                role,
                objectivePart1: !VampireGameEnemyRoles.includes(role) ? this.getObjectivePart1Progress() : null,
                objectivePart2: !VampireGameEnemyRoles.includes(role) ? this.getObjectivePart2Progress() : null,
            });

            if (role === VampireGameRole.Vampire) {
                this.teleportVampireRandomly(player);
            }

            this.sendObjectivePart1();
            this.sendObjectivePart2();

            return;
        }

        const role = await this.getRandomRole();
        if (!role) {
            this.logger.error(
                `${player.charinfo.firstname} ${player.charinfo.lastname} n'a pas pu être assigné à un rôle, aucun rôle de disponible...`
            );
            return;
        }

        const playerPosition =
            this.playerPositionProvider.getPlayerPosition(player.source) ?? fromVector3Object(player.position);
        let position = [...playerPosition, 0] as Vector4;

        if (player.metadata.inside.apartment && player.metadata.inside.exitCoord) {
            this.playerPositionProvider.teleportToCoords(
                player.source,
                fromVector4Object(player.metadata.inside.exitCoord)
            );

            this.playerService.setPlayerMetadata(player.source, 'inside', {
                apartment: false,
                property: null,
                exitCoord: player.metadata.inside.exitCoord, //keep exitCoord for command player-tp-entrance
            });

            position = fromVector4Object(player.metadata.inside.exitCoord);
        }

        this.gameState.originalPlayerPositions.set(player.citizenid, position);

        this.gameState.playerRoles.set(player.citizenid, role);
        await this.computeCurrentRoleGauge();

        this.playerStateService.setClientState(player.source, {
            halloweenRole: role,
        });

        TriggerClientEvent(ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_STATE, player.source, {
            inWaitingRoom: true,
            started: this.gameState.started,
            role,
            objectivePart1: !VampireGameEnemyRoles.includes(role) ? this.getObjectivePart1Progress() : null,
            objectivePart2: !VampireGameEnemyRoles.includes(role) ? this.getObjectivePart2Progress() : null,
        });

        if (player.metadata.isdead) {
            await this.lsmcDeathProvider.revive(player.source, player.source, true, false, false);
        }

        if (role === VampireGameRole.Vampire) {
            this.teleportVampireRandomly(player);
        }

        this.logger.debug(
            `Player ${player.charinfo.firstname} ${player.charinfo.lastname} has been assigned to role ${role}`
        );
    }

    private teleportVampireRandomly(player: PlayerData) {
        let object: WorldObject | undefined;
        do {
            const bin = this.objectProvider
                .getObjects()
                .filter(object => BIN_MODELS.includes(object.model))
                .sort(() => Math.random() - 0.5)
                ?.shift();

            if (bin && !locationIsTooClose(bin.position, 400)) {
                object = bin;
            }
        } while (!object);

        this.playerPositionProvider.teleportToCoords(player.source, object.position);
    }

    private async getRandomRole(): Promise<VampireGameRole> {
        for (const role of Object.keys(this.roleMaxNumber) as VampireGameRole[]) {
            if (this.roleMaxNumber[role] <= 0) {
                continue;
            }

            const roleGauge = await this.gameState.gauges[role].get();
            if (roleGauge.values[0].value >= 1) {
                continue;
            }

            return role;
        }

        return getRandomKeyWeighted<VampireGameRole>(this.roleMaxNumber, VampireGameRole.Vampire) as VampireGameRole;
    }

    private async updateConfiguration() {
        return this.configurationRepository.update('VampireGame', {
            gameDuration: this.gameDuration,

            roleMaxNumber: this.roleMaxNumber,
            excludedPlayers: [...this.gameState.excludedPlayers],

            mortalObjectivePart1: this.mortalObjectivePart1,
            mortalObjectivePart2: this.mortalObjectivePart2,
            mortalObjectivePart3Duration: this.mortalObjectivePart3Duration,
        });
    }

    private createObjectivePart1() {
        for (const collection of Object.keys(VampireGameObjectiveCollectionPart1) as VampireGameCollection[]) {
            this.gameState.mortalObjectivePart1.set(
                collection,
                this.getCollectionContent(collection, this.mortalObjectivePart1[collection])
            );

            this.gameState.objectiveGauges.part1.set(
                {
                    objective: collection,
                    total: this.mortalObjectivePart1[collection],
                },
                0
            );
        }
    }

    private getCollectionContent(collection: VampireGameCollection, amount: number): Vector3[] {
        const collectionPropsList = VampireGameObjectiveCollectionPart1[collection];
        if (!collectionPropsList) {
            return [];
        }

        const collectionContent = Object.values(collectionPropsList).flatMap(props => {
            return VampireGameObjectiveProps[props];
        });

        return collectionContent
            .filter(coords => coords[1] >= OBJECTIVE_Y_LIMITATION[0] && coords[1] <= OBJECTIVE_Y_LIMITATION[1])
            .sort(() => Math.random() - 0.5)
            .slice(0, amount);
    }

    private sendObjectivePart1() {
        if (!this.gameState.started) return;

        this.callFunctionOnNonEnemyPlayers(player => {
            TriggerLatentClientEvent(
                ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_OBJECTIVE_PART1,
                player.source,
                1024,
                this.getObjectivePart1Progress()
            );
        });
    }

    private getObjectivePart1Progress() {
        return Object.fromEntries(this.gameState.mortalObjectivePart1.entries());
    }

    private sendObjectivePart2() {
        if (!this.gameState.started) return;

        for (const [, positions] of this.gameState.mortalObjectivePart1) {
            if (positions.length > 0) return;
        }

        this.callFunctionOnNonEnemyPlayers(player => {
            TriggerLatentClientEvent(
                ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_OBJECTIVE_PART2,
                player.source,
                1024,
                this.getObjectivePart2Progress()
            );
        });
    }

    private getObjectivePart2Progress() {
        for (const [, positions] of this.gameState.mortalObjectivePart1) {
            if (positions.length > 0) return null;
        }

        return Object.fromEntries(
            Object.entries(VampireGameObjectivePart2).map(([key]) => [
                key,
                {
                    playerRequired: this.mortalObjectivePart2[key],
                    finished: this.gameState.mortalObjectivePart2[key].finished,
                },
            ])
        );
    }

    private callFunctionOnNonEnemyPlayers(callback: (player: PlayerData) => void) {
        this.gameState.playerRoles.forEach((role, citizenId) => {
            if (VampireGameEnemyRoles.includes(role)) return;

            const player = this.serverStateService.getPlayerByCitizenId(citizenId);
            if (!player) {
                return;
            }

            callback(player);
        });
    }

    private callFunctionOnEnemyPlayers(callback: (player: PlayerData) => void) {
        this.gameState.playerRoles.forEach((role, citizenId) => {
            if (!VampireGameEnemyRoles.includes(role)) return;

            const player = this.serverStateService.getPlayerByCitizenId(citizenId);
            if (!player) {
                return;
            }

            callback(player);
        });
    }

    private triggerMortalObjectivePart3() {
        this.gameState.playerRoles.forEach((role, citizenId) => {
            if (VampireGameEnemyRoles.includes(role)) return;
            if (role === VampireGameRole.Hunter) return;

            const player = this.serverStateService.getPlayerByCitizenId(citizenId);
            if (!player) {
                return;
            }

            this.gameState.playerRoles.set(citizenId, VampireGameRole.Hunter);
            this.computeCurrentRoleGauge();

            this.switchPlayerRole(player.source, VampireGameRole.Hunter);
        });

        clearInterval(this.gameState.mortalObjectivePart3);
        this.gameState.mortalObjectivePart3 = setTimeout(
            async () => {
                await this.stopGame('mortal_victory');
            },
            this.mortalObjectivePart3Duration * 60 * 1000
        );
    }

    private switchPlayerRole(source: number, role: VampireGameRole) {
        this.playerStateService.setClientState(source, {
            isKnockedOut: false,
            halloweenRole: role,
        });

        TriggerClientEvent(ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_STATE, source, {
            role,
            objectivePart1: this.getObjectivePart1Progress(),
            objectivePart2: this.getObjectivePart2Progress(),
        });
        TriggerClientEvent(ClientEvent.HALLOWEEN_VAMPIRE_PLAYER_CONVERTED, source, role);

        TriggerLatentClientEvent(ClientEvent.HALLOWEEN_VAMPIRE_UPDATE_POSITION, source, 1024, [], false);
    }

    private async computeCurrentRoleGauge() {
        return this.lockService.lock('computeCurrentRoleGauge', async () => {
            const counter = {
                [VampireGameRole.Vampire]: 0,
                [VampireGameRole.Ghoul]: 0,
                [VampireGameRole.Hunter]: 0,
                [VampireGameRole.Mortal]: 0,
                [VampireGameRole.Squire]: 0,
                [VampireGameRole.Alchemist]: 0,
            };

            this.gameState.playerRoles.forEach(role => {
                counter[role]++;
            });

            this.gameState.gauges[VampireGameRole.Vampire].set(counter[VampireGameRole.Vampire]);
            this.gameState.gauges[VampireGameRole.Ghoul].set(counter[VampireGameRole.Ghoul]);
            this.gameState.gauges[VampireGameRole.Hunter].set(counter[VampireGameRole.Hunter]);
            this.gameState.gauges[VampireGameRole.Mortal].set(counter[VampireGameRole.Mortal]);
            this.gameState.gauges[VampireGameRole.Squire].set(counter[VampireGameRole.Squire]);
            this.gameState.gauges[VampireGameRole.Alchemist].set(counter[VampireGameRole.Alchemist]);
        });
    }
}
