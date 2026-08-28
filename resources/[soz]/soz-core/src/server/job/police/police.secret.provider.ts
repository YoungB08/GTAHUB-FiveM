import { OnEvent } from '@public/core/decorators/event';
import { Inject } from '@public/core/decorators/injectable';
import { Provider } from '@public/core/decorators/provider';
import { Rpc } from '@public/core/decorators/rpc';
import { Monitor } from '@public/server/monitor/monitor';
import { Notifier } from '@public/server/notifier';
import { ServerEvent } from '@public/shared/event';
import { RpcServerEvent } from '@public/shared/rpc';

@Provider()
export class PoliceSecretProvider {
    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(Monitor)
    private monitor: Monitor;

    private done = false;

    @Rpc(RpcServerEvent.POLICE_SECRET_CHECK)
    public secretCheck(source: number) {
        if (this.done) {
            this.notifier.error(source, 'Máy tính này đã bị khóa cho đến ngày mai');
        }
        return !this.done;
    }

    @OnEvent(ServerEvent.POLICE_SECRET)
    public onSevret(source: number, success: boolean) {
        if (this.done) {
            return;
        }
        this.done = true;

        if (success) {
            this.notifier.notify(
                source,
                "Tập tin chứa những bức ảnh nhạy cảm của O'reilly cực kỳ nóng bỏng, khiến bạn phải suy ngẫm lại về xu hướng của mình.",
                'success'
            );
        } else {
            this.notifier.notify(
                source,
                "Bạn đã không tìm đúng mật khẩu, máy tính đã bị khóa cho đến ngày mai.",
                'error'
            );
        }

        this.monitor.traceEvent('police_secret', {
            player_source: source,
            success,
        });
    }
}
