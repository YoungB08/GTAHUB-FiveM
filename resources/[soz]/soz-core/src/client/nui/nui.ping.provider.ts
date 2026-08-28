import { OnNuiEvent } from '../../core/decorators/event';
import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { Tick } from '../../core/decorators/tick';
import { NuiEvent } from '../../shared/event';
import { Font } from '../../shared/hud';
import { DrawService } from '../draw.service';

@Provider()
export class NuiPingProvider {
    @Inject(DrawService)
    private readonly drawService: DrawService;

    private interfaceCrashed = false;

    private lastPing = GetGameTimer();

    @Tick(1000)
    public async checkLastPing(): Promise<void> {
        this.interfaceCrashed = GetGameTimer() - this.lastPing > 5000;
    }

    @OnNuiEvent(NuiEvent.Ping)
    public async onPing(): Promise<void> {
        this.lastPing = GetGameTimer();
    }

    @Tick()
    public async showInterfaceCrashed(): Promise<void> {
        if (!this.interfaceCrashed) {
            return;
        }

        this.drawService.drawText('Mất liên lạc với các giao diện...', [0.315, 0.015], {
            font: Font.ChaletComprimeCologne,
            size: 1.0,
            color: [244, 43, 29, 255],
        });
        this.drawService.drawText(
            'Cài đặt FiveM của bạn không hỗ trợ tải giao diện...',
            [0.355, 0.075],
            {
                font: Font.ChaletComprimeCologne,
                size: 0.5,
                color: [255, 255, 255, 255],
            }
        );
        this.drawService.drawText('Réduis tes paramètres graphiques, et redémarre ton jeu.', [0.378, 0.105], {
            font: Font.ChaletComprimeCologne,
            size: 0.5,
            color: [255, 255, 255, 255],
        });
    }
}
