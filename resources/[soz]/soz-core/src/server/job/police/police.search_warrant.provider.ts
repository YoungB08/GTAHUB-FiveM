import { Inject } from '@core/decorators/injectable';
import { Command } from '@public/core/decorators/command';
import { OnEvent } from '@public/core/decorators/event';
import { Provider } from '@public/core/decorators/provider';
import { InventoryFactory } from '@public/server/inventory/inventory.factory';
import { Notifier } from '@public/server/notifier';
import { HousingRepository } from '@public/server/repository/housing.repository';
import { ServerEvent } from '@public/shared/event';

@Provider()
export class PoliceSearchWarrantProvider {
    @Inject(InventoryFactory)
    private inventoryFactory: InventoryFactory;

    @Inject(Notifier)
    private notifier: Notifier;

    @Inject(HousingRepository)
    private housingRepository: HousingRepository;

    @OnEvent(ServerEvent.FDO_USE_SEARCH_WARRANT)
    public async onSearchWarrantUse(source: number, apartmentId: number, propertyId: number) {
        const inventory = await this.inventoryFactory.getPlayerInventory(source);

        const [, apartment] = await this.housingRepository.getApartment(propertyId, apartmentId);
        if (!apartment) {
            return;
        }

        if (apartment.search_warrant_access > Date.now()) {
            this.notifier.error(source, 'Căn hộ này đã bị phá khóa khám xét.');
            return;
        }

        if (!inventory.remove('search_warrant', 1, false)) {
            this.notifier.error(source, 'Bạn không có lệnh khám xét hợp lệ.');
            return;
        }

        await this.housingRepository.setApartmentWarrantAccess(apartmentId);
        this.notifier.notify(source, `${apartment.label} đã bị phá khóa khám xét.`, 'success');
    }

    @OnEvent(ServerEvent.FDO_CLOSE_SEARCH_WARRANT)
    public async onCloseWarrantUse(source: number, apartmentId: number, propertyId: number) {
        const [, apartment] = await this.housingRepository.getApartment(propertyId, apartmentId);
        if (!apartment) {
            return;
        }

        if (apartment.search_warrant_access <= Date.now()) {
            this.notifier.error(source, 'Căn hộ này hiện không trong tình trạng bị phá khóa.');
            return;
        }

        await this.housingRepository.setApartmentWarrantAccess(apartmentId, 0);
        this.notifier.notify(source, `${apartment.label} đã được khóa lại.`, 'success');
    }

    @Command('set-warrant-access', {
        role: ['admin'],
        arguments: [
            { name: 'apartmentIdentifier', help: 'Apartment identifier to find' },
            { name: 'minutes', help: 'Number of minute to set the warrant access expiration in the future' },
        ],
    })
    public async triggerSetWarrantAccessCommand(source: number, apartmentIdentifier: string, minutes: number) {
        const apartment = await this.housingRepository.getApartmentByIdentifier(apartmentIdentifier);

        if (!apartmentIdentifier) {
            this.notifier.error(source, 'Căn hộ này không tồn tại.');
            return;
        }

        await this.housingRepository.setApartmentWarrantAccess(apartment.id, minutes);
        this.notifier.notify(source, `Căn hộ đã được cấp quyền phá khóa khám xét trong ${minutes} phút.`);
    }
}
