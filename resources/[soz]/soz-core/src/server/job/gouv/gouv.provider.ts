import { PermissionService } from '@public/server/permission.service';
import { expirationVisaDuration } from '@public/shared/player';
import { TaxLabel, TaxType } from '@public/shared/tax';

import { OnEvent } from '../../../core/decorators/event';
import { Inject } from '../../../core/decorators/injectable';
import { Provider } from '../../../core/decorators/provider';
import { JobTaxTier } from '../../../shared/configuration';
import { ServerEvent } from '../../../shared/event/server';
import { JobPermission, JobType } from '../../../shared/job';
import { PrismaService } from '../../database/prisma.service';
import { JobService } from '../../job.service';
import { Notifier } from '../../notifier';
import { PlayerService } from '../../player/player.service';
import { ConfigurationRepository } from '../../repository/configuration.repository';
import { TaxRepository } from '../../repository/tax.repository';

@Provider()
export class GouvProvider {
    @Inject(TaxRepository)
    private taxRepository: TaxRepository;

    @Inject(ConfigurationRepository)
    private configurationRepository: ConfigurationRepository;

    @Inject(JobService)
    private jobService: JobService;

    @Inject(PlayerService)
    private playerService: PlayerService;

    @Inject(PermissionService)
    private permissionService: PermissionService;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(PrismaService)
    private prismaService: PrismaService;

    @OnEvent(ServerEvent.GOUV_UPDATE_JOB_TIER_TAX)
    public async updateJobTierTax(source: number, tier: keyof JobTaxTier, value: number) {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        if (!(await this.jobService.hasPermission(player, JobType.Gouv, JobPermission.GouvUpdateTax))) {
            return;
        }

        const jobTaxTier = await this.configurationRepository.getValue('JobTaxTier');

        if (tier === 'Tier1' && value > jobTaxTier.Tier2) {
            this.notifier.notify(source, `Mức ~g~"Bậc 1"~s~ phải thấp hơn mức ~g~"Bậc 2"~s~`);

            return;
        }

        if (tier === 'Tier2' && (value < jobTaxTier.Tier1 || value > jobTaxTier.Tier3)) {
            this.notifier.notify(
                source,
                `Mức ~g~"Bậc 2"~s~ phải nằm trong khoảng từ ~g~"Bậc 1"~s~ đến ~g~"Bậc 3"~s~`
            );

            return;
        }

        if (tier === 'Tier3' && (value < jobTaxTier.Tier2 || value > jobTaxTier.Tier4)) {
            this.notifier.notify(
                source,
                `Mức ~g~"Bậc 3"~s~ phải nằm trong khoảng từ ~g~"Bậc 2"~s~ đến ~g~"Bậc 4"~s~`
            );

            return;
        }

        if (tier === 'Tier4' && value < jobTaxTier.Tier3) {
            this.notifier.notify(source, `Mức ~g~"Bậc 4"~s~ phải cao hơn mức ~g~"Bậc 3"~s~`);

            return;
        }

        jobTaxTier[tier] = value;

        await this.configurationRepository.update('JobTaxTier', jobTaxTier);

        this.notifier.notify(source, `Bạn đã cập nhật mức ~g~"${tier}"~s~ thành ~g~$${value}~s~`);
    }

    @OnEvent(ServerEvent.GOUV_UPDATE_JOB_TIER_TAX_PERCENTAGE)
    public async updateJobTierTaxPercentage(source: number, tier: keyof JobTaxTier, value: number) {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        if (!(await this.jobService.hasPermission(player, JobType.Gouv, JobPermission.GouvUpdateTax))) {
            return;
        }

        const jobTaxTier = await this.configurationRepository.getValue('JobTaxTier');
        jobTaxTier[tier] = value;

        await this.configurationRepository.update('JobTaxTier', jobTaxTier);

        this.notifier.notify(source, `Bạn đã cập nhật tỷ lệ phần trăm thành ~g~${value}~s~%`);
    }

    @OnEvent(ServerEvent.GOUV_UPDATE_TAX)
    public async updateTax(source: number, taxType: TaxType, value: number) {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        if ((value < 16 || 30 < value) && !this.permissionService.isStaff(source)) {
            this.notifier.error(source, `Giá trị thuế nằm ~r~ngoài~s~ quy định của phủ tổng thống.`);
            return;
        }

        if (!(await this.jobService.hasPermission(player, JobType.Gouv, JobPermission.GouvUpdateTax))) {
            return;
        }

        await this.prismaService.tax.upsert({
            where: { id: taxType },
            update: { value },
            create: { id: taxType, value },
        });

        await this.taxRepository.set(taxType, { id: taxType, value });

        const label = TaxLabel[taxType];

        this.notifier.notify(source, `Bạn đã cập nhật mức thuế ~g~"${label}"~s~ thành ~g~${value}~s~`);
    }

    @OnEvent(ServerEvent.GOUV_VALIDATE_IDENTITY)
    public async onValidateIdentity(source: number, target: number) {
        const sourcePlayer = this.playerService.getPlayer(source);
        const targetPlayer = this.playerService.getPlayer(target);

        if (!sourcePlayer || !targetPlayer) {
            return;
        }

        if (targetPlayer.created_at + expirationVisaDuration > Date.now()) {
            this.notifier.error(
                source,
                `Không thể ~g~xác thực~s~ danh tính trước khi Visa tạm trú hết hạn (${new Date(
                    targetPlayer.created_at + expirationVisaDuration
                ).toLocaleString('vi-VN')}).`
            );
            return;
        }

        this.playerService.setPlayerValidated(target, true);

        this.notifier.notify(target, `Danh tính của bạn đã được ~g~xác thực~s~.`);
        this.notifier.notify(source, `Bạn đã ~g~xác thực~s~ danh tính công dân thành công.`);
    }

    @OnEvent(ServerEvent.GOUV_SENAT_SALARY)
    public async senatSalary(source: number, value: number) {
        const player = this.playerService.getPlayer(source);

        if (!player) {
            return;
        }

        if (!(await this.jobService.hasPermission(player, JobType.Gouv, JobPermission.GouvSenatSalary))) {
            return;
        }

        await this.configurationRepository.update('Gouv', {
            SenatSalary: value,
        });

        this.notifier.notify(source, `Bạn đã cập nhật lương thượng nghị sĩ thành ~g~$${value}~s~.`);
    }
}
