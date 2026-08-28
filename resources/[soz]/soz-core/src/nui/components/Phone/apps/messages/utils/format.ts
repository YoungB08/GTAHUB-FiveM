import { isImage } from './image';
import { isPosition } from './position';

export const formatMessage = (message?: string, isEmitter?: boolean): string => {
    if (isImage(message)) {
        return `Bạn đã ${isEmitter ? 'gửi' : 'nhận'} một hình ảnh`;
    }

    if (isPosition(message)) {
        return `Bạn đã ${isEmitter ? 'gửi' : 'nhận'} một vị trí`;
    }

    return message;
};
