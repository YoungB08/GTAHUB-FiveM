import { Tax, TaxType } from '@public/shared/tax';

type TaxDescription = {
    title: string;
    description: string;
    whoModifies: string;
};

export const TaxesDescription: Record<TaxType, TaxDescription> = {
    [TaxType.WEAPON]: {
        title: 'Thuế vũ khí',
        description:
            'Thuế vũ khí áp dụng cho việc mua trang bị và nâng cấp tại cửa hàng vũ khí, bao gồm vũ khí, phụ kiện và dụng cụ thể thao.',
        whoModifies: 'Chính phủ',
    },
    [TaxType.VEHICLE]: {
        title: 'Thuế phương tiện',
        description:
            'Thuế phương tiện áp dụng khi mua xe tại các đại lý đường bộ, đường thủy, hàng không, xe sang, xe hai bánh và xe doanh nghiệp. Thuế cũng áp dụng cho nâng cấp hiệu suất tại LS Custom, dịch vụ rửa xe và thi bằng lái.',
        whoModifies: 'Chính phủ',
    },
    [TaxType.HOUSING]: {
        title: 'Thuế nhà ở',
        description:
            'Thuế nhà ở áp dụng khi mua và nâng cấp nhà ở, đồng thời áp dụng cho đồ nội thất mua tại Zkea.',
        whoModifies: 'Chính phủ',
    },
    [TaxType.SERVICE]: {
        title: 'Thuế dịch vụ',
        description:
            'Thuế dịch vụ áp dụng cho các dịch vụ khẩn cấp như bác sĩ trực LSMC, Pit Stop LS Custom và gói tập luyện tại Muscle Peach.',
        whoModifies: 'Chính phủ',
    },
    [TaxType.SUPPLY]: {
        title: 'Thuế hàng hóa',
        description:
            'Thuế hàng hóa áp dụng cho các giao dịch tại tiệm tóc, tiệm xăm, cửa hàng quần áo, cửa hàng trang sức và cửa hàng lưu niệm.',
        whoModifies: 'Chính phủ',
    },
    [TaxType.TRAVEL]: {
        title: 'Thuế di chuyển',
        description:
            'Thuế di chuyển áp dụng cho mọi lượt vận chuyển phương tiện giữa San Andreas và Cayo Perico.',
        whoModifies: 'Chính phủ',
    },
    [TaxType.FOOD]: {
        title: 'Thuế thực phẩm',
        description:
            'Thuế thực phẩm áp dụng cho mọi giao dịch tại cửa hàng tiện lợi, kể cả sản phẩm không phải thực phẩm.',
        whoModifies: 'Chính phủ',
    },
    [TaxType.GREEN]: {
        title: 'Thuế xanh',
        description:
            'Thuế xanh áp dụng khi mua phương tiện tại đại lý xe điện.',
        whoModifies: 'Chính phủ',
    },
};

export const defaultTaxes: Tax[] = [
    { id: TaxType.HOUSING, value: 0 },
    { id: TaxType.FOOD, value: 0 },
    { id: TaxType.GREEN, value: 0 },
    { id: TaxType.TRAVEL, value: 0 },
    { id: TaxType.SUPPLY, value: 0 },
    { id: TaxType.VEHICLE, value: 0 },
    { id: TaxType.WEAPON, value: 0 },
    { id: TaxType.SERVICE, value: 0 },
];
