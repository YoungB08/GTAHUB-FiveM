export const weekToString = (dayOfWeek: number): string => {
    switch (dayOfWeek) {
        case 0:
            return 'CN';
        case 1:
            return 'T2';
        case 2:
            return 'T3';
        case 3:
            return 'T4';
        case 4:
            return 'T5';
        case 5:
            return 'T6';
        case 6:
            return 'T7';
        default:
            return '???';
    }
};
