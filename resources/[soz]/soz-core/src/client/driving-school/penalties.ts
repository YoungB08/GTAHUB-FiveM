import { DrivingSchoolConfig, DrivingSchoolLicenseType, PenaltyContext } from '../../shared/driving-school';
import { Err, Ok, Result } from '../../shared/result';

export abstract class Penalty {
    public context: PenaltyContext;

    public exclude: DrivingSchoolLicenseType[] = [];

    protected playerWarned = false;
    protected gracePeriod = 0;
    private maxGracePeriod = DrivingSchoolConfig.maxGracePeriod;
    protected ignoreGracePeriod = false;

    protected warningMsg: string;
    protected failMsg: string;

    constructor(context: PenaltyContext) {
        this.context = context;
    }

    public performCheck(): Result<boolean, boolean> {
        if (this.isValid()) {
            this.gracePeriod =
                this.gracePeriod > DrivingSchoolConfig.gracePeriodIncrement
                    ? this.gracePeriod - DrivingSchoolConfig.gracePeriodIncrement
                    : 0;

            this.playerWarned = this.gracePeriod !== 0;

            return Ok(true);
        }

        if (this.ignoreGracePeriod || this.isGracePeriodExceeded()) {
            this.displayFailMsg();
            return Err(true);
        }

        if (!this.playerWarned) {
            this.playerWarned = true;
            this.displayWarningMsg();
        }

        this.gracePeriod += DrivingSchoolConfig.gracePeriodIncrement;

        return Ok(true);
    }

    protected displayWarningMsg(): void {
        if (!this.warningMsg) {
            return;
        }

        this.context.notifier.notify(`CẢNH BÁO: ${this.warningMsg}`, 'warning');
    }

    protected displayFailMsg(): void {
        if (!this.failMsg) {
            return;
        }

        this.context.notifier.notify(`THI TRƯỢT: ${this.failMsg}`, 'error');
    }

    private isGracePeriodExceeded(): boolean {
        return this.gracePeriod >= this.maxGracePeriod;
    }

    public abstract isValid(): boolean;
}

class DamagePenalty extends Penalty {
    private WARNING_THRESHOLD = 995;
    private FAIL_THRESHOLD = 950;

    protected warningMsg = 'Đừng phá xe! Chú ý các va chạm hư hỏng.';
    protected failMsg = 'Xe đã bị hư hỏng quá nặng! Bài thi kết thúc tại đây.';

    public isValid(): boolean {
        /**
         * `this.gracePeriod` is not relevant for this penalty.
         * Value is set every tick so that it does not trigger exam failure.
         */

        const health = GetEntityHealth(this.context.vehicle);

        if (health > this.WARNING_THRESHOLD) {
            this.gracePeriod = 1;

            return true;
        } else if (health > this.FAIL_THRESHOLD) {
            this.gracePeriod = DrivingSchoolConfig.gracePeriodIncrement + 1;

            if (!this.playerWarned) {
                this.playerWarned = true;
                this.displayWarningMsg();
            }

            return true;
        }

        this.gracePeriod = DrivingSchoolConfig.maxGracePeriod;

        return false;
    }
}

class DeadPenalty extends Penalty {
    protected ignoreGracePeriod = true;

    protected failMsg = 'Không thể cấp bằng lái cho người đã bất tỉnh/chết...';

    public isValid(): boolean {
        const player = this.context.playerService.getPlayer();

        return !player.metadata.isdead;
    }
}

class OutOfVehiclePenalty extends Penalty {
    protected warningMsg = 'Hãy quay lại xe ngay!';
    protected failMsg = 'Để thi bằng lái, bạn phải ở TRONG phương tiện!';

    public isValid(): boolean {
        const playerPed = PlayerPedId();

        return GetVehiclePedIsIn(playerPed, false) == this.context.vehicle;
    }
}

class OverspeedPenalty extends Penalty {
    public exclude = [DrivingSchoolLicenseType.Heli];

    private MAX_SPEED = 90.5;

    protected warningMsg = 'Chú ý tốc độ! Không được vượt quá 90 km/h.';
    protected failMsg = 'Bạn không kiểm soát được tốc độ của mình. Dừng thi tại đây...';

    public isValid(): boolean {
        const speed = Math.ceil(GetEntitySpeed(this.context.vehicle) * 3.6);

        return speed < this.MAX_SPEED;
    }
}

class PhonePenalty extends Penalty {
    protected warningMsg = 'Cất điện thoại đi! Hãy tập trung nhìn đường!';
    protected failMsg = 'Nghiêm cấm sử dụng điện thoại khi đang lái xe!';

    public isValid(): boolean {
        return !this.context.phoneService.isPhoneVisible() && !this.context.phoneService.hasAnActiveCall();
    }
}

class SeatbeltPenalty extends Penalty {
    public exclude = [DrivingSchoolLicenseType.Moto];

    protected warningMsg = 'Hãy thắt dây an toàn! An toàn là trên hết.';
    protected failMsg = 'Bạn không thắt dây an toàn! Bài thi kết thúc.';

    public isValid(): boolean {
        return this.context.seatbeltProvider.isSeatbeltOnForPlayer();
    }
}

class UndrivablePenalty extends Penalty {
    protected ignoreGracePeriod = true;

    protected failMsg = 'Bạn đã thi trượt! Xe này không thể tiếp tục di chuyển nữa...';

    public isValid(): boolean {
        return !this.context.undrivableVehicles.includes(this.context.vehicle);
    }
}

export const Penalties = [
    DamagePenalty,
    DeadPenalty,
    OutOfVehiclePenalty,
    OverspeedPenalty,
    PhonePenalty,
    SeatbeltPenalty,
    UndrivablePenalty,
];
