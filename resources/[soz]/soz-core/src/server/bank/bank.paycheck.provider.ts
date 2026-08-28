import { JobType } from '@public/shared/job';

import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { Tick } from '../../core/decorators/tick';
import { Feature } from '../../shared/features';
import { FeatureProvider } from '../feature/feature.provider';
import { Monitor } from '../monitor/monitor';
import { Notifier } from '../notifier';
import { ConfigurationRepository } from '../repository/configuration.repository';
import { JobGradeRepository } from '../repository/job.grade.repository';
import { ServerStateService } from '../server.state.service';
import { BankService } from './bank.service';

@Provider()
export class BankPaycheckProvider {
    @Inject(ServerStateService)
    private serverStateService: ServerStateService;

    @Inject(JobGradeRepository)
    private jobGradeRepository: JobGradeRepository;

    @Inject(BankService)
    private bankService: BankService;

    @Inject(Monitor)
    private monitor: Monitor;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(ConfigurationRepository)
    private configurationRepository: ConfigurationRepository;

    @Inject(FeatureProvider)
    private featureProvider: FeatureProvider;

    @Tick(20 * 60 * 1000)
    public async paycheckLoop() {
        if (this.featureProvider.isFeatureEnabled(Feature.WhatIfSecondEpisode)) {
            return;
        }

        const players = this.serverStateService.getPlayers();

        for (const player of players) {
            if (player.metadata.injail) {
                continue;
            }

            if (!player.job || player.job.id === JobType.Unemployed) {
                continue;
            }

            const grade = await this.jobGradeRepository.find(Number(player.job.grade));

            if (!grade || grade.jobId != player.job.id) {
                continue;
            }

            let payment = grade.salary;

            if (payment <= 0) {
                continue;
            }

            if (!player.job.onduty) {
                payment = Math.ceil(payment * 0.2);
            }

            const result = await this.bankService.transferBankMoney(
                player.job.id,
                player.charinfo.account,
                'money',
                payment,
                false,
                'Thanh toán tiền lương'
            );

            if (result) {
                this.notifier.advancedNotify(
                    player.source,
                    'Ngân hàng Fleeca',
                    'Biến động số dư',
                    `Tiền lương ~g~${
                        player.job.onduty ? 'trong ca làm' : 'ngoài ca làm'
                    }~s~ ~g~$${payment}~s~ đã được chuyển vào tài khoản ngân hàng của bạn.`,
                    'CHAR_BANK_MAZE'
                );

                this.monitor.traceEvent('paycheck', {
                    player_source: player.source,
                    amount: payment,
                });
            }
        }

        const gouvConf = await this.configurationRepository.getValue('Gouv');
        for (const player of players) {
            if (player.metadata.is_senator) {
                const result = await this.bankService.transferBankMoney(
                    'gouv',
                    player.charinfo.account,
                    'money',
                    gouvConf.SenatSalary,
                    false,
                    'Phụ cấp thượng nghị sĩ'
                );
                if (result) {
                    this.notifier.advancedNotify(
                        player.source,
                        'Ngân hàng Fleeca',
                        'Biến động số dư',
                        `Phụ cấp ~g~thượng nghị sĩ~s~ ~g~$${gouvConf.SenatSalary}~s~ đã được chuyển vào tài khoản ngân hàng của bạn.`,
                        'CHAR_BANK_MAZE'
                    );

                    this.monitor.traceEvent('senator_paycheck', {
                        player_source: player.source,
                        amount: gouvConf.SenatSalary,
                    });
                }
            }
        }
    }
}
