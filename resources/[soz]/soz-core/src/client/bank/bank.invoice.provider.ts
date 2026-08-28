import { OnEvent } from '../../core/decorators/event';
import { Inject } from '../../core/decorators/injectable';
import { Provider } from '../../core/decorators/provider';
import { emitRpc } from '../../core/rpc';
import { ClientEvent } from '../../shared/event/client';
import { RpcServerEvent } from '../../shared/rpc';
import { Notifier } from '../notifier';

@Provider()
export class BankInvoiceProvider {
    @Inject(Notifier)
    private notifier: Notifier;

    @OnEvent(ClientEvent.BANK_PHONE_INVOICE_RECEIVED)
    public async onInvoiceReceive(invoiceId: string, label: string, amount: number) {
        const [confirmed, timeout] = await this.notifier.notifyWithConfirm(
            `Bạn nhận được hóa đơn trị giá ~r~$${amount}~s~~n~Lý do: ${label}.~n~~n~Nhấn ~g~Y~s~ để thanh toán hoặc ~r~N~s~ để từ chối`
        );

        if (timeout) {
            return;
        }

        if (!confirmed) {
            await emitRpc(RpcServerEvent.BANK_REJECT_INVOICE, invoiceId);
            return;
        }

        await emitRpc(RpcServerEvent.BANK_PAY_INVOICE, invoiceId);
    }
}
