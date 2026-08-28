import { Err, Ok, Result } from '@public/shared/result';

export interface NuiInputMethodMap {
    AskInput: AskInput;
    InInput: boolean;
}

export type AskInput = {
    title: string;
    defaultValue?: string;
    maxCharacters?: number;
};

export type ValidateInput<T> = (input: string) => Result<T, string>;

export const NotEmptyStringValidator: ValidateInput<string> = (input: string) => {
    if (input?.trim() === '') {
        return Err('Vui lòng nhập một giá trị');
    }

    return Ok(input);
};

export const PositiveNumberValidator: ValidateInput<number> = (input: string) => {
    const inputNumber = Number(input);

    if (isNaN(inputNumber) || inputNumber < 0) {
        return Err('Vui lòng nhập số dương');
    }

    if (inputNumber % 1 !== 0) {
        return Err(`Giá trị phải là số nguyên.`);
    }

    return Ok(inputNumber);
};

export const NumberValidator: ValidateInput<number> = (input: string) => {
    const inputNumber = Number(input);

    if (isNaN(inputNumber)) {
        return Err('Vui lòng nhập một số');
    }

    return Ok(inputNumber);
};

export const NumberValidatorFactory = (min?: number, max?: number): ValidateInput<number> => {
    return (input: string) => {
        const inputNumber = Number(input);

        if (isNaN(inputNumber)) {
            return Err(`Vui lòng nhập một số.`);
        }

        if (min && inputNumber < min) {
            return Err(`La valeur doit être supérieure ou égale à ${min}.`);
        }

        if (max && inputNumber > max) {
            return Err(`La valeur doit être inférieure ou égale à ${max}.`);
        }

        if (inputNumber % 1 !== 0) {
            return Err(`Giá trị phải là số nguyên.`);
        }

        return Ok(inputNumber);
    };
};

export const HttpLinkValidator: ValidateInput<string> = (input: string) => {
    if (input?.trim() === '') {
        return Err('Vui lòng nhập địa chỉ URL');
    }
    const trimmed = input?.trim() ?? '';
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return Err('URL phải bắt đầu bằng "http://" hoặc"https://"');
    }
    return Ok(input);
};
