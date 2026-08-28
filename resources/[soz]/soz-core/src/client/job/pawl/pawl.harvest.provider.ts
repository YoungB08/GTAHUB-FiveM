import { DrugSkill } from '@private/shared/drugs';
import { InventoryManager } from '@public/client/inventory/inventory.manager';
import { Notifier } from '@public/client/notifier';
import { PlayerService } from '@public/client/player/player.service';
import { Once, OnceStep } from '@public/core/decorators/event';
import { Inject } from '@public/core/decorators/injectable';
import { Provider } from '@public/core/decorators/provider';
import { ClientEvent, ServerEvent } from '@public/shared/event';

import { RepositoryUpdate } from '../../../core/decorators/repository';
import { Tick, TickInterval } from '../../../core/decorators/tick';
import { emitRpc } from '../../../core/rpc';
import { wait } from '../../../core/utils';
import { Field, isPawlField, isTreeCutted, PAWL_FIELD_LIST, PawlField, PawlFieldTree } from '../../../shared/field';
import { JobType } from '../../../shared/job';
import { RepositoryType } from '../../../shared/repository';
import { RpcServerEvent } from '../../../shared/rpc';
import { ObjectProvider } from '../../object/object.provider';
import { ProgressService } from '../../progress.service';
import { FieldRepository } from '../../repository/field.repository';
import { SoundService } from '../../sound.service';
import { WeaponProvider } from '../../weapon/weapon.provider';

@Provider()
export class PawlHarvestProvider {
    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(FieldRepository)
    private fieldRepository: FieldRepository;

    @Inject(InventoryManager)
    private inventoryManager: InventoryManager;

    @Inject(ObjectProvider)
    private objectProvider: ObjectProvider;

    @Inject(WeaponProvider)
    private weaponProvider: WeaponProvider;

    @Inject(ProgressService)
    private progressService: ProgressService;

    @Inject(SoundService)
    private soundService: SoundService;

    @Inject(Notifier)
    private notifier: Notifier;

    private harvestedTreeSap: Set<string> = new Set();

    @Once(OnceStep.RepositoriesLoaded)
    public async setupTreeHarvest() {
        for (const identifier of PAWL_FIELD_LIST) {
            const field = this.fieldRepository.find(identifier);

            if (!field) {
                continue;
            }

            if (!isPawlField(field)) {
                continue;
            }

            for (const tree of field.field) {
                await this.handleTreeSpawn(field, tree);
            }
        }
    }

    @RepositoryUpdate(RepositoryType.Field)
    public async onPawlFieldUpdate(field: Field) {
        if (!isPawlField(field)) {
            return;
        }

        for (const tree of field.field) {
            await this.handleTreeSpawn(field, tree);
        }
    }

    @Tick(TickInterval.EVERY_MINUTE)
    public async checkTreeCut() {
        for (const identifier of PAWL_FIELD_LIST) {
            const field = this.fieldRepository.find(identifier);

            if (!field) {
                continue;
            }

            if (!isPawlField(field)) {
                continue;
            }

            for (const tree of field.field) {
                await this.handleTreeSpawn(field, tree);
            }

            await wait(0);
        }
    }

    private async handleTreeSpawn(field: PawlField, tree: PawlFieldTree) {
        const isTreeUp = !isTreeCutted(field, tree);
        const hasObject = this.objectProvider.hasObject(tree.identifier);

        if (!isTreeUp) {
            this.objectProvider.deleteObject(tree.identifier);

            return;
        }

        if (hasObject) {
            return;
        }

        await this.objectProvider.createObject(
            {
                model: GetHashKey(tree.model),
                position: [tree.position.x, tree.position.y, tree.position.z, tree.position.w || 0],
                id: tree.identifier,
            },
            [
                {
                    label: 'Đốn gỗ (Rìu)',
                    icon: 'pawl/harvest',
                    item: 'weapon_hatchet',
                    job: JobType.Pawl,
                    blackoutGlobal: true,
                    blackoutJob: JobType.Pawl,
                    category: 'society',
                    action: () => {
                        this.harvestTree(field.identifier, tree.identifier);
                    },
                },
                {
                    label: 'Cưa gỗ (Máy cưa)',
                    icon: 'pawl/harvest-chainsaw',
                    item: 'chainsaw',
                    job: JobType.Pawl,
                    blackoutGlobal: true,
                    blackoutJob: JobType.Pawl,
                    category: 'society',
                    action: () => {
                        this.harvestTreeChainsaw(field.identifier, tree.identifier);
                    },
                },
                {
                    label: 'Thu hoạch nhựa cây',
                    icon: 'pawl/harvest-sap',
                    item: 'weapon_hatchet',
                    job: JobType.Pawl,
                    blackoutGlobal: true,
                    blackoutJob: JobType.Pawl,
                    category: 'society',
                    canInteract: () => {
                        return !this.harvestedTreeSap.has(tree.identifier);
                    },
                    action: () => {
                        this.harvestTreeSap(field.identifier, tree.identifier);
                    },
                },
                {
                    label: 'Hái nấm rừng',
                    icon: 'pawl/harvest-mushroom',
                    canInteract: () => {
                        const player = this.playerService.getPlayer();

                        if (!player) {
                            return false;
                        }

                        return player.metadata.drugs_skills.includes(DrugSkill.Botaniste);
                    },
                    category: 'criminal',
                    action: () => {
                        this.harvestMushroom(field.identifier, tree);
                    },
                },
            ]
        );
    }

