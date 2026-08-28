export const PlayerAccountRegExp = /^[0-9]{3}Z[0-9]{4}T[0-9]{3}$/;

export const FORMAT_CURRENCY: Intl.NumberFormatOptions = {
    style: 'decimal',
    currency: 'USD',
    maximumFractionDigits: 0,
};

export const inputErrorMessage = (type: string): string => {
    switch (type) {
        case 'required':
            return 'Le champ est requis';
        case 'min':
            return 'Số tiền phải lớn hơn 0';
        case 'max':
            return "Bạn không có nhiều tiền như vậy";
        case 'minLength':
            return 'Trường phải chứa nhiều ký tự hơn';
        case 'maxLength':
            return 'Trường phải chứa ít ký tự hơn';
    }
};