    private async harvestTree(fieldId: string, treeId: string) {
        await this.weaponProvider.clearCurrentWeapon();

        const item = this.inventoryManager.getItem('weapon_hatchet');

        if (!item) {
            return;
        }

        await this.weaponProvider.onUseWeapon(item);
        await wait(3000);

        const { completed } = await this.progressService.progress(
            'harvest-tree',
            'Đang đốn cây bằng rìu...',
            30_000,
            {
                dictionary: 'melee@large_wpn@streamed_core',
                name: 'plyr_rear_takedown_bat_r_facehit',
                options: {
                    onlyUpperBody: true,
                    repeat: true,
                },
            },
            {
                disableMovement: true,
                disableCombat: true,
            }
        );

        if (!completed) {
            await this.weaponProvider.clearCurrentWeapon();

            return;
        }

        const isHarvest = await emitRpc<boolean>(RpcServerEvent.PAWL_HARVEST_TREE, fieldId, treeId);

        if (!isHarvest) {
            this.notifier.error('Bạn đã ~r~thất bại~s~ khi đốn cây.');

            return;
        }

        this.harvestedTreeSap.delete(treeId);
        this.notifier.notify('Bạn đã ~g~đốn hạ~s~ cây gỗ thành công.', 'success');

        await this.weaponProvider.clearCurrentWeapon();
    }

    private async harvestTreeChainsaw(fieldId: string, treeId: string) {
        const chainsaw = this.inventoryManager.getItem('chainsaw');

        if (!chainsaw?.metadata.fuel || chainsaw?.metadata?.fuel < 1) {
            this.notifier.error('Máy cưa đã hết xăng / nhiên liệu..');
            return;
        }

        TriggerServerEvent(ServerEvent.PAWL_DECREASE_CHAINSAW_FUEL, {
            slot: chainsaw.slot,
            fuel: chainsaw.metadata.fuel,
        });

        await this.weaponProvider.clearCurrentWeapon();

        this.soundService.playAround('pawl/chainsaw', 2, 15_000);

        const { completed } = await this.progressService.progress(
            'harvest-tree-chainsaw',
            'Đang cưa thân cây...',
            15_000,
            {
                dictionary: 'anim@amb@business@cfm@cfm_cut_sheets@',
                name: 'load_and_tune_guilotine_v1_billcutter',
                options: {
                    onlyUpperBody: true,
                    repeat: true,
                },
                props: [
                    {
                        model: 'prop_tool_consaw',
                        bone: 28422,
                        position: [0.12, 0.02, 0.0001],
                        rotation: [90.0, 180.0, -40.0],
                    },
                ],
            },
            {
                disableMovement: true,
                disableCombat: true,
            }
        );

        if (!completed) {
            return;
        }

        const isHarvest = await emitRpc<boolean>(RpcServerEvent.PAWL_HARVEST_TREE, fieldId, treeId);

        if (!isHarvest) {
            this.notifier.error('Bạn đã ~r~thất bại~s~ khi đốn cây.');

            return;
        }

        this.harvestedTreeSap.delete(treeId);
        this.notifier.notify('Bạn đã ~g~cưa hạ~s~ thân cây thành công.', 'success');
    }

    private async harvestTreeSap(fieldId: string, treeId: string) {
        if (this.harvestedTreeSap.has(treeId)) {
            return;
        }

        await this.weaponProvider.clearCurrentWeapon();

        const item = this.inventoryManager.getItem('weapon_hatchet');

        if (!item) {
            return;
        }

        await this.weaponProvider.onUseWeapon(item);
        await wait(3000);

        const { completed } = await this.progressService.progress(
            'harvest-tree-sap',
            'Đang cạo lấy nhựa cây...',
            8_000,
            {
                dictionary: 'melee@large_wpn@streamed_core',
                name: 'plyr_rear_takedown_bat_r_facehit',
                options: {
                    onlyUpperBody: true,
                    repeat: true,
                },
            },
            {
                disableMovement: true,
                disableCombat: true,
            }
        );

        await this.weaponProvider.clearCurrentWeapon();

        if (!completed) {
            return;
        }

        const isHarvest = await emitRpc<boolean>(RpcServerEvent.PAWL_HARVEST_TREE_SAP, fieldId, treeId);

        if (!isHarvest) {
            this.notifier.error('Bạn đã ~r~thất bại~s~ khi lấy nhựa cây.');

            return;
        }

        this.harvestedTreeSap.add(treeId);
        this.notifier.notify('Bạn đã ~g~thu hoạch~s~ nhựa cây thành công.', 'success');
    }

    private harvestMushroom(identifier: string, tree: PawlFieldTree) {
        TriggerEvent(ClientEvent.DRUGS_HARVEST_CHAMPI, {
            entity: identifier,
            position: tree.position,
        });
    }
}
